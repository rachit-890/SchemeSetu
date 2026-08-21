package com.rachitkushwaha.schemesetu.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "questionnaire_answers")
public class QuestionnaireAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "session_id", nullable = false)
    @JsonIgnore
    private QuestionnaireSession session;

    @Column(name = "field_name", nullable = false, length = 50)
    private String fieldName;

    @Column(name = "value", nullable = false, columnDefinition = "TEXT")
    private String value;

    @Column(name = "answered_at", nullable = false, updatable = false)
    private LocalDateTime answeredAt;

    public QuestionnaireAnswer() {
    }

    public QuestionnaireAnswer(QuestionnaireSession session, String fieldName, String value) {
        this.session = session;
        this.fieldName = fieldName;
        this.value = value;
    }

    @PrePersist
    protected void onCreate() {
        this.answeredAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public QuestionnaireSession getSession() {
        return session;
    }

    public void setSession(QuestionnaireSession session) {
        this.session = session;
    }

    public String getFieldName() {
        return fieldName;
    }

    public void setFieldName(String fieldName) {
        this.fieldName = fieldName;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }

    public LocalDateTime getAnsweredAt() {
        return answeredAt;
    }

    public void setAnsweredAt(LocalDateTime answeredAt) {
        this.answeredAt = answeredAt;
    }
}
