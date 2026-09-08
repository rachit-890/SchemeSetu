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
    void embedScheme_withRawSourceText_chunksAndCallsVectorStoreAdd() {
        Scheme mockScheme = new Scheme(
                "Mukhyamantri Kanya Vidyadhan",
                "Financial assistance for girl students.",
                "SCHOLARSHIP",
                "UP Govt",
                "http://example.com",
                "Visit portal scholarship.up.gov.in.",
                "ACTIVE"
        );
        mockScheme.setId(100L);

        String rawSourceText = "Financial assistance for girl students in Uttar Pradesh.\n\n" +
                "Applicants must have passed 12th standard and family income below 20000 per month.\n\n" +
                "Apply online through the scholarship portal or visit nearest CSC.";

        int chunkCount = schemeEmbeddingService.embedScheme(mockScheme, rawSourceText);

        assertEquals(3, chunkCount);

        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<Document>> captor = ArgumentCaptor.forClass(List.class);
        verify(vectorStore).add(captor.capture());

        List<Document> documents = captor.getValue();
        assertEquals(3, documents.size());

        Document doc0 = documents.get(0);
        assertEquals("Financial assistance for girl students in Uttar Pradesh.", doc0.getText());
        assertEquals(100L, doc0.getMetadata().get("scheme_id"));
        assertEquals("Mukhyamantri Kanya Vidyadhan", doc0.getMetadata().get("scheme_name"));
        assertEquals("source_text", doc0.getMetadata().get("field_type"));
        assertEquals(0, doc0.getMetadata().get("chunk_index"));

        Document doc1 = documents.get(1);
        assertEquals("Applicants must have passed 12th standard and family income below 20000 per month.", doc1.getText());
        assertEquals(100L, doc1.getMetadata().get("scheme_id"));
        assertEquals("source_text", doc1.getMetadata().get("field_type"));
        assertEquals(1, doc1.getMetadata().get("chunk_index"));

        Document doc2 = documents.get(2);
        assertEquals("Apply online through the scholarship portal or visit nearest CSC.", doc2.getText());
        assertEquals(100L, doc2.getMetadata().get("scheme_id"));
        assertEquals("source_text", doc2.getMetadata().get("field_type"));
        assertEquals(2, doc2.getMetadata().get("chunk_index"));
    }

    @Test
    void embedScheme_whenNullOrEmptyFields_returnsZeroAndDoesNotCallVectorStore() {
        Scheme mockScheme = new Scheme("Empty Scheme", null, "SUBSIDY", "Govt", "http://example.com", "   ", "ACTIVE");
        mockScheme.setId(101L);

        assertEquals(0, schemeEmbeddingService.embedScheme(mockScheme, null));
        assertEquals(0, schemeEmbeddingService.embedScheme(mockScheme, "   "));
        assertEquals(0, schemeEmbeddingService.embedScheme(null, "some text"));

        verify(vectorStore, never()).add(any());
    }
}
