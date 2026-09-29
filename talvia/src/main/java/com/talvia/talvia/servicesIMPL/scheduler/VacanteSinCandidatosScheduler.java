package com.talvia.talvia.servicesIMPL.scheduler;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.talvia.talvia.model.enums.EstadoVacante;
import com.talvia.talvia.model.enums.TipoNotificacion;
import com.talvia.talvia.model.proceso.ConfiguracionSistema;
import com.talvia.talvia.model.vacante.Vacante;
import com.talvia.talvia.repository.proceso.PostulacionRepository;
import com.talvia.talvia.repository.sistema.ConfiguracionSistemaRepository;
import com.talvia.talvia.repository.vacante.VacanteRepository;
import com.talvia.talvia.services.notificacion.NotificacionService;

@Component
@RestController
public class VacanteSinCandidatosScheduler {

    @Autowired
    private VacanteRepository vacanteRepository;
    @Autowired
    private PostulacionRepository postulacionRepository;
    @Autowired
    private NotificacionService notificacionService;

    @Autowired
private ConfiguracionSistemaRepository configRepository;


    @Scheduled(cron = "0 0 8 * * *")
public void revisarVacantesSinCandidatos() {
    int diasConfigurados = configRepository.findById(1L)
            .map(ConfiguracionSistema::getDiasVacanteSinCandidatos)
            .orElse(15); // valor por defecto si nadie ha guardado configuración todavía

    LocalDateTime limite = LocalDateTime.now().minusDays(diasConfigurados);
    List<Vacante> vacantesAbiertas = vacanteRepository.findByEstado(EstadoVacante.ABIERTA);

    for (Vacante v : vacantesAbiertas) {
        boolean publicadaHaceRato = v.getFechaPublicacion() != null && v.getFechaPublicacion().isBefore(limite);
        boolean sinPostulaciones = postulacionRepository.findByVacanteId(v.getId()).isEmpty();

        if (publicadaHaceRato && sinPostulaciones) {
            notificacionService.crear(v.getEmpresa(), TipoNotificacion.VACANTE_SIN_CANDIDATOS,
                    "Tu vacante \"" + v.getTitulo() + "\" lleva más de " + diasConfigurados +
                    " días sin candidatos. Considera revisar sus requisitos o el presupuesto ofrecido.",
                    "/private/empresa/dashboard");
        }
    }
}

    // TEMPORAL PARA PRUEBAS, BORRAR LUEGO
    @GetMapping("/api/admin/probar-scheduler-vacantes")
    public String probarManualmente() {
        revisarVacantesSinCandidatos();
        return "Revisión ejecutada manualmente.";
    }
}
