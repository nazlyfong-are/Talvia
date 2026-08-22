package com.talvia.talvia.model.embedded;

import java.math.BigDecimal;

public class RangoSalarial {

    private BigDecimal montoMin;
    private BigDecimal montoMax;
    private String moneda;
    private String periodicidad;

    public RangoSalarial() {
    }
    public RangoSalarial(BigDecimal montoMin, BigDecimal montoMax, String moneda, String periodicidad) {
        this.montoMin = montoMin;
        this.montoMax = montoMax;
        this.moneda = moneda;
        this.periodicidad = periodicidad;
    }
    public BigDecimal getMontoMin() {
        return montoMin;
    }
    public void setMontoMin(BigDecimal montoMin) {
        this.montoMin = montoMin;
    }
    public BigDecimal getMontoMax() {
        return montoMax;
    }
    public void setMontoMax(BigDecimal montoMax) {
        this.montoMax = montoMax;
    }
    public String getMoneda() {
        return moneda;
    }
    public void setMoneda(String moneda) {
        this.moneda = moneda;
    }
    public String getPeriodicidad() {
        return periodicidad;
    }
    public void setPeriodicidad(String periodicidad) {
        this.periodicidad = periodicidad;
    }
}
