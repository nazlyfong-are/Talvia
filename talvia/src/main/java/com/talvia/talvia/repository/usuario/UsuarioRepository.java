package com.talvia.talvia.repository.usuario;

import com.talvia.talvia.model.enums.Rol;
import com.talvia.talvia.model.usuario.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long>, JpaSpecificationExecutor<Usuario> {
    Optional<Usuario> findByEmailIgnoreCase(String email);
    @Query("SELECT u.fechaRegistro FROM Usuario u WHERE u.rol <> :rolExcluido AND u.fechaRegistro >= :desde")
List<LocalDateTime> findFechasRegistroDesde(@Param("rolExcluido") Rol rolExcluido,
                                            @Param("desde") LocalDateTime desde);
}
