package com.talvia.talvia.servicesIMPL.modelo;

import com.talvia.talvia.model.embedded.Formacion;
import com.talvia.talvia.model.embedded.RangoSalarial;
import com.talvia.talvia.model.proceso.Postulacion;
import com.talvia.talvia.model.usuario.Trabajador;
import com.talvia.talvia.model.vacante.Vacante;
import com.talvia.talvia.services.modelo.FeaturesCompatibilidad;
import org.springframework.stereotype.Component;

import java.text.Normalizer;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class ConstructorFeatures {

    // Escala del contrato de datos; solo cuentan las formaciones terminadas
    private static final Map<String, Integer> NIVEL_EDUCATIVO = Map.of(
            "BACHILLER", 1, "TECNICO", 2, "TECNOLOGO", 3, "PROFESIONAL", 4,
            "ESPECIALIZACION", 5, "MAESTRIA", 6, "DOCTORADO", 7);

    // Mas de 100 millones de pesos al mes se considera un monto en la unidad equivocada: queda vacio
    private static final double PRESUPUESTO_MAXIMO_MES = 1e8;

    // El sueldo esperado trae su propia moneda: "$3454 USD", "$34578 COP/hora", "$2.587.377 COP"
    private static final Pattern MONEDA_EN_TEXTO = Pattern.compile("\\b(COP|USD|EUR|MXN)\\b");

    private final ModeloArtefactos artefactos;

    public ConstructorFeatures(ModeloArtefactos artefactos) {
        this.artefactos = artefactos;
    }

    public FeaturesCompatibilidad construir(Postulacion p) {
        Trabajador t = p.getTrabajador();
        Vacante v = p.getVacante();

        String area = norm(v.getArea());
        boolean mismoArea = !area.isEmpty() && area.equals(norm(t.getEspecilidad()));

        double anos = t.getAnosExperienciaTotal() != null ? t.getAnosExperienciaTotal() : 0.0;
        int expMin = v.getExpMinimaAnios() != null ? v.getExpMinimaAnios() : 0;

        int educacionMax = 0;
        for (Formacion f : t.getFormaciones()) {
            if (!f.isEnCurso()) {
                educacionMax = Math.max(educacionMax, nivelEducativo(f.getNivel()));
            }
        }
        int educacionMin = nivelEducativo(v.getNivelEducativoMinimo());

        String ubicacion = norm(v.getUbicacion());
        String ciudad = norm(t.getCiudad());
        boolean ubicacionRemota = ubicacion.equals("remoto");
        boolean esRemoto = norm(v.getModalidad()).equals("remoto") || ubicacionRemota;
        boolean mismaCiudad = !ubicacion.isEmpty() && !ubicacionRemota && !ciudad.isEmpty() && ciudad.equals(ubicacion);

        Double presMin = null;
        Double presMax = null;
        String monedaVacante = null;
        RangoSalarial presupuesto = v.getPresupuesto();
        if (presupuesto != null) {
            monedaVacante = presupuesto.getMoneda() == null ? null : String.valueOf(presupuesto.getMoneda());
            String periodicidad = presupuesto.getPeriodicidad() == null ? null : String.valueOf(presupuesto.getPeriodicidad());
            presMin = aCopMensual(presupuesto.getMontoMin(), monedaVacante, periodicidad);
            presMax = aCopMensual(presupuesto.getMontoMax(), monedaVacante, periodicidad);
        }

        return new FeaturesCompatibilidad(
                mismoArea, anos - expMin, educacionMax >= educacionMin, mismaCiudad, esRemoto,
                salarioEsperadoCop(p.getSalarioEsperado(), monedaVacante), presMin, presMax,
                disponibilidad(p.getDisponibilidad()),
                anos, expMin, educacionMax, educacionMin);
    }

    /** Pesos por mes: la tasa de la moneda, por hora por las horas al mes, por proyecto sin valor. */
    private Double aCopMensual(Number monto, String moneda, String periodicidad) {
        if (monto == null || "POR_PROYECTO".equalsIgnoreCase(periodicidad)) {
            return null;
        }
        Double tasa = artefactos.tasa(moneda);
        if (tasa == null) {
            return null;
        }
        double horas = "POR_HORA".equalsIgnoreCase(periodicidad) ? artefactos.horasMes() : 1.0;
        double pesos = monto.doubleValue() * tasa * horas;
        return pesos <= PRESUPUESTO_MAXIMO_MES ? pesos : null;
    }

    /**
     * Sueldo esperado en pesos por mes, con la moneda y el periodo que trae el propio texto.
     * Si el texto no dice la moneda, se usa la de la vacante; si dice "hora", se multiplica por las horas al mes.
     */
    private Double salarioEsperadoCop(String texto, String monedaVacante) {
        if (texto == null) {
            return null;
        }
        String digitos = texto.replaceAll("\\D", "");
        if (digitos.isEmpty()) {
            return null;
        }
        Matcher m = MONEDA_EN_TEXTO.matcher(texto.toUpperCase(Locale.ROOT));
        String moneda = m.find() ? m.group(1) : monedaVacante;
        Double tasa = artefactos.tasa(moneda);
        if (tasa == null) {
            return null;
        }
        boolean porHora = texto.toLowerCase(Locale.ROOT).contains("hora");
        return Double.parseDouble(digitos) * tasa * (porHora ? artefactos.horasMes() : 1.0);
    }

    private static int nivelEducativo(Object nivel) {
        if (nivel == null) {
            return 0;
        }
        return NIVEL_EDUCATIVO.getOrDefault(String.valueOf(nivel).trim().toUpperCase(Locale.ROOT), 0);
    }

    static String norm(String s) {
        if (s == null) {
            return "";
        }
        String sinTildes = Normalizer.normalize(s, Normalizer.Form.NFD).replaceAll("\\p{M}", "");
        return sinTildes.toLowerCase(Locale.ROOT).trim().replaceAll("\\s+", " ");
    }

    static int disponibilidad(String texto) {
        return switch (norm(texto)) {
            case "inmediata" -> 0;
            case "en 15 dias" -> 1;
            case "en 1 mes" -> 2;
            default -> -1;
        };
    }
}