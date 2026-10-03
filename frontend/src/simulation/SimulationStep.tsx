import { useCallback, useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';

import type { Step } from '../types/api';
import { useAppStore } from '../store/useAppStore';
import { stepMeta } from '../data/steps';
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
const AUTO_MS = 3200;

function renderView(step: Step) {
  switch (step.id) {
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

  // Krok z odpowiedzi dobieramy po id (odpowiedź wciąż ma 7 kroków z backendu;
  // kolejność UI bierze się z stepMeta, więc dopasowujemy po identyfikatorze).
  const meta = stepMeta[index - 1];
  const step = response!.steps.find((s) => s.id === meta.id);
  if (!step) return <Navigate to="/simulation" replace />;

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
