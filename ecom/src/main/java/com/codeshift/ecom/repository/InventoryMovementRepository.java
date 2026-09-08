package com.codeshift.ecom.repository;

import com.codeshift.ecom.model.InventoryMovement;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InventoryMovementRepository extends JpaRepository<InventoryMovement, Long> {
    List<InventoryMovement> findTop100ByOrderByCreatedAtDesc();
}
