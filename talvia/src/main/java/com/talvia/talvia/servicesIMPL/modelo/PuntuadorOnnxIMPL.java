package com.talvia.talvia.servicesIMPL.modelo;

import ai.onnxruntime.OnnxTensor;
import ai.onnxruntime.OrtEnvironment;
import ai.onnxruntime.OrtException;
import ai.onnxruntime.OrtSession;
import com.talvia.talvia.services.modelo.FeaturesCompatibilidad;
import com.talvia.talvia.services.modelo.PuntuadorCompatibilidad;
import jakarta.annotation.PreDestroy;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.function.ToDoubleFunction;

@Service
@ConditionalOnProperty(name = "talvia.modelo.tipo", havingValue = "onnx")
public class PuntuadorOnnxIMPL implements PuntuadorCompatibilidad {

    private final OrtEnvironment entorno = OrtEnvironment.getEnvironment();
    private final OrtSession sesion;
    private final String nombreEntrada;
    private final List<ToDoubleFunction<FeaturesCompatibilidad>> extractores;
    private final String version;

    public PuntuadorOnnxIMPL(ModeloArtefactos artefactos) {
        if (artefactos.entradas().isEmpty()) {
            throw new IllegalStateException("Falta features.json en la carpeta del modelo (talvia.modelo.ruta).");
        }
        List<String> desconocidas = artefactos.entradas().stream()
                .filter(nombre -> !VariablesModelo.POR_NOMBRE.containsKey(nombre))
                .toList();
        if (!desconocidas.isEmpty()) {
            throw new IllegalStateException("El modelo pide variables que la aplicación no sabe construir: " + desconocidas
                    + ". Hay que agregarlas a VariablesModelo y a ConstructorFeatures, o entrenar con las variables de ajuste.");
        }
        this.extractores = artefactos.entradas().stream().map(VariablesModelo.POR_NOMBRE::get).toList();
        this.version = artefactos.version();
        try {
            this.sesion = entorno.createSession(artefactos.modeloBytes(), new OrtSession.SessionOptions());
            this.nombreEntrada = sesion.getInputNames().iterator().next();
        } catch (Exception e) {
            throw new IllegalStateException("No se pudo cargar el modelo ONNX: " + e.getMessage(), e);
        }
    }

    @Override
    public double puntuar(FeaturesCompatibilidad f) {
        float[][] fila = new float[1][extractores.size()];
        for (int i = 0; i < extractores.size(); i++) {
            fila[0][i] = (float) extractores.get(i).applyAsDouble(f);
        }
        try (OnnxTensor tensor = OnnxTensor.createTensor(entorno, fila);
             OrtSession.Result resultado = sesion.run(Map.of(nombreEntrada, tensor))) {
            // Salida 0: la clase; salida 1: las probabilidades [no aceptado, aceptado]
            float[][] probabilidades = (float[][]) resultado.get(1).getValue();
            return probabilidades[0][1] * 100.0;
        } catch (OrtException e) {
            throw new IllegalStateException("Falló el cálculo del puntaje: " + e.getMessage(), e);
        }
    }

    @Override
    public String origen() {
        return "MODELO";
    }

    @Override
    public String version() {
        return version;
    }

    @PreDestroy
    public void cerrar() {
        try {
            sesion.close();
        } catch (OrtException e) {
            // al apagar la aplicaion no hay nada mas que hacer
        }
    }
}