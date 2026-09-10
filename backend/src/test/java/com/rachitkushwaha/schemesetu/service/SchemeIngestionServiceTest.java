package com.rachitkushwaha.schemesetu.service;

import com.rachitkushwaha.schemesetu.dto.ExtractedRuleDto;
import com.rachitkushwaha.schemesetu.dto.IngestionSummaryDto;
import com.rachitkushwaha.schemesetu.entity.EligibilityRule;
import com.rachitkushwaha.schemesetu.entity.Scheme;
import com.rachitkushwaha.schemesetu.repository.EligibilityRuleRepository;
import com.rachitkushwaha.schemesetu.repository.SchemeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.ai.chat.model.ChatModel;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class SchemeIngestionServiceTest {

    private SchemeRepository schemeRepository;
    private EligibilityRuleRepository eligibilityRuleRepository;
    private RuleValidator ruleValidator;
    private ChatModel chatModel;
    private SchemeEmbeddingService schemeEmbeddingService;
    private SchemeIngestionService schemeIngestionService;

    @BeforeEach
    void setUp() {
        schemeRepository = mock(SchemeRepository.class);
        eligibilityRuleRepository = mock(EligibilityRuleRepository.class);
        ruleValidator = new RuleValidator();
        chatModel = mock(ChatModel.class);
        schemeEmbeddingService = mock(SchemeEmbeddingService.class);

        schemeIngestionService = spy(new SchemeIngestionService(
                chatModel,
                ruleValidator,
                schemeRepository,
                eligibilityRuleRepository,
                schemeEmbeddingService
        ));
    }

    @Test
    void testIngestSchemeRulesPersistsOnlyValidRulesAsPendingReview() {
        Long schemeId = 1L;
        Scheme mockScheme = new Scheme("Kanya Vidyadhan", "Scholarship scheme", "SCHOLARSHIP", "UP Govt", "http://example.com", "Apply online", "ACTIVE");
        mockScheme.setId(schemeId);

        when(schemeRepository.findById(schemeId)).thenReturn(Optional.of(mockScheme));
        when(schemeEmbeddingService.embedScheme(mockScheme, "sample text")).thenReturn(2);

        List<ExtractedRuleDto> mockExtracted = List.of(
                new ExtractedRuleDto("AGE", "BETWEEN", "15,25"),
                new ExtractedRuleDto("INCOME_LEVEL", "LTE", "200000") // Invalid field
        );

        doReturn(mockExtracted).when(schemeIngestionService).extractEligibilityRules(anyString());
        doReturn(List.of("Class 12 marksheet", "Income certificate")).when(schemeIngestionService).extractRequiredDocuments(anyString());
        when(eligibilityRuleRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));

        IngestionSummaryDto summary = schemeIngestionService.ingestSchemeRules(schemeId, "sample text");

        assertEquals(schemeId, summary.schemeId());
        assertEquals(1, summary.rulesPersistedCount());
        assertEquals(1, summary.rejectedRules().size());
        assertEquals("INCOME_LEVEL", summary.rejectedRules().get(0).rawRule().field());
        assertEquals(2, summary.embeddedChunkCount());

        verify(schemeRepository).save(mockScheme);
        assertEquals(List.of("Class 12 marksheet", "Income certificate"), mockScheme.getRequiredDocuments());
        verify(schemeEmbeddingService).embedScheme(mockScheme, "sample text");

        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<EligibilityRule>> captor = ArgumentCaptor.forClass(List.class);
        verify(eligibilityRuleRepository).saveAll(captor.capture());

        List<EligibilityRule> savedRules = captor.getValue();
        assertEquals(1, savedRules.size());
        EligibilityRule savedRule = savedRules.get(0);
        assertEquals("AGE", savedRule.getField());
        assertEquals("BETWEEN", savedRule.getOperator());
        assertEquals("15,25", savedRule.getValue());
        assertEquals("PENDING_REVIEW", savedRule.getStatus());
        assertNull(savedRule.getId());
        assertEquals(mockScheme, savedRule.getScheme());
    }

    @Test
    void testExtractRequiredDocumentsFallbackOnException() {
        // Calling real extractRequiredDocuments with a mock chatModel that throws returns empty list gracefully
        when(chatModel.call(any(org.springframework.ai.chat.prompt.Prompt.class))).thenThrow(new RuntimeException("LLM service unavailable"));

        List<String> docs = schemeIngestionService.extractRequiredDocuments("Some scheme text");
        assertNotNull(docs);
        assertTrue(docs.isEmpty());
    }

    @Test
    void testIngestSchemeRules_rejectsBlankSchemeText() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                schemeIngestionService.ingestSchemeRules(1L, "   ")
        );
        assertEquals("Scheme text must not be null or blank", ex.getMessage());
    }

    @Test
    void testIngestSchemeRules_rejectsOversizedSchemeText() {
        String oversizedText = "a".repeat(10001);
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                schemeIngestionService.ingestSchemeRules(1L, oversizedText)
        );
        assertEquals("Scheme text exceeds maximum allowed length of 10000 characters", ex.getMessage());
    }
}
