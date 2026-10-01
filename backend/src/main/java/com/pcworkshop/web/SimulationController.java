package com.pcworkshop.web;

import com.pcworkshop.model.SimulationResponse;
import com.pcworkshop.model.Step;
import com.pcworkshop.steps.StepGenerator;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class SimulationController {

    private static final int MAX_CODE_POINTS = 12;

    private final List<StepGenerator> generators;

    public SimulationController(List<StepGenerator> generators) {
        // Kolejność kroków wg order() (1..7).
        this.generators = generators.stream()
                .sorted(Comparator.comparingInt(StepGenerator::order))
                .toList();
    }

    public record SimulationRequest(String text) {}

    @PostMapping("/simulation")
    public ResponseEntity<?> simulate(@RequestBody(required = false) SimulationRequest body) {
        String text = body == null ? null : body.text();

        if (text == null || text.isEmpty()) {
            return error("Tekst nie może być pusty.");
        }
        // Liczymy code pointy, nie char — ważne dla znaków spoza BMP (emoji itd.).
        long codePoints = text.codePointCount(0, text.length());
        if (codePoints > MAX_CODE_POINTS) {
            return error("Tekst może mieć maksymalnie " + MAX_CODE_POINTS + " znaków.");
        }

        List<Step> steps = generators.stream().map(g -> g.generate(text)).toList();
        return ResponseEntity.ok(new SimulationResponse(text, steps));
    }

    private static ResponseEntity<Map<String, String>> error(String message) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", message));
    }
}
