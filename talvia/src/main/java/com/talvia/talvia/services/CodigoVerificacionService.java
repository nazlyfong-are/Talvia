package com.talvia.talvia.services;

import com.talvia.talvia.model.enums.TipoCodigo;

public interface CodigoVerificacionService {
    String generarCodigo(String email, TipoCodigo tipo);
    boolean validarCodigo(String email, TipoCodigo tipo, String codigo);
}