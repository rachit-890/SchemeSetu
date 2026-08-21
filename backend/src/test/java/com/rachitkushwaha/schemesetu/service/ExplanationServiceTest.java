package com.rachitkushwaha.schemesetu.service;

import com.rachitkushwaha.schemesetu.dto.CitizenProfile;
import com.rachitkushwaha.schemesetu.dto.ExplanationDto;
import com.rachitkushwaha.schemesetu.entity.EligibilityRule;
import com.rachitkushwaha.schemesetu.entity.Scheme;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.ai.anthropic.AnthropicChatModel;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

class ExplanationServiceTest {

    private AnthropicChatModel anthropicChatModel;
    private ExplanationService explanationService;

    @BeforeEach
    void setUp() {
        anthropicChatModel = mock(AnthropicChatModel.class);
        explanationService = new ExplanationService(anthropicChatModel);
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

        verifyNoInteractions(anthropicChatModel);
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
}
