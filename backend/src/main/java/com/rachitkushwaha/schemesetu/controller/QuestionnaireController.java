package com.rachitkushwaha.schemesetu.controller;

import com.rachitkushwaha.schemesetu.dto.AnswerRequest;
import com.rachitkushwaha.schemesetu.dto.QuestionnaireAnswerResponse;
import com.rachitkushwaha.schemesetu.dto.QuestionnaireStartResponse;
import com.rachitkushwaha.schemesetu.exception.RateLimitExceededException;
import com.rachitkushwaha.schemesetu.service.QuestionnaireService;
import com.rachitkushwaha.schemesetu.service.RateLimiterService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/questionnaire")
public class QuestionnaireController {

    private final QuestionnaireService questionnaireService;
    private final RateLimiterService rateLimiterService;

    public QuestionnaireController(QuestionnaireService questionnaireService,
                                   RateLimiterService rateLimiterService) {
        this.questionnaireService = questionnaireService;
        this.rateLimiterService = rateLimiterService;
    }

    @PostMapping("/start")
    public ResponseEntity<QuestionnaireStartResponse> startSession(
            @RequestParam(name = "lang", defaultValue = "en") String lang,
            HttpServletRequest request) {
        rateLimiterService.checkRateLimit(request);
        QuestionnaireStartResponse response = questionnaireService.startSession(lang);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{sessionId}/answer")
    public ResponseEntity<QuestionnaireAnswerResponse> submitAnswer(
            @PathVariable(name = "sessionId") Long sessionId,
            @RequestBody AnswerRequest request,
            @RequestParam(name = "lang", defaultValue = "en") String lang) {
        QuestionnaireAnswerResponse response = questionnaireService.submitAnswer(sessionId, request, lang);
        return ResponseEntity.ok(response);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgumentException(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, String>> handleIllegalStateException(IllegalStateException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(RateLimitExceededException.class)
    public ResponseEntity<Map<String, String>> handleRateLimitExceededException(RateLimitExceededException ex) {
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(Map.of("error", ex.getMessage()));
    }
}
