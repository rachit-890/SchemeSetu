package com.rachitkushwaha.schemesetu.service;

import com.rachitkushwaha.schemesetu.dto.CitizenProfile;
import com.rachitkushwaha.schemesetu.dto.MatchedCriterionDto;
import com.rachitkushwaha.schemesetu.entity.EligibilityRule;
import com.rachitkushwaha.schemesetu.entity.Scheme;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Component
public class RuleMatchingEngine {

    public record SchemeMatch(Scheme scheme, List<EligibilityRule> matchedRules, List<MatchedCriterionDto> matchedCriteria) {
        public SchemeMatch(Scheme scheme, List<EligibilityRule> matchedRules) {
            this(scheme, matchedRules, List.of());
        }
    }

    public List<SchemeMatch> findMatchingSchemes(CitizenProfile profile, List<Scheme> candidateSchemes) {
        if (candidateSchemes == null || candidateSchemes.isEmpty() || profile == null) {
            return List.of();
        }

        List<SchemeMatch> matches = new ArrayList<>();

        for (Scheme scheme : candidateSchemes) {
            List<EligibilityRule> activeRules = scheme.getRules() == null ? List.of() :
                    scheme.getRules().stream()
                            .filter(r -> "ACTIVE".equalsIgnoreCase(r.getStatus()))
                            .toList();

            boolean allMatch = true;
            List<EligibilityRule> matchedRules = new ArrayList<>();
            List<MatchedCriterionDto> matchedCriteria = new ArrayList<>();

            for (EligibilityRule rule : activeRules) {
                if (matchesRule(profile, rule)) {
                    matchedRules.add(rule);
                    String actualVal = getActualValueString(profile, rule.getField());
                    matchedCriteria.add(new MatchedCriterionDto(
                            rule.getField(),
                            rule.getOperator(),
                            rule.getValue(),
                            actualVal
                    ));
                } else {
                    allMatch = false;
                    break;
                }
            }

            if (allMatch) {
                matches.add(new SchemeMatch(scheme, matchedRules, matchedCriteria));
            }
        }

        return matches;
    }

    private String getActualValueString(CitizenProfile profile, String field) {
        if (profile == null || field == null) {
            return "";
        }
        return switch (field.toUpperCase()) {
            case "AGE" -> profile.age() != null ? String.valueOf(profile.age()) : "";
            case "MONTHLY_INCOME" -> {
                if (profile.monthlyIncome() == null) yield "";
                if (profile.monthlyIncome() == Math.floor(profile.monthlyIncome()) && !Double.isInfinite(profile.monthlyIncome())) {
                    yield String.valueOf(profile.monthlyIncome().longValue());
                }
                yield String.valueOf(profile.monthlyIncome());
            }
            case "LAND_HOLDING_ACRES" -> {
                if (profile.landHoldingAcres() == null) yield "";
                if (profile.landHoldingAcres() == Math.floor(profile.landHoldingAcres()) && !Double.isInfinite(profile.landHoldingAcres())) {
                    yield String.valueOf(profile.landHoldingAcres().longValue());
                }
                yield String.valueOf(profile.landHoldingAcres());
            }
            case "STATE" -> profile.state() != null ? profile.state() : "";
            case "CASTE_CATEGORY" -> profile.casteCategory() != null ? profile.casteCategory() : "";
            case "OCCUPATION" -> profile.occupation() != null ? profile.occupation() : "";
            case "GENDER" -> profile.gender() != null ? profile.gender() : "";
            default -> "";
        };
    }

    private boolean matchesRule(CitizenProfile profile, EligibilityRule rule) {
        if (rule == null || rule.getField() == null || rule.getOperator() == null || rule.getValue() == null) {
            return false;
        }

        String field = rule.getField().toUpperCase();
        String operator = rule.getOperator().toUpperCase();
        String targetValue = rule.getValue().trim();

        return switch (field) {
            case "AGE" -> evalNumeric(profile.age() != null ? profile.age().doubleValue() : null, operator, targetValue);
            case "MONTHLY_INCOME" -> evalNumeric(profile.monthlyIncome(), operator, targetValue);
            case "LAND_HOLDING_ACRES" -> evalNumeric(profile.landHoldingAcres(), operator, targetValue);
            case "STATE" -> evalString(profile.state(), operator, targetValue);
            case "CASTE_CATEGORY" -> evalString(profile.casteCategory(), operator, targetValue);
            case "OCCUPATION" -> evalString(profile.occupation(), operator, targetValue);
            case "GENDER" -> evalString(profile.gender(), operator, targetValue);
            default -> false;
        };
    }

    private boolean evalNumeric(Double actualValue, String operator, String targetValue) {
        if (actualValue == null) {
            return false;
        }

        try {
            return switch (operator) {
                case "EQ", "EQUALS" -> Double.compare(actualValue, Double.parseDouble(targetValue)) == 0;
                case "LT", "LESS_THAN" -> actualValue < Double.parseDouble(targetValue);
                case "LTE", "LESS_THAN_OR_EQUALS" -> actualValue <= Double.parseDouble(targetValue);
                case "GT", "GREATER_THAN" -> actualValue > Double.parseDouble(targetValue);
                case "GTE", "GREATER_THAN_OR_EQUALS" -> actualValue >= Double.parseDouble(targetValue);
                case "BETWEEN" -> {
                    String[] parts = targetValue.split(",");
                    if (parts.length != 2) yield false;
                    double min = Double.parseDouble(parts[0].trim());
                    double max = Double.parseDouble(parts[1].trim());
                    yield actualValue >= min && actualValue <= max;
                }
                case "IN" -> {
                    String[] parts = targetValue.split(",");
                    yield Arrays.stream(parts)
                            .map(String::trim)
                            .mapToDouble(Double::parseDouble)
                            .anyMatch(val -> Double.compare(actualValue, val) == 0);
                }
                default -> false;
            };
        } catch (NumberFormatException e) {
            return false;
        }
    }

    private boolean evalString(String actualValue, String operator, String targetValue) {
        if (actualValue == null) {
            return false;
        }

        String actualTrimmed = actualValue.trim();

        return switch (operator) {
            case "EQ", "EQUALS" -> actualTrimmed.equalsIgnoreCase(targetValue);
            case "IN" -> {
                String[] parts = targetValue.split(",");
                yield Arrays.stream(parts)
                        .map(String::trim)
                        .anyMatch(actualTrimmed::equalsIgnoreCase);
            }
            case "BETWEEN" -> {
                String[] parts = targetValue.split(",");
                if (parts.length != 2) yield false;
                String min = parts[0].trim();
                String max = parts[1].trim();
                yield actualTrimmed.compareToIgnoreCase(min) >= 0 && actualTrimmed.compareToIgnoreCase(max) <= 0;
            }
            default -> false;
        };
    }
}
