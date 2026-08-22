package com.talvia.talvia.servicesIMPL;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
 
import com.talvia.talvia.dto.RegisterEmpresaDTO;
import com.talvia.talvia.dto.RegisterNaturalDTO;
import com.talvia.talvia.model.companyModel;
import com.talvia.talvia.model.naturalPerson;
import com.talvia.talvia.repository.CompanyRepository;
import com.talvia.talvia.repository.NaturalPersonRepository;
import com.talvia.talvia.services.RegisterService;
 
@Service
public class RegisterServiceIMPL implements RegisterService {
 
    @Autowired
    private NaturalPersonRepository naturalPersonRepository;
 
    @Autowired
    private CompanyRepository companyRepository;
 
    @Autowired
    private PasswordEncoder passwordEncoder;
 
    @Override
    public void registerNatural(RegisterNaturalDTO dto) {
 
        // Verificar correo duplicado en ambas colecciones
        if (naturalPersonRepository.findByCorreoElectronico(dto.getCorreoElectronico()) != null) {
            throw new IllegalArgumentException("Ya existe una cuenta con ese correo electrónico.");
        }
        if (companyRepository.findByCorreoElectronico(dto.getCorreoElectronico()) != null) {
            throw new IllegalArgumentException("Ya existe una cuenta con ese correo electrónico.");
        }
 
        naturalPerson person = new naturalPerson();
        person.setNombres(dto.getNombres());
        person.setPrimerApellido(dto.getPrimerApellido());
        person.setSegundoApellido(dto.getSegundoApellido());
        person.setTipoDocumento(dto.getTipoDocumento());
        person.setNumeroDocumento(dto.getNumeroDocumento());
        person.setCorreoElectronico(dto.getCorreoElectronico());
        person.setNumeroTelefono(dto.getNumeroTelefono());
        // Contraseña encriptada con BCrypt
        person.setContrasena(passwordEncoder.encode(dto.getContrasena()));
 
        naturalPersonRepository.save(person);
    }
 
    @Override
    public void registerEmpresa(RegisterEmpresaDTO dto) {
 
        // Verificar correo y NIT duplicados
        if (companyRepository.findByCorreoElectronico(dto.getCorreoElectronico()) != null) {
            throw new IllegalArgumentException("Ya existe una cuenta con ese correo electrónico.");
        }
        if (naturalPersonRepository.findByCorreoElectronico(dto.getCorreoElectronico()) != null) {
            throw new IllegalArgumentException("Ya existe una cuenta con ese correo electrónico.");
        }
        if (companyRepository.findByNit(dto.getNit()) != null) {
            throw new IllegalArgumentException("Ya existe una empresa registrada con ese NIT.");
        }
 
        companyModel company = new companyModel();
        company.setRazonSocial(dto.getRazonSocial());
        company.setFiguraLegal(dto.getFiguraLegal());
        company.setNit(dto.getNit());
        company.setCorreoElectronico(dto.getCorreoElectronico());
        company.setNumeroTelefono(dto.getNumeroTelefono());
        company.setContrasena(passwordEncoder.encode(dto.getContrasena()));
 
        companyRepository.save(company);
    }
}


