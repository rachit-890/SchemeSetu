package com.rachitkushwaha.schemesetu.service;

import com.rachitkushwaha.schemesetu.dto.ExtractedRuleDto;
import com.rachitkushwaha.schemesetu.dto.RuleValidationResult;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class RuleValidatorTest {

    private RuleValidator ruleValidator;

    @BeforeEach
    void setUp() {
        ruleValidator = new RuleValidator();
    }

    @Test
    void testValidRulesPassValidation() {
        List<ExtractedRuleDto> input = List.of(
                new ExtractedRuleDto("AGE", "BETWEEN", "15,25"),
                new ExtractedRuleDto("MONTHLY_INCOME", "LTE", "16666"),
                new ExtractedRuleDto("STATE", "EQ", "Uttar Pradesh"),
                new ExtractedRuleDto("CASTE_CATEGORY", "IN", "General,OBC,SC,ST"),
                new ExtractedRuleDto("GENDER", "EQ", "FEMALE")
        );

        RuleValidationResult result = ruleValidator.validateRules(input);

        assertEquals(5, result.validRules().size());
        assertTrue(result.rejectedRules().isEmpty());
    }

    @Test
    void testCategoricalInOperatorWithStringsAccepted() {
        List<ExtractedRuleDto> input = List.of(
                new ExtractedRuleDto("CASTE_CATEGORY", "IN", "GENERAL,OBC,SC,ST")
        );

        RuleValidationResult result = ruleValidator.validateRules(input);

        assertEquals(1, result.validRules().size());
        assertEquals("CASTE_CATEGORY", result.validRules().get(0).field());
        assertEquals("IN", result.validRules().get(0).operator());
        assertEquals("GENERAL,OBC,SC,ST", result.validRules().get(0).value());
        assertTrue(result.rejectedRules().isEmpty());
    }

    @Test
    void testInvalidFieldIsRejected() {
        List<ExtractedRuleDto> input = List.of(
                new ExtractedRuleDto("INCOME_LEVEL", "LTE", "200000")
        );

        RuleValidationResult result = ruleValidator.validateRules(input);

        assertTrue(result.validRules().isEmpty());
        assertEquals(1, result.rejectedRules().size());
        assertTrue(result.rejectedRules().get(0).reason().contains("field 'INCOME_LEVEL' not in allowed field set"));
    }

    @Test
    void testInvalidOperatorIsRejected() {
        List<ExtractedRuleDto> input = List.of(
                new ExtractedRuleDto("AGE", "LESS_THAN", "25")
        );

        RuleValidationResult result = ruleValidator.validateRules(input);

        assertTrue(result.validRules().isEmpty());
        assertEquals(1, result.rejectedRules().size());
        assertTrue(result.rejectedRules().get(0).reason().contains("operator 'LESS_THAN' not in allowed operator set"));
    }

    @Test
    void testNonNumericValueForNumericFieldIsRejected() {
        List<ExtractedRuleDto> input = List.of(
                new ExtractedRuleDto("AGE", "EQ", "twenty-five")
        );

        RuleValidationResult result = ruleValidator.validateRules(input);

        assertTrue(result.validRules().isEmpty());
        assertEquals(1, result.rejectedRules().size());
        assertTrue(result.rejectedRules().get(0).reason().contains("is not a valid number"));
    }
}
