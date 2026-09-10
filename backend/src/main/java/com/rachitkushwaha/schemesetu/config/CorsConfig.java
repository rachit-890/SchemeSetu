package com.rachitkushwaha.schemesetu.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;

@Configuration
public class CorsConfig {

    private final String allowedOrigins;

    public CorsConfig(@Value("${cors.allowed-origins}") String allowedOrigins) {
        if (allowedOrigins == null || allowedOrigins.isBlank() || allowedOrigins.contains("${")) {
            throw new IllegalArgumentException("cors.allowed-origins configuration property must not be null, blank, or unresolved placeholder: " + allowedOrigins);
        }
        this.allowedOrigins = allowedOrigins;
    }

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                String[] origins = Arrays.stream(allowedOrigins.split(","))
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .toArray(String[]::new);

                registry.addMapping("/**")
                        .allowedOrigins(origins)
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD")
                        .allowedHeaders("Content-Type", "X-Admin-Key", "Accept", "Origin", "Authorization")
                        .allowCredentials(true)
                        .maxAge(3600);
            }
        };
    }
}
