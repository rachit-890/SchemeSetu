package com.rachitkushwaha.schemesetu.service;

import com.rachitkushwaha.schemesetu.dto.SchemeTranslationDto;
import com.rachitkushwaha.schemesetu.entity.Scheme;
import com.rachitkushwaha.schemesetu.repository.SchemeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.ai.chat.client.ChatClient;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

class SchemeTranslationServiceTest {

    private SchemeRepository schemeRepository;
    private ChatClient chatClient;
    private ChatClient.ChatClientRequestSpec requestSpec;
    private ChatClient.CallResponseSpec callResponseSpec;
    private SchemeTranslationService schemeTranslationService;

    @BeforeEach
    void setUp() {
        schemeRepository = mock(SchemeRepository.class);
        chatClient = mock(ChatClient.class);
        requestSpec = mock(ChatClient.ChatClientRequestSpec.class);
        callResponseSpec = mock(ChatClient.CallResponseSpec.class);

        when(chatClient.prompt()).thenReturn(requestSpec);
        when(requestSpec.user(anyString())).thenReturn(requestSpec);
        when(requestSpec.call()).thenReturn(callResponseSpec);

        schemeTranslationService = new SchemeTranslationService(chatClient, schemeRepository);
    }

    @Test
    void translateAndStoreScheme_success() {
        Long schemeId = 1L;
        Scheme scheme = new Scheme(
                "Mukhyamantri Kanya Vidyadhan Yojana",
                "Financial assistance of ₹30,000 for girl students.",
                "SCHOLARSHIP",
                "Government of UP",
                "https://scholarship.up.gov.in",
                "Visit scholarship.up.gov.in and apply.",
                "ACTIVE"
        );
        scheme.setId(schemeId);

        when(schemeRepository.findById(schemeId)).thenReturn(Optional.of(scheme));
        when(schemeRepository.save(any(Scheme.class))).thenAnswer(inv -> inv.getArgument(0));

        SchemeTranslationDto mockTranslation = new SchemeTranslationDto(
                "मुख्यमंत्री कन्या विद्याधन योजना",
                "छात्राओं के लिए ₹30,000 की वित्तीय सहायता।",
                "scholarship.up.gov.in पर जाएं और आवेदन करें।"
        );
        when(callResponseSpec.entity(SchemeTranslationDto.class)).thenReturn(mockTranslation);

        Scheme result = schemeTranslationService.translateAndStoreScheme(schemeId, "hi");

        assertNotNull(result);
        assertNotNull(result.getTranslations());
        assertTrue(result.getTranslations().containsKey("hi"));

        Map<String, String> hiTranslation = result.getTranslations().get("hi");
        assertEquals("मुख्यमंत्री कन्या विद्याधन योजना", hiTranslation.get("name"));
        assertEquals("छात्राओं के लिए ₹30,000 की वित्तीय सहायता।", hiTranslation.get("description"));
        assertEquals("scholarship.up.gov.in पर जाएं और आवेदन करें।", hiTranslation.get("applicationProcess"));

        verify(schemeRepository).save(scheme);
    }

    @Test
    void translateAndStoreScheme_preservesRupeeAmountsAndUrlsUnchanged() {
        Long schemeId = 2L;
        Scheme scheme = new Scheme(
                "PM Kisan Samman Nidhi",
                "Annual benefit of ₹6,000 in 3 installments.",
                "SUBSIDY",
                "Ministry of Agriculture",
                "https://pmkisan.gov.in",
                "Visit pmkisan.gov.in to check status and apply.",
                "ACTIVE"
        );
        scheme.setId(schemeId);

        when(schemeRepository.findById(schemeId)).thenReturn(Optional.of(scheme));
        when(schemeRepository.save(any(Scheme.class))).thenAnswer(inv -> inv.getArgument(0));

        ArgumentCaptor<String> promptCaptor = ArgumentCaptor.forClass(String.class);
        when(requestSpec.user(promptCaptor.capture())).thenReturn(requestSpec);

        SchemeTranslationDto mockTranslation = new SchemeTranslationDto(
                "पीएम किसान सम्मान निधि",
                "₹6,000 का वार्षिक लाभ 3 किस्तों में।",
                "स्थिति जांचने और आवेदन करने के लिए pmkisan.gov.in पर जाएं।"
        );
        when(callResponseSpec.entity(SchemeTranslationDto.class)).thenReturn(mockTranslation);

        Scheme result = schemeTranslationService.translateAndStoreScheme(schemeId, "hi");

        // Verify prompt explicitly instructs preserving figures and URLs
        String capturedPrompt = promptCaptor.getValue();
        assertTrue(capturedPrompt.contains("CRITICAL TRANSLATION INSTRUCTIONS"));
        assertTrue(capturedPrompt.contains("₹30,000"));
        assertTrue(capturedPrompt.contains("scholarship.up.gov.in"));

        // Verify stored translation preserves ₹ amounts and URLs exactly
        Map<String, String> storedHi = result.getTranslations().get("hi");
        assertNotNull(storedHi);
        assertTrue(storedHi.get("description").contains("₹6,000"));
        assertTrue(storedHi.get("applicationProcess").contains("pmkisan.gov.in"));
    }

    @Test
    void translateAndStoreScheme_preservesExistingTranslationsInMap() {
        Long schemeId = 3L;
        Scheme scheme = new Scheme(
                "UP Scholarship",
                "Scholarship for students.",
                "SCHOLARSHIP",
                "Government of UP",
                "https://scholarship.up.gov.in",
                "Apply at scholarship.up.gov.in",
                "ACTIVE"
        );
        scheme.setId(schemeId);

        // Verify map semantics: existing translation entries are preserved when storing new ones
        Map<String, Map<String, String>> initialTranslations = new HashMap<>();
        initialTranslations.put("existing_lang", Map.of(
                "name", "Existing Name",
                "description", "Existing Description",
                "applicationProcess", "Existing Process"
        ));
        scheme.setTranslations(initialTranslations);

        when(schemeRepository.findById(schemeId)).thenReturn(Optional.of(scheme));
        when(schemeRepository.save(any(Scheme.class))).thenAnswer(inv -> inv.getArgument(0));

        SchemeTranslationDto mockHiTranslation = new SchemeTranslationDto(
                "यूपी छात्रवृत्ति",
                "छात्रों के लिए छात्रवृत्ति।",
                "scholarship.up.gov.in पर आवेदन करें"
        );
        when(callResponseSpec.entity(SchemeTranslationDto.class)).thenReturn(mockHiTranslation);

        Scheme result = schemeTranslationService.translateAndStoreScheme(schemeId, "hi");

        assertNotNull(result.getTranslations());
        assertEquals(2, result.getTranslations().size());
        assertTrue(result.getTranslations().containsKey("existing_lang"));
        assertTrue(result.getTranslations().containsKey("hi"));
        assertEquals("Existing Name", result.getTranslations().get("existing_lang").get("name"));
        assertEquals("यूपी छात्रवृत्ति", result.getTranslations().get("hi").get("name"));
    }

    @Test
    void translateAndStoreScheme_unsupportedLanguage_throwsIllegalArgumentException() {
        Long schemeId = 4L;
        Scheme scheme = new Scheme(
                "UP Scholarship",
                "Scholarship for students.",
                "SCHOLARSHIP",
                "Government of UP",
                "https://scholarship.up.gov.in",
                "Apply at scholarship.up.gov.in",
                "ACTIVE"
        );
        scheme.setId(schemeId);

        when(schemeRepository.findById(schemeId)).thenReturn(Optional.of(scheme));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                schemeTranslationService.translateAndStoreScheme(schemeId, "bn"));

        assertTrue(ex.getMessage().contains("Unsupported translation language"));
        verify(schemeRepository, never()).save(any());
    }

    @Test
    void translateAndStoreScheme_schemeNotFound_throwsIllegalArgumentException() {
        Long schemeId = 999L;
        when(schemeRepository.findById(schemeId)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () ->
                schemeTranslationService.translateAndStoreScheme(schemeId, "hi"));

        verify(schemeRepository, never()).save(any());
    }
}
