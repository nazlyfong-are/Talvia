package com.talvia.talvia.model.usuario;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import com.talvia.talvia.model.embedded.Certificacion;
import com.talvia.talvia.model.embedded.CvDocumento;
import com.talvia.talvia.model.embedded.ExpLaboral;
import com.talvia.talvia.model.embedded.Formacion;
import com.talvia.talvia.model.embedded.Habilidad;
import com.talvia.talvia.model.embedded.ImagenCloudinary;
import com.talvia.talvia.model.enums.ApoyoLaboral;
import com.talvia.talvia.model.enums.TipoDocumento;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "trabajadores")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Trabajador extends Usuario {

    private String especilidad;
    private String primerApellido;
    private String segundoApellido;

    @Enumerated(EnumType.STRING)
    private TipoDocumento tipoDocumento;

    @Column(unique = true)
    private String numeroDocumento;

    @Column(length = 2000)
    private String resumenProfesional;

    private String ciudad;
    private boolean disponibleInmediato;
    private Double anosExperienciaTotal;

    @Embedded
    private ImagenCloudinary foto;

    @OneToMany(mappedBy = "trabajador", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ExpLaboral> experiencias = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "trabajador_habilidades", joinColumns = @JoinColumn(name = "trabajador_id"))
    private List<Habilidad> habilidades = new ArrayList<>();

    @OneToMany(mappedBy = "trabajador", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Formacion> formaciones = new ArrayList<>();

    @OneToMany(mappedBy = "trabajador", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Certificacion> certificaciones = new ArrayList<>();

    @OneToMany(mappedBy = "trabajador", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CvDocumento> cvs = new ArrayList<>();

    // ── Preferencias y apoyos de trabajo (opcional) ──
    // Lista vacía = la persona no respondió.
    @ElementCollection
    @Enumerated(EnumType.STRING)
    @CollectionTable(name = "trabajador_apoyos", joinColumns = @JoinColumn(name = "trabajador_id"))
    @Column(name = "apoyo", length = 40)
    private Set<ApoyoLaboral> apoyos = new HashSet<>();

    @Column(length = 500)
    private String apoyosNota;

    private LocalDateTime apoyosActualizadosEn;

    private LocalDateTime fechaConsentimientoInclusion;

    // private LocalDateTime fechaConsentimientoInclusion; ← ya existe, se conserva

    /**
     * Aplica las preferencias y apoyos de trabajo.
     * - codigos == null: la sección no vino en la petición; no se toca nada.
     * - codigos vacío y sin nota: se borra todo (equivale a "sin respuesta").
     * - NINGUNO y DESPUES se excluyen entre sí y con cualquier otra opción.
     * - Marcar apoyos concretos o escribir una nota requiere autorización de
     * tratamiento.
     */
    public void aplicarApoyos(List<String> codigos, String nota, boolean autoriza) {
        if (codigos == null)
            return;

        Set<ApoyoLaboral> nuevos = new HashSet<>();
        for (String codigo : codigos) {
            try {
                nuevos.add(ApoyoLaboral.valueOf(codigo));
            } catch (IllegalArgumentException | NullPointerException e) {
                throw new IllegalArgumentException("Una de las opciones seleccionadas no es válida.");
            }
        }

        boolean exclusivo = nuevos.contains(ApoyoLaboral.NINGUNO) || nuevos.contains(ApoyoLaboral.DESPUES);
        if (exclusivo && nuevos.size() > 1) {
            throw new IllegalArgumentException(
                    "«No necesito ajustes por ahora» y «Prefiero hablarlo más adelante» no se pueden combinar con otras opciones.");
        }

        String texto = (!exclusivo && nota != null && !nota.isBlank()) ? nota.trim() : null;
        if (texto != null && texto.length() > 500) {
            throw new IllegalArgumentException("La nota no puede superar los 500 caracteres.");
        }

        // Solo los apoyos concretos y la nota son información sensible
        boolean sensible = (!exclusivo && !nuevos.isEmpty()) || texto != null;
        if (sensible && !autoriza) {
            throw new IllegalArgumentException("Para registrar esta información debes autorizar su tratamiento.");
        }

        this.apoyos.clear();
        this.apoyos.addAll(nuevos);
        this.apoyosNota = texto;

        if (nuevos.isEmpty() && texto == null) {
            this.apoyosActualizadosEn = null;
            this.fechaConsentimientoInclusion = null;
        } else {
            this.apoyosActualizadosEn = LocalDateTime.now();
            if (sensible) {
                if (this.fechaConsentimientoInclusion == null)
                    this.fechaConsentimientoInclusion = LocalDateTime.now();
            } else {
                this.fechaConsentimientoInclusion = null;
            }
        }
    }
}
