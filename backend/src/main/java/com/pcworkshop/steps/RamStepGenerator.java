package com.pcworkshop.steps;

import com.pcworkshop.model.Step;
import org.springframework.stereotype.Component;

import java.util.List;

/** Krok 3 "ram". TODO: prawdziwa logika. Na razie poprawne strukturalnie dane. */
@Component
public class RamStepGenerator implements StepGenerator {
    @Override
    public int order() {
        return 3;
    }

    @Override
    public Step generate(String input) {
        // TODO: ułożyć bajty w komórkach pamięci.
        List<Step.RamRow> rows = List.of(
                new Step.RamRow("0x0000", List.of(72, 101, 108, 108)),
                new Step.RamRow("0x0004", List.of(111, 0, 0, 0)));
        return new Step.Ram(rows, List.of(0, 5));
    }
}
