import { useCallback, useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';

import type { Step } from '../types/api';
import { useAppStore } from '../store/useAppStore';
import { stepMeta } from '../data/steps';
import SimShell from './SimShell';
import {
  MouseStepView,
  SsdStepView,
  RamStepView,
  CpuDecodeStepView,
  TextEncodeStepView,
  RasterStepView,
  DisplayStepView,
} from './stepViews';

const TOTAL = 7;
const AUTO_MS = 3200;

function renderView(step: Step) {
  switch (step.id) {
    case 'mouse':
      return <MouseStepView step={step} />;
    case 'ssd':
      return <SsdStepView step={step} />;
    case 'ram':
      return <RamStepView step={step} />;
    case 'cpu-decode':
      return <CpuDecodeStepView step={step} />;
    case 'text-encode':
      return <TextEncodeStepView step={step} />;
    case 'raster':
      return <RasterStepView step={step} />;
    case 'display':
      return <DisplayStepView step={step} />;
  }
}

export default function SimulationStep() {
  const navigate = useNavigate();
  const { n } = useParams();
  const response = useAppStore((s) => s.response);
  const setCurrentStep = useAppStore((s) => s.setCurrentStep);
  const autoPlay = useAppStore((s) => s.autoPlay);
  const setAutoPlay = useAppStore((s) => s.setAutoPlay);

  const index = Number(n);
  const valid = !!response && Number.isInteger(index) && index >= 1 && index <= TOTAL;

  // Nawigacja ograniczona do zakresu 1..TOTAL (na krańcach strzałki nieaktywne).
  const goPrev = useCallback(() => {
    if (index > 1) navigate(`/simulation/step/${index - 1}`);
  }, [index, navigate]);
  const goNext = useCallback(() => {
    if (index < TOTAL) navigate(`/simulation/step/${index + 1}`);
  }, [index, navigate]);
  const goFinish = useCallback(() => navigate('/simulation/done'), [navigate]);
  const toggleAuto = useCallback(() => setAutoPlay(!autoPlay), [autoPlay, setAutoPlay]);

  useEffect(() => {
    if (valid) setCurrentStep(index);
  }, [valid, index, setCurrentStep]);

  // Auto-play: przeskok do kolejnego kroku; na końcu zatrzymanie.
  useEffect(() => {
    if (!valid || !autoPlay) return;
    if (index >= TOTAL) {
      setAutoPlay(false);
      return;
    }
    const t = window.setTimeout(() => navigate(`/simulation/step/${index + 1}`), AUTO_MS);
    return () => window.clearTimeout(t);
  }, [valid, autoPlay, index, navigate, setAutoPlay]);

  // Nawigacja klawiaturą: ← → kroki, spacja auto.
  useEffect(() => {
    if (!valid) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext();
      else if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === ' ') {
        e.preventDefault();
        toggleAuto();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [valid, goNext, goPrev, toggleAuto]);

  // Wejście bez danych (np. odświeżenie) → powrót na start.
  if (!valid) return <Navigate to="/simulation" replace />;

  const step = response!.steps[index - 1];
  const meta = stepMeta[index - 1];

  return (
    <SimShell
      index={index}
      total={TOTAL}
      meta={meta}
      onPrev={goPrev}
      onNext={goNext}
      onSelect={(target) => navigate(`/simulation/step/${target}`)}
      onFinish={goFinish}
      isAuto={autoPlay}
      onToggleAuto={toggleAuto}
    >
      {renderView(step)}
    </SimShell>
  );
}
