package com.rachitkushwaha.schemesetu.repository;

import com.rachitkushwaha.schemesetu.entity.EligibilityRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EligibilityRuleRepository extends JpaRepository<EligibilityRule, Long> {
    List<EligibilityRule> findBySchemeId(Long schemeId);
    List<EligibilityRule> findByStatus(String status);
}
