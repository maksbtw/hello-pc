package com.pcworkshop.steps;

import com.pcworkshop.model.Step;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Krok 5 "text-encode" — JEDYNY w pełni zaimplementowany (wzorzec dla reszty).
 * Każdy znak (code point) → bajty UTF-8 → zapis binarny (8 bitów na bajt).
 */
@Component
public class TextEncodeStepGenerator implements StepGenerator {

    @Override
    public int order() {
        return 5;
    }

    @Override
    public Step generate(String input) {
        List<Step.CharEncoding> chars = new ArrayList<>();

        // Iteracja po code pointach (poprawnie dla znaków spoza BMP).
        input.codePoints().forEach(cp -> {
            String ch = new String(Character.toChars(cp));
            byte[] utf8 = ch.getBytes(java.nio.charset.StandardCharsets.UTF_8);

            List<Integer> bytes = new ArrayList<>(utf8.length);
            List<String> binary = new ArrayList<>(utf8.length);
            for (byte b : utf8) {
                int unsigned = b & 0xFF;
                bytes.add(unsigned);
                binary.add(toBinary8(unsigned));
            }
            chars.add(new Step.CharEncoding(ch, bytes, binary));
        });

        return new Step.TextEncode(chars);
    }

    /** Bajt (0..255) → 8-bitowy string, np. 72 → "01001000". */
    private static String toBinary8(int unsigned) {
        return String.format("%8s", Integer.toBinaryString(unsigned)).replace(' ', '0');
    }
}
