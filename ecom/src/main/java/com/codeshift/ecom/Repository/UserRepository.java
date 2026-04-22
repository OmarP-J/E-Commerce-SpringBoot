package com.codeshift.ecom.Repository;

import com.codeshift.ecom.Entity.User;
import com.codeshift.ecom.Enum.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public class UserRepository extends JpaRepository<User, Long> {
    Optional<User> findFirstByEmail(String email);

    User findByRole(UserRole userRole);

}
