package com.rachitkushwaha.schemesetu.service;

import com.rachitkushwaha.schemesetu.dto.SchemeTranslationDto;
import com.rachitkushwaha.schemesetu.entity.Scheme;
import com.rachitkushwaha.schemesetu.repository.SchemeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
public class SchemeTranslationService {

    private static final Logger log = LoggerFactory.getLogger(SchemeTranslationService.class);
    private final ChatClient chatClient;
    private final SchemeRepository schemeRepository;

    @Autowired
    public SchemeTranslationService(ChatModel chatModel, SchemeRepository schemeRepository) {
        this.chatClient = ChatClient.builder(chatModel).build();
        this.schemeRepository = schemeRepository;
    }

    public SchemeTranslationService(ChatClient chatClient, SchemeRepository schemeRepository) {
        this.chatClient = chatClient;
        this.schemeRepository = schemeRepository;
    }

    @Transactional
    public Scheme translateAndStoreScheme(Long schemeId, String lang) {
        Scheme scheme = schemeRepository.findById(schemeId)
                .orElseThrow(() -> new IllegalArgumentException("Scheme not found with ID: " + schemeId));

        if (lang == null || lang.isBlank()) {
            lang = "hi";
        }
        String langKey = lang.trim().toLowerCase();
        if (!"hi".equals(langKey)) {
            throw new IllegalArgumentException("Unsupported translation language: '" + lang + "'. Only 'hi' (Hindi) translation is supported.");
        }

        String targetLanguage = "Hindi";

        String userPrompt = """
            Translate the following Indian government welfare scheme details into %s (language code: %s).

            Scheme Details:
            - Name: %s
            - Description: %s
            - Application Process: %s

            CRITICAL TRANSLATION INSTRUCTIONS:
            - Translate accurately, professionally, and naturally into %s.
            - You MUST preserve all specific numerical figures, quantities, monetary amounts, and currency symbols exactly as they are without alterations (e.g. ₹30,000, 12th, ₹2,00,000, 15, 25 must remain unchanged).
            - You MUST preserve all URLs, portal domains, email addresses, and technical identifiers exactly as they are without translating them (e.g. scholarship.up.gov.in, pmkisan.gov.in must remain unchanged).
            - Provide the translated name, description, and applicationProcess.
            """.formatted(
                targetLanguage,
                langKey,
                scheme.getName() != null ? scheme.getName() : "",
                scheme.getDescription() != null ? scheme.getDescription() : "",
                scheme.getApplicationProcess() != null ? scheme.getApplicationProcess() : "",
                targetLanguage
        );

        SchemeTranslationDto translationDto = chatClient.prompt()
                .user(userPrompt)
                .call()
                .entity(SchemeTranslationDto.class);

        if (translationDto == null) {
            throw new IllegalStateException("Translation returned empty result from LLM for scheme ID: " + schemeId);
        }

        Map<String, String> translationMap = new HashMap<>();
        translationMap.put("name", translationDto.name() != null ? translationDto.name() : scheme.getName());
        translationMap.put("description", translationDto.description() != null ? translationDto.description() : scheme.getDescription());
        translationMap.put("applicationProcess", translationDto.applicationProcess() != null ? translationDto.applicationProcess() : scheme.getApplicationProcess());

        Map<String, Map<String, String>> allTranslations = scheme.getTranslations();
        if (allTranslations == null) {
            allTranslations = new HashMap<>();
        }
        allTranslations.put(langKey, translationMap);
        scheme.setTranslations(allTranslations);

        log.info("Successfully translated and stored translations for schemeId: {}, lang: {}", schemeId, langKey);
        return schemeRepository.save(scheme);
    }
}
