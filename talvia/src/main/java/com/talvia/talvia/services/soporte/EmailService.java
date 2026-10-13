package com.talvia.talvia.services.soporte;

public interface EmailService {
    void enviarCorreoSimple(String destinatario, String asunto, String cuerpoHtml);
}
