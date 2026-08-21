package com.rachitkushwaha.schemesetu.controller;

import com.rachitkushwaha.schemesetu.dto.CitizenProfile;
import com.rachitkushwaha.schemesetu.dto.ExplanationDto;
import com.rachitkushwaha.schemesetu.dto.SchemeMatchResponse;
import com.rachitkushwaha.schemesetu.entity.EligibilityRule;
import com.rachitkushwaha.schemesetu.entity.Scheme;
import com.rachitkushwaha.schemesetu.service.ExplanationService;
import com.rachitkushwaha.schemesetu.service.RetrievalService;
import com.rachitkushwaha.schemesetu.service.RuleMatchingEngine;
import com.rachitkushwaha.schemesetu.service.SchemeService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.ai.document.Document;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class CitizenSchemeControllerTest {

    private SchemeService schemeService;
    private RuleMatchingEngine ruleMatchingEngine;
    private RetrievalService retrievalService;
    private ExplanationService explanationService;
    private CitizenSchemeController controller;

    @BeforeEach
    void setUp() {
        schemeService = mock(SchemeService.class);
        ruleMatchingEngine = mock(RuleMatchingEngine.class);
        retrievalService = mock(RetrievalService.class);
        explanationService = mock(ExplanationService.class);
        controller = new CitizenSchemeController(schemeService, ruleMatchingEngine, retrievalService, explanationService);
    }

    @Test
    void matchSchemes_returnsMatchedSchemesWithExplanations() {
        Scheme scheme = new Scheme();
        scheme.setId(1L);
        scheme.setName("PM Kisan");
        scheme.setCategory("SUBSIDY");
        scheme.setIssuingBody("Ministry of Agriculture");
        scheme.setSourceUrl("https://pmkisan.gov.in");

        EligibilityRule rule = new EligibilityRule(scheme, "OCCUPATION", "EQ", "FARMER", "ACTIVE");
        RuleMatchingEngine.SchemeMatch match = new RuleMatchingEngine.SchemeMatch(scheme, List.of(rule));

        when(schemeService.getAllSchemes()).thenReturn(List.of(scheme));
        when(ruleMatchingEngine.findMatchingSchemes(any(CitizenProfile.class), anyList())).thenReturn(List.of(match));
        when(retrievalService.retrieveContext(eq(1L), eq(5))).thenReturn(List.of(new Document("Chunk context")));
        when(explanationService.generateExplanation(any(), any(), anyList(), anyList()))
                .thenReturn(new ExplanationDto("You qualify as a farmer.", List.of("Apply online"), false));

        ResponseEntity<List<SchemeMatchResponse>> response = controller.matchSchemes(
                30, 10000.0, "UP", "OBC", "FARMER", "MALE", 1.5
        );

        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());

        SchemeMatchResponse item = response.getBody().get(0);
        assertEquals(1L, item.schemeId());
        assertEquals("PM Kisan", item.schemeName());
        assertEquals("You qualify as a farmer.", item.explanation().reasoning());
        assertFalse(item.explanation().usedFallback());
    }

    @Test
    void matchSchemes_whenNoSchemesMatch_returnsEmptyListWith200OK() {
        Scheme scheme = new Scheme();
        scheme.setId(1L);
        scheme.setName("PM Kisan");

        when(schemeService.getAllSchemes()).thenReturn(List.of(scheme));
        when(ruleMatchingEngine.findMatchingSchemes(any(CitizenProfile.class), anyList())).thenReturn(List.of());

        ResponseEntity<List<SchemeMatchResponse>> response = controller.matchSchemes(
                50, 500000.0, "Delhi", "GENERAL", "SOFTWARE_ENGINEER", "MALE", 0.0
        );

        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isEmpty());

        verifyNoInteractions(retrievalService, explanationService);
    }
}
