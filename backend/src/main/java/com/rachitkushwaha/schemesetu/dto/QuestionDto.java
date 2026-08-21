package com.rachitkushwaha.schemesetu.dto;

public record QuestionDto(
    int id,
    String fieldName,
    String text,
    String textHi
) {
    public static QuestionDto fromDefinition(QuestionDefinition def, String lang) {
        if (def == null) return null;
        String mainText = "hi".equalsIgnoreCase(lang) ? def.textHi() : def.textEn();
        return new QuestionDto(def.id(), def.fieldName(), mainText, def.textHi());
    }
}
