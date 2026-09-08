package com.rachitkushwaha.schemesetu.config;

import org.junit.jupiter.api.Test;
import org.springframework.ai.document.Document;
import org.springframework.ai.embedding.Embedding;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.embedding.EmbeddingRequest;
import org.springframework.ai.embedding.EmbeddingResponse;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class NormalizingEmbeddingModelTest {

    @Test
    void testEmbedStringNormalizesVectorToUnitLength() {
        EmbeddingModel mockDelegate = mock(EmbeddingModel.class);
        float[] rawVector = new float[]{3.0f, 4.0f}; // Norm = 5.0
        when(mockDelegate.embed("test text")).thenReturn(rawVector);

        NormalizingEmbeddingModel model = new NormalizingEmbeddingModel(mockDelegate);
        float[] normalized = model.embed("test text");

        assertEquals(2, normalized.length);
        assertEquals(0.6f, normalized[0], 1e-5f);
        assertEquals(0.8f, normalized[1], 1e-5f);

        double norm = Math.sqrt(normalized[0] * normalized[0] + normalized[1] * normalized[1]);
        assertEquals(1.0, norm, 1e-5);
    }

    @Test
    void testEmbedDocumentNormalizesVectorToUnitLength() {
        EmbeddingModel mockDelegate = mock(EmbeddingModel.class);
        float[] rawVector = new float[]{1.0f, 2.0f, 2.0f}; // Norm = 3.0
        Document doc = new Document("hello");
        when(mockDelegate.embed(doc)).thenReturn(rawVector);

        NormalizingEmbeddingModel model = new NormalizingEmbeddingModel(mockDelegate);
        float[] normalized = model.embed(doc);

        assertEquals(3, normalized.length);
        assertEquals(1.0f / 3.0f, normalized[0], 1e-5f);
        assertEquals(2.0f / 3.0f, normalized[1], 1e-5f);
        assertEquals(2.0f / 3.0f, normalized[2], 1e-5f);

        double norm = Math.sqrt(normalized[0] * normalized[0] + normalized[1] * normalized[1] + normalized[2] * normalized[2]);
        assertEquals(1.0, norm, 1e-5);
    }

    @Test
    void testCallEmbeddingRequestNormalizesResponseEmbeddings() {
        EmbeddingModel mockDelegate = mock(EmbeddingModel.class);
        float[] rawVector = new float[]{3.0f, 4.0f};
        EmbeddingResponse mockResponse = new EmbeddingResponse(List.of(new Embedding(rawVector, 0)));
        when(mockDelegate.call(any(EmbeddingRequest.class))).thenReturn(mockResponse);

        NormalizingEmbeddingModel model = new NormalizingEmbeddingModel(mockDelegate);
        EmbeddingRequest request = new EmbeddingRequest(List.of("test"), null);
        EmbeddingResponse response = model.call(request);

        assertNotNull(response);
        assertEquals(1, response.getResults().size());
        float[] normalized = response.getResults().get(0).getOutput();

        assertEquals(0.6f, normalized[0], 1e-5f);
        assertEquals(0.8f, normalized[1], 1e-5f);

        double norm = Math.sqrt(normalized[0] * normalized[0] + normalized[1] * normalized[1]);
        assertEquals(1.0, norm, 1e-5);
    }
}
