package com.talvia.talvia.repository.usuario;

import com.talvia.talvia.model.usuario.Empresa;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EmpresaRepository extends JpaRepository<Empresa, Long> {
    Optional<Empresa> findByEmail(String email);
    Optional<Empresa> findByNit(String nit);
    boolean existsByEmailIgnoreCase(String email);
}
