package com.rachitkushwaha.schemesetu.config;

import org.springframework.ai.document.Document;
import org.springframework.ai.embedding.Embedding;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.embedding.EmbeddingRequest;
import org.springframework.ai.embedding.EmbeddingResponse;

import java.util.List;
import java.util.stream.Collectors;

public class NormalizingEmbeddingModel implements EmbeddingModel {

    private final EmbeddingModel delegate;

    public NormalizingEmbeddingModel(EmbeddingModel delegate) {
        this.delegate = delegate;
    }

    @Override
    public EmbeddingResponse call(EmbeddingRequest request) {
        EmbeddingResponse response = delegate.call(request);
        if (response == null || response.getResults() == null) {
            return response;
        }

        List<Embedding> normalizedEmbeddings = response.getResults().stream()
                .map(embedding -> {
                    float[] normalizedVector = l2Normalize(embedding.getOutput());
                    return new Embedding(normalizedVector, embedding.getIndex());
                })
                .collect(Collectors.toList());

        return new EmbeddingResponse(normalizedEmbeddings, response.getMetadata());
    }

    @Override
    public float[] embed(Document document) {
        float[] raw = delegate.embed(document);
        return l2Normalize(raw);
    }

    @Override
    public float[] embed(String text) {
        float[] raw = delegate.embed(text);
        return l2Normalize(raw);
    }

    @Override
    public List<float[]> embed(List<String> texts) {
        List<float[]> rawList = delegate.embed(texts);
        if (rawList == null) {
            return null;
        }
        return rawList.stream()
                .map(NormalizingEmbeddingModel::l2Normalize)
                .collect(Collectors.toList());
    }

    @Override
    public int dimensions() {
        return delegate.dimensions();
    }

    public static float[] l2Normalize(float[] vector) {
        if (vector == null || vector.length == 0) {
            return vector;
        }
        double sumSquare = 0.0;
        for (float v : vector) {
            sumSquare += v * v;
        }
        double norm = Math.sqrt(sumSquare);
        if (norm == 0.0 || Math.abs(norm - 1.0) < 1e-6) {
            return vector;
        }

        float[] normalized = new float[vector.length];
        for (int i = 0; i < vector.length; i++) {
            normalized[i] = (float) (vector[i] / norm);
        }
        return normalized;
    }
}
