package com.pcworkshop.exception;

import com.pcworkshop.dto.AskResponse;
import com.pcworkshop.dto.ApiErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.client.RestClientException;

import java.time.Instant;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidationError(
            MethodArgumentNotValidException exception,
            HttpServletRequest request) {
        String message = exception.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .distinct()
                .collect(Collectors.joining("; "));

        if (message.isBlank()) {
            message = "Request validation failed.";
        }
        return badRequest(message, request);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiErrorResponse> handleUnreadableRequest(HttpServletRequest request) {
        return badRequest("Request body is missing or contains invalid JSON.", request);
    }

    @ExceptionHandler(RestClientException.class)
    public ResponseEntity<AskResponse> handleLlamaUnavailable() {
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                .body(new AskResponse("Local LLM is unavailable."));
    }

    @ExceptionHandler(LlamaResponseException.class)
    public ResponseEntity<AskResponse> handleIncompleteLlamaResponse() {
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                .body(new AskResponse("The answer was too long to finish. Please ask a more specific question."));
    }

    private ResponseEntity<ApiErrorResponse> badRequest(String message, HttpServletRequest request) {
        ApiErrorResponse body = new ApiErrorResponse(
                Instant.now(),
                HttpStatus.BAD_REQUEST.value(),
                HttpStatus.BAD_REQUEST.getReasonPhrase(),
                message,
                request.getRequestURI()
        );
        return ResponseEntity.badRequest().body(body);
    }
}
