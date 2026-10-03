package com.pcworkshop.logging;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.concurrent.TimeUnit;

@Component
@Profile("dev")
public class DevRequestLoggingFilter extends OncePerRequestFilter {
    private static final Logger logger = LoggerFactory.getLogger(DevRequestLoggingFilter.class);

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        long startedAt = System.nanoTime();

        try {
            filterChain.doFilter(request, response);
        } catch (IOException | ServletException | RuntimeException exception) {
            long durationMs = elapsedMilliseconds(startedAt);
            logger.error("HTTP {} {} failed after {} ms",
                    request.getMethod(), request.getRequestURI(), durationMs, exception);
            throw exception;
        }

        long durationMs = elapsedMilliseconds(startedAt);
        int status = response.getStatus();
        String message = "HTTP {} {} -> {} ({} ms)";

        if (status >= 500) {
            logger.error(message, request.getMethod(), request.getRequestURI(), status, durationMs);
        } else if (status >= 400) {
            logger.warn(message, request.getMethod(), request.getRequestURI(), status, durationMs);
        } else {
            logger.info(message, request.getMethod(), request.getRequestURI(), status, durationMs);
        }
    }

    private long elapsedMilliseconds(long startedAt) {
        return TimeUnit.NANOSECONDS.toMillis(System.nanoTime() - startedAt);
    }
}
