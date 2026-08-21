package com.rachitkushwaha.schemesetu.service;

import com.rachitkushwaha.schemesetu.dto.CitizenProfile;
import com.rachitkushwaha.schemesetu.entity.EligibilityRule;
import com.rachitkushwaha.schemesetu.entity.Scheme;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class RuleMatchingEngineTest {

    private RuleMatchingEngine engine;

    @BeforeEach
    void setUp() {
        engine = new RuleMatchingEngine();
    }

    @Test
    void testOperatorEQ() {
        Scheme scheme = createSchemeWithRule("STATE", "EQ", "Uttar Pradesh", "ACTIVE");
        CitizenProfile profileMatch = new CitizenProfile(null, null, "Uttar Pradesh", null, null, null, null);
        CitizenProfile profileNoMatch = new CitizenProfile(null, null, "Bihar", null, null, null, null);

        assertEquals(1, engine.findMatchingSchemes(profileMatch, List.of(scheme)).size());
        assertEquals(0, engine.findMatchingSchemes(profileNoMatch, List.of(scheme)).size());
    }

    @Test
    void testOperatorLT() {
        Scheme scheme = createSchemeWithRule("MONTHLY_INCOME", "LT", "20000", "ACTIVE");
        CitizenProfile match = new CitizenProfile(null, 15000.0, null, null, null, null, null);
        CitizenProfile noMatch = new CitizenProfile(null, 25000.0, null, null, null, null, null);

        assertEquals(1, engine.findMatchingSchemes(match, List.of(scheme)).size());
        assertEquals(0, engine.findMatchingSchemes(noMatch, List.of(scheme)).size());
    }

    @Test
    void testOperatorLTE() {
        Scheme scheme = createSchemeWithRule("MONTHLY_INCOME", "LTE", "20000", "ACTIVE");
        CitizenProfile matchEqual = new CitizenProfile(null, 20000.0, null, null, null, null, null);
        CitizenProfile noMatch = new CitizenProfile(null, 20001.0, null, null, null, null, null);

        assertEquals(1, engine.findMatchingSchemes(matchEqual, List.of(scheme)).size());
        assertEquals(0, engine.findMatchingSchemes(noMatch, List.of(scheme)).size());
    }

    @Test
    void testOperatorGT() {
        Scheme scheme = createSchemeWithRule("AGE", "GT", "18", "ACTIVE");
        CitizenProfile match = new CitizenProfile(19, null, null, null, null, null, null);
        CitizenProfile noMatch = new CitizenProfile(18, null, null, null, null, null, null);

        assertEquals(1, engine.findMatchingSchemes(match, List.of(scheme)).size());
        assertEquals(0, engine.findMatchingSchemes(noMatch, List.of(scheme)).size());
    }

    @Test
    void testOperatorGTE() {
        Scheme scheme = createSchemeWithRule("AGE", "GTE", "18", "ACTIVE");
        CitizenProfile matchEqual = new CitizenProfile(18, null, null, null, null, null, null);
        CitizenProfile noMatch = new CitizenProfile(17, null, null, null, null, null, null);

        assertEquals(1, engine.findMatchingSchemes(matchEqual, List.of(scheme)).size());
        assertEquals(0, engine.findMatchingSchemes(noMatch, List.of(scheme)).size());
    }

    @Test
    void testOperatorIN() {
        Scheme scheme = createSchemeWithRule("CASTE_CATEGORY", "IN", "SC,ST,OBC", "ACTIVE");
        CitizenProfile match = new CitizenProfile(null, null, null, "OBC", null, null, null);
        CitizenProfile noMatch = new CitizenProfile(null, null, null, "GENERAL", null, null, null);

        assertEquals(1, engine.findMatchingSchemes(match, List.of(scheme)).size());
        assertEquals(0, engine.findMatchingSchemes(noMatch, List.of(scheme)).size());
    }

    @Test
    void testOperatorBETWEEN() {
        Scheme scheme = createSchemeWithRule("AGE", "BETWEEN", "18,35", "ACTIVE");
        CitizenProfile match = new CitizenProfile(25, null, null, null, null, null, null);
        CitizenProfile noMatchHigh = new CitizenProfile(40, null, null, null, null, null, null);

        assertEquals(1, engine.findMatchingSchemes(match, List.of(scheme)).size());
        assertEquals(0, engine.findMatchingSchemes(noMatchHigh, List.of(scheme)).size());
    }

    @Test
    void testMultiConditionMatch_allRulesMustMatch() {
        Scheme scheme = new Scheme();
        scheme.setId(1L);
        scheme.setName("Multi Rule Scheme");

        List<EligibilityRule> rules = List.of(
                new EligibilityRule(scheme, "AGE", "BETWEEN", "18,60", "ACTIVE"),
                new EligibilityRule(scheme, "STATE", "EQ", "Uttar Pradesh", "ACTIVE"),
                new EligibilityRule(scheme, "MONTHLY_INCOME", "LTE", "15000", "ACTIVE")
        );
        scheme.setRules(rules);

        CitizenProfile fullMatch = new CitizenProfile(25, 12000.0, "Uttar Pradesh", "OBC", "FARMER", "MALE", 1.5);
        List<RuleMatchingEngine.SchemeMatch> matches = engine.findMatchingSchemes(fullMatch, List.of(scheme));

        assertEquals(1, matches.size());
        assertEquals(3, matches.get(0).matchedRules().size());
    }

    @Test
    void testPendingReviewAndRejectedRulesExcludedFromEvaluation() {
        Scheme scheme = new Scheme();
        scheme.setId(2L);
        scheme.setName("Rule Status Test Scheme");

        List<EligibilityRule> rules = List.of(
                new EligibilityRule(scheme, "AGE", "GTE", "18", "ACTIVE"),
                new EligibilityRule(scheme, "MONTHLY_INCOME", "LTE", "5000", "PENDING_REVIEW"),
                new EligibilityRule(scheme, "STATE", "EQ", "Delhi", "REJECTED")
        );
        scheme.setRules(rules);

        // Profile passes ACTIVE age rule, but fails pending income rule & rejected state rule.
        // Since non-ACTIVE rules are excluded, the scheme should match based on ACTIVE age rule only.
        CitizenProfile profile = new CitizenProfile(25, 50000.0, "Uttar Pradesh", "GENERAL", "OTHER", "MALE", 0.0);
        List<RuleMatchingEngine.SchemeMatch> matches = engine.findMatchingSchemes(profile, List.of(scheme));

        assertEquals(1, matches.size());
        assertEquals(1, matches.get(0).matchedRules().size());
        assertEquals("AGE", matches.get(0).matchedRules().get(0).getField());
    }

    @Test
    void testFailsToMatchWhenOneActiveRuleFails() {
        Scheme scheme = new Scheme();
        scheme.setId(3L);
        scheme.setName("Partial Match Scheme");

        List<EligibilityRule> rules = List.of(
                new EligibilityRule(scheme, "AGE", "GTE", "18", "ACTIVE"),
                new EligibilityRule(scheme, "STATE", "EQ", "Bihar", "ACTIVE")
        );
        scheme.setRules(rules);

        CitizenProfile profile = new CitizenProfile(25, null, "Uttar Pradesh", null, null, null, null);
        List<RuleMatchingEngine.SchemeMatch> matches = engine.findMatchingSchemes(profile, List.of(scheme));

        assertEquals(0, matches.size());
    }

    private Scheme createSchemeWithRule(String field, String operator, String value, String status) {
        Scheme scheme = new Scheme();
        scheme.setId(100L);
        scheme.setName("Test Scheme");
        EligibilityRule rule = new EligibilityRule(scheme, field, operator, value, status);
        scheme.setRules(List.of(rule));
        return scheme;
    }
}
