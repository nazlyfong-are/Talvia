package com.talvia.talvia.servicesIMPL.auth;

import com.talvia.talvia.model.enums.TipoCodigo;
import com.talvia.talvia.services.auth.CodigoVerificacionService;

import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class CodigoVerificacionServiceIMPL implements CodigoVerificacionService {

    private static final int MINUTOS_EXPIRACION = 15;
    private final SecureRandom random = new SecureRandom();

    private final ConcurrentHashMap<String, CodigoPendiente> codigos = new ConcurrentHashMap<>();

    private static class CodigoPendiente {
        String codigo;
        LocalDateTime expiracion;
    }

    @Override
    public String generarCodigo(String email, TipoCodigo tipo) {
        String clave = clave(email, tipo);
        String codigo = String.valueOf(100000 + random.nextInt(900000));

        CodigoPendiente cp = new CodigoPendiente();
        cp.codigo = codigo;
        cp.expiracion = LocalDateTime.now().plusMinutes(MINUTOS_EXPIRACION);

        codigos.put(clave, cp);
        return codigo;
    }

    @Override
    public boolean validarCodigo(String email, TipoCodigo tipo, String codigo) {
        String clave = clave(email, tipo);
        CodigoPendiente cp = codigos.get(clave);

        if (cp == null) return false;
        if (!cp.codigo.equals(codigo)) return false;
        if (cp.expiracion.isBefore(LocalDateTime.now())) {
            codigos.remove(clave);
            return false;
        }

        codigos.remove(clave);
        return true;
    }

    private String clave(String email, TipoCodigo tipo) {
        return email.toLowerCase() + ":" + tipo.name();
    }
}