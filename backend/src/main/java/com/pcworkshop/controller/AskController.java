package com.pcworkshop.controller;

import com.pcworkshop.client.LlamaClient;
import com.pcworkshop.dto.AskRequest;
import com.pcworkshop.dto.AskResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AskController {
    private final LlamaClient llamaClient;

    public AskController(LlamaClient llamaClient) {
        this.llamaClient = llamaClient;
    }

    @PostMapping("/api/ask")
    public AskResponse ask(@Valid @RequestBody AskRequest request) {
        return new AskResponse(llamaClient.ask(request.question()));
    }
}
