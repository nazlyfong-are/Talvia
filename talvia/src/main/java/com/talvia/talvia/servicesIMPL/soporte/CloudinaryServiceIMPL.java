package com.talvia.talvia.servicesIMPL.soporte;

import java.util.Map;
import java.util.UUID;

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

        Map<String, Object> opciones = new java.util.HashMap<>();
        opciones.put("folder", carpeta);
        opciones.put("resource_type", resourceType);

        if ("raw".equals(resourceType)) {
            String extension = extraerExtension(archivo.getOriginalFilename());
            if (extension != null) {
                String idUnico = UUID.randomUUID().toString();
                opciones.put("public_id", idUnico + "." + extension);
            }
        }

        Map<?, ?> resultado = cloudinary.uploader().upload(archivo.getBytes(), opciones);

        return new CloudinaryUploadResultDTO((String) resultado.get("secure_url"), (String) resultado.get("public_id"));
    }

    @Override
    public void eliminar(String publicId) throws Exception {
        if (publicId == null || publicId.isBlank())
            return;
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
        return "raw";
    }

    private String extraerExtension(String nombreOriginal) {
        if (nombreOriginal == null || !nombreOriginal.contains(".")) {
            return null;
        }
        return nombreOriginal.substring(nombreOriginal.lastIndexOf('.') + 1).toLowerCase();
    }
}