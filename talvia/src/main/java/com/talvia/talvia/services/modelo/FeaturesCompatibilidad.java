package com.talvia.talvia.services.modelo;

/** Variables de entrada del puntaje. Los nombres siguen las columnas del dataset de entrenamiento. */
public record FeaturesCompatibilidad(
        boolean mismoArea,
        double brechaExperiencia,        // años del candidato menos años exigidos
        boolean cumpleEducacion,
        boolean mismaCiudad,
        boolean esRemoto,
        Double salarioEsperadoCop,       // nulo si no se pudo leer
        Double presupuestoMinCop,        // nulo si no es comparable
        Double presupuestoMaxCop,
        int disponibilidad,              // 0 inmediata, 1 en 15 dias, 2 en 1 mes, -1 sin dato
        double anosExperiencia,
        int expMinimaAnios,
        int nivelEducativoMax,           // 0 a 7
        int nivelEducativoMinimo) {      // 0 a 7

    /** Salario esperado dividido por el presupuesto (el max; si no hay, el min). */
    public Double ratioSalario() {
        Double referencia = presupuestoMaxCop != null ? presupuestoMaxCop : presupuestoMinCop;
        if (salarioEsperadoCop == null || referencia == null || referencia <= 0) return null;
        return salarioEsperadoCop / referencia;
    }

    /** true, false o null cuando no se puede comparar. */
    public Boolean dentroDelPresupuesto() {
        if (salarioEsperadoCop == null) return null;
        if (presupuestoMaxCop != null) return salarioEsperadoCop <= presupuestoMaxCop;
        if (presupuestoMinCop != null) return salarioEsperadoCop <= 1.1 * presupuestoMinCop;
        return null;
    }
}