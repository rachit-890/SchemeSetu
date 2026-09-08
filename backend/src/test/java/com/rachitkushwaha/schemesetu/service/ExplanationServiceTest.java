package com.rachitkushwaha.schemesetu.service;

import com.rachitkushwaha.schemesetu.dto.CitizenProfile;
import com.rachitkushwaha.schemesetu.dto.ExplanationDto;
import com.rachitkushwaha.schemesetu.entity.EligibilityRule;
import com.rachitkushwaha.schemesetu.entity.Scheme;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

class ExplanationServiceTest {

    private ChatModel chatModel;
    private ExplanationService explanationService;

    @BeforeEach
    void setUp() {
        chatModel = mock(ChatModel.class);
        explanationService = new ExplanationService(chatModel);
    }

    @Test
    void generateExplanation_whenRetrievedDocsEmpty_returnsFixedFallbackWithoutCallingLLM() {
        Scheme scheme = new Scheme();
        scheme.setId(1L);
        scheme.setName("Test Scheme");

        CitizenProfile profile = new CitizenProfile(25, 15000.0, "UP", "GENERAL", "STUDENT", "FEMALE", 0.0);

        ExplanationDto result = explanationService.generateExplanation(scheme, profile, Collections.emptyList(), Collections.emptyList());

        assertNotNull(result);
        assertEquals("No information available for this scheme.", result.reasoning());
        assertTrue(result.applicationSteps().isEmpty());
        assertTrue(result.usedFallback());

        verifyNoInteractions(chatModel);
    }

    @Test
    void generateExplanation_whenRetrievedDocsEmpty_hindi_returnsHindiFallbackWithoutCallingLLM() {
        Scheme scheme = new Scheme();
        scheme.setId(1L);
        scheme.setName("Test Scheme");

        CitizenProfile profile = new CitizenProfile(25, 15000.0, "UP", "GENERAL", "STUDENT", "FEMALE", 0.0);

        ExplanationDto result = explanationService.generateExplanation(scheme, profile, Collections.emptyList(), Collections.emptyList(), "hi");

        assertNotNull(result);
        assertEquals("इस योजना के लिए कोई जानकारी उपलब्ध नहीं है।", result.reasoning());
        assertTrue(result.applicationSteps().isEmpty());
        assertTrue(result.usedFallback());

        verifyNoInteractions(chatModel);
    }

    @Test
    void generateExplanation_whenLLMThrowsException_returnsRuleBasedFallback() {
        ChatClient chatClient = mock(ChatClient.class);
        ChatClient.ChatClientRequestSpec requestSpec = mock(ChatClient.ChatClientRequestSpec.class);

        when(chatClient.prompt()).thenReturn(requestSpec);
        when(requestSpec.user(anyString())).thenReturn(requestSpec);
        when(requestSpec.call()).thenThrow(new RuntimeException("401 Unauthorized / Billing limit exceeded"));

        ExplanationService serviceWithMockChat = new ExplanationService(chatClient);

        Scheme scheme = new Scheme();
        scheme.setId(1L);
        scheme.setName("PM Kisan");

        EligibilityRule rule1 = new EligibilityRule(scheme, "AGE", "BETWEEN", "18,60", "ACTIVE");
        EligibilityRule rule2 = new EligibilityRule(scheme, "MONTHLY_INCOME", "LTE", "200000", "ACTIVE");

        Document doc = new Document("PM Kisan details");

        ExplanationDto result = serviceWithMockChat.generateExplanation(scheme, null, List.of(rule1, rule2), List.of(doc));

        assertNotNull(result);
        assertTrue(result.usedFallback());
        assertTrue(result.reasoning().contains("age (between 18,60)"));
        assertTrue(result.reasoning().contains("monthly income (below or equal to 200000)"));
        assertTrue(result.applicationSteps().isEmpty());
    }

    @Test
    void generateExplanation_whenLLMThrowsException_hindi_returnsHindiRuleBasedFallback() {
        ChatClient chatClient = mock(ChatClient.class);
        ChatClient.ChatClientRequestSpec requestSpec = mock(ChatClient.ChatClientRequestSpec.class);

        when(chatClient.prompt()).thenReturn(requestSpec);
        when(requestSpec.user(anyString())).thenReturn(requestSpec);
        when(requestSpec.call()).thenThrow(new RuntimeException("API error"));

        ExplanationService serviceWithMockChat = new ExplanationService(chatClient);

        Scheme scheme = new Scheme();
        scheme.setId(1L);
        scheme.setName("PM Kisan");

        EligibilityRule rule1 = new EligibilityRule(scheme, "OCCUPATION", "EQ", "FARMER", "ACTIVE");
        Document doc = new Document("PM Kisan details");

        ExplanationDto result = serviceWithMockChat.generateExplanation(scheme, null, List.of(rule1), List.of(doc), "hi");

        assertNotNull(result);
        assertTrue(result.usedFallback());
        assertTrue(result.reasoning().startsWith("आप इन पात्रता नियमों के आधार पर योग्य प्रतीत होते हैं:"));
        assertTrue(result.reasoning().contains("occupation (FARMER)"));
    }

    @Test
    void generateExplanation_withHindiLang_callsChatClientWithHindiPrompt() {
        ChatClient chatClient = mock(ChatClient.class);
        ChatClient.ChatClientRequestSpec requestSpec = mock(ChatClient.ChatClientRequestSpec.class);
        ChatClient.CallResponseSpec callResponseSpec = mock(ChatClient.CallResponseSpec.class);

        when(chatClient.prompt()).thenReturn(requestSpec);
        ArgumentCaptor<String> promptCaptor = ArgumentCaptor.forClass(String.class);
        when(requestSpec.user(promptCaptor.capture())).thenReturn(requestSpec);
        when(requestSpec.call()).thenReturn(callResponseSpec);

        ExplanationDto mockDto = new ExplanationDto("आप छात्र होने के कारण इस योजना के लिए पात्र हैं।", List.of("पोर्टल पर जाएं"), false);
        when(callResponseSpec.entity(ExplanationDto.class)).thenReturn(mockDto);

        ExplanationService serviceWithMockChat = new ExplanationService(chatClient);

        Scheme scheme = new Scheme();
        scheme.setId(10L);
        scheme.setName("UP Scholarship");
        Document doc = new Document("UP Scholarship portal scholarship.up.gov.in provides ₹30,000");

        ExplanationDto result = serviceWithMockChat.generateExplanation(scheme, null, List.of(), List.of(doc), "hi");

        assertNotNull(result);
        assertFalse(result.usedFallback());
        assertEquals("आप छात्र होने के कारण इस योजना के लिए पात्र हैं।", result.reasoning());

        String capturedPrompt = promptCaptor.getValue();
        assertTrue(capturedPrompt.contains("Hindi"));
        assertTrue(capturedPrompt.contains("language code: hi"));
        assertTrue(capturedPrompt.contains("UP Scholarship"));
    }
}
