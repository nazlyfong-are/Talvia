package com.talvia.talvia.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.talvia.talvia.dto.response.EmpresaResponseDTO;
import com.talvia.talvia.services.EmpresaService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequestMapping("/api/empresas")
public class EmpresaPublicController {

    @Autowired private EmpresaService empresaService;

    @GetMapping
    public List<EmpresaResponseDTO> list() {
        return empresaService.listarEmpresas();
    }
    

}
