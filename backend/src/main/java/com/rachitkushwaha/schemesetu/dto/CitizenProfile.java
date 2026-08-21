package com.rachitkushwaha.schemesetu.dto;

public record CitizenProfile(
    Integer age,
    Double monthlyIncome,
    String state,
    String casteCategory,
    String occupation,
    String gender,
    Double landHoldingAcres
) {}
