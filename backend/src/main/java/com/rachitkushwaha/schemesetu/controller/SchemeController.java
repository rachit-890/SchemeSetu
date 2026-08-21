package com.rachitkushwaha.schemesetu.controller;

import com.rachitkushwaha.schemesetu.dto.IngestRequestDto;
import com.rachitkushwaha.schemesetu.dto.IngestionSummaryDto;
import com.rachitkushwaha.schemesetu.dto.PendingRuleDto;
import com.rachitkushwaha.schemesetu.entity.EligibilityRule;
import com.rachitkushwaha.schemesetu.entity.Scheme;
import com.rachitkushwaha.schemesetu.service.SchemeIngestionService;
import com.rachitkushwaha.schemesetu.service.SchemeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/schemes")
public class SchemeController {

    private final SchemeService schemeService;
    private final SchemeIngestionService schemeIngestionService;

    public SchemeController(SchemeService schemeService, SchemeIngestionService schemeIngestionService) {
        this.schemeService = schemeService;
        this.schemeIngestionService = schemeIngestionService;
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
    public ResponseEntity<Scheme> createScheme(@RequestBody Scheme scheme) {
        Scheme created = schemeService.createScheme(scheme);
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
    public ResponseEntity<?> ingestSchemeRules(@PathVariable Long id, @RequestBody IngestRequestDto request) {
        try {
            String text = (request != null && request.schemeText() != null) ? request.schemeText() : "";
            IngestionSummaryDto summary = schemeIngestionService.ingestSchemeRules(id, text);
            return ResponseEntity.ok(summary);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            String errorMsg = e.getMessage() != null ? e.getMessage() : "Ingestion processing failed";
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
}
