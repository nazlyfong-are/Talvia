package com.talvia.talvia.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.talvia.talvia.model.vacante.Vacante;
import java.util.List;
import com.talvia.talvia.model.enums.EstadoVacante;



public interface VacanteRepository extends JpaRepository<Vacante, Long>{

    //Todas las vacantes de una empresa especifica
    List<Vacante> findByEmpresaId(Long empresaId);

    List<Vacante> findByEstado(EstadoVacante estado);
    //Filtro combinado por area+estado
    List<Vacante> findByAreaAndEstado(String area, EstadoVacante estado);
    //Filtro combinado por modalidad+estado
    List<Vacante> findByModalidadAndEstado(String modalidad, EstadoVacante estado);

    long countByEmpresaIdAndEstado(Long empresaId, EstadoVacante estado);
}
