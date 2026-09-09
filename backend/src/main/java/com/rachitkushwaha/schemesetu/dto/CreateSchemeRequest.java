package com.rachitkushwaha.schemesetu.dto;

import com.rachitkushwaha.schemesetu.entity.Scheme;
import jakarta.validation.constraints.NotBlank;

public record CreateSchemeRequest(
    @NotBlank(message = "Scheme name is required")
    String name,

    @NotBlank(message = "Scheme description is required")
    String description,

    String category,
    String issuingBody,
    String sourceUrl,
    String applicationProcess,
    String status
) {
    public Scheme toEntity() {
        Scheme scheme = new Scheme();
        scheme.setName(this.name);
        scheme.setDescription(this.description);
        scheme.setCategory(this.category);
        scheme.setIssuingBody(this.issuingBody);
        scheme.setSourceUrl(this.sourceUrl);
        scheme.setApplicationProcess(this.applicationProcess);
        if (this.status != null && !this.status.isBlank()) {
            scheme.setStatus(this.status);
        }
        return scheme;
    }
}
