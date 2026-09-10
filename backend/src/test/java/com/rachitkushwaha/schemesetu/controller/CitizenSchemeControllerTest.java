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

import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
    void matchSchemes_returnsMatchedSchemesWithExplanations_defaultEnglish() {
        Scheme scheme = new Scheme();
        scheme.setId(1L);
        scheme.setName("PM Kisan");
        scheme.setDescription("Income support for farmers.");
        scheme.setCategory("SUBSIDY");
        scheme.setIssuingBody("Ministry of Agriculture");
        scheme.setSourceUrl("https://pmkisan.gov.in");
        scheme.setApplicationProcess("Apply at pmkisan.gov.in");

        EligibilityRule rule = new EligibilityRule(scheme, "OCCUPATION", "EQ", "FARMER", "ACTIVE");
        RuleMatchingEngine.SchemeMatch match = new RuleMatchingEngine.SchemeMatch(scheme, List.of(rule));

        when(schemeService.getAllSchemes()).thenReturn(List.of(scheme));
        when(ruleMatchingEngine.findMatchingSchemes(any(CitizenProfile.class), anyList())).thenReturn(List.of(match));
        when(retrievalService.retrieveContext(eq(1L), eq(5))).thenReturn(List.of(new Document("Chunk context")));
        when(explanationService.generateExplanation(any(), any(), anyList(), anyList(), anyString()))
                .thenReturn(new ExplanationDto("You qualify as a farmer.", List.of("Apply online"), false));

        ResponseEntity<List<SchemeMatchResponse>> response = controller.matchSchemes(
                30, 10000.0, "UP", "OBC", "FARMER", "MALE", 1.5, "en"
        );

        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());

        SchemeMatchResponse item = response.getBody().get(0);
        assertEquals(1L, item.schemeId());
        assertEquals("PM Kisan", item.schemeName());
        assertEquals("Income support for farmers.", item.description());
        assertEquals("Apply at pmkisan.gov.in", item.applicationProcess());
        assertTrue(item.translationAvailable());
        assertEquals("You qualify as a farmer.", item.explanation().reasoning());
        assertFalse(item.explanation().usedFallback());
    }

    @Test
    void matchSchemes_returnsStructuredMatchedCriteriaWithActualValues() {
        Scheme scheme = new Scheme();
        scheme.setId(1L);
        scheme.setName("Kanya Vidyadhan");
        scheme.setDescription("Support for students");

        EligibilityRule rule1 = new EligibilityRule(scheme, "AGE", "BETWEEN", "15,25", "ACTIVE");
        EligibilityRule rule2 = new EligibilityRule(scheme, "STATE", "EQ", "Uttar Pradesh", "ACTIVE");
        com.rachitkushwaha.schemesetu.dto.MatchedCriterionDto crit1 = new com.rachitkushwaha.schemesetu.dto.MatchedCriterionDto("AGE", "BETWEEN", "15,25", "20");
        com.rachitkushwaha.schemesetu.dto.MatchedCriterionDto crit2 = new com.rachitkushwaha.schemesetu.dto.MatchedCriterionDto("STATE", "EQ", "Uttar Pradesh", "Uttar Pradesh");
        RuleMatchingEngine.SchemeMatch match = new RuleMatchingEngine.SchemeMatch(scheme, List.of(rule1, rule2), List.of(crit1, crit2));

        when(schemeService.getAllSchemes()).thenReturn(List.of(scheme));
        when(ruleMatchingEngine.findMatchingSchemes(any(CitizenProfile.class), anyList())).thenReturn(List.of(match));
        when(retrievalService.retrieveContext(eq(1L), eq(5))).thenReturn(List.of(new Document("Chunk context")));
        when(explanationService.generateExplanation(any(), any(), anyList(), anyList(), anyString()))
                .thenReturn(new ExplanationDto("Eligible", List.of("Apply online"), false));

        ResponseEntity<List<SchemeMatchResponse>> response = controller.matchSchemes(
                20, 15000.0, "Uttar Pradesh", "OBC", "STUDENT", "FEMALE", null, "en"
        );

        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());

        SchemeMatchResponse item = response.getBody().get(0);
        assertNotNull(item.matchedCriteria());
        assertEquals(2, item.matchedCriteria().size());
        assertEquals("AGE", item.matchedCriteria().get(0).field());
        assertEquals("BETWEEN", item.matchedCriteria().get(0).operator());
        assertEquals("15,25", item.matchedCriteria().get(0).ruleValue());
        assertEquals("20", item.matchedCriteria().get(0).actualValue());
        assertEquals("STATE", item.matchedCriteria().get(1).field());
        assertEquals("Uttar Pradesh", item.matchedCriteria().get(1).actualValue());
    }

    @Test
    void matchSchemes_withHindiLang_returnsHindiTranslatedContentWhenAvailable() {
        Scheme scheme = new Scheme();
        scheme.setId(1L);
        scheme.setName("Mukhyamantri Kanya Vidyadhan Yojana");
        scheme.setDescription("Financial assistance of ₹30,000 for girl students.");
        scheme.setCategory("SCHOLARSHIP");
        scheme.setIssuingBody("Government of UP");
        scheme.setSourceUrl("https://scholarship.up.gov.in");
        scheme.setApplicationProcess("Visit scholarship.up.gov.in and apply.");

        Map<String, Map<String, String>> translations = new HashMap<>();
        translations.put("hi", Map.of(
                "name", "मुख्यमंत्री कन्या विद्याधन योजना",
                "description", "छात्राओं के लिए ₹30,000 की वित्तीय सहायता।",
                "applicationProcess", "scholarship.up.gov.in पर जाएं और आवेदन करें।"
        ));
        scheme.setTranslations(translations);

        EligibilityRule rule = new EligibilityRule(scheme, "GENDER", "EQ", "FEMALE", "ACTIVE");
        RuleMatchingEngine.SchemeMatch match = new RuleMatchingEngine.SchemeMatch(scheme, List.of(rule));

        when(schemeService.getAllSchemes()).thenReturn(List.of(scheme));
        when(ruleMatchingEngine.findMatchingSchemes(any(CitizenProfile.class), anyList())).thenReturn(List.of(match));
        when(retrievalService.retrieveContext(eq(1L), eq(5))).thenReturn(List.of(new Document("Chunk context")));
        when(explanationService.generateExplanation(any(), any(), anyList(), anyList(), anyString()))
                .thenReturn(new ExplanationDto("आप पात्र हैं।", List.of("scholarship.up.gov.in पर आवेदन करें"), false));

        ResponseEntity<List<SchemeMatchResponse>> response = controller.matchSchemes(
                20, 15000.0, "UP", "OBC", "STUDENT", "FEMALE", null, "hi"
        );

        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());

        SchemeMatchResponse item = response.getBody().get(0);
        assertEquals(1L, item.schemeId());
        assertEquals("मुख्यमंत्री कन्या विद्याधन योजना", item.schemeName());
        assertEquals("छात्राओं के लिए ₹30,000 की वित्तीय सहायता।", item.description());
        assertEquals("scholarship.up.gov.in पर जाएं और आवेदन करें।", item.applicationProcess());
        assertTrue(item.translationAvailable());
    }

    @Test
    void matchSchemes_withHindiLang_fallsBackToEnglishWhenNoTranslation() {
        Scheme scheme = new Scheme();
        scheme.setId(2L);
        scheme.setName("UP Skill Development Mission");
        scheme.setDescription("Free skill training for youth.");
        scheme.setCategory("SKILL_DEVELOPMENT");
        scheme.setIssuingBody("Government of UP");
        scheme.setSourceUrl("https://upsdm.gov.in");
        scheme.setApplicationProcess("Register at upsdm.gov.in");
        scheme.setTranslations(new HashMap<>()); // No "hi" translation

        EligibilityRule rule = new EligibilityRule(scheme, "AGE", "BETWEEN", "18,35", "ACTIVE");
        RuleMatchingEngine.SchemeMatch match = new RuleMatchingEngine.SchemeMatch(scheme, List.of(rule));

        when(schemeService.getAllSchemes()).thenReturn(List.of(scheme));
        when(ruleMatchingEngine.findMatchingSchemes(any(CitizenProfile.class), anyList())).thenReturn(List.of(match));
        when(retrievalService.retrieveContext(eq(2L), eq(5))).thenReturn(List.of(new Document("Chunk context")));
        when(explanationService.generateExplanation(any(), any(), anyList(), anyList(), anyString()))
                .thenReturn(new ExplanationDto("You qualify based on age.", List.of("Register online"), false));

        ResponseEntity<List<SchemeMatchResponse>> response = controller.matchSchemes(
                22, 10000.0, "UP", "GENERAL", "UNEMPLOYED", "MALE", null, "hi"
        );

        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());

        SchemeMatchResponse item = response.getBody().get(0);
        assertEquals(2L, item.schemeId());
        assertEquals("UP Skill Development Mission", item.schemeName());
        assertEquals("Free skill training for youth.", item.description());
        assertEquals("Register at upsdm.gov.in", item.applicationProcess());
        assertFalse(item.translationAvailable());
    }

    @Test
    void matchSchemes_whenNoSchemesMatch_returnsEmptyListWith200OK() {
        Scheme scheme = new Scheme();
        scheme.setId(1L);
        scheme.setName("PM Kisan");

        when(schemeService.getAllSchemes()).thenReturn(List.of(scheme));
        when(ruleMatchingEngine.findMatchingSchemes(any(CitizenProfile.class), anyList())).thenReturn(List.of());

        ResponseEntity<List<SchemeMatchResponse>> response = controller.matchSchemes(
                50, 500000.0, "Delhi", "GENERAL", "SOFTWARE_ENGINEER", "MALE", 0.0, "en"
        );

        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isEmpty());

        verifyNoInteractions(retrievalService, explanationService);
    }
}
