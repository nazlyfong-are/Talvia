package com.talvia.talvia.security;

import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

@Service
public class LoginAttempService {

    private static final int MAX_INTENTOS = 5;
    private static final long BLOQUEO_MINUTOS = 15;

    private static class Intento {
        int cont;
        Instant ultimoIntento;
        Instant bloqueoHasta;
    }

    private final ConcurrentHashMap<String, Intento> intentosPorCorreo = new ConcurrentHashMap<>();

    public void registrarFallo(String correo) {
        String clave = correo.toLowerCase();
        Intento intento = intentosPorCorreo.computeIfAbsent(clave, k -> new Intento());

        synchronized(intento) {
            intento.cont++;
            intento.ultimoIntento = Instant.now();

            if(intento.cont >= MAX_INTENTOS){
                intento.bloqueoHasta = Instant.now().plusSeconds(BLOQUEO_MINUTOS * 60);
            }
        }
    }

    public void registrarExito(String correo){
        intentosPorCorreo.remove(correo.toLowerCase());
    }

    public boolean estaBloqueado(String correo){
        Intento intento = intentosPorCorreo.get(correo.toLowerCase());
        if(intento == null || intento.bloqueoHasta == null){
            return false;
        }

        synchronized(intento){
            if (Instant.now().isAfter(intento.bloqueoHasta)) {
                //Ya paso el tiempo de bloqueo, se resetea
                intento.cont = 0;
                intento.bloqueoHasta = null;
                return false;
            }
            return true;
        }
    }

    public long minutosRestantesDeBloqueo(String correo){
        Intento intento = intentosPorCorreo.get(correo.toLowerCase());
        if (intento == null || intento.bloqueoHasta == null) {
            return 0;
        }
        long segundosRestantes = Instant.now().until(intento.bloqueoHasta, java.time.temporal.ChronoUnit.SECONDS);
        return Math.max(0, (segundosRestantes + 59) / 60);
    }
}
