package com.pcworkshop.steps;

import com.pcworkshop.model.Step;
import org.springframework.stereotype.Component;

import java.util.List;

/** Krok 1 "mouse". TODO: prawdziwa logika. Na razie poprawne strukturalnie dane. */
@Component
public class MouseStepGenerator implements StepGenerator {
    @Override
    public int order() {
        return 1;
    }

    @Override
    public Step generate(String input) {
        // TODO: policzyć prawdziwe zdarzenie myszy.
        return new Step.Mouse(List.of(0, 0, 0, 0), List.of("dx", "dy", "buttons", "wheel"));
    }
}
