package com.talvia.talvia.servicesIMPL.admin;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjuster;
import java.time.temporal.TemporalAdjusters;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.talvia.talvia.dto.response.admin.EstadisticasAdminDTO;
import com.talvia.talvia.dto.response.admin.EstadisticasAdminDTO.RegistroSemana;
import com.talvia.talvia.model.enums.EstadoPostulacion;
import com.talvia.talvia.model.enums.EstadoVacante;
import com.talvia.talvia.model.enums.Rol;
import com.talvia.talvia.repository.proceso.PostulacionRepository;
import com.talvia.talvia.repository.usuario.EmpresaRepository;
import com.talvia.talvia.repository.usuario.TrabajadorRepository;
import com.talvia.talvia.repository.usuario.UsuarioRepository;
import com.talvia.talvia.repository.vacante.VacanteRepository;
import com.talvia.talvia.services.admin.AdminEstadisticasService;

@Service 
public class AdminEstadisticasServiceIMPL implements AdminEstadisticasService{

    private static final int SEMANAS_A_MOSTRAR = 8;
    private static final DateTimeFormatter FORMATO_ETIQUETA = DateTimeFormatter.ofPattern("dd/MM");

    @Autowired private TrabajadorRepository trabajadorRepository; 
    @Autowired private EmpresaRepository empresaRepository;
    @Autowired private VacanteRepository vacanteRepository;
    @Autowired private PostulacionRepository postulacionRepository;
    @Autowired private UsuarioRepository usuarioRepository;

    @Override 
    @Transactional(readOnly = true)
    public EstadisticasAdminDTO obtenerEstadisticas(){
        EstadisticasAdminDTO dto = new EstadisticasAdminDTO();
        dto.setTotalTrabajadores(trabajadorRepository.count());
        dto.setTotalEmpresas(empresaRepository.count());
        dto.setVacantesAbiertas(vacanteRepository.countByEstado(EstadoVacante.ABIERTA));
        dto.setVacantesPausadas(vacanteRepository.countByEstado(EstadoVacante.PAUSADA));
        dto.setTotalPostulaciones(postulacionRepository.count());
        dto.setAceptadas(postulacionRepository.countByEstado(EstadoPostulacion.ACEPTADO));
        dto.setRechazadas(postulacionRepository.countByEstado(EstadoPostulacion.RECHAZADO));
        dto.setRegistroPorSemana(calcularRegistroPorSemana());
        return dto;
    }

    private List<RegistroSemana> calcularRegistroPorSemana(){
        LocalDate lunesActual = LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate primerLunes = lunesActual.minusWeeks(SEMANAS_A_MOSTRAR - 1);

        List<LocalDateTime> fechas = usuarioRepository.findFechasRegistroDesde(Rol.ADMIN, primerLunes.atStartOfDay());
        
        //Inicializar las ocho semanas en cero para que el grafico nunva tenga huecos
        Map<LocalDate, Long> conteo = new LinkedHashMap<>();
        for (int i = 0; i < SEMANAS_A_MOSTRAR; i++){
            conteo.put(primerLunes.plusWeeks(i),0L);
        }

        for(LocalDateTime fecha : fechas){
            LocalDate lunes = fecha.toLocalDate().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
            conteo.computeIfPresent(lunes, (k, v) -> v + 1);
        }

        return conteo.entrySet().stream()
                .map(e -> new RegistroSemana(e.getKey().format(FORMATO_ETIQUETA), e.getValue()))
                .collect(Collectors.toList());
    }
}
