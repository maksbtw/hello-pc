package com.pcworkshop.controller;

import com.pcworkshop.dto.SimulationRequest;
import com.pcworkshop.dto.SimulationResponse;
import com.pcworkshop.service.SimulationService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SimulationController {
    private final SimulationService simulationService;

    public SimulationController(SimulationService simulationService) {
        this.simulationService = simulationService;
    }

    @PostMapping("/api/simulation")
    public SimulationResponse simulate(@Valid @RequestBody SimulationRequest request) {
        return simulationService.encode(request.text());
    }
}
