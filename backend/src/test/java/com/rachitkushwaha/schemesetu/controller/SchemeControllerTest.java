package com.rachitkushwaha.schemesetu.controller;

import com.rachitkushwaha.schemesetu.dto.CreateSchemeRequest;
import com.rachitkushwaha.schemesetu.dto.IngestRequestDto;
import com.rachitkushwaha.schemesetu.dto.IngestionSummaryDto;
import com.rachitkushwaha.schemesetu.entity.Scheme;
import com.rachitkushwaha.schemesetu.exception.RateLimitExceededException;
import com.rachitkushwaha.schemesetu.service.RateLimiterService;
import com.rachitkushwaha.schemesetu.service.SchemeIngestionService;
import com.rachitkushwaha.schemesetu.service.SchemeService;
import com.rachitkushwaha.schemesetu.service.SchemeTranslationService;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class SchemeControllerTest {

    private SchemeService schemeService;
    private SchemeIngestionService schemeIngestionService;
    private SchemeTranslationService schemeTranslationService;
    private RateLimiterService rateLimiterService;
    private SchemeController controller;

    @BeforeEach
    void setUp() {
        schemeService = mock(SchemeService.class);
        schemeIngestionService = mock(SchemeIngestionService.class);
        schemeTranslationService = mock(SchemeTranslationService.class);
        rateLimiterService = mock(RateLimiterService.class);
        controller = new SchemeController(schemeService, schemeIngestionService, schemeTranslationService, rateLimiterService);
    }

    @Test
    void createScheme_withValidRequest_returns201Created() {
        CreateSchemeRequest request = new CreateSchemeRequest(
                "PM Kisan Samman Nidhi",
                "Direct income support for farmers",
                "AGRICULTURE",
                "Ministry of Agriculture",
                "https://pmkisan.gov.in",
                "Online apply",
                "ACTIVE"
        );

        Scheme savedScheme = request.toEntity();
        savedScheme.setId(1L);

        when(schemeService.createScheme(any(Scheme.class))).thenReturn(savedScheme);

        ResponseEntity<Scheme> response = controller.createScheme(request);

        assertNotNull(response);
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1L, response.getBody().getId());
        assertEquals("PM Kisan Samman Nidhi", response.getBody().getName());
        assertEquals("Direct income support for farmers", response.getBody().getDescription());
        verify(schemeService).createScheme(any(Scheme.class));
    }

    @Test
    void ingestSchemeRules_checksRateLimit_andReturnsSummary() {
        HttpServletRequest httpRequest = mock(HttpServletRequest.class);
        IngestRequestDto ingestRequest = new IngestRequestDto("Sample scheme text");
        IngestionSummaryDto summary = new IngestionSummaryDto(1L, 2, List.of(), 1);

        when(schemeIngestionService.ingestSchemeRules(1L, "Sample scheme text")).thenReturn(summary);

        ResponseEntity<?> response = controller.ingestSchemeRules(1L, ingestRequest, httpRequest);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(rateLimiterService).checkAdminRateLimit(httpRequest, "ingest");
    }

    @Test
    void translateScheme_checksRateLimit_andReturnsTranslatedScheme() {
        HttpServletRequest httpRequest = mock(HttpServletRequest.class);
        Scheme scheme = new Scheme();
        scheme.setId(1L);

        when(schemeTranslationService.translateAndStoreScheme(1L, "hi")).thenReturn(scheme);

        ResponseEntity<?> response = controller.translateScheme(1L, "hi", httpRequest);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(rateLimiterService).checkAdminRateLimit(httpRequest, "translate");
    }

    @Test
    void handleRateLimitExceededException_returns429TooManyRequests() {
        RateLimitExceededException ex = new RateLimitExceededException("Admin rate limit exceeded for ingest. Maximum 20 requests per hour allowed.");
        ResponseEntity<Map<String, String>> response = controller.handleRateLimitExceededException(ex);

        assertEquals(HttpStatus.TOO_MANY_REQUESTS, response.getStatusCode());
        assertEquals("Admin rate limit exceeded for ingest. Maximum 20 requests per hour allowed.", response.getBody().get("error"));
    }

    @Test
    void handleValidationExceptions_returns400WithFieldErrors() {
        CreateSchemeRequest invalidRequest = new CreateSchemeRequest(
                "",
                "",
                "AGRICULTURE",
                "Ministry of Agriculture",
                "https://pmkisan.gov.in",
                "Online apply",
                "ACTIVE"
        );

        BeanPropertyBindingResult bindingResult = new BeanPropertyBindingResult(invalidRequest, "createSchemeRequest");
        bindingResult.addError(new FieldError("createSchemeRequest", "name", "Scheme name is required"));
        bindingResult.addError(new FieldError("createSchemeRequest", "description", "Scheme description is required"));

        MethodArgumentNotValidException ex = new MethodArgumentNotValidException(null, bindingResult);

        ResponseEntity<Map<String, Object>> response = controller.handleValidationExceptions(ex);

        assertNotNull(response);
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Validation failed", response.getBody().get("error"));
        @SuppressWarnings("unchecked")
        Map<String, String> details = (Map<String, String>) response.getBody().get("details");
        assertNotNull(details);
        assertEquals("Scheme name is required", details.get("name"));
        assertEquals("Scheme description is required", details.get("description"));
    }

    @Test
    void handleValidationExceptions_withIngestRequestDto_returns400WithSchemeTextError() {
        IngestRequestDto invalidRequest = new IngestRequestDto("a".repeat(10001));

        BeanPropertyBindingResult bindingResult = new BeanPropertyBindingResult(invalidRequest, "ingestRequestDto");
        bindingResult.addError(new FieldError("ingestRequestDto", "schemeText", "Scheme text must not exceed 10000 characters"));

        MethodArgumentNotValidException ex = new MethodArgumentNotValidException(null, bindingResult);

        ResponseEntity<Map<String, Object>> response = controller.handleValidationExceptions(ex);

        assertNotNull(response);
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Validation failed", response.getBody().get("error"));
        @SuppressWarnings("unchecked")
        Map<String, String> details = (Map<String, String>) response.getBody().get("details");
        assertNotNull(details);
        assertEquals("Scheme text must not exceed 10000 characters", details.get("schemeText"));
    }
}
