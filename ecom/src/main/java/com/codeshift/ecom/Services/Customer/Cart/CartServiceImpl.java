package com.codeshift.ecom.Services.Customer.Cart;

import com.codeshift.ecom.DTO.AddProductInCartDTO;
import com.codeshift.ecom.Entity.CartItems;
import com.codeshift.ecom.Entity.Order;
import com.codeshift.ecom.Entity.Product;
import com.codeshift.ecom.Entity.User;
import com.codeshift.ecom.Enum.OrderStatus;
import com.codeshift.ecom.Repository.CartItemsRepository;
import com.codeshift.ecom.Repository.OrderRepository;
import com.codeshift.ecom.Repository.ProductRepository;
import com.codeshift.ecom.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.Optional;

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
}
