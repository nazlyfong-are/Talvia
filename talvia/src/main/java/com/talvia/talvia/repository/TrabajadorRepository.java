package com.talvia.talvia.repository;

import com.talvia.talvia.model.usuario.Trabajador;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TrabajadorRepository extends JpaRepository<Trabajador, Long> {
    Optional<Trabajador> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<Trabajador> findByNumeroDocumento(String numeroDocumento);
}