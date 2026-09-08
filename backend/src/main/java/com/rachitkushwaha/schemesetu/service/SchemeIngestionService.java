package com.rachitkushwaha.schemesetu.service;

import com.rachitkushwaha.schemesetu.dto.ExtractedRuleDto;
import com.rachitkushwaha.schemesetu.dto.IngestionSummaryDto;
import com.rachitkushwaha.schemesetu.dto.RuleValidationResult;
import com.rachitkushwaha.schemesetu.entity.EligibilityRule;
import com.rachitkushwaha.schemesetu.entity.Scheme;
import com.rachitkushwaha.schemesetu.repository.EligibilityRuleRepository;
import com.rachitkushwaha.schemesetu.repository.SchemeRepository;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SchemeIngestionService {

    private final ChatClient chatClient;
    private final RuleValidator ruleValidator;
    private final SchemeRepository schemeRepository;
    private final EligibilityRuleRepository eligibilityRuleRepository;
    private final SchemeEmbeddingService schemeEmbeddingService;

    public SchemeIngestionService(ChatModel chatModel,
                                  RuleValidator ruleValidator,
                                  SchemeRepository schemeRepository,
                                  EligibilityRuleRepository eligibilityRuleRepository,
                                  SchemeEmbeddingService schemeEmbeddingService) {
        this.chatClient = ChatClient.builder(chatModel).build();
        this.ruleValidator = ruleValidator;
        this.schemeRepository = schemeRepository;
        this.eligibilityRuleRepository = eligibilityRuleRepository;
        this.schemeEmbeddingService = schemeEmbeddingService;
    }

    public List<ExtractedRuleDto> extractEligibilityRules(String schemeText) {
        String userPrompt = """
            Extract eligibility rules from the raw scheme text below. Output a JSON list where each object has exactly these fields:
              - field: one of AGE | MONTHLY_INCOME | STATE | CASTE_CATEGORY | OCCUPATION | GENDER | LAND_HOLDING_ACRES
              - operator: one of EQ | LT | LTE | GT | GTE | IN | BETWEEN
              - value: the threshold or category value as a string (for BETWEEN, use "min,max"; for IN, use comma-separated values)

            Rules:
            - Only extract eligibility criteria explicitly stated in the text — do not infer criteria that aren't written.
            - If income is stated as an upper limit ("annual family income must not exceed ₹2,50,000"), use field=MONTHLY_INCOME, operator=LTE, value = annual amount divided by 12, rounded down.
            - If a criterion applies to a range (e.g. "age between 18 and 40"), use operator=BETWEEN, value="18,40".
            - If multiple categories qualify (e.g. "open to SC, ST, and OBC applicants"), use operator=IN, value="SC,ST,OBC".
            - If a criterion in the text doesn't map cleanly to one of the allowed fields, omit it and do not force it into the closest field — under-extraction is safer than a wrong rule.
            - Output valid JSON only, no prose, no markdown code fences.

            Scheme Text:
            %s
            """.formatted(schemeText);

        return chatClient.prompt()
                .user(userPrompt)
                .call()
                .entity(new ParameterizedTypeReference<List<ExtractedRuleDto>>() {});
    }

    public RuleValidationResult validateRules(List<ExtractedRuleDto> extractedRules) {
        return ruleValidator.validateRules(extractedRules);
    }

    @Transactional
    public IngestionSummaryDto ingestSchemeRules(Long schemeId, String schemeText) {
        Scheme scheme = schemeRepository.findById(schemeId)
                .orElseThrow(() -> new IllegalArgumentException("Scheme not found with ID: " + schemeId));

        List<ExtractedRuleDto> rawExtractedRules = extractEligibilityRules(schemeText);
        RuleValidationResult validationResult = validateRules(rawExtractedRules);

        // Map ONLY valid ExtractedRuleDto objects to EligibilityRule entities
        List<EligibilityRule> rulesToPersist = validationResult.validRules().stream()
                .map(dto -> {
                    EligibilityRule rule = new EligibilityRule();
                    rule.setScheme(scheme);
                    rule.setField(dto.field());
                    rule.setOperator(dto.operator());
                    rule.setValue(dto.value());
                    rule.setStatus("PENDING_REVIEW"); // Explicitly set status to PENDING_REVIEW
                    return rule;
                })
                .toList();

        List<EligibilityRule> persistedRules = eligibilityRuleRepository.saveAll(rulesToPersist);

        // Generate and store embeddings for the raw scheme text
        int embeddedChunkCount = schemeEmbeddingService.embedScheme(scheme, schemeText);

        // Note: Rejected rules are NOT saved to the database anywhere; they are only logged and returned in the summary.
        return new IngestionSummaryDto(schemeId, persistedRules.size(), validationResult.rejectedRules(), embeddedChunkCount);
    }
}
