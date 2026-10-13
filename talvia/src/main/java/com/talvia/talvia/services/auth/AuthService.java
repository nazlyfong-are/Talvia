package com.talvia.talvia.services.auth;

import com.talvia.talvia.dto.request.auth.LoginRequestDTO;
import com.talvia.talvia.dto.response.auth.LoginResponseDTO;

public interface AuthService {
   LoginResponseDTO login(LoginRequestDTO loginRequest);
    void logout();

    void solicitarRecuperacionContrasena(String email);
    void restablecerContrasena(String email, String codigo, String nuevaContrasena);
    void solicitarEliminacionCuenta(Long usuarioId, String email);
    void confirmarEliminacionCuenta(Long usuarioId, String email, String codigo);
    void verificarCorreo(String email, String codigo);
    void reenviarCodigoVerificacion(String email);
}