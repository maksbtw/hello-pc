package com.pcworkshop.steps;

import com.pcworkshop.model.Step;
import org.springframework.stereotype.Component;

import java.util.List;

/** Krok 7 "display". TODO: prawdziwa logika. Na razie poprawne strukturalnie dane. */
@Component
public class DisplayStepGenerator implements StepGenerator {
    @Override
    public int order() {
        return 7;
    }

    @Override
    public Step generate(String input) {
        // TODO: policzyć próbki kolorów pikseli na ekranie.
        List<Step.Sample> sample = List.of(
                new Step.Sample(0, 0, List.of(74, 222, 128)),
                new Step.Sample(4, 2, List.of(96, 165, 250)));
        return new Step.Display(5, 3, sample);
    }
}
