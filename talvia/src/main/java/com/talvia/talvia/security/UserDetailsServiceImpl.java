package com.talvia.talvia.security;

import com.talvia.talvia.model.usuario.Admin;
import com.talvia.talvia.model.usuario.Empresa;
import com.talvia.talvia.model.usuario.Trabajador;
import com.talvia.talvia.repository.usuario.AdminRepository;
import com.talvia.talvia.repository.usuario.EmpresaRepository;
import com.talvia.talvia.repository.usuario.TrabajadorRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired private TrabajadorRepository trabajadorRepository;
    @Autowired private EmpresaRepository empresaRepository;
    @Autowired private AdminRepository adminRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {

        return trabajadorRepository.findByEmail(email)
                .map(this::toPrincipal)
                .or(() -> empresaRepository.findByEmail(email).map(this::toPrincipal))
                .or(() -> adminRepository.findByEmail(email).map(this::toPrincipal))
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + email));
    }

    private UserPrincipal toPrincipal(Trabajador t) {
        return new UserPrincipal(t.getId(), t.getEmail(), t.getContrasena(), t.getRol().name(), t.isActivo());
    }

    private UserPrincipal toPrincipal(Empresa e) {
        return new UserPrincipal(e.getId(), e.getEmail(), e.getContrasena(), e.getRol().name(), e.isActivo());
    }

    private UserPrincipal toPrincipal(Admin a) {
        return new UserPrincipal(a.getId(), a.getEmail(), a.getContrasena(), a.getRol().name(), a.isActivo());
    }
}
