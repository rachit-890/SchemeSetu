package com.rachitkushwaha.schemesetu.controller;

import com.rachitkushwaha.schemesetu.dto.CitizenProfile;
import com.rachitkushwaha.schemesetu.dto.ExplanationDto;
import com.rachitkushwaha.schemesetu.dto.SchemeMatchResponse;
import com.rachitkushwaha.schemesetu.entity.Scheme;
import com.rachitkushwaha.schemesetu.service.ExplanationService;
import com.rachitkushwaha.schemesetu.service.RetrievalService;
import com.rachitkushwaha.schemesetu.service.RuleMatchingEngine;
import com.rachitkushwaha.schemesetu.service.SchemeService;
import org.springframework.ai.document.Document;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/v1/schemes")
public class CitizenSchemeController {

    private final SchemeService schemeService;
    private final RuleMatchingEngine ruleMatchingEngine;
    private final RetrievalService retrievalService;
    private final ExplanationService explanationService;

    public CitizenSchemeController(SchemeService schemeService,
                                   RuleMatchingEngine ruleMatchingEngine,
                                   RetrievalService retrievalService,
                                   ExplanationService explanationService) {
        this.schemeService = schemeService;
        this.ruleMatchingEngine = ruleMatchingEngine;
        this.retrievalService = retrievalService;
        this.explanationService = explanationService;
    }

    @GetMapping("/match")
    public ResponseEntity<List<SchemeMatchResponse>> matchSchemes(
            @RequestParam(required = false) Integer age,
            @RequestParam(required = false) Double monthlyIncome,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String casteCategory,
            @RequestParam(required = false) String occupation,
            @RequestParam(required = false) String gender,
            @RequestParam(required = false) Double landHoldingAcres,
            @RequestParam(name = "lang", defaultValue = "en") String lang
    ) {
        CitizenProfile profile = new CitizenProfile(age, monthlyIncome, state, casteCategory, occupation, gender, landHoldingAcres);
        List<Scheme> candidateSchemes = schemeService.getAllSchemes();

        List<RuleMatchingEngine.SchemeMatch> matches = ruleMatchingEngine.findMatchingSchemes(profile, candidateSchemes);

        List<SchemeMatchResponse> responses = new ArrayList<>();
        for (RuleMatchingEngine.SchemeMatch match : matches) {
            Scheme scheme = match.scheme();
            List<Document> docs = retrievalService.retrieveContext(scheme.getId(), 5);
            ExplanationDto explanation = explanationService.generateExplanation(scheme, profile, match.matchedRules(), docs, lang);

            responses.add(SchemeMatchResponse.from(scheme, match.matchedCriteria(), explanation, lang));
        }

        return ResponseEntity.ok(responses);
    }
}
