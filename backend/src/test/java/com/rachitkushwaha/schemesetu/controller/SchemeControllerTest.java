package com.rachitkushwaha.schemesetu.controller;

import com.rachitkushwaha.schemesetu.dto.CreateSchemeRequest;
import com.rachitkushwaha.schemesetu.entity.Scheme;
import com.rachitkushwaha.schemesetu.service.SchemeIngestionService;
import com.rachitkushwaha.schemesetu.service.SchemeService;
import com.rachitkushwaha.schemesetu.service.SchemeTranslationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class SchemeControllerTest {

    private SchemeService schemeService;
    private SchemeIngestionService schemeIngestionService;
    private SchemeTranslationService schemeTranslationService;
    private SchemeController controller;

    @BeforeEach
    void setUp() {
        schemeService = mock(SchemeService.class);
        schemeIngestionService = mock(SchemeIngestionService.class);
        schemeTranslationService = mock(SchemeTranslationService.class);
        controller = new SchemeController(schemeService, schemeIngestionService, schemeTranslationService);
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
}
