package com.codeshift.ecom.Services.Customer.Cart;

import com.codeshift.ecom.DTO.AddProductInCartDTO;
import com.codeshift.ecom.DTO.CartItemsDTO;
import com.codeshift.ecom.DTO.OrderDTO;
import com.codeshift.ecom.Entity.*;
import com.codeshift.ecom.Enum.OrderStatus;
import com.codeshift.ecom.Exceptions.ValidationExceptions;
import com.codeshift.ecom.Repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CartServiceImpl implements CartService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CartItemsRepository cartItemsRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CouponRepository couponRepository;

    public ResponseEntity<?> addProductInCart(AddProductInCartDTO addProductInCartDTO) {
        Order activeOrder = orderRepository.findByUserIdAndOrderStatus(addProductInCartDTO.getUserId(),
                OrderStatus.Pending);
        Optional<CartItems> optionalCartItems = cartItemsRepository.findByProductIdAndOrderIdAndUserId(
                addProductInCartDTO.getProductId(), activeOrder.getId(), addProductInCartDTO.getUserId());

        if (optionalCartItems.isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(null);
        } else {
            Optional<Product> optionalProduct = productRepository.findById(addProductInCartDTO.getProductId());
            Optional<User> optionalUser = userRepository.findById(addProductInCartDTO.getUserId());

            if (optionalProduct.isPresent() && optionalUser.isPresent()) {
                CartItems cart = new CartItems();
                cart.setProduct(optionalProduct.get());
                cart.setPrice(optionalProduct.get().getPrice());
                cart.setQuantity(1L);
                cart.setUser(optionalUser.get());
                cart.setOrder(activeOrder);

                cartItemsRepository.save(cart);

                activeOrder.setTotalAmount(activeOrder.getAmount() + cart.getPrice());
                activeOrder.setAmount(activeOrder.getAmount() + cart.getPrice());
                activeOrder.getCartItems().add(cart);

                orderRepository.save(activeOrder);

                return ResponseEntity.status(HttpStatus.CREATED).body(cart);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User or product not found");
            }
        }
    }

    public OrderDTO getCartByUserId(Long userId) {
        Order activeOrder = orderRepository.findByUserIdAndOrderStatus(userId, OrderStatus.Pending);
        List<CartItemsDTO> cartItemsDTOList = activeOrder.getCartItems().stream().map(CartItems::getCartDTO).collect(Collectors.toList());
        OrderDTO orderDTO = new OrderDTO();
        orderDTO.setAmount(activeOrder.getAmount());
        orderDTO.setId(activeOrder.getId());
        orderDTO.setOrderStatus(activeOrder.getOrderStatus());
        orderDTO.setDiscount(activeOrder.getDiscount());
        orderDTO.setTotalAmount(activeOrder.getTotalAmount());
        orderDTO.setCartItems(cartItemsDTOList);
        if (activeOrder.getCoupon() != null) {
            orderDTO.setCouponName(activeOrder.getCoupon().getName());
        }

        return orderDTO;

    }
    
    public OrderDTO applyCoupon(Long userId, String code){
        Order activeOrder = orderRepository.findByUserIdAndOrderStatus(userId, OrderStatus.Pending);
        Coupon coupon = couponRepository.findByCode(code).orElseThrow(()-> new ValidationExceptions("Coupon not found."));

        if(couponIsExpired(coupon)){
            throw new ValidationExceptions("Coupon is expired.");
        }

        double discountAmount = ((coupon.getDiscount() / 100.0) * activeOrder.getTotalAmount());
        double netAmount = activeOrder.getTotalAmount() - discountAmount;

        activeOrder.setAmount((long)netAmount);
        activeOrder.setDiscount((long)discountAmount);
        activeOrder.setCoupon(coupon);

        orderRepository.save(activeOrder);
        return activeOrder.getOrderDTO();
    }

    private boolean couponIsExpired(Coupon coupon){
        Date currentdate = new Date();
        Date expirationDate = coupon.getExpirationDate();

        return expirationDate != null && currentdate.after(expirationDate);
    }

}
