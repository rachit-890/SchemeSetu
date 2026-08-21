package com.rachitkushwaha.schemesetu.service;

import com.rachitkushwaha.schemesetu.entity.Scheme;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.VectorStore;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class SchemeEmbeddingServiceTest {

    private VectorStore vectorStore;
    private SchemeEmbeddingService schemeEmbeddingService;

    @BeforeEach
    void setUp() {
        vectorStore = mock(VectorStore.class);
        schemeEmbeddingService = new SchemeEmbeddingService(vectorStore);
    }

    @Test
    void embedScheme_withDescriptionAndApplicationProcess_chunksAndCallsVectorStoreAdd() {
        Scheme mockScheme = new Scheme(
                "Mukhyamantri Kanya Vidyadhan",
                "Financial assistance for girl students.\n\nMust belong to economically weaker sections.",
                "SCHOLARSHIP",
                "UP Govt",
                "http://example.com",
                "Visit portal scholarship.up.gov.in.\n\nFill application form online.",
                "ACTIVE"
        );
        mockScheme.setId(100L);

        int chunkCount = schemeEmbeddingService.embedScheme(mockScheme);

        assertEquals(4, chunkCount);

        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<Document>> captor = ArgumentCaptor.forClass(List.class);
        verify(vectorStore).add(captor.capture());

        List<Document> documents = captor.getValue();
        assertEquals(4, documents.size());

        Document doc0 = documents.get(0);
        assertEquals("Financial assistance for girl students.", doc0.getText());
        assertEquals(100L, doc0.getMetadata().get("scheme_id"));
        assertEquals("Mukhyamantri Kanya Vidyadhan", doc0.getMetadata().get("scheme_name"));
        assertEquals("description", doc0.getMetadata().get("field_type"));
        assertEquals(0, doc0.getMetadata().get("chunk_index"));

        Document doc1 = documents.get(1);
        assertEquals("Must belong to economically weaker sections.", doc1.getText());
        assertEquals("description", doc1.getMetadata().get("field_type"));
        assertEquals(1, doc1.getMetadata().get("chunk_index"));

        Document doc2 = documents.get(2);
        assertEquals("Visit portal scholarship.up.gov.in.", doc2.getText());
        assertEquals("application_process", doc2.getMetadata().get("field_type"));
        assertEquals(0, doc2.getMetadata().get("chunk_index"));
    }

    @Test
    void embedScheme_whenNullOrEmptyFields_returnsZeroAndDoesNotCallVectorStore() {
        Scheme emptyScheme = new Scheme("Empty Scheme", null, "SUBSIDY", "Govt", "http://example.com", "   ", "ACTIVE");
        emptyScheme.setId(101L);

        int chunkCount = schemeEmbeddingService.embedScheme(emptyScheme);

        assertEquals(0, chunkCount);
        verify(vectorStore, never()).add(any());
    }
}
