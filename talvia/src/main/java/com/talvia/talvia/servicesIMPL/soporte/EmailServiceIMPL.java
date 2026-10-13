package com.talvia.talvia.servicesIMPL.soporte;

import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.talvia.talvia.services.soporte.EmailService;

@Service
public class EmailServiceIMPL implements EmailService{

    @Autowired private JavaMailSender mailSender;

    @Value("${app.mail.remitente}")
    private String remitente;

    @Override
public void enviarCorreoSimple(String destinatario, String asunto, String cuerpoHtml) {
    try {
        MimeMessage mensaje = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mensaje, true, "UTF-8");
        helper.setFrom(remitente);
        helper.setTo(destinatario);
        helper.setSubject(asunto);
        helper.setText(cuerpoHtml, true);

        mailSender.send(mensaje);
    } catch (Exception e) {
        System.err.println(">>> ERROR AL ENVIAR CORREO a " + destinatario + ": " + e.getMessage());
    }
}
}
