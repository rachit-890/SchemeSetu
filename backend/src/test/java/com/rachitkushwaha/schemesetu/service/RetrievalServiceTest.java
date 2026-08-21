package com.rachitkushwaha.schemesetu.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class RetrievalServiceTest {

    private VectorStore vectorStore;
    private RetrievalService retrievalService;

    @BeforeEach
    void setUp() {
        vectorStore = mock(VectorStore.class);
        retrievalService = new RetrievalService(vectorStore);
    }

    @Test
    void retrieveContext_callsVectorStoreSimilaritySearchWithFilter() {
        Long schemeId = 1L;
        int topK = 3;

        Document doc1 = new Document("Chunk 1", Map.of("scheme_id", 1L));
        Document doc2 = new Document("Chunk 2", Map.of("scheme_id", 1L));
        when(vectorStore.similaritySearch(any(SearchRequest.class))).thenReturn(List.of(doc1, doc2));

        List<Document> results = retrievalService.retrieveContext(schemeId, topK);

        assertEquals(2, results.size());
        assertEquals("Chunk 1", results.get(0).getText());

        ArgumentCaptor<SearchRequest> captor = ArgumentCaptor.forClass(SearchRequest.class);
        verify(vectorStore).similaritySearch(captor.capture());

        SearchRequest request = captor.getValue();
        assertEquals(topK, request.getTopK());
        assertNotNull(request.getFilterExpression());
    }

    @Test
    void retrieveContext_whenNullSchemeId_returnsEmptyList() {
        List<Document> results = retrievalService.retrieveContext(null, 3);
        assertTrue(results.isEmpty());
        verify(vectorStore, never()).similaritySearch(any(SearchRequest.class));
    }
}
