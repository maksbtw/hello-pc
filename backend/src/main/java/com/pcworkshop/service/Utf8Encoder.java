package com.pcworkshop.service;

import com.pcworkshop.dto.SimulationResponse;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Component
public class Utf8Encoder {

    public EncodingResult encode(String text) {
        List<SimulationResponse.CharacterEncoding> characters = new ArrayList<>();
        int totalBytes = 0;

        for (int offset = 0; offset < text.length();) {
            int codePoint = text.codePointAt(offset);
            String character = new String(Character.toChars(codePoint));
            byte[] encoded = character.getBytes(StandardCharsets.UTF_8);
            List<SimulationResponse.ByteRepresentation> bytes = new ArrayList<>(encoded.length);

            for (byte value : encoded) {
                int unsignedValue = value & 0xFF;
                String binary = Integer.toBinaryString(unsignedValue);
                binary = "0".repeat(8 - binary.length()) + binary;
                bytes.add(new SimulationResponse.ByteRepresentation(
                        unsignedValue,
                        String.format("%02X", unsignedValue),
                        binary
                ));
            }

            characters.add(new SimulationResponse.CharacterEncoding(
                    character,
                    String.format("U+%04X", codePoint),
                    encoded.length,
                    bytes
            ));
            totalBytes += encoded.length;
            offset += Character.charCount(codePoint);
        }

        return new EncodingResult(totalBytes, characters);
    }

    public record EncodingResult(
            int totalBytes,
            List<SimulationResponse.CharacterEncoding> characters
    ) {}
}
