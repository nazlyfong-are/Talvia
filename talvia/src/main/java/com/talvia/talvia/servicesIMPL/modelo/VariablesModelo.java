package com.talvia.talvia.servicesIMPL.modelo;

import com.talvia.talvia.services.modelo.FeaturesCompatibilidad;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.function.ToDoubleFunction;

public final class VariablesModelo {

    public static final Map<String, ToDoubleFunction<FeaturesCompatibilidad>> POR_NOMBRE = crear();

    private VariablesModelo() {
    }

    private static Map<String, ToDoubleFunction<FeaturesCompatibilidad>> crear() {
        Map<String, ToDoubleFunction<FeaturesCompatibilidad>> m = new LinkedHashMap<>();
        m.put("mismo_area", f -> f.mismoArea() ? 1.0 : 0.0);
        m.put("brecha_experiencia", f -> f.brechaExperiencia());
        m.put("cumple_educacion", f -> f.cumpleEducacion() ? 1.0 : 0.0);
        m.put("misma_ciudad", f -> f.mismaCiudad() ? 1.0 : 0.0);
        m.put("es_remoto", f -> f.esRemoto() ? 1.0 : 0.0);
        m.put("ratio_salario", f -> dato(f.ratioSalario()));
        m.put("disponibilidad", f -> f.disponibilidad() < 0 ? Double.NaN : f.disponibilidad());
        m.put("anos_experiencia", f -> f.anosExperiencia());
        m.put("exp_minima_anios", f -> f.expMinimaAnios());
        m.put("nivel_educativo_max", f -> f.nivelEducativoMax());
        m.put("nivel_educativo_minimo", f -> f.nivelEducativoMinimo());
        m.put("presupuesto_min_cop", f -> dato(f.presupuestoMinCop()));
        m.put("presupuesto_max_cop", f -> dato(f.presupuestoMaxCop()));
        m.put("salario_esperado_cop", f -> dato(f.salarioEsperadoCop()));
        return Collections.unmodifiableMap(m);
    }

    private static double dato(Double valor) {
        return valor == null ? Double.NaN : valor;
    }
}