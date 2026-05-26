package com.codeshift.ecom.Entity;

import com.codeshift.ecom.DTO.OrderDTO;
import com.codeshift.ecom.Enum.OrderStatus;
import jakarta.persistence.*;
import lombok.Data;

import java.util.Date;
import java.util.List;
import java.util.UUID;

@Entity
@Data
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String orderDescription;

    private Date date;

    private Long amount;

    private String address;

    private OrderStatus orderStatus;

    private Long totalAmount;

    private Long discount;

    private UUID trackingId;

    @OneToOne(cascade = CascadeType.MERGE)
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    @OneToOne(cascade = CascadeType.MERGE)
    @JoinColumn(name = "coupon_id", referencedColumnName = "id")
    private Coupon coupon;

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "order")
    private List<CartItems> cartItems;

    public OrderDTO getOrderDTO() {
        OrderDTO orderDTO = new OrderDTO();

        orderDTO.setId(id);
        orderDTO.setOrderDescription(orderDescription);
        orderDTO.setAddress(address);
        orderDTO.setTrackingId(trackingId);
        orderDTO.setAmount(amount);
        orderDTO.setDate(date);
        orderDTO.setOrderStatus(orderStatus);
        orderDTO.setUserName(user.getName());
        if (coupon != null) {
            orderDTO.setCouponName(coupon.getName());
        }
        return orderDTO;
    }
}
