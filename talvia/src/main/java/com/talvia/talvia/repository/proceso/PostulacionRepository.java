package com.talvia.talvia.repository.proceso;

import com.talvia.talvia.model.enums.EstadoPostulacion;
import com.talvia.talvia.model.proceso.Postulacion;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PostulacionRepository extends 
        JpaRepository<Postulacion, Long>, 
        JpaSpecificationExecutor<Postulacion>{
    List<Postulacion> findByTrabajadorId(Long trabajadorId);
    List<Postulacion> findByVacanteId(Long vacanteId);
    List<Postulacion> findByVacante_Empresa_IdOrderByFechaPostulacionDesc(Long empresaId);
    boolean existsByTrabajadorIdAndVacanteId(Long trabajadorId, Long vacanteId);
    boolean existsByCvEnviadoId(Long cvEnviadoId);
    long countByEstado(EstadoPostulacion estado);
    long countByVacanteId(Long vacanteId);

    //Trae pares para varias vacantes en una sola consulta
    @Query("SELECT p.vacante.id, COUNT(p) FROM Postulacion p " +
           "WHERE p.vacante.id IN :ids GROUP BY p.vacante.id")
    List<Object[]> contarPorVacantes(@Param("ids") List<Long> ids);

    // Trae trabajador, vacante y empresa en una sola consulta (evita N+1) al listar con filtros
    @Override
    @EntityGraph(attributePaths = {"trabajador", "vacante", "vacante.empresa"})
    Page<Postulacion> findAll(Specification<Postulacion> spec, Pageable pageable);
}