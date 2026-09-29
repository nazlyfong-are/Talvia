package com.talvia.talvia.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class ViewController {

    @GetMapping("/public/login")
    public String login() {
        return "auth/login";
    }

    @GetMapping("/public/form")
    public String registro() {
        return "auth/form";
    }

    @GetMapping("/private/trabajador/index")
    public String indexTrabajador() {
        return "trabajador/index";
    }

    @GetMapping("/private/trabajador/empresas")
    public String empresasTrabajador() {
        return "trabajador/empresas";
    }

    @GetMapping("/private/trabajador/perfil")
    public String perfilTrabajador() {
        return "trabajador/perfil";
    }

    @GetMapping("/private/empresa/dashboard")
    public String dashboardEmpresa() {
        return "empresa/dashboard";
    }

    @GetMapping("/private/trabajador/vacante")
    public String detalleVacante() {
        return "trabajador/vacante";
    }

    @GetMapping("/private/trabajador/postulaciones")
    public String misPostulaciones() {
        return "trabajador/postulaciones";
    }

    @GetMapping("/public/forgot-password")
    public String forgotPassword() {
        return "auth/forgot-password";
    }

    @GetMapping("/public/verify-email")
    public String verifyEmail() {
        return "auth/verify-email";
    }

    @GetMapping("/")
    public String home() {
        return "landing_page";
    }

    @GetMapping("/private/trabajador/empresa")
    public String perfilPublicoEmpresa() {
        return "trabajador/empresa-perfil";
    }

    @GetMapping("/private/trabajador/favoritos")
    public String misFavoritos() {
        return "trabajador/favoritos";
    }

    @GetMapping("/private/admin/dashboard")
public String adminDashboard() { return "admin/dashboard"; }

@GetMapping("/private/admin/usuarios")
public String adminUsuarios() { return "admin/usuarios"; }

@GetMapping("/private/admin/vacantes")
public String adminVacantes() { return "admin/vacantes"; }

@GetMapping("/private/admin/postulaciones")
public String adminPostulaciones() { return "admin/postulaciones"; }

@GetMapping("/private/admin/exportar-datos")
public String adminExportarDatos() { return "admin/exportar-datos"; }

@GetMapping("/private/admin/configuracion")
public String adminConfiguracion() { return "admin/configuracion"; }
}