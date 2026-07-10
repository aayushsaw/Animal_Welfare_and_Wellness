package com.animalwelfare.config;

import com.cloudinary.Cloudinary;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Map;

/**
 * Cloudinary configuration.
 *
 * In development (no CLOUDINARY_API_KEY set), the service falls back
 * to saving images locally under /assets/stray_animals/.
 * In production, all uploads go to Cloudinary CDN.
 */
@Configuration
public class CloudinaryConfig {

    @Value("${app.cloudinary.cloud-name}")
    private String cloudName;

    @Value("${app.cloudinary.api-key}")
    private String apiKey;

    @Value("${app.cloudinary.api-secret}")
    private String apiSecret;

    @Bean
    public Cloudinary cloudinary() {
        String urlEnv = System.getenv("CLOUDINARY_URL");
        if (urlEnv != null && !urlEnv.isBlank()) {
            return new Cloudinary(urlEnv);
        }
        return new Cloudinary(Map.of(
                "cloud_name", cloudName,
                "api_key",    apiKey,
                "api_secret", apiSecret,
                "secure",     true
        ));
    }
}
