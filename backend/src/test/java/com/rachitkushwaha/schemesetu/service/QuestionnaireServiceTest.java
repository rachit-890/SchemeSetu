package com.rachitkushwaha.schemesetu.service;

import com.rachitkushwaha.schemesetu.config.QuestionnaireRegistry;
import com.rachitkushwaha.schemesetu.dto.*;
import com.rachitkushwaha.schemesetu.entity.QuestionnaireAnswer;
import com.rachitkushwaha.schemesetu.entity.QuestionnaireSession;
import com.rachitkushwaha.schemesetu.entity.Scheme;
import com.rachitkushwaha.schemesetu.repository.QuestionnaireAnswerRepository;
import com.rachitkushwaha.schemesetu.repository.QuestionnaireSessionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.ai.document.Document;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class QuestionnaireServiceTest {

    private QuestionnaireSessionRepository sessionRepository;
    private QuestionnaireAnswerRepository answerRepository;
    private QuestionnaireRegistry questionnaireRegistry;
    private SchemeService schemeService;
    private RuleMatchingEngine ruleMatchingEngine;
    private RetrievalService retrievalService;
    private ExplanationService explanationService;
    private QuestionnaireService questionnaireService;

    @BeforeEach
    void setUp() {
        sessionRepository = mock(QuestionnaireSessionRepository.class);
        answerRepository = mock(QuestionnaireAnswerRepository.class);
        questionnaireRegistry = new QuestionnaireRegistry();
        schemeService = mock(SchemeService.class);
        ruleMatchingEngine = mock(RuleMatchingEngine.class);
        retrievalService = mock(RetrievalService.class);
        explanationService = mock(ExplanationService.class);

        questionnaireService = new QuestionnaireService(
                sessionRepository,
                answerRepository,
                questionnaireRegistry,
                schemeService,
                ruleMatchingEngine,
                retrievalService,
                explanationService
        );
    }

    @Test
    void farmerWalkthrough_asksAll7QuestionsAndCompletes() {
        QuestionnaireSession session = new QuestionnaireSession();
        session.setId(100L);
        session.setStatus("IN_PROGRESS");

        when(sessionRepository.save(any(QuestionnaireSession.class))).thenAnswer(invocation -> {
            QuestionnaireSession s = invocation.getArgument(0);
            if (s.getId() == null) s.setId(100L);
            return s;
        });
        when(sessionRepository.findById(100L)).thenReturn(Optional.of(session));

        Scheme scheme = new Scheme();
        scheme.setId(1L);
        scheme.setName("PM Kisan");
        RuleMatchingEngine.SchemeMatch match = new RuleMatchingEngine.SchemeMatch(scheme, List.of());

        when(schemeService.getAllSchemes()).thenReturn(List.of(scheme));
        when(ruleMatchingEngine.findMatchingSchemes(any(CitizenProfile.class), anyList())).thenReturn(List.of(match));
        when(retrievalService.retrieveContext(eq(1L), anyInt())).thenReturn(List.of(new Document("doc")));
        when(explanationService.generateExplanation(any(), any(), anyList(), anyList()))
                .thenReturn(new ExplanationDto("Qualifies", List.of("Apply online"), false));

        // Start session -> gets Question 1 (age)
        QuestionnaireStartResponse startResp = questionnaireService.startSession("en");
        assertNotNull(startResp);
        assertEquals(100L, startResp.sessionId());
        assertEquals("IN_PROGRESS", startResp.status());
        assertEquals("age", startResp.question().fieldName());

        // Answer 1: age -> next is gender
        QuestionnaireAnswerResponse r1 = questionnaireService.submitAnswer(100L, new AnswerRequest("age", "30"), "en");
        assertEquals("gender", r1.question().fieldName());

        // Answer 2: gender -> next is state
        QuestionnaireAnswerResponse r2 = questionnaireService.submitAnswer(100L, new AnswerRequest("gender", "Male"), "en");
        assertEquals("state", r2.question().fieldName());

        // Answer 3: state -> next is casteCategory
        QuestionnaireAnswerResponse r3 = questionnaireService.submitAnswer(100L, new AnswerRequest("state", "UP"), "en");
        assertEquals("casteCategory", r3.question().fieldName());

        // Answer 4: casteCategory -> next is occupation
        QuestionnaireAnswerResponse r4 = questionnaireService.submitAnswer(100L, new AnswerRequest("casteCategory", "OBC"), "en");
        assertEquals("occupation", r4.question().fieldName());

        // Answer 5: occupation = FARMER -> next is monthlyIncome
        QuestionnaireAnswerResponse r5 = questionnaireService.submitAnswer(100L, new AnswerRequest("occupation", "FARMER"), "en");
        assertEquals("monthlyIncome", r5.question().fieldName());

        // Answer 6: monthlyIncome -> next is landHoldingAcres (Question 7 asked because FARMER!)
        QuestionnaireAnswerResponse r6 = questionnaireService.submitAnswer(100L, new AnswerRequest("monthlyIncome", "15000"), "en");
        assertEquals("landHoldingAcres", r6.question().fieldName());

        // Answer 7: landHoldingAcres -> completes session
        QuestionnaireAnswerResponse r7 = questionnaireService.submitAnswer(100L, new AnswerRequest("landHoldingAcres", "2.5"), "en");
        assertEquals("COMPLETED", r7.status());
        assertNull(r7.question());
        assertNotNull(r7.results());
        assertEquals(1, r7.results().size());
        assertEquals("PM Kisan", r7.results().get(0).schemeName());
    }

    @Test
    void nonFarmerWalkthrough_skipsLandHoldingAcresQuestion() {
        QuestionnaireSession session = new QuestionnaireSession();
        session.setId(101L);
        session.setStatus("IN_PROGRESS");

        when(sessionRepository.save(any(QuestionnaireSession.class))).thenAnswer(invocation -> {
            QuestionnaireSession s = invocation.getArgument(0);
            if (s.getId() == null) s.setId(101L);
            return s;
        });
        when(sessionRepository.findById(101L)).thenReturn(Optional.of(session));
        when(schemeService.getAllSchemes()).thenReturn(List.of());
        when(ruleMatchingEngine.findMatchingSchemes(any(CitizenProfile.class), anyList())).thenReturn(List.of());

        // Answer 1: age
        questionnaireService.submitAnswer(101L, new AnswerRequest("age", "22"), "en");
        // Answer 2: gender
        questionnaireService.submitAnswer(101L, new AnswerRequest("gender", "Female"), "en");
        // Answer 3: state
        questionnaireService.submitAnswer(101L, new AnswerRequest("state", "Delhi"), "en");
        // Answer 4: casteCategory
        questionnaireService.submitAnswer(101L, new AnswerRequest("casteCategory", "GENERAL"), "en");

        // Answer 5: occupation = Student (NON-FARMER)
        QuestionnaireAnswerResponse r5 = questionnaireService.submitAnswer(101L, new AnswerRequest("occupation", "Student"), "en");
        // Confirm next question is monthlyIncome (question 6), skipping landHoldingAcres (question 7)!
        assertEquals("monthlyIncome", r5.question().fieldName());
        assertNotEquals("landHoldingAcres", r5.question().fieldName());

        // Answer 6: monthlyIncome -> completes session directly
        QuestionnaireAnswerResponse r6 = questionnaireService.submitAnswer(101L, new AnswerRequest("monthlyIncome", "20000"), "en");
        assertEquals("COMPLETED", r6.status());
        assertNull(r6.question());
        assertNotNull(r6.results());
        assertTrue(r6.results().isEmpty());
    }

    @Test
    void submitAnswer_unknownFieldName_throwsIllegalArgumentException() {
        QuestionnaireSession session = new QuestionnaireSession();
        session.setId(102L);
        when(sessionRepository.findById(102L)).thenReturn(Optional.of(session));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                questionnaireService.submitAnswer(102L, new AnswerRequest("invalidField", "123"), "en")
        );
        assertTrue(ex.getMessage().contains("Unknown field: invalidField"));
    }

    @Test
    void submitAnswer_outOfOrderField_throwsIllegalArgumentException() {
        QuestionnaireSession session = new QuestionnaireSession();
        session.setId(103L);
        when(sessionRepository.findById(103L)).thenReturn(Optional.of(session));

        // Session expects 'age' first, but submitting 'gender'
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                questionnaireService.submitAnswer(103L, new AnswerRequest("gender", "Male"), "en")
        );
        assertTrue(ex.getMessage().contains("Invalid field order. Expected next field: 'age', but got: 'gender'"));
    }

    @Test
    void submitAnswer_alreadyCompletedSession_throwsIllegalStateException() {
        QuestionnaireSession session = new QuestionnaireSession();
        session.setId(104L);
        session.setStatus("COMPLETED");
        when(sessionRepository.findById(104L)).thenReturn(Optional.of(session));

        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                questionnaireService.submitAnswer(104L, new AnswerRequest("age", "25"), "en")
        );
        assertTrue(ex.getMessage().contains("QuestionnaireSession is already completed for id: 104"));
    }
}
