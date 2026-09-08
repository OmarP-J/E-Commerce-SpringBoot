package com.codeshift.ecom.repository;

import com.codeshift.ecom.model.ShopOrder;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.*;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<ShopOrder, Long> {
    List<ShopOrder> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<ShopOrder> findAllByOrderByCreatedAtDesc();

    Optional<ShopOrder> findByUserIdAndRequestKey(Long userId, String requestKey);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select o from ShopOrder o where o.id = :id")
    Optional<ShopOrder> lockById(Long id);
}
