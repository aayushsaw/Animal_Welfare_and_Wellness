package com.animalwelfare.security;

import com.animalwelfare.api.response.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * IP-based rate limiting filter using Bucket4j.
 * Enforces security gates:
 * - General endpoints: Max 100 requests per minute per IP
 * - Authentication (login/register): Max 5 attempts per minute per IP to prevent brute force
 */
@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    private final Map<String, Bucket> generalCache = new ConcurrentHashMap<>();
    private final Map<String, Bucket> authCache = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${app.rate-limit.capacity:100}")
    private int capacity;

    @Value("${app.rate-limit.duration-minutes:1}")
    private int durationMinutes;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String path = request.getRequestURI();
        // Skip actuator endpoints from rate limiting to prevent health checking tools from being blocked
        if (path.startsWith("/actuator")) {
            filterChain.doFilter(request, response);
            return;
        }

        String ip = getClientIp(request);

        // Strict rate limit for auth endpoints to prevent brute force
        if (path.startsWith("/api/v1/auth/login") || path.startsWith("/api/v1/auth/register")) {
            Bucket authBucket = authCache.computeIfAbsent(ip, k -> createAuthBucket());
            if (!authBucket.tryConsume(1)) {
                sendErrorResponse(response, "Too many authentication attempts. Please wait 1 minute before trying again.");
                return;
            }
        }

        // Global threshold check
        Bucket generalBucket = generalCache.computeIfAbsent(ip, k -> createGeneralBucket());
        if (!generalBucket.tryConsume(1)) {
            sendErrorResponse(response, "Too many requests. Please try again later.");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private Bucket createGeneralBucket() {
        return Bucket.builder()
                .addLimit(Bandwidth.classic(capacity, Refill.intervally(capacity, Duration.ofMinutes(durationMinutes))))
                .build();
    }

    private Bucket createAuthBucket() {
        // Enforce 5 authentication attempts per minute max
        return Bucket.builder()
                .addLimit(Bandwidth.classic(5, Refill.intervally(5, Duration.ofMinutes(1))))
                .build();
    }

    private void sendErrorResponse(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        ApiResponse<Void> apiResponse = ApiResponse.error(message);
        response.getWriter().write(objectMapper.writeValueAsString(apiResponse));
    }

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isBlank()) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0].trim();
    }
}
