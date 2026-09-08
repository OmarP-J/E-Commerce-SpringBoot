package com.codeshift.ecom.repository;

import com.codeshift.ecom.model.SupportCase;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SupportCaseRepository extends JpaRepository<SupportCase, Long> {
    List<SupportCase> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    List<SupportCase> findAllByOrderByUpdatedAtDesc();

    List<SupportCase> findByOrderId(Long orderId);

    boolean existsByOrderIdAndCustomerIdAndTypeAndStatusIn(Long orderId, Long customerId, SupportCase.Type type,
            List<SupportCase.Status> statuses);
}
