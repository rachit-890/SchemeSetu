package com.rachitkushwaha.schemesetu.repository;

import com.rachitkushwaha.schemesetu.entity.QuestionnaireSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QuestionnaireSessionRepository extends JpaRepository<QuestionnaireSession, Long> {
}
