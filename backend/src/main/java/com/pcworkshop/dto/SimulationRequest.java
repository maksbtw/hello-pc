package com.pcworkshop.dto;

import com.pcworkshop.validation.CodePointLength;
import jakarta.validation.constraints.NotBlank;

public record SimulationRequest(
        @NotBlank
        @CodePointLength(max = 12)
        String text
) {}
