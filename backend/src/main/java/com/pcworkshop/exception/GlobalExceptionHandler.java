package com.pcworkshop.exception;

import com.pcworkshop.dto.AskResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.client.RestClientException;

@RestControllerAdvice
public class GlobalExceptionHandler {
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
}
