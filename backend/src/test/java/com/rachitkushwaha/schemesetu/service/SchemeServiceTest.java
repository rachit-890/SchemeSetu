package com.rachitkushwaha.schemesetu.service;

import com.rachitkushwaha.schemesetu.dto.PendingRuleDto;
import com.rachitkushwaha.schemesetu.entity.EligibilityRule;
import com.rachitkushwaha.schemesetu.entity.Scheme;
import com.rachitkushwaha.schemesetu.repository.EligibilityRuleRepository;
import com.rachitkushwaha.schemesetu.repository.SchemeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class SchemeServiceTest {

    private SchemeRepository schemeRepository;
    private EligibilityRuleRepository eligibilityRuleRepository;
    private SchemeService schemeService;

    @BeforeEach
    void setUp() {
        schemeRepository = mock(SchemeRepository.class);
        eligibilityRuleRepository = mock(EligibilityRuleRepository.class);
        schemeService = new SchemeService(schemeRepository, eligibilityRuleRepository);
    }

    @Test
    void approveRule_whenPendingReview_flipsStatusToActive() {
        Long schemeId = 1L;
        Long ruleId = 10L;

        Scheme mockScheme = new Scheme("Test Scheme", "Desc", "SUBSIDY", "Govt", "http://example.com", "Steps", "ACTIVE");
        mockScheme.setId(schemeId);

        EligibilityRule mockRule = new EligibilityRule(mockScheme, "AGE", "GT", "18", "PENDING_REVIEW");
        mockRule.setId(ruleId);

        when(eligibilityRuleRepository.findById(ruleId)).thenReturn(Optional.of(mockRule));
        when(eligibilityRuleRepository.save(any(EligibilityRule.class))).thenAnswer(inv -> inv.getArgument(0));

        EligibilityRule updatedRule = schemeService.approveRule(schemeId, ruleId);

        assertEquals("ACTIVE", updatedRule.getStatus());
        verify(eligibilityRuleRepository).save(mockRule);
    }

    @Test
    void approveRule_whenAlreadyActive_throwsIllegalStateException() {
        Long schemeId = 1L;
        Long ruleId = 10L;

        Scheme mockScheme = new Scheme("Test Scheme", "Desc", "SUBSIDY", "Govt", "http://example.com", "Steps", "ACTIVE");
        mockScheme.setId(schemeId);

        EligibilityRule mockRule = new EligibilityRule(mockScheme, "AGE", "GT", "18", "ACTIVE");
        mockRule.setId(ruleId);

        when(eligibilityRuleRepository.findById(ruleId)).thenReturn(Optional.of(mockRule));

        assertThrows(IllegalStateException.class, () -> schemeService.approveRule(schemeId, ruleId));
        verify(eligibilityRuleRepository, never()).save(any());
    }

    @Test
    void approveRule_whenNonExistent_throwsIllegalArgumentException() {
        Long schemeId = 1L;
        Long ruleId = 999L;

        when(eligibilityRuleRepository.findById(ruleId)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> schemeService.approveRule(schemeId, ruleId));
        verify(eligibilityRuleRepository, never()).save(any());
    }

    @Test
    void approveRule_whenRuleBelongsToDifferentScheme_throwsIllegalArgumentException() {
        Long schemeId = 1L;
        Long otherSchemeId = 2L;
        Long ruleId = 10L;

        Scheme otherScheme = new Scheme("Other Scheme", "Desc", "SUBSIDY", "Govt", "http://example.com", "Steps", "ACTIVE");
        otherScheme.setId(otherSchemeId);

        EligibilityRule mockRule = new EligibilityRule(otherScheme, "AGE", "GT", "18", "PENDING_REVIEW");
        mockRule.setId(ruleId);

        when(eligibilityRuleRepository.findById(ruleId)).thenReturn(Optional.of(mockRule));

        assertThrows(IllegalArgumentException.class, () -> schemeService.approveRule(schemeId, ruleId));
        verify(eligibilityRuleRepository, never()).save(any());
    }

    @Test
    void rejectRule_whenPendingReview_flipsStatusToRejected() {
        Long schemeId = 1L;
        Long ruleId = 10L;

        Scheme mockScheme = new Scheme("Test Scheme", "Desc", "SUBSIDY", "Govt", "http://example.com", "Steps", "ACTIVE");
        mockScheme.setId(schemeId);

        EligibilityRule mockRule = new EligibilityRule(mockScheme, "AGE", "GT", "18", "PENDING_REVIEW");
        mockRule.setId(ruleId);

        when(eligibilityRuleRepository.findById(ruleId)).thenReturn(Optional.of(mockRule));
        when(eligibilityRuleRepository.save(any(EligibilityRule.class))).thenAnswer(inv -> inv.getArgument(0));

        EligibilityRule updatedRule = schemeService.rejectRule(schemeId, ruleId);

        assertEquals("REJECTED", updatedRule.getStatus());
        verify(eligibilityRuleRepository).save(mockRule);
    }

    @Test
    void rejectRule_whenAlreadyRejected_throwsIllegalStateException() {
        Long schemeId = 1L;
        Long ruleId = 10L;

        Scheme mockScheme = new Scheme("Test Scheme", "Desc", "SUBSIDY", "Govt", "http://example.com", "Steps", "ACTIVE");
        mockScheme.setId(schemeId);

        EligibilityRule mockRule = new EligibilityRule(mockScheme, "AGE", "GT", "18", "REJECTED");
        mockRule.setId(ruleId);

        when(eligibilityRuleRepository.findById(ruleId)).thenReturn(Optional.of(mockRule));

        assertThrows(IllegalStateException.class, () -> schemeService.rejectRule(schemeId, ruleId));
        verify(eligibilityRuleRepository, never()).save(any());
    }

    @Test
    void getPendingRules_returnsPendingRulesWithParentSchemeDetails() {
        Scheme mockScheme = new Scheme("Test Scheme", "Desc", "SUBSIDY", "Govt", "http://example.com", "Steps", "ACTIVE");
        mockScheme.setId(1L);

        EligibilityRule mockRule = new EligibilityRule(mockScheme, "AGE", "GT", "18", "PENDING_REVIEW");
        mockRule.setId(10L);

        when(eligibilityRuleRepository.findByStatus("PENDING_REVIEW")).thenReturn(List.of(mockRule));

        List<PendingRuleDto> pending = schemeService.getPendingRules();

        assertEquals(1, pending.size());
        PendingRuleDto dto = pending.get(0);
        assertEquals(10L, dto.id());
        assertEquals(1L, dto.schemeId());
        assertEquals("Test Scheme", dto.schemeName());
        assertEquals("AGE", dto.field());
        assertEquals("PENDING_REVIEW", dto.status());
    }
}
