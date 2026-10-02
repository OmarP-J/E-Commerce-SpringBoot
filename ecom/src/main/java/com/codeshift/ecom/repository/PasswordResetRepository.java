package com.codeshift.ecom.repository;

import com.codeshift.ecom.model.PasswordReset;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PasswordResetRepository extends JpaRepository<PasswordReset, Long> {
    Optional<PasswordReset> findByUserId(Long userId);
}
