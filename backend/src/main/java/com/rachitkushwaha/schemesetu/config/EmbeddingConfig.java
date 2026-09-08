package com.rachitkushwaha.schemesetu.config;

import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.google.genai.text.GoogleGenAiTextEmbeddingModel;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class EmbeddingConfig {

    @Bean
    @Primary
    public EmbeddingModel normalizingEmbeddingModel(GoogleGenAiTextEmbeddingModel googleGenAiEmbeddingModel) {
        return new NormalizingEmbeddingModel(googleGenAiEmbeddingModel);
    }
}
