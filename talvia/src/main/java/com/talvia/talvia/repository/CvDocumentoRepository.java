package com.talvia.talvia.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.talvia.talvia.model.embedded.CvDocumento;



public interface CvDocumentoRepository extends JpaRepository<CvDocumento, Long>{
    List<CvDocumento> findByTrabajadorId(Long trabajadorId);
    long countByTrabajadorId(Long trabajadorId);
}
