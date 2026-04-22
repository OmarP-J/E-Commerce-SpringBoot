package com.codeshift.ecom.Services.auth;

import com.codeshift.ecom.DTO.SignupRequest;
import com.codeshift.ecom.DTO.UserDto;

public interface AuthService {
    UserDto createUser(SignupRequest signupRequest);

    Boolean hasUserWithEmail(String email);
}
