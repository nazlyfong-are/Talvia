package com.talvia.talvia.services;

import com.talvia.talvia.dto.LoginRequestDTO;
import com.talvia.talvia.dto.LoginResponseDTO;

public interface AuthService {
    LoginResponseDTO login(LoginRequestDTO loginRequest);
    void logout();
}