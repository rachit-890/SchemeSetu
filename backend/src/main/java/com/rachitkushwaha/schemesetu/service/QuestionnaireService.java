package com.rachitkushwaha.schemesetu.service;

import com.rachitkushwaha.schemesetu.config.QuestionnaireRegistry;
import com.rachitkushwaha.schemesetu.dto.*;
import com.rachitkushwaha.schemesetu.entity.QuestionnaireAnswer;
import com.rachitkushwaha.schemesetu.entity.QuestionnaireSession;
import com.rachitkushwaha.schemesetu.entity.Scheme;
import com.rachitkushwaha.schemesetu.repository.QuestionnaireAnswerRepository;
import com.rachitkushwaha.schemesetu.repository.QuestionnaireSessionRepository;
import org.springframework.ai.document.Document;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class QuestionnaireService {

    private final QuestionnaireSessionRepository sessionRepository;
    private final QuestionnaireAnswerRepository answerRepository;
    private final QuestionnaireRegistry questionnaireRegistry;
    private final SchemeService schemeService;
    private final RuleMatchingEngine ruleMatchingEngine;
    private final RetrievalService retrievalService;
    private final ExplanationService explanationService;

    public QuestionnaireService(QuestionnaireSessionRepository sessionRepository,
                                QuestionnaireAnswerRepository answerRepository,
                                QuestionnaireRegistry questionnaireRegistry,
                                SchemeService schemeService,
                                RuleMatchingEngine ruleMatchingEngine,
                                RetrievalService retrievalService,
                                ExplanationService explanationService) {
        this.sessionRepository = sessionRepository;
        this.answerRepository = answerRepository;
        this.questionnaireRegistry = questionnaireRegistry;
        this.schemeService = schemeService;
        this.ruleMatchingEngine = ruleMatchingEngine;
        this.retrievalService = retrievalService;
        this.explanationService = explanationService;
    }

    @Transactional
    public QuestionnaireStartResponse startSession(String lang) {
        QuestionnaireSession session = new QuestionnaireSession();
        session.setStatus("IN_PROGRESS");
        session = sessionRepository.save(session);

        Optional<QuestionDefinition> firstQuestionOpt = questionnaireRegistry.getNextApplicableQuestion(0, Collections.emptyMap());
        QuestionDto firstQuestionDto = firstQuestionOpt.map(def -> QuestionDto.fromDefinition(def, lang)).orElse(null);

        return new QuestionnaireStartResponse(session.getId(), session.getStatus(), firstQuestionDto);
    }

    @Transactional
    public QuestionnaireAnswerResponse submitAnswer(Long sessionId, AnswerRequest request, String lang) {
        if (request == null || request.fieldName() == null || request.fieldName().isBlank()) {
            throw new IllegalArgumentException("Field name is required in answer request.");
        }

        String fieldName = request.fieldName().trim();
        validateAnswerValue(fieldName, request.value());

        QuestionDefinition targetDef = questionnaireRegistry.getAllQuestions().stream()
                .filter(q -> q.fieldName().equalsIgnoreCase(fieldName))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unknown field: " + fieldName));

        QuestionnaireSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("QuestionnaireSession not found for id: " + sessionId));

        if ("COMPLETED".equalsIgnoreCase(session.getStatus())) {
            throw new IllegalStateException("QuestionnaireSession is already completed for id: " + sessionId);
        }

        Map<String, String> existingAnswersMap = session.getAnswers().stream()
                .collect(Collectors.toMap(
                        QuestionnaireAnswer::getFieldName,
                        QuestionnaireAnswer::getValue,
                        (existing, replacement) -> replacement
                ));

        int lastAnsweredQuestionId = session.getAnswers().stream()
                .map(ans -> questionnaireRegistry.getAllQuestions().stream()
                        .filter(q -> q.fieldName().equalsIgnoreCase(ans.getFieldName()))
                        .map(QuestionDefinition::id)
                        .findFirst().orElse(0))
                .max(Integer::compareTo)
                .orElse(0);

        Optional<QuestionDefinition> expectedNextOpt = questionnaireRegistry.getNextApplicableQuestion(lastAnsweredQuestionId, existingAnswersMap);

        if (expectedNextOpt.isEmpty()) {
            throw new IllegalStateException("All questions have already been answered for session: " + sessionId);
        }

        QuestionDefinition expectedNext = expectedNextOpt.get();
        if (!expectedNext.fieldName().equalsIgnoreCase(fieldName)) {
            throw new IllegalArgumentException("Invalid field order. Expected next field: '" 
                    + expectedNext.fieldName() + "', but got: '" + fieldName + "'");
        }

        QuestionnaireAnswer newAnswer = new QuestionnaireAnswer(session, targetDef.fieldName(), request.value().trim());
        session.addAnswer(newAnswer);
        answerRepository.save(newAnswer);

        Map<String, String> updatedAnswersMap = new HashMap<>(existingAnswersMap);
        updatedAnswersMap.put(targetDef.fieldName(), request.value().trim());

        Optional<QuestionDefinition> nextQuestionOpt = questionnaireRegistry.getNextApplicableQuestion(targetDef.id(), updatedAnswersMap);

        if (nextQuestionOpt.isPresent()) {
            QuestionDto nextQuestionDto = QuestionDto.fromDefinition(nextQuestionOpt.get(), lang);
            return new QuestionnaireAnswerResponse(session.getId(), session.getStatus(), nextQuestionDto, null);
        } else {
            session.setStatus("COMPLETED");
            sessionRepository.save(session);

            CitizenProfile profile = buildCitizenProfile(updatedAnswersMap);
            List<SchemeMatchResponse> matchResults = executeSchemeMatchingPipeline(profile);

            return new QuestionnaireAnswerResponse(session.getId(), session.getStatus(), null, matchResults);
        }
    }

    private void validateAnswerValue(String fieldName, String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Answer value cannot be empty for field: " + fieldName);
        }
        String trimmed = value.trim();
        if ("age".equalsIgnoreCase(fieldName)) {
            try {
                int ageVal = Integer.parseInt(trimmed);
                if (ageVal <= 0 || ageVal > 120) {
                    throw new IllegalArgumentException("Age must be between 1 and 120.");
                }
            } catch (NumberFormatException e) {
                throw new IllegalArgumentException("Age must be a valid integer number: " + value);
            }
        } else if ("monthlyIncome".equalsIgnoreCase(fieldName)) {
            try {
                double incomeVal = Double.parseDouble(trimmed);
                if (incomeVal < 0) {
                    throw new IllegalArgumentException("Monthly income cannot be negative.");
                }
            } catch (NumberFormatException e) {
                throw new IllegalArgumentException("Monthly income must be a valid number: " + value);
            }
        } else if ("landHoldingAcres".equalsIgnoreCase(fieldName)) {
            try {
                double landVal = Double.parseDouble(trimmed);
                if (landVal < 0) {
                    throw new IllegalArgumentException("Land holding acres cannot be negative.");
                }
            } catch (NumberFormatException e) {
                throw new IllegalArgumentException("Land holding acres must be a valid number: " + value);
            }
        }
    }

    public CitizenProfile buildCitizenProfile(Map<String, String> answers) {
        Integer age = parseInteger(answers.get("age"));
        Double monthlyIncome = parseDouble(answers.get("monthlyIncome"));
        String state = answers.get("state");
        String casteCategory = answers.get("casteCategory");
        String occupation = answers.get("occupation");
        String gender = answers.get("gender");
        Double landHoldingAcres = parseDouble(answers.get("landHoldingAcres"));

        return new CitizenProfile(
                age,
                monthlyIncome,
                state,
                casteCategory,
                occupation,
                gender,
                landHoldingAcres
        );
    }

    private List<SchemeMatchResponse> executeSchemeMatchingPipeline(CitizenProfile profile) {
        List<Scheme> candidateSchemes = schemeService.getAllSchemes();
        List<RuleMatchingEngine.SchemeMatch> matches = ruleMatchingEngine.findMatchingSchemes(profile, candidateSchemes);

        return matches.stream().map(match -> {
            Scheme scheme = match.scheme();
            List<Document> docs = retrievalService.retrieveContext(scheme.getId(), 5);
            ExplanationDto explanation = explanationService.generateExplanation(scheme, profile, match.matchedRules(), docs);

            List<String> matchedCriteriaStrings = match.matchedRules().stream()
                    .map(r -> r.getField() + " " + r.getOperator() + " " + r.getValue())
                    .toList();

            return new SchemeMatchResponse(
                    scheme.getId(),
                    scheme.getName(),
                    scheme.getCategory(),
                    scheme.getIssuingBody(),
                    scheme.getSourceUrl(),
                    matchedCriteriaStrings,
                    explanation
            );
        }).toList();
    }

    private Integer parseInteger(String val) {
        if (val == null || val.isBlank()) {
            return null;
        }
        try {
            return Integer.parseInt(val.trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private Double parseDouble(String val) {
        if (val == null || val.isBlank()) {
            return null;
        }
        try {
            return Double.parseDouble(val.trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
