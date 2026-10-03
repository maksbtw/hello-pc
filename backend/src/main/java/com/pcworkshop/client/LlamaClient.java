package com.pcworkshop.client;

import com.pcworkshop.exception.LlamaResponseException;
import tools.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.util.List;
import java.util.Map;

@Component
public class LlamaClient {
    private final RestClient restClient;

    public LlamaClient(RestClient.Builder builder, @Value("${llama.base-url}") String baseUrl) {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofSeconds(5));
        requestFactory.setReadTimeout(Duration.ofSeconds(60));
        this.restClient = builder.baseUrl(baseUrl).requestFactory(requestFactory).build();
    }

    public String ask(String question) {
        JsonNode response = restClient.post()
                .uri("/v1/chat/completions")
                .body(Map.of(
                        "model", "local",
                        "messages", List.of(
                                Map.of("role", "system", "content",
                                        "Answer in plain text only. Do not use HTML or Markdown, including headings, bullets, bold text, or links. " +
                                                "Keep the answer to at most 3 short sentences and 60 words. Answer only what was asked."),
                                Map.of("role", "user", "content", question)
                        ),
                        "stream", false,
                        "max_tokens", 160,
                        "chat_template_kwargs", Map.of("enable_thinking", false)
                ))
                .retrieve()
                .body(JsonNode.class);

        JsonNode choice = response == null ? null : response.at("/choices/0");
        if (choice == null || "length".equals(choice.path("finish_reason").asText())) {
            throw new LlamaResponseException("Local LLM response exceeded its output limit");
        }

        JsonNode content = choice.at("/message/content");
        if (content == null || !content.isTextual() || content.asText().isBlank()) {
            throw new LlamaResponseException("Local LLM returned no answer");
        }
        return content.asText();
    }
}
