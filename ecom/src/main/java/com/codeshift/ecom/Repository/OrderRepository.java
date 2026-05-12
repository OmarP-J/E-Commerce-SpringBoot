package com.codeshift.ecom.Repository;

import com.codeshift.ecom.Entity.Order;
import com.codeshift.ecom.Enum.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    Order findByUserIdAndOrderStatus(Long userId, OrderStatus orderStatus);
}
