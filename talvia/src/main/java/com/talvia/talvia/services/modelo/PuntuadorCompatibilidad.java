package com.talvia.talvia.services.modelo;

public interface PuntuadorCompatibilidad {
    /** Devuelve un puntaje de 0 a 100. */
    double puntuar(FeaturesCompatibilidad features);

    /** REGLAS (provisional) o MODELO. */
    String origen();

    String version();
}