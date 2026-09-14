package com.codeshift.ecom.repository;

import com.codeshift.ecom.model.EmailVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface EmailVerificationRepository extends JpaRepository<EmailVerification, Long> {
    Optional<EmailVerification> findByUserId(Long userId);

    void deleteByUserId(Long userId);
}
