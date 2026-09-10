package com.rachitkushwaha.schemesetu.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record IngestRequestDto(
    @NotBlank(message = "Scheme text is required")
    @Size(max = 10000, message = "Scheme text must not exceed 10000 characters")
    String schemeText
) {}

