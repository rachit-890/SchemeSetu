package com.rachitkushwaha.schemesetu.config;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.DefaultCorsProcessor;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class CorsConfigTest {

    @Test
    void corsConfigurer_registersAllowedOriginsAndExplicitHeaders() {
        CorsConfig config = new CorsConfig("https://schemesetu.in, https://admin.schemesetu.in");

        WebMvcConfigurer configurer = config.corsConfigurer();
        assertNotNull(configurer);

        TestCorsRegistry registry = new TestCorsRegistry();
        configurer.addCorsMappings(registry);

        Map<String, CorsConfiguration> configs = registry.getCorsConfigurations();
        assertTrue(configs.containsKey("/**"));

        CorsConfiguration corsConfig = configs.get("/**");
        assertNotNull(corsConfig);
        assertEquals(2, corsConfig.getAllowedOrigins().size());
        assertTrue(corsConfig.getAllowedOrigins().contains("https://schemesetu.in"));
        assertTrue(corsConfig.getAllowedOrigins().contains("https://admin.schemesetu.in"));

        assertTrue(Boolean.TRUE.equals(corsConfig.getAllowCredentials()));
        assertTrue(corsConfig.getAllowedHeaders().contains("Content-Type"));
        assertTrue(corsConfig.getAllowedHeaders().contains("X-Admin-Key"));
        assertTrue(corsConfig.getAllowedHeaders().contains("Accept"));
        assertTrue(corsConfig.getAllowedHeaders().contains("Origin"));
        assertTrue(corsConfig.getAllowedHeaders().contains("Authorization"));
        assertFalse(corsConfig.getAllowedHeaders().contains("*"), "Must not use wildcard headers with allowCredentials(true)");
    }

    @Test
    void constructor_throwsException_whenOriginsNullBlankOrUnresolved() {
        assertThrows(IllegalArgumentException.class, () -> new CorsConfig(null));
        assertThrows(IllegalArgumentException.class, () -> new CorsConfig("   "));
        assertThrows(IllegalArgumentException.class, () -> new CorsConfig("${FRONTEND_URL}"));
    }

    @Test
    void corsProcessor_handlesPreflightAndSetsCorrectCorsHeaders() throws Exception {
        CorsConfig config = new CorsConfig("http://localhost:5173, http://localhost:3000");

        WebMvcConfigurer configurer = config.corsConfigurer();
        TestCorsRegistry registry = new TestCorsRegistry();
        configurer.addCorsMappings(registry);
        CorsConfiguration corsConfig = registry.getCorsConfigurations().get("/**");

        DefaultCorsProcessor processor = new DefaultCorsProcessor();

        // Simulate preflight OPTIONS request from localhost:5173
        MockHttpServletRequest request = new MockHttpServletRequest("OPTIONS", "/api/v1/schemes/match");
        request.addHeader("Origin", "http://localhost:5173");
        request.addHeader("Access-Control-Request-Method", "POST");
        request.addHeader("Access-Control-Request-Headers", "Content-Type, X-Admin-Key");
        MockHttpServletResponse response = new MockHttpServletResponse();

        boolean result = processor.processRequest(corsConfig, request, response);

        // Preflight requests return true when successfully processed and accepted
        assertTrue(result);
        assertEquals("http://localhost:5173", response.getHeader("Access-Control-Allow-Origin"));
        assertEquals("true", response.getHeader("Access-Control-Allow-Credentials"));
        assertNotNull(response.getHeader("Access-Control-Allow-Headers"));
        assertTrue(response.getHeader("Access-Control-Allow-Headers").contains("Content-Type"));
        assertTrue(response.getHeader("Access-Control-Allow-Headers").contains("X-Admin-Key"));
        assertNotNull(response.getHeader("Access-Control-Allow-Methods"));
    }

    @Test
    void corsProcessor_rejectsUnauthorizedOrigin() throws Exception {
        CorsConfig config = new CorsConfig("http://localhost:5173");

        WebMvcConfigurer configurer = config.corsConfigurer();
        TestCorsRegistry registry = new TestCorsRegistry();
        configurer.addCorsMappings(registry);
        CorsConfiguration corsConfig = registry.getCorsConfigurations().get("/**");

        DefaultCorsProcessor processor = new DefaultCorsProcessor();

        MockHttpServletRequest request = new MockHttpServletRequest("OPTIONS", "/api/v1/schemes/match");
        request.addHeader("Origin", "http://malicious-origin.com");
        request.addHeader("Access-Control-Request-Method", "POST");
        MockHttpServletResponse response = new MockHttpServletResponse();

        boolean result = processor.processRequest(corsConfig, request, response);

        assertFalse(result);
        assertNull(response.getHeader("Access-Control-Allow-Origin"));
        assertEquals(403, response.getStatus());
    }

    @Test
    void applicationContextRunner_resolvesProdProfileFrontendUrl() {
        new ApplicationContextRunner()
                .withPropertyValues(
                        "spring.profiles.active=prod",
                        "FRONTEND_URL=https://schemesetu.in",
                        "cors.allowed-origins=${FRONTEND_URL}"
                )
                .withUserConfiguration(CorsConfig.class, org.springframework.boot.autoconfigure.context.PropertyPlaceholderAutoConfiguration.class)
                .run(context -> {
                    assertTrue(context.containsBean("corsConfigurer"));
                    CorsConfig corsConfigBean = context.getBean(CorsConfig.class);
                    Object origins = ReflectionTestUtils.getField(corsConfigBean, "allowedOrigins");
                    assertEquals("https://schemesetu.in", origins);
                });
    }

    @Test
    void applicationContextRunner_failsStartupIfFrontendUrlUnsetInProd() {
        new ApplicationContextRunner()
                .withPropertyValues(
                        "spring.profiles.active=prod",
                        "cors.allowed-origins=${FRONTEND_URL}"
                )
                .withUserConfiguration(CorsConfig.class)
                .run(context -> {
                    assertNotNull(context.getStartupFailure());
                    Throwable root = org.springframework.core.NestedExceptionUtils.getRootCause(context.getStartupFailure());
                    assertNotNull(root);
                    assertInstanceOf(IllegalArgumentException.class, root);
                    assertTrue(root.getMessage().contains("cors.allowed-origins configuration property must not be null, blank, or unresolved placeholder"));
                });
    }

    private static class TestCorsRegistry extends CorsRegistry {
        @Override
        public Map<String, CorsConfiguration> getCorsConfigurations() {
            return super.getCorsConfigurations();
        }
    }
}
