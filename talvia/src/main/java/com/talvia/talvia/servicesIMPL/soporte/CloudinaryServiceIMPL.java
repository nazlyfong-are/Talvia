package com.talvia.talvia.servicesIMPL.soporte;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.talvia.talvia.dto.request.comunes.CloudinaryUploadResultDTO;
import com.talvia.talvia.services.soporte.CloudinaryService;

@Service
public class CloudinaryServiceIMPL implements CloudinaryService {

    @Autowired
    private Cloudinary cloudinary;

    @Override
    public CloudinaryUploadResultDTO subir(MultipartFile archivo, String carpeta) throws Exception {
        String resourceType = determinarResourceType(archivo);

        Map<?, ?> resultado = cloudinary.uploader().upload(
                archivo.getBytes(),
                ObjectUtils.asMap("folder", carpeta, "resource_type", resourceType));

        System.out.println(">>> RESPUESTA CRUDA DE CLOUDINARY: " + resultado); // ← temporal, para diagnosticar

        return new CloudinaryUploadResultDTO((String) resultado.get("secure_url"), (String) resultado.get("public_id"));
    }

    @Override
    public void eliminar(String publicId) throws Exception {
        if (publicId == null || publicId.isBlank())
            return;
        // "raw" cubre PDFs/documentos; si el recurso era imagen, Cloudinary igual
        // permite destroy con resource_type explícito.
        // Para simplificar, probamos primero como "image" y si falla, como "raw".
        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.asMap("resource_type", "image"));
        } catch (Exception ignoredImage) {
            cloudinary.uploader().destroy(publicId, ObjectUtils.asMap("resource_type", "raw"));
        }
    }

    private String determinarResourceType(MultipartFile archivo) {
        String contentType = archivo.getContentType();
        if (contentType != null && contentType.startsWith("image/")) {
            return "image";
        }
        // PDFs, Word, etc. van como "raw" en Cloudinary
        return "raw";
    }
}
