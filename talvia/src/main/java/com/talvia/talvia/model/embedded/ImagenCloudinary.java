package com.talvia.talvia.model.embedded;

import java.time.LocalDateTime;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ImagenCloudinary {

    private String url;
    private String publicId;
    private LocalDateTime fechaSubida;
}
