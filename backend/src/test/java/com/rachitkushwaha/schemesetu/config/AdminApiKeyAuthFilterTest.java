package com.rachitkushwaha.schemesetu.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;

import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AdminApiKeyAuthFilterTest {

    private AdminApiKeyAuthFilter filter;
    private HttpServletRequest request;
    private HttpServletResponse response;
    private FilterChain filterChain;
    private StringWriter responseWriter;

    @BeforeEach
    void setUp() throws IOException {
        filter = new AdminApiKeyAuthFilter("secret-admin-key-123");
        request = mock(HttpServletRequest.class);
        response = mock(HttpServletResponse.class);
        filterChain = mock(FilterChain.class);

        responseWriter = new StringWriter();
        when(response.getWriter()).thenReturn(new PrintWriter(responseWriter));
    }

    @Test
    void constructor_throwsException_whenApiKeyIsNull() {
        assertThrows(IllegalArgumentException.class, () -> new AdminApiKeyAuthFilter(null));
    }

    @Test
    void constructor_throwsException_whenApiKeyIsBlank() {
        assertThrows(IllegalArgumentException.class, () -> new AdminApiKeyAuthFilter("   "));
    }

    @Test
    void shouldNotFilter_returnsTrue_forNonAdminPaths() {
        when(request.getRequestURI()).thenReturn("/api/v1/schemes/match");
        assertTrue(filter.shouldNotFilter(request));

        when(request.getRequestURI()).thenReturn("/api/v1/questionnaire/start");
        assertTrue(filter.shouldNotFilter(request));

        when(request.getRequestURI()).thenReturn("/api/v1/questionnaire/1/answer");
        assertTrue(filter.shouldNotFilter(request));
    }

    @Test
    void shouldNotFilter_returnsFalse_forAdminPaths() {
        when(request.getMethod()).thenReturn("GET");
        when(request.getRequestURI()).thenReturn("/api/v1/admin/schemes");
        assertFalse(filter.shouldNotFilter(request));

        when(request.getRequestURI()).thenReturn("/api/v1/admin/schemes/1/ingest");
        assertFalse(filter.shouldNotFilter(request));

        when(request.getRequestURI()).thenReturn("/api/v1/admin/schemes/rules/pending");
        assertFalse(filter.shouldNotFilter(request));
    }

    @Test
    void shouldNotFilter_returnsTrue_forOptionsPreflightRequests() {
        when(request.getMethod()).thenReturn("OPTIONS");
        when(request.getRequestURI()).thenReturn("/api/v1/admin/schemes/1/ingest");
        assertTrue(filter.shouldNotFilter(request));
    }

    @Test
    void doFilterInternal_withValidKey_proceedsThroughFilterChain() throws ServletException, IOException {
        when(request.getHeader("X-Admin-Key")).thenReturn("secret-admin-key-123");

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        verify(response, never()).setStatus(HttpStatus.UNAUTHORIZED.value());
    }

    @Test
    void doFilterInternal_withMissingKey_returns401Unauthorized() throws ServletException, IOException {
        when(request.getHeader("X-Admin-Key")).thenReturn(null);

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain, never()).doFilter(request, response);
        verify(response).setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        verify(response).setContentType(MediaType.APPLICATION_JSON_VALUE);
        assertTrue(responseWriter.toString().contains("Unauthorized: Invalid or missing X-Admin-Key header"));
    }

    @Test
    void doFilterInternal_withInvalidKey_returns401Unauthorized() throws ServletException, IOException {
        when(request.getHeader("X-Admin-Key")).thenReturn("wrong-key");

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain, never()).doFilter(request, response);
        verify(response).setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        assertTrue(responseWriter.toString().contains("Unauthorized: Invalid or missing X-Admin-Key header"));
    }

    @Test
    void doFilterInternal_withEmptyKey_returns401Unauthorized() throws ServletException, IOException {
        when(request.getHeader("X-Admin-Key")).thenReturn("");

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain, never()).doFilter(request, response);
        verify(response).setStatus(HttpServletResponse.SC_UNAUTHORIZED);
    }
}
