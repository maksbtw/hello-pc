import { useCallback, useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';

import type { Step } from '../types/api';
import { useAppStore } from '../store/useAppStore';
import { stepMeta, type StepMeta } from '../data/steps';
import SimShell from './SimShell';
import {
  SsdStepView,
  RamStepView,
  CpuDecodeStepView,
  TextEncodeStepView,
  RasterStepView,
  DisplayStepView,
} from './stepViews';

const TOTAL = stepMeta.length;

function renderView(step: Step, meta: StepMeta) {
  switch (step.id) {
    case 'ssd':
      return <SsdStepView step={step} meta={meta} />;
    case 'ram':
      return <RamStepView step={step} meta={meta} />;
    case 'cpu-decode':
      return <CpuDecodeStepView step={step} meta={meta} />;
    case 'text-encode':
      return <TextEncodeStepView step={step} meta={meta} />;
    case 'raster':
      return <RasterStepView step={step} meta={meta} />;
    case 'display':
      return <DisplayStepView step={step} meta={meta} />;
  }
}

export default function SimulationStep() {
  const navigate = useNavigate();
  const { n } = useParams();
  const response = useAppStore((s) => s.response);
  const setCurrentStep = useAppStore((s) => s.setCurrentStep);

  const index = Number(n);
  const valid = !!response && Number.isInteger(index) && index >= 1 && index <= TOTAL;

  // Lewa strzałka nieaktywna na kroku 1; prawa na ostatnim → podsumowanie.
  const goPrev = useCallback(() => {
    if (index > 1) navigate(`/simulation/step/${index - 1}`);
  }, [index, navigate]);
  const goNext = useCallback(() => {
    navigate(index < TOTAL ? `/simulation/step/${index + 1}` : '/simulation/done');
  }, [index, navigate]);

  useEffect(() => {
    if (valid) setCurrentStep(index);
  }, [valid, index, setCurrentStep]);

  // Nawigacja klawiaturą: ← → kroki.
  useEffect(() => {
    if (!valid) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext();
      else if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [valid, goNext, goPrev]);

  // Wejście bez danych (np. odświeżenie) → powrót na start.
  if (!valid) return <Navigate to="/simulation" replace />;

  const meta = stepMeta[index - 1];
  const step = response!.steps.find((s) => s.id === meta.id);
  if (!step) return <Navigate to="/simulation" replace />;

  return (
    <SimShell
      index={index}
      meta={meta}
      onPrev={goPrev}
      onNext={goNext}
      onSelect={(target) => navigate(`/simulation/step/${target}`)}
    >
      {renderView(step, meta)}
    </SimShell>
  );
}
