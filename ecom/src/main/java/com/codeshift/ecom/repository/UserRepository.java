package com.codeshift.ecom.repository;

import com.codeshift.ecom.model.User;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.*;
import java.util.Optional;
import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select u from User u where u.email = :email")
    Optional<User> lockByEmail(String email);

    List<User> findAllByOrderByNameAsc();
}
