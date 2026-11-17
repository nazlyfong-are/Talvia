package com.talvia.talvia.servicesIMPL.scheduler;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Mantiene despierta la aplicación en Render (plan gratuito): cada 10 minutos hace una
 * petición a su propia dirección pública. Solo corre en producción (perfil "prod") y
 * solo si Render entrega RENDER_EXTERNAL_URL; en tu equipo no hace nada.
 *
 * LÍMITE: si la aplicación ya está dormida, no puede despertarse sola. Para eso hace falta
 * además un servicio externo (UptimeRobot o cron-job.org) que la visite cada 5-10 minutos.
 */
@Component
@Profile("prod")
public class MantenerActivoScheduler {

    private final String urlPublica;
    private final HttpClient cliente = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    public MantenerActivoScheduler(@Value("${RENDER_EXTERNAL_URL:}") String urlPublica) {
        this.urlPublica = urlPublica == null ? "" : urlPublica.trim();
    }

    // Cada 10 minutos (Render duerme el servicio tras 15 minutos sin tráfico). Primer aviso a los 2 minutos.
    @Scheduled(initialDelay = 120_000, fixedRate = 600_000)
    public void despertarse() {
        if (urlPublica.isEmpty()) return;
        try {
            HttpRequest peticion = HttpRequest.newBuilder(URI.create(urlPublica + "/public/login"))
                    .timeout(Duration.ofSeconds(20))
                    .GET()
                    .build();
            HttpResponse<Void> respuesta = cliente.send(peticion, HttpResponse.BodyHandlers.discarding());
            System.out.println("[keep-alive] " + respuesta.statusCode());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } catch (Exception e) {
            System.out.println("[keep-alive] sin respuesta: " + e.getClass().getSimpleName());
        }
    }
}