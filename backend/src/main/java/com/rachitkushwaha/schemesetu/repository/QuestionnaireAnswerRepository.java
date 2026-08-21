package com.rachitkushwaha.schemesetu.repository;

import com.rachitkushwaha.schemesetu.entity.QuestionnaireAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionnaireAnswerRepository extends JpaRepository<QuestionnaireAnswer, Long> {
    List<QuestionnaireAnswer> findBySessionId(Long sessionId);
}
