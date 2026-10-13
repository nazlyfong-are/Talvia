package com.talvia.talvia.servicesIMPL.modelo;

import com.talvia.talvia.repository.proceso.PostulacionRepository;
import com.talvia.talvia.services.modelo.FeaturesCompatibilidad;
import org.springframework.boot.CommandLineRunner;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.ToDoubleFunction;

@Component
@Profile("verificar-modelo")
public class VerificadorFeatures implements CommandLineRunner {

    private final PostulacionRepository postulaciones;
    private final ConstructorFeatures constructor;
    private final TransactionTemplate transaccion;
    private final String rutaDataset;
    private final int limite;

    public VerificadorFeatures(PostulacionRepository postulaciones,
                               ConstructorFeatures constructor,
                               PlatformTransactionManager gestor,
                               @Value("${talvia.modelo.dataset:dataset_modelo.csv}") String rutaDataset,
                               @Value("${talvia.modelo.verificar-filas:300}") int limite) {
        this.postulaciones = postulaciones;
        this.constructor = constructor;
        this.transaccion = new TransactionTemplate(gestor);
        this.rutaDataset = rutaDataset;
        this.limite = limite;
    }

    @Override
    public void run(String... args) throws Exception {
        List<String> lineas = Files.readAllLines(Path.of(rutaDataset));
        String[] cabecera = lineas.get(0).split(",", -1);
        Map<String, Integer> posicion = new HashMap<>();
        for (int i = 0; i < cabecera.length; i++) {
            posicion.put(cabecera[i].trim(), i);
        }

        Map<String, Integer> fallos = new LinkedHashMap<>();
        Map<String, List<String>> ejemplos = new LinkedHashMap<>();
        VariablesModelo.POR_NOMBRE.keySet().forEach(n -> { fallos.put(n, 0); ejemplos.put(n, new ArrayList<>()); });

        int revisadas = 0;
        int sinPostulacion = 0;
        for (String linea : lineas.subList(1, Math.min(lineas.size(), limite + 1))) {
            String[] c = linea.split(",", -1);
            long id = Long.parseLong(c[posicion.get("id_postulacion")].trim());

            Map<String, Double> reales = transaccion.execute(estado -> postulaciones.findById(id)
                    .map(p -> valores(constructor.construir(p)))
                    .orElse(null));
            if (reales == null) {
                sinPostulacion++;
                continue;
            }
            revisadas++;
            for (String nombre : VariablesModelo.POR_NOMBRE.keySet()) {
                String crudo = c[posicion.get(nombre)].trim();
                double esperado = crudo.isEmpty() ? Double.NaN : Double.parseDouble(crudo);
                double real = reales.get(nombre);
                if (!iguales(esperado, real)) {
                    fallos.merge(nombre, 1, Integer::sum);
                    List<String> lista = ejemplos.get(nombre);
                    if (lista.size() < 3) {
                        lista.add("postulación " + id + ": dataset=" + esperado + " | Java=" + real);
                    }
                }
            }
        }

        System.out.println();
        System.out.println("===== VERIFICACIÓN DE VARIABLES (Java frente al dataset de entrenamiento) =====");
        System.out.println("Postulaciones revisadas: " + revisadas + " | no encontradas en la base: " + sinPostulacion);
        fallos.forEach((nombre, n) -> {
            System.out.println((n == 0 ? "OK     " : "FALLA  ") + String.format("%4d", n) + "  " + nombre);
            ejemplos.get(nombre).forEach(e -> System.out.println("          " + e));
        });
        System.out.println("Todas deben decir OK. Una variable con FALLA significa que Java y el cuaderno la calculan distinto.");
        System.exit(0);
    }

    private static Map<String, Double> valores(FeaturesCompatibilidad f) {
        Map<String, Double> m = new LinkedHashMap<>();
        for (Map.Entry<String, ToDoubleFunction<FeaturesCompatibilidad>> e : VariablesModelo.POR_NOMBRE.entrySet()) {
            m.put(e.getKey(), e.getValue().applyAsDouble(f));
        }
        return m;
    }

    private static boolean iguales(double a, double b) {
        if (Double.isNaN(a) || Double.isNaN(b)) {
            return Double.isNaN(a) && Double.isNaN(b);
        }
        return Math.abs(a - b) <= 1e-6 * Math.max(1.0, Math.abs(a));
    }
}