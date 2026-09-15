package com.talvia.talvia.services;

public interface EmailService {
    void enviarCorreoSimple(String destinatario, String asunto, String cuerpoHtml);
}
