package com.rachitkushwaha.schemesetu.service;

import com.rachitkushwaha.schemesetu.dto.PendingRuleDto;
import com.rachitkushwaha.schemesetu.entity.EligibilityRule;
import com.rachitkushwaha.schemesetu.entity.Scheme;
import com.rachitkushwaha.schemesetu.repository.EligibilityRuleRepository;
import com.rachitkushwaha.schemesetu.repository.SchemeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class SchemeService {

    private final SchemeRepository schemeRepository;
    private final EligibilityRuleRepository eligibilityRuleRepository;

    public SchemeService(SchemeRepository schemeRepository, EligibilityRuleRepository eligibilityRuleRepository) {
        this.schemeRepository = schemeRepository;
        this.eligibilityRuleRepository = eligibilityRuleRepository;
    }

    @Transactional(readOnly = true)
    public List<Scheme> getAllSchemes() {
        return schemeRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Scheme> getSchemeById(Long id) {
        return schemeRepository.findById(id);
    }

    public Scheme createScheme(Scheme scheme) {
        return schemeRepository.save(scheme);
    }

    public Scheme updateScheme(Long id, Scheme updatedScheme) {
        return schemeRepository.findById(id).map(existing -> {
            existing.setName(updatedScheme.getName());
            existing.setDescription(updatedScheme.getDescription());
            existing.setCategory(updatedScheme.getCategory());
            existing.setIssuingBody(updatedScheme.getIssuingBody());
            existing.setSourceUrl(updatedScheme.getSourceUrl());
            existing.setApplicationProcess(updatedScheme.getApplicationProcess());
            if (updatedScheme.getStatus() != null) {
                existing.setStatus(updatedScheme.getStatus());
            }
            return schemeRepository.save(existing);
        }).orElseThrow(() -> new IllegalArgumentException("Scheme not found with id: " + id));
    }

    public void deleteScheme(Long id) {
        schemeRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<PendingRuleDto> getPendingRules() {
        return eligibilityRuleRepository.findByStatus("PENDING_REVIEW").stream()
                .map(rule -> new PendingRuleDto(
                        rule.getId(),
                        rule.getScheme().getId(),
                        rule.getScheme().getName(),
                        rule.getField(),
                        rule.getOperator(),
                        rule.getValue(),
                        rule.getStatus(),
                        rule.getCreatedAt()
                ))
                .toList();
    }

    public EligibilityRule approveRule(Long schemeId, Long ruleId) {
        EligibilityRule rule = eligibilityRuleRepository.findById(ruleId)
                .orElseThrow(() -> new IllegalArgumentException("Rule not found with id: " + ruleId));

        if (!rule.getScheme().getId().equals(schemeId)) {
            throw new IllegalArgumentException("Rule " + ruleId + " does not belong to scheme " + schemeId);
        }

        if (!"PENDING_REVIEW".equals(rule.getStatus())) {
            throw new IllegalStateException("Rule " + ruleId + " is not currently PENDING_REVIEW (status: " + rule.getStatus() + ")");
        }

        rule.setStatus("ACTIVE");
        return eligibilityRuleRepository.save(rule);
    }

    public EligibilityRule rejectRule(Long schemeId, Long ruleId) {
        EligibilityRule rule = eligibilityRuleRepository.findById(ruleId)
                .orElseThrow(() -> new IllegalArgumentException("Rule not found with id: " + ruleId));

        if (!rule.getScheme().getId().equals(schemeId)) {
            throw new IllegalArgumentException("Rule " + ruleId + " does not belong to scheme " + schemeId);
        }

        if (!"PENDING_REVIEW".equals(rule.getStatus())) {
            throw new IllegalStateException("Rule " + ruleId + " is not currently PENDING_REVIEW (status: " + rule.getStatus() + ")");
        }

        rule.setStatus("REJECTED");
        return eligibilityRuleRepository.save(rule);
    }
}
