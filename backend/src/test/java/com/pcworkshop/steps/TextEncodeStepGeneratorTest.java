package com.pcworkshop.steps;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class TextEncodeStepGeneratorTest {

    private final TextEncodeStepGenerator generator = new TextEncodeStepGenerator();

    @Test
    void encodesAsciiCharToSingleByte() {
        Step.TextEncode step = (Step.TextEncode) generator.generate("H");

        assertEquals(1, step.chars().size());
        Step.CharEncoding h = step.chars().get(0);
        assertEquals("H", h.ch());
        assertEquals(List.of(72), h.bytes());
        assertEquals(List.of("01001000"), h.binary());
    }

    @Test
    void encodesMultiByteCharToTwoBytes() {
        // "Ł" (U+0141) w UTF-8 to dwa bajty: 0xC5 0x81 = 197, 129.
        Step.TextEncode step = (Step.TextEncode) generator.generate("Ł");

        assertEquals(1, step.chars().size());
        Step.CharEncoding l = step.chars().get(0);
        assertEquals("Ł", l.ch());
        assertEquals(List.of(197, 129), l.bytes());
        assertEquals(List.of("11000101", "10000001"), l.binary());
    }

    @Test
    void metadataMatchesContract() {
        Step step = generator.generate("Hello");
        assertEquals("text-encode", step.id());
        assertEquals("cpu", step.component());
    }
}
