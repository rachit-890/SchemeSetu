package com.rachitkushwaha.schemesetu.service;

import com.rachitkushwaha.schemesetu.exception.RateLimitExceededException;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.data.redis.core.StringRedisTemplate;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class RateLimiterServiceTest {

    private StringRedisTemplate redisTemplate;
    private ValueOperations<String, String> valueOperations;
    private RateLimiterService rateLimiterService;

    @BeforeEach
    @SuppressWarnings("unchecked")
    void setUp() {
        redisTemplate = mock(StringRedisTemplate.class);
        valueOperations = mock(ValueOperations.class);
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);

        rateLimiterService = new RateLimiterService(redisTemplate);
    }

    @Test
    void extractClientIp_prioritizesXForwardedForHeader() {
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(request.getHeader("X-Forwarded-For")).thenReturn("203.0.113.195, 10.0.0.1");

        String ip = rateLimiterService.extractClientIp(request);
        assertEquals("203.0.113.195", ip);
    }

    @Test
    void extractClientIp_fallsBackToRemoteAddrWhenHeaderAbsent() {
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(request.getHeader("X-Forwarded-For")).thenReturn(null);
        when(request.getRemoteAddr()).thenReturn("192.168.1.50");

        String ip = rateLimiterService.extractClientIp(request);
        assertEquals("192.168.1.50", ip);
    }

    @Test
    void checkRateLimit_under20Requests_allowsSessionStart() {
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(request.getRemoteAddr()).thenReturn("10.0.0.5");
        when(valueOperations.increment(anyString())).thenReturn(5L);

        assertDoesNotThrow(() -> rateLimiterService.checkRateLimit(request));
    }

    @Test
    void checkRateLimit_21stRequest_throwsRateLimitExceededException() {
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(request.getRemoteAddr()).thenReturn("10.0.0.5");
        when(valueOperations.increment(anyString())).thenReturn(21L);

        RateLimitExceededException ex = assertThrows(RateLimitExceededException.class, () ->
                rateLimiterService.checkRateLimit(request)
        );
        assertTrue(ex.getMessage().contains("Rate limit exceeded"));
    }

    @Test
    void checkAdminRateLimit_under20Requests_allowsOperation() {
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(request.getRemoteAddr()).thenReturn("10.0.0.5");
        when(valueOperations.increment(anyString())).thenReturn(10L);

        assertDoesNotThrow(() -> rateLimiterService.checkAdminRateLimit(request, "ingest"));
    }

    @Test
    void checkAdminRateLimit_21stRequest_throwsRateLimitExceededException() {
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(request.getRemoteAddr()).thenReturn("10.0.0.5");
        when(valueOperations.increment(startsWith("rate_limit:admin_ingest:"))).thenReturn(21L);

        RateLimitExceededException ex = assertThrows(RateLimitExceededException.class, () ->
                rateLimiterService.checkAdminRateLimit(request, "ingest")
        );
        assertTrue(ex.getMessage().contains("Admin rate limit exceeded for ingest"));
    }
}
