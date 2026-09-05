package com.talvia.talvia.model.embedded;

import java.math.BigDecimal;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RangoSalarial {

    private BigDecimal montoMin;
    private BigDecimal montoMax;
    private String moneda;
    private String periodicidad;
}
