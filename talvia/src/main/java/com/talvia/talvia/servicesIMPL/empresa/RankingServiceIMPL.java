package com.talvia.talvia.servicesIMPL.empresa;

import com.talvia.talvia.dto.response.empresa.CandidatoRankingDTO;
import com.talvia.talvia.dto.response.empresa.FactorDTO;
import com.talvia.talvia.dto.response.empresa.RankingVacanteDTO;
import com.talvia.talvia.model.proceso.Postulacion;
import com.talvia.talvia.model.usuario.Trabajador;
import com.talvia.talvia.model.vacante.Vacante;
import com.talvia.talvia.repository.proceso.PostulacionRepository;
import com.talvia.talvia.repository.vacante.VacanteRepository;
import com.talvia.talvia.services.empresa.RankingService;
import com.talvia.talvia.services.modelo.FeaturesCompatibilidad;
import com.talvia.talvia.services.modelo.PuntuadorCompatibilidad;
import com.talvia.talvia.servicesIMPL.modelo.ConstructorFeatures;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.talvia.talvia.servicesIMPL.modelo.ModeloArtefactos;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

@Service
public class RankingServiceIMPL implements RankingService {

        private static final DateTimeFormatter FORMATO_FECHA = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @Autowired private VacanteRepository vacanteRepository;
    @Autowired private PostulacionRepository postulacionRepository;
    @Autowired private ConstructorFeatures constructorFeatures;
    @Autowired private PuntuadorCompatibilidad puntuador;
    @Autowired private ModeloArtefactos artefactos;

    private record Puntuada(Postulacion postulacion, FeaturesCompatibilidad features, double puntaje) {}

    @Override
    @Transactional(readOnly = true)
    public RankingVacanteDTO rankingDeVacante(Long empresaId, Long vacanteId) {
        // El mismo mensaje para "no existe" y "no es tuya": no se revela qué vacantes existen
        Vacante vacante = vacanteRepository.findById(vacanteId)
                .filter(v -> v.getEmpresa() != null && v.getEmpresa().getId().equals(empresaId))
                .orElseThrow(() -> new IllegalArgumentException("Vacante no encontrada."));

        List<Puntuada> ordenadas = postulacionRepository.findConPerfilByVacanteId(vacanteId).stream()
                .map(p -> {
                    FeaturesCompatibilidad f = constructorFeatures.construir(p);
                    return new Puntuada(p, f, puntuador.puntuar(f));
                })
                .sorted(Comparator.<Puntuada>comparingDouble(Puntuada::puntaje).reversed()
                        .thenComparing(x -> x.postulacion().getFechaPostulacion(),
                                Comparator.nullsLast(Comparator.naturalOrder())))
                .toList();

        List<CandidatoRankingDTO> candidatos = new ArrayList<>();
        int posicion = 1;
        for (Puntuada x : ordenadas) {
            candidatos.add(aDTO(x, posicion++));
        }

        RankingVacanteDTO dto = new RankingVacanteDTO();
        dto.setVacanteId(vacante.getId());
        dto.setTitulo(vacante.getTitulo());
        dto.setOrigen(puntuador.origen());
        dto.setVersion(puntuador.version());
        dto.setGeneradoEn(LocalDateTime.now().toString());
        dto.setTotal(candidatos.size());
        dto.setCandidatos(candidatos);
        return dto;
    }

    private CandidatoRankingDTO aDTO(Puntuada x, int posicion) {
        Postulacion p = x.postulacion();
        Trabajador t = p.getTrabajador();
        int puntaje = (int) Math.round(x.puntaje());

        CandidatoRankingDTO dto = new CandidatoRankingDTO();
        dto.setPosicion(posicion);
        dto.setPostulacionId(p.getId());
        dto.setNombre((t.getNombre() + " " + (t.getPrimerApellido() != null ? t.getPrimerApellido() : "")).trim());
        dto.setCiudad(t.getCiudad());
        dto.setAnosExperiencia(t.getAnosExperienciaTotal());
        dto.setFecha(p.getFechaPostulacion() != null ? p.getFechaPostulacion().toLocalDate().format(FORMATO_FECHA) : null);
        dto.setEstado(p.getEstado() != null ? p.getEstado().name() : null);
        dto.setVista(p.getFechaVista() != null);
        dto.setPuntaje(puntaje);
        dto.setNivel(puntaje >= artefactos.umbralAlta() ? "ALTA" : puntaje >= artefactos.umbralMedia() ? "MEDIA" : "BAJA");
        dto.setFactores(factores(x.features()));
        return dto;
    }

    /**
     * Comparaciones entre el perfil y la vacante. Describen el ajuste; no son la explicación
     * interna del modelo.
     */
    private List<FactorDTO> factores(FeaturesCompatibilidad f) {
        List<FactorDTO> lista = new ArrayList<>();

        lista.add(f.mismoArea()
                ? new FactorDTO("Su especialidad es del área de la vacante", "POSITIVO")
                : new FactorDTO("Su especialidad es de otra área", "NEGATIVO"));

        if (f.brechaExperiencia() >= 0) {
            lista.add(new FactorDTO(f.expMinimaAnios() == 0
                    ? "Cumple la experiencia (la vacante no exige mínimo)"
                    : "Cumple la experiencia: " + anios(f.anosExperiencia()) + " años, se piden " + f.expMinimaAnios(),
                    "POSITIVO"));
        } else {
            lista.add(new FactorDTO("Le faltan " + anios(-f.brechaExperiencia()) + " años de experiencia", "NEGATIVO"));
        }

        if (!f.cumpleEducacion()) {
            lista.add(new FactorDTO("No alcanza el nivel educativo exigido", "NEGATIVO"));
        } else if (f.nivelEducativoMinimo() == 0) {
            lista.add(new FactorDTO("La vacante no exige nivel educativo", "NEUTRO"));
        } else {
            lista.add(new FactorDTO("Cumple el nivel educativo exigido", "POSITIVO"));
        }

        Boolean dentro = f.dentroDelPresupuesto();
        if (dentro == null) {
            lista.add(new FactorDTO("No se puede comparar su sueldo con el presupuesto", "NEUTRO"));
        } else if (dentro) {
            lista.add(new FactorDTO("Su expectativa de sueldo está dentro del presupuesto", "POSITIVO"));
        } else {
            lista.add(new FactorDTO("Su expectativa de sueldo supera el presupuesto", "NEGATIVO"));
        }

        if (f.esRemoto()) {
            lista.add(new FactorDTO("La vacante es remota", "POSITIVO"));
        } else if (f.mismaCiudad()) {
            lista.add(new FactorDTO("Vive en la ciudad de la vacante", "POSITIVO"));
        } else {
            lista.add(new FactorDTO("Vive en otra ciudad", "NEGATIVO"));
        }

        switch (f.disponibilidad()) {
            case 0 -> lista.add(new FactorDTO("Disponibilidad inmediata", "POSITIVO"));
            case 1 -> lista.add(new FactorDTO("Disponible en 15 días", "NEUTRO"));
            case 2 -> lista.add(new FactorDTO("Disponible en 1 mes", "NEUTRO"));
            default -> { }
        }
        return lista;
    }

    private String anios(double valor) {
        return valor == Math.floor(valor)
                ? String.valueOf((long) valor)
                : String.format(Locale.of("es", "CO"), "%.1f", valor);
    }
}