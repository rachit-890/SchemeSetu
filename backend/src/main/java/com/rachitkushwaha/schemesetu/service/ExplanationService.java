package com.rachitkushwaha.schemesetu.service;

import com.rachitkushwaha.schemesetu.dto.CitizenProfile;
import com.rachitkushwaha.schemesetu.dto.ExplanationDto;
import com.rachitkushwaha.schemesetu.entity.EligibilityRule;
import com.rachitkushwaha.schemesetu.entity.Scheme;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.ai.anthropic.AnthropicChatModel;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ExplanationService {

    private static final Logger log = LoggerFactory.getLogger(ExplanationService.class);
    private final ChatClient chatClient;

    @Autowired
    public ExplanationService(AnthropicChatModel anthropicChatModel) {
        this.chatClient = ChatClient.builder(anthropicChatModel).build();
    }

    public ExplanationService(ChatClient chatClient) {
        this.chatClient = chatClient;
    }

    public ExplanationDto generateExplanation(Scheme scheme, CitizenProfile profile, List<EligibilityRule> matchedRules, List<Document> retrievedDocs) {
        if (retrievedDocs == null || retrievedDocs.isEmpty()) {
            return new ExplanationDto("No information available for this scheme.", List.of(), true);
        }

        String schemeName = scheme != null && scheme.getName() != null ? scheme.getName() : "Unknown Scheme";
        String schemeCategory = scheme != null && scheme.getCategory() != null ? scheme.getCategory() : "N/A";
        String issuingBody = scheme != null && scheme.getIssuingBody() != null ? scheme.getIssuingBody() : "N/A";

        String matchedCriteriaText = formatMatchedRules(matchedRules, profile);

        String contextText = retrievedDocs.stream()
                .map(Document::getText)
                .collect(Collectors.joining("\n---\n"));

        String userPrompt = """
            You are an expert assistant for Indian government welfare schemes (SchemeSetu platform).
            Your task is to explain to a citizen why they qualify for a specific scheme and detail the application process based ONLY on the provided context.

            CRITICAL GROUNDING INSTRUCTIONS:
            - You must generate your response using ONLY the provided retrieved context below.
            - Do NOT invent or infer application steps, deadlines, benefit amounts, or eligibility details not explicitly stated in the context.
            - If the application process is not described in the context, leave applicationSteps empty and explicitly state in reasoning that the application process is not available in the retrieved context.
            - If NO retrieved context is relevant or if the context does not discuss eligibility or application process, explicitly state in reasoning that an explanation cannot be generated due to insufficient context.

            Scheme Name: %s
            Scheme Category: %s
            Issuing Body: %s

            Matched Eligibility Criteria:
            %s

            Retrieved Context Chunks:
            %s

            Instructions:
            Using ONLY the context provided above, explain in plain language why this citizen qualifies for this scheme (for the "reasoning" field) and list the sequential application steps as a list of strings (for the "applicationSteps" field).
            """.formatted(schemeName, schemeCategory, issuingBody, matchedCriteriaText, contextText);

        try {
            ExplanationDto result = chatClient.prompt()
                    .user(userPrompt)
                    .call()
                    .entity(ExplanationDto.class);

            if (result != null) {
                return new ExplanationDto(result.reasoning(), result.applicationSteps() != null ? result.applicationSteps() : List.of(), false);
            }
        } catch (Exception ex) {
            log.warn("ChatClient LLM explanation call failed for scheme {}: {}. Falling back to rule-based explanation.",
                    scheme != null ? scheme.getId() : "null", ex.getMessage());
        }

        return buildRuleBasedFallback(matchedRules, profile);
    }

    private ExplanationDto buildRuleBasedFallback(List<EligibilityRule> matchedRules, CitizenProfile profile) {
        String details = formatMatchedRules(matchedRules, profile);
        String reasoning = "You appear to qualify based on: " + details + ".";
        return new ExplanationDto(reasoning, List.of(), true);
    }

    private String formatMatchedRules(List<EligibilityRule> matchedRules, CitizenProfile profile) {
        if (matchedRules != null && !matchedRules.isEmpty()) {
            return matchedRules.stream()
                    .map(r -> r.getField().toLowerCase().replace('_', ' ') + " (" + formatOperatorValue(r.getOperator(), r.getValue()) + ")")
                    .collect(Collectors.joining(", "));
        }
        if (profile != null) {
            List<String> parts = new ArrayList<>();
            if (profile.age() != null) parts.add("age (" + profile.age() + ")");
            if (profile.monthlyIncome() != null) parts.add("monthly income (₹" + profile.monthlyIncome() + ")");
            if (profile.state() != null) parts.add("state (" + profile.state() + ")");
            if (profile.casteCategory() != null) parts.add("caste category (" + profile.casteCategory() + ")");
            if (profile.occupation() != null) parts.add("occupation (" + profile.occupation() + ")");
            if (profile.gender() != null) parts.add("gender (" + profile.gender() + ")");
            if (profile.landHoldingAcres() != null) parts.add("land holding (" + profile.landHoldingAcres() + " acres)");
            if (!parts.isEmpty()) {
                return String.join(", ", parts);
            }
        }
        return "matched eligibility rules";
    }

    private String formatOperatorValue(String operator, String value) {
        if (operator == null) return value;
        return switch (operator.toUpperCase()) {
            case "EQ", "EQUALS" -> value;
            case "LT", "LESS_THAN" -> "below " + value;
            case "LTE", "LESS_THAN_OR_EQUALS" -> "below or equal to " + value;
            case "GT", "GREATER_THAN" -> "above " + value;
            case "GTE", "GREATER_THAN_OR_EQUALS" -> "above or equal to " + value;
            case "BETWEEN" -> "between " + value;
            case "IN" -> "in " + value;
            default -> operator + " " + value;
        };
    }
}
