package com.talvia.talvia.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import com.talvia.talvia.dto.LoginRequestDTO;
import com.talvia.talvia.dto.LoginResponseDTO;
import com.talvia.talvia.services.AuthService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;


@Controller
public class ViewController {

    @GetMapping("/")
    public String home() {
        return "redirect:/public/login";
    }

    @GetMapping("/public/login")
    public String login() {
        return "auth/login";
    }
    
    @GetMapping("/public/form")
    public String registro() {
        return "auth/form";
    }
}