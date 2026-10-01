package com.pcworkshop.model;

import java.util.List;

/** Odpowiedź symulacji — ten sam kształt co typy TS we frontendzie i mock JSON. */
public record SimulationResponse(String input, List<Step> steps) {}
