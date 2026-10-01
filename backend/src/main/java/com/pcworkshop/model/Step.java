package com.pcworkshop.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

/**
 * Krok symulacji. Unia rozróżniana polem "id" (+ "component"), jak w kontrakcie TS.
 * Każdy rekord serializuje się do JSON-a z polami id/component i swoim payloadem.
 */
public sealed interface Step
        permits Step.Mouse, Step.Ssd, Step.Ram, Step.CpuDecode, Step.TextEncode, Step.Raster, Step.Display {

    String id();

    String component();

    // 1
    record Mouse(List<Integer> bytes, List<String> labels) implements Step {
        public String id() { return "mouse"; }
        public String component() { return "mouse"; }
    }

    // 2
    record Ssd(List<Integer> bytes, List<Integer> highlight) implements Step {
        public String id() { return "ssd"; }
        public String component() { return "ssd"; }
    }

    // 3
    record Ram(List<RamRow> rows, List<Integer> highlight) implements Step {
        public String id() { return "ram"; }
        public String component() { return "ram"; }
    }
    record RamRow(String address, List<Integer> bytes) {}

    // 4
    record CpuDecode(List<Instruction> instructions, int currentIndex) implements Step {
        public String id() { return "cpu-decode"; }
        public String component() { return "cpu"; }
    }
    record Instruction(String address, List<Integer> bytes, String asm) {}

    // 5 — jedyny w pełni zaimplementowany krok
    record TextEncode(List<CharEncoding> chars) implements Step {
        public String id() { return "text-encode"; }
        public String component() { return "cpu"; }
    }
    // W JSON pole nazywa się "char" ("char" jest słowem kluczowym w Javie).
    record CharEncoding(@JsonProperty("char") String ch, List<Integer> bytes, List<String> binary) {}

    // 6
    record Raster(int width, int height, List<List<Integer>> pixels) implements Step {
        public String id() { return "raster"; }
        public String component() { return "gpu"; }
    }

    // 7
    record Display(int width, int height, List<Sample> sample) implements Step {
        public String id() { return "display"; }
        public String component() { return "monitor"; }
    }
    record Sample(int x, int y, List<Integer> rgb) {}
}
