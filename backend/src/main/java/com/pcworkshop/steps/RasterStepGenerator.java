package com.pcworkshop.steps;

import com.pcworkshop.model.Step;
import org.springframework.stereotype.Component;

import java.util.List;

/** Krok 6 "raster". TODO: prawdziwa logika. Na razie poprawne strukturalnie dane (0/1). */
@Component
public class RasterStepGenerator implements StepGenerator {
    @Override
    public int order() {
        return 6;
    }

    @Override
    public Step generate(String input) {
        // TODO: wyrasteryzować tekst do siatki pikseli.
        List<List<Integer>> pixels = List.of(
                List.of(1, 0, 0, 0, 1),
                List.of(1, 1, 1, 1, 1),
                List.of(1, 0, 0, 0, 1));
        return new Step.Raster(5, 3, pixels);
    }
}
