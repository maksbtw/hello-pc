package com.pcworkshop.steps;

import com.pcworkshop.model.Step;

/**
 * Wspólny interfejs kroków symulacji. Dopisanie kroku = nowa klasa implementująca
 * ten interfejs (wykrywana automatycznie jako bean Springa). Kolejność nadaje
 * {@code order()}.
 */
public interface StepGenerator {
    /** Kolejność w odpowiedzi (1..7). */
    int order();

    /** Zbuduj krok dla danego tekstu wejściowego. */
    Step generate(String input);
}
