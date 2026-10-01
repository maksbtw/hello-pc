package com.pcworkshop.steps;

import com.pcworkshop.model.Step;
import org.springframework.stereotype.Component;

import java.util.List;

/** Krok 4 "cpu-decode". TODO: prawdziwa logika. Na razie poprawne strukturalnie dane. */
@Component
public class CpuDecodeStepGenerator implements StepGenerator {
    @Override
    public int order() {
        return 4;
    }

    @Override
    public Step generate(String input) {
        // TODO: zdekodować instrukcje.
        List<Step.Instruction> instructions = List.of(
                new Step.Instruction("0x0000", List.of(184, 72, 0, 0), "MOV AX, 'H'"),
                new Step.Instruction("0x0004", List.of(184, 101, 0, 0), "MOV AX, 'e'"));
        return new Step.CpuDecode(instructions, 0);
    }
}
