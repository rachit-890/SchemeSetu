package com.rachitkushwaha.schemesetu.config;

import com.rachitkushwaha.schemesetu.dto.QuestionDefinition;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Component
public class QuestionnaireRegistry {

    private static final List<QuestionDefinition> QUESTIONS = List.of(
        new QuestionDefinition(
            1,
            "age",
            "What is your age?",
            "आपकी आयु क्या है?",
            null,
            null
        ),
        new QuestionDefinition(
            2,
            "gender",
            "What is your gender? (Male / Female / Other)",
            "आपका लिंग क्या है?",
            null,
            null
        ),
        new QuestionDefinition(
            3,
            "state",
            "Which state do you live in?",
            "आप किस राज्य में रहते हैं?",
            null,
            null
        ),
        new QuestionDefinition(
            4,
            "casteCategory",
            "What is your category? (General / OBC / SC / ST / EWS)",
            "आपकी श्रेणी क्या है?",
            null,
            null
        ),
        new QuestionDefinition(
            5,
            "occupation",
            "What is your occupation? (Farmer / Student / Unemployed / Salaried / Self-employed / Laborer / Retired)",
            "आपका व्यवसाय क्या है?",
            null,
            null
        ),
        new QuestionDefinition(
            6,
            "monthlyIncome",
            "What is your approximate monthly family income (in ₹)?",
            "आपकी मासिक पारिवारिक आय लगभग कितनी है?",
            null,
            null
        ),
        new QuestionDefinition(
            7,
            "landHoldingAcres",
            "How much agricultural land do you own (in acres)?",
            "आपके पास कितनी कृषि भूमि है (एकड़ में)?",
            "occupation",
            "FARMER"
        )
    );

    public List<QuestionDefinition> getAllQuestions() {
        return QUESTIONS;
    }

    public Optional<QuestionDefinition> getQuestionById(int id) {
        return QUESTIONS.stream()
                .filter(q -> q.id() == id)
                .findFirst();
    }

    public Optional<QuestionDefinition> getNextApplicableQuestion(int currentQuestionId, Map<String, String> answers) {
        for (QuestionDefinition question : QUESTIONS) {
            if (question.id() <= currentQuestionId) {
                continue;
            }

            if (isQuestionApplicable(question, answers)) {
                return Optional.of(question);
            }
        }
        return Optional.empty();
    }

    public boolean isQuestionApplicable(QuestionDefinition question, Map<String, String> answers) {
        if (question.isNeverSkipped()) {
            return true;
        }

        String requiredField = question.skipUnlessField();
        String requiredValue = question.skipUnlessValue();

        if (answers == null || requiredField == null || requiredValue == null) {
            return false;
        }

        String actualValue = answers.get(requiredField);
        return actualValue != null && actualValue.equalsIgnoreCase(requiredValue);
    }
}
