package com.rachitkushwaha.schemesetu.service;

import com.rachitkushwaha.schemesetu.exception.RateLimitExceededException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;

@Service
public class RateLimiterService {

    private static final int MAX_REQUESTS_PER_HOUR = 20;
    private static final DateTimeFormatter HOUR_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMddHH");

    private final StringRedisTemplate redisTemplate;

    public RateLimiterService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public void checkRateLimit(HttpServletRequest request) {
        String clientIp = extractClientIp(request);
        String currentHour = LocalDateTime.now(ZoneOffset.UTC).format(HOUR_FORMATTER);
        String redisKey = "rate_limit:questionnaire_start:" + clientIp + ":" + currentHour;

        Long currentCount = redisTemplate.opsForValue().increment(redisKey);
        if (currentCount != null && currentCount == 1) {
            redisTemplate.expire(redisKey, Duration.ofHours(1));
        }

        if (currentCount != null && currentCount > MAX_REQUESTS_PER_HOUR) {
            throw new RateLimitExceededException(
                    "Rate limit exceeded. Maximum " + MAX_REQUESTS_PER_HOUR + " session creations per hour allowed."
            );
        }
    }

    public String extractClientIp(HttpServletRequest request) {
        if (request == null) {
            return "unknown";
        }
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr() != null ? request.getRemoteAddr() : "unknown";
    }
}
