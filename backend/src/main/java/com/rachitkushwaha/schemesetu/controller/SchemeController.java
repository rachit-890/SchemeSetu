package com.rachitkushwaha.schemesetu.controller;

import com.rachitkushwaha.schemesetu.dto.CreateSchemeRequest;
import com.rachitkushwaha.schemesetu.dto.IngestRequestDto;
import com.rachitkushwaha.schemesetu.dto.IngestionSummaryDto;
import com.rachitkushwaha.schemesetu.dto.PendingRuleDto;
import com.rachitkushwaha.schemesetu.entity.EligibilityRule;
import com.rachitkushwaha.schemesetu.entity.Scheme;
import com.rachitkushwaha.schemesetu.exception.RateLimitExceededException;
import com.rachitkushwaha.schemesetu.service.RateLimiterService;
import com.rachitkushwaha.schemesetu.service.SchemeIngestionService;
import com.rachitkushwaha.schemesetu.service.SchemeService;
import com.rachitkushwaha.schemesetu.service.SchemeTranslationService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/schemes")
public class SchemeController {

    private final SchemeService schemeService;
    private final SchemeIngestionService schemeIngestionService;
    private final SchemeTranslationService schemeTranslationService;
    private final RateLimiterService rateLimiterService;

    public SchemeController(SchemeService schemeService,
                            SchemeIngestionService schemeIngestionService,
                            SchemeTranslationService schemeTranslationService,
                            RateLimiterService rateLimiterService) {
        this.schemeService = schemeService;
        this.schemeIngestionService = schemeIngestionService;
        this.schemeTranslationService = schemeTranslationService;
        this.rateLimiterService = rateLimiterService;
    }

    @GetMapping
    public ResponseEntity<List<Scheme>> getAllSchemes() {
        return ResponseEntity.ok(schemeService.getAllSchemes());
    }

    @GetMapping("/rules/pending")
    public ResponseEntity<List<PendingRuleDto>> getPendingRules() {
        return ResponseEntity.ok(schemeService.getPendingRules());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Scheme> getSchemeById(@PathVariable Long id) {
        return schemeService.getSchemeById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Scheme> createScheme(@Valid @RequestBody CreateSchemeRequest request) {
        Scheme created = schemeService.createScheme(request.toEntity());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Scheme> updateScheme(@PathVariable Long id, @RequestBody Scheme scheme) {
        try {
            Scheme updated = schemeService.updateScheme(id, scheme);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteScheme(@PathVariable Long id) {
        schemeService.deleteScheme(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/ingest")
    public ResponseEntity<?> ingestSchemeRules(
            @PathVariable Long id,
            @Valid @RequestBody IngestRequestDto request,
            HttpServletRequest httpRequest) {
        rateLimiterService.checkAdminRateLimit(httpRequest, "ingest");
        try {
            String text = (request != null && request.schemeText() != null) ? request.schemeText() : "";
            IngestionSummaryDto summary = schemeIngestionService.ingestSchemeRules(id, text);
            return ResponseEntity.ok(summary);
        } catch (IllegalArgumentException e) {
            if (e.getMessage() != null && e.getMessage().contains("Scheme not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            String errorMsg = e.getMessage() != null ? e.getMessage() : "Ingestion processing failed";
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", errorMsg));
        }
    }

    @PostMapping("/{id}/translate")
    public ResponseEntity<?> translateScheme(
            @PathVariable Long id,
            @RequestParam(defaultValue = "hi") String lang,
            HttpServletRequest httpRequest) {
        rateLimiterService.checkAdminRateLimit(httpRequest, "translate");
        if (lang != null && !lang.isBlank() && !"hi".equalsIgnoreCase(lang.trim())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Unsupported translation language: '" + lang + "'. Only 'hi' (Hindi) translation is supported."));
        }
        try {
            Scheme translated = schemeTranslationService.translateAndStoreScheme(id, lang);
            return ResponseEntity.ok(translated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            String errorMsg = e.getMessage() != null ? e.getMessage() : "Translation failed";
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", errorMsg));
        }
    }

    @PostMapping("/{id}/rules/{ruleId}/approve")
    public ResponseEntity<?> approveRule(@PathVariable Long id, @PathVariable Long ruleId) {
        try {
            EligibilityRule rule = schemeService.approveRule(id, ruleId);
            return ResponseEntity.ok(rule);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/rules/{ruleId}/reject")
    public ResponseEntity<?> rejectRule(@PathVariable Long id, @PathVariable Long ruleId) {
        try {
            EligibilityRule rule = schemeService.rejectRule(id, ruleId);
            return ResponseEntity.ok(rule);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
        }
    }

    @ExceptionHandler(RateLimitExceededException.class)
    public ResponseEntity<Map<String, String>> handleRateLimitExceededException(RateLimitExceededException ex) {
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
                errors.put(error.getField(), error.getDefaultMessage())
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "error", "Validation failed",
                "details", errors
        ));
    }
}
