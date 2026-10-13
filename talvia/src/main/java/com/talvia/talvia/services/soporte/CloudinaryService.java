package com.talvia.talvia.services.soporte;

import org.springframework.web.multipart.MultipartFile;

import com.talvia.talvia.dto.request.comunes.CloudinaryUploadResultDTO;

public interface CloudinaryService {
    CloudinaryUploadResultDTO subir(MultipartFile archivo, String carpeta) throws Exception;
    void eliminar(String publicId) throws Exception;
}
