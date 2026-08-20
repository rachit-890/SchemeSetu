package com.rachitkushwaha.schemesetu.service;

import com.rachitkushwaha.schemesetu.dto.ExtractedRuleDto;
import com.rachitkushwaha.schemesetu.dto.RejectedRuleDto;
import com.rachitkushwaha.schemesetu.dto.RuleValidationResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Component
public class RuleValidator {

    private static final Logger log = LoggerFactory.getLogger(RuleValidator.class);

    public static final Set<String> ALLOWED_FIELDS = Set.of(
            "AGE", "MONTHLY_INCOME", "STATE", "CASTE_CATEGORY", "OCCUPATION", "GENDER", "LAND_HOLDING_ACRES"
    );

    public static final Set<String> ALLOWED_OPERATORS = Set.of(
            "EQ", "LT", "LTE", "GT", "GTE", "IN", "BETWEEN"
    );

    public static final Set<String> NUMERIC_FIELDS = Set.of(
            "AGE", "MONTHLY_INCOME", "LAND_HOLDING_ACRES"
    );

    public static final Set<String> CATEGORICAL_FIELDS = Set.of(
            "STATE", "CASTE_CATEGORY", "OCCUPATION", "GENDER"
    );

    public RuleValidationResult validateRules(List<ExtractedRuleDto> rules) {
        List<ExtractedRuleDto> validRules = new ArrayList<>();
        List<RejectedRuleDto> rejectedRules = new ArrayList<>();

        if (rules == null) {
            return new RuleValidationResult(validRules, rejectedRules);
        }

        for (ExtractedRuleDto rule : rules) {
            String rejectionReason = validateRule(rule);
            if (rejectionReason == null) {
                validRules.add(rule);
            } else {
                log.warn("Rejected eligibility rule DTO [{}]: {}", rule, rejectionReason);
                rejectedRules.add(new RejectedRuleDto(rule, rejectionReason));
            }
        }

        return new RuleValidationResult(validRules, rejectedRules);
    }

    private String validateRule(ExtractedRuleDto rule) {
        if (rule == null) {
            return "Rule DTO is null";
        }

        if (rule.field() == null || !ALLOWED_FIELDS.contains(rule.field())) {
            return "field '" + rule.field() + "' not in allowed field set " + ALLOWED_FIELDS;
        }

        if (rule.operator() == null || !ALLOWED_OPERATORS.contains(rule.operator())) {
            return "operator '" + rule.operator() + "' not in allowed operator set " + ALLOWED_OPERATORS;
        }

        if (rule.value() == null || rule.value().isBlank()) {
            return "value cannot be null or blank";
        }

        String field = rule.field();
        String operator = rule.operator();
        String val = rule.value().trim();

        if (NUMERIC_FIELDS.contains(field)) {
            if ("BETWEEN".equals(operator)) {
                String[] parts = val.split(",");
                if (parts.length != 2) {
                    return "value '" + val + "' for numeric field '" + field + "' with BETWEEN operator must be a 'min,max' pair";
                }
                try {
                    Double.parseDouble(parts[0].trim());
                    Double.parseDouble(parts[1].trim());
                } catch (NumberFormatException e) {
                    return "value '" + val + "' for numeric field '" + field + "' with BETWEEN operator must contain valid numbers";
                }
            } else if ("IN".equals(operator)) {
                String[] parts = val.split(",");
                if (parts.length == 0) {
                    return "value '" + val + "' for numeric field '" + field + "' with IN operator cannot be empty";
                }
                for (String part : parts) {
                    try {
                        Double.parseDouble(part.trim());
                    } catch (NumberFormatException e) {
                        return "value '" + val + "' for numeric field '" + field + "' with IN operator contains invalid number '" + part.trim() + "'";
                    }
                }
            } else {
                try {
                    Double.parseDouble(val);
                } catch (NumberFormatException e) {
                    return "value '" + val + "' for numeric field '" + field + "' is not a valid number";
                }
            }
        } else if (CATEGORICAL_FIELDS.contains(field)) {
            if ("BETWEEN".equals(operator)) {
                String[] parts = val.split(",");
                if (parts.length != 2 || parts[0].isBlank() || parts[1].isBlank()) {
                    return "value '" + val + "' for categorical field '" + field + "' with BETWEEN operator must be a 'val1,val2' pair";
                }
            } else if ("IN".equals(operator)) {
                String[] parts = val.split(",");
                if (parts.length == 0) {
                    return "value '" + val + "' for categorical field '" + field + "' with IN operator cannot be empty";
                }
                for (String part : parts) {
                    if (part.isBlank()) {
                        return "value '" + val + "' for categorical field '" + field + "' with IN operator contains blank value";
                    }
                }
            } else {
                if (val.isEmpty()) {
                    return "value for categorical field '" + field + "' cannot be empty";
                }
            }
        }

        return null; // Valid
    }
}
