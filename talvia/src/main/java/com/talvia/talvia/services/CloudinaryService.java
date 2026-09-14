package com.talvia.talvia.services;

import org.springframework.web.multipart.MultipartFile;

import com.talvia.talvia.dto.request.CloudinaryUploadResultDTO;

public interface CloudinaryService {
    CloudinaryUploadResultDTO subir(MultipartFile archivo, String carpeta) throws Exception;
    void eliminar(String publicId) throws Exception;
}
