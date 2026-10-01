package com.pcworkshop.steps;

import com.pcworkshop.model.Step;
import org.springframework.stereotype.Component;

import java.util.List;

/** Krok 2 "ssd". TODO: prawdziwa logika. Na razie poprawne strukturalnie dane. */
@Component
public class SsdStepGenerator implements StepGenerator {
    @Override
    public int order() {
        return 2;
    }

    @Override
    public Step generate(String input) {
        // TODO: zapis bajtów tekstu na "dysku".
        return new Step.Ssd(List.of(72, 101, 108, 108, 111), List.of(0, 5));
    }
}
