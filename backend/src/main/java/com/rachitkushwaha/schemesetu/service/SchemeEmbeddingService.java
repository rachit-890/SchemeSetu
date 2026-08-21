package com.rachitkushwaha.schemesetu.service;

import com.rachitkushwaha.schemesetu.entity.Scheme;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class SchemeEmbeddingService {

    private static final Logger log = LoggerFactory.getLogger(SchemeEmbeddingService.class);
    private final VectorStore vectorStore;

    public SchemeEmbeddingService(VectorStore vectorStore) {
        this.vectorStore = vectorStore;
    }

    public int embedScheme(Scheme scheme) {
        if (scheme == null) {
            return 0;
        }

        List<Document> documents = new ArrayList<>();

        if (scheme.getDescription() != null && !scheme.getDescription().isBlank()) {
            List<String> chunks = chunkText(scheme.getDescription());
            for (int i = 0; i < chunks.size(); i++) {
                documents.add(new Document(
                        chunks.get(i),
                        Map.of(
                                "scheme_id", scheme.getId() != null ? scheme.getId() : 0L,
                                "scheme_name", scheme.getName() != null ? scheme.getName() : "",
                                "field_type", "description",
                                "chunk_index", i
                        )
                ));
            }
        }

        if (scheme.getApplicationProcess() != null && !scheme.getApplicationProcess().isBlank()) {
            List<String> chunks = chunkText(scheme.getApplicationProcess());
            for (int i = 0; i < chunks.size(); i++) {
                documents.add(new Document(
                        chunks.get(i),
                        Map.of(
                                "scheme_id", scheme.getId() != null ? scheme.getId() : 0L,
                                "scheme_name", scheme.getName() != null ? scheme.getName() : "",
                                "field_type", "application_process",
                                "chunk_index", i
                        )
                ));
            }
        }

        if (!documents.isEmpty()) {
            vectorStore.add(documents);
            log.info("Embedded and stored {} document chunks in VectorStore for schemeId: {}", documents.size(), scheme.getId());
        }

        return documents.size();
    }

    private List<String> chunkText(String text) {
        if (text == null || text.isBlank()) {
            return List.of();
        }
        String[] paragraphs = text.split("\n\n+");
        List<String> result = new ArrayList<>();
        for (String p : paragraphs) {
            String trimmed = p.trim();
            if (!trimmed.isEmpty()) {
                result.add(trimmed);
            }
        }
        return result.isEmpty() ? List.of(text.trim()) : result;
    }
}
