package com.talvia.talvia.services;

import com.talvia.talvia.dto.request.LoginRequestDTO;
import com.talvia.talvia.dto.response.LoginResponseDTO;

public interface AuthService {
    LoginResponseDTO login(LoginRequestDTO loginRequest);
    void logout();
}