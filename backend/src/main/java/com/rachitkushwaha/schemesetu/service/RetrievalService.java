package com.rachitkushwaha.schemesetu.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.vectorstore.filter.FilterExpressionBuilder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RetrievalService {

    private static final Logger log = LoggerFactory.getLogger(RetrievalService.class);
    private final VectorStore vectorStore;

    public RetrievalService(VectorStore vectorStore) {
        this.vectorStore = vectorStore;
    }

    public List<Document> retrieveContext(Long schemeId, int topK) {
        if (schemeId == null) {
            return List.of();
        }

        try {
            SearchRequest request = SearchRequest.builder()
                    .query("scheme documentation and application steps for scheme " + schemeId)
                    .topK(topK)
                    .filterExpression(new FilterExpressionBuilder().eq("scheme_id", schemeId).build())
                    .build();

            List<Document> docs = vectorStore.similaritySearch(request);
            return docs != null ? docs : List.of();
        } catch (Exception e) {
            log.warn("Failed to retrieve context from VectorStore for schemeId {}: {}. Returning empty list.", schemeId, e.getMessage());
            return List.of();
        }
    }
}
