package com.talvia.talvia.servicesIMPL.modelo;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class ModeloArtefactos {

    private final ResourceLoader cargador;
    private final String base;
    private final String archivoModelo;
    private final double horasMes;
    private final Map<String, Double> tasas = new HashMap<>();
    private final String version;
    private final List<String> entradas;
    private final int umbralAlta;
    private final int umbralMedia;

    public ModeloArtefactos(ResourceLoader cargador,
                            @Value("${talvia.modelo.ruta:classpath:modelo/}") String ruta,
                            @Value("${talvia.modelo.archivo:compatibilidad_v1.onnx}") String archivoModelo,
                            @Value("${talvia.modelo.horas-mes:160}") double horasMes,
                            @Value("${talvia.modelo.tasa.cop:1}") double cop,
                            @Value("${talvia.modelo.tasa.usd:4000}") double usd,
                            @Value("${talvia.modelo.tasa.eur:4400}") double eur,
                            @Value("${talvia.modelo.tasa.mxn:220}") double mxn) throws IOException {
        this.cargador = cargador;
        this.base = ruta.endsWith("/") ? ruta : ruta + "/";
        this.archivoModelo = archivoModelo;
        this.horasMes = horasMes;
        tasas.put("COP", cop);
        tasas.put("USD", usd);
        tasas.put("EUR", eur);
        tasas.put("MXN", mxn);

        String features = leerTexto("features.json");
        String umbrales = leerTexto("umbrales.json");
        this.version = features == null ? "provisional" : texto(features, "version", "sin-version");
        this.entradas = features == null ? List.of() : lista(features, "entradas");
        this.umbralAlta = umbrales == null ? 70 : entero(umbrales, "alta", 70);
        this.umbralMedia = umbrales == null ? 40 : entero(umbrales, "media", 40);
    }

    public String version() {
        return version;
    }

    /** Las variables del modelo, en el orden en que hay que enviárselas. Vacio si no hay modelo. */
    public List<String> entradas() {
        return entradas;
    }

    public int umbralAlta() {
        return umbralAlta;
    }

    public int umbralMedia() {
        return umbralMedia;
    }

    public double horasMes() {
        return horasMes;
    }

    /** Pesos por una unidad de la moneda, o null si la moneda no esta configurada. */
    public Double tasa(String moneda) {
        return moneda == null ? null : tasas.get(moneda.trim().toUpperCase(Locale.ROOT));
    }

    public byte[] modeloBytes() throws IOException {
        Resource recurso = cargador.getResource(base + archivoModelo);
        if (!recurso.exists()) {
            throw new IOException("No existe el modelo: " + base + archivoModelo);
        }
        try (InputStream in = recurso.getInputStream()) {
            return in.readAllBytes();
        }
    }

    private String leerTexto(String nombre) throws IOException {
        Resource recurso = cargador.getResource(base + nombre);
        if (!recurso.exists()) {
            return null;
        }
        try (InputStream in = recurso.getInputStream()) {
            return new String(in.readAllBytes(), StandardCharsets.UTF_8);
        }
    }

    private static String texto(String json, String clave, String porDefecto) {
        Matcher m = Pattern.compile("\"" + Pattern.quote(clave) + "\"\\s*:\\s*\"([^\"]*)\"").matcher(json);
        return m.find() ? m.group(1) : porDefecto;
    }

    private static int entero(String json, String clave, int porDefecto) {
        Matcher m = Pattern.compile("\"" + Pattern.quote(clave) + "\"\\s*:\\s*(\\d+)").matcher(json);
        return m.find() ? Integer.parseInt(m.group(1)) : porDefecto;
    }

    private static List<String> lista(String json, String clave) {
        Matcher bloque = Pattern.compile("\"" + Pattern.quote(clave) + "\"\\s*:\\s*\\[(.*?)\\]", Pattern.DOTALL).matcher(json);
        if (!bloque.find()) {
            return List.of();
        }
        List<String> resultado = new ArrayList<>();
        Matcher item = Pattern.compile("\"([^\"]+)\"").matcher(bloque.group(1));
        while (item.find()) {
            resultado.add(item.group(1));
        }
        return List.copyOf(resultado);
    }
}