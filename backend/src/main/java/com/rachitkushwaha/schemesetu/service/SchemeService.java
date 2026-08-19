package com.rachitkushwaha.schemesetu.service;

import com.rachitkushwaha.schemesetu.entity.Scheme;
import com.rachitkushwaha.schemesetu.repository.SchemeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class SchemeService {

    private final SchemeRepository schemeRepository;

    public SchemeService(SchemeRepository schemeRepository) {
        this.schemeRepository = schemeRepository;
    }

    @Transactional(readOnly = true)
    public List<Scheme> getAllSchemes() {
        return schemeRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Scheme> getSchemeById(Long id) {
        return schemeRepository.findById(id);
    }

    public Scheme createScheme(Scheme scheme) {
        return schemeRepository.save(scheme);
    }

    public Scheme updateScheme(Long id, Scheme updatedScheme) {
        return schemeRepository.findById(id).map(existing -> {
            existing.setName(updatedScheme.getName());
            existing.setDescription(updatedScheme.getDescription());
            existing.setCategory(updatedScheme.getCategory());
            existing.setIssuingBody(updatedScheme.getIssuingBody());
            existing.setSourceUrl(updatedScheme.getSourceUrl());
            existing.setApplicationProcess(updatedScheme.getApplicationProcess());
            if (updatedScheme.getStatus() != null) {
                existing.setStatus(updatedScheme.getStatus());
            }
            return schemeRepository.save(existing);
        }).orElseThrow(() -> new IllegalArgumentException("Scheme not found with id: " + id));
    }

    public void deleteScheme(Long id) {
        schemeRepository.deleteById(id);
    }
}
