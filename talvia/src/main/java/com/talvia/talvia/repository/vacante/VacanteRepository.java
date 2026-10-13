package com.talvia.talvia.repository.vacante;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.talvia.talvia.model.vacante.Vacante;
import java.util.List;
import com.talvia.talvia.model.enums.EstadoVacante;



public interface VacanteRepository extends JpaRepository<Vacante, Long>, JpaSpecificationExecutor<Vacante>{

    //Todas las vacantes de una empresa especifica
    List<Vacante> findByEmpresaId(Long empresaId);

    List<Vacante> findByEstado(EstadoVacante estado);
    //Filtro combinado por area+estado
    List<Vacante> findByAreaAndEstado(String area, EstadoVacante estado);
    //Filtro combinado por modalidad+estado
    List<Vacante> findByModalidadAndEstado(String modalidad, EstadoVacante estado);
    long countByEmpresaIdAndEstado(Long empresaId, EstadoVacante estado);
    long countByEstado(EstadoVacante estado);
    @Override
    @EntityGraph(attributePaths = {"empresa"})
    Page<Vacante> findAll(Specification<Vacante> spec, Pageable pageable);
    @Query("SELECT v.empresa.id, COUNT(v) FROM Vacante v WHERE v.estado = :estado GROUP BY v.empresa.id")
List<Object[]> contarActivasPorEmpresa(@Param("estado") EstadoVacante estado);
}
