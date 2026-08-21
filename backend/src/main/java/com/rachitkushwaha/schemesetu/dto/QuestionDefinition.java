package com.rachitkushwaha.schemesetu.dto;

public record QuestionDefinition(
    int id,
    String fieldName,
    String textEn,
    String textHi,
    String skipUnlessField,
    String skipUnlessValue
) {
    public boolean isNeverSkipped() {
        return skipUnlessField == null || skipUnlessValue == null;
    }
}
