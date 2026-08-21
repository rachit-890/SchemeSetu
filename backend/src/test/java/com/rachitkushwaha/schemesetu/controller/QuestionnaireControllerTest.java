package com.rachitkushwaha.schemesetu.controller;

import com.rachitkushwaha.schemesetu.dto.AnswerRequest;
import com.rachitkushwaha.schemesetu.dto.QuestionDto;
import com.rachitkushwaha.schemesetu.dto.QuestionnaireAnswerResponse;
import com.rachitkushwaha.schemesetu.dto.QuestionnaireStartResponse;
import com.rachitkushwaha.schemesetu.exception.RateLimitExceededException;
import com.rachitkushwaha.schemesetu.service.QuestionnaireService;
import com.rachitkushwaha.schemesetu.service.RateLimiterService;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class QuestionnaireControllerTest {

    private QuestionnaireService questionnaireService;
    private RateLimiterService rateLimiterService;
    private QuestionnaireController controller;

    @BeforeEach
    void setUp() {
        questionnaireService = mock(QuestionnaireService.class);
        rateLimiterService = mock(RateLimiterService.class);
        controller = new QuestionnaireController(questionnaireService, rateLimiterService);
    }

    @Test
    void startSession_returns200OK() {
        HttpServletRequest request = mock(HttpServletRequest.class);
        doNothing().when(rateLimiterService).checkRateLimit(request);

        QuestionDto question = new QuestionDto(1, "age", "What is your age?", "आपकी आयु क्या है?");
        when(questionnaireService.startSession("en")).thenReturn(new QuestionnaireStartResponse(1L, "IN_PROGRESS", question));

        ResponseEntity<QuestionnaireStartResponse> response = controller.startSession("en", request);

        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals(1L, response.getBody().sessionId());
        assertEquals("IN_PROGRESS", response.getBody().status());
        assertEquals("age", response.getBody().question().fieldName());

        verify(rateLimiterService).checkRateLimit(request);
    }

    @Test
    void startSession_whenRateLimitExceeded_returns429TooManyRequests() {
        HttpServletRequest request = mock(HttpServletRequest.class);
        doThrow(new RateLimitExceededException("Rate limit exceeded. Maximum 20 session creations per hour allowed."))
                .when(rateLimiterService).checkRateLimit(request);

        RateLimitExceededException ex = assertThrows(RateLimitExceededException.class, () ->
                controller.startSession("en", request)
        );

        ResponseEntity<Map<String, String>> response = controller.handleRateLimitExceededException(ex);
        assertNotNull(response);
        assertEquals(429, response.getStatusCode().value());
        assertEquals("Rate limit exceeded. Maximum 20 session creations per hour allowed.", response.getBody().get("error"));
    }

    @Test
    void submitAnswer_unknownField_returns400BadRequest() {
        IllegalArgumentException ex = new IllegalArgumentException("Unknown field: invalidField");
        ResponseEntity<Map<String, String>> response = controller.handleIllegalArgumentException(ex);

        assertNotNull(response);
        assertEquals(400, response.getStatusCode().value());
        assertEquals("Unknown field: invalidField", response.getBody().get("error"));
    }

    @Test
    void submitAnswer_outOfOrder_returns400BadRequest() {
        IllegalArgumentException ex = new IllegalArgumentException("Invalid field order. Expected next field: 'age', but got: 'gender'");
        ResponseEntity<Map<String, String>> response = controller.handleIllegalArgumentException(ex);

        assertNotNull(response);
        assertEquals(400, response.getStatusCode().value());
        assertEquals("Invalid field order. Expected next field: 'age', but got: 'gender'", response.getBody().get("error"));
    }

    @Test
    void submitAnswer_completedSession_returns409Conflict() {
        IllegalStateException ex = new IllegalStateException("QuestionnaireSession is already completed for id: 10");
        ResponseEntity<Map<String, String>> response = controller.handleIllegalStateException(ex);

        assertNotNull(response);
        assertEquals(409, response.getStatusCode().value());
        assertEquals("QuestionnaireSession is already completed for id: 10", response.getBody().get("error"));
    }
}
