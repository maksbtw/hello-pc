import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, ContactShadows } from '@react-three/drei';
import { useGLTF } from '@react-three/drei';
import { ASSEMBLY_PARTS, modelUrl, useCatalog } from './catalog';
import { useAppStore } from '../store/useAppStore';
import type { PartName } from '../data/parts';

// Kolor podświetlenia = token --accent z design systemu.
const HIGHLIGHT_COLOR = '#F5A524';

/**
 * Scena eksploracji (Max): złożony PC z 8 modeli montażowych w origin.
 * Offline-first — bez Environment/HDRI z CDN; oświetlenie trójpunktowe
 * z ciepłym fillem w kolorze motywu „lampa". Klikanie/podświetlanie
 * dochodzi w kolejnych krokach.
 */

// Środek złożonego PC (ok. środek obudowy) — target dla OrbitControls.
const SCENE_TARGET: [number, number, number] = [0, 0.23, 0];

function LoadingScreen() {
  return (
    <Html center>
      <div className="font-mono text-sm text-text-muted">Ładowanie sceny…</div>
    </Html>
  );
}

interface AssemblyPartProps {
  part: PartName;
  url: string;
  hovered: boolean;
  onHover: (part: PartName) => void;
  onUnhover: () => void;
}

function AssemblyPart({ part, url, hovered, onHover, onUnhover }: AssemblyPartProps) {
  const { scene } = useGLTF(url);
  const setSelectedPart = useAppStore((s) => s.setSelectedPart);
  const isSelected = useAppStore((s) => s.selectedPart === part);
  const intensityRef = useRef(0);
  const targetRef = useRef(0);

  // Klon sceny z WŁASNYMI materiałami — nie mutujemy współdzielonego cache
  // GLTF (README). Baza emissive = kolor akcentu + siła 0 (klucz do braku
  // „świecącego całego kompa": bez tego materiały z własnym emissive w modelu
  // świeciłyby się pomarańczowo od startu).
  const { object, materials } = useMemo(() => {
    const object = scene.clone(true);
    const materials: THREE.MeshStandardMaterial[] = [];
    object.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh || !mesh.material) return;
      const cloneOne = (m: THREE.Material) => {
        const c = m.clone();
        if ('emissive' in c) {
          const sm = c as THREE.MeshStandardMaterial;
          sm.emissive.set(HIGHLIGHT_COLOR);
          sm.emissiveIntensity = 0;
          materials.push(sm);
        }
        return c;
      };
      mesh.material = Array.isArray(mesh.material)
        ? mesh.material.map(cloneOne)
        : cloneOne(mesh.material);
    });
    return { object, materials };
  }, [scene]);

  // Docelowa siła świecenia wg stanu (ref — bez nieaktualnego domknięcia w useFrame).
  targetRef.current = isSelected ? 0.6 : hovered ? 0.22 : 0;

  // Płynne dochodzenie do targetu (damp, niezależne od FPS) — miękkie
  // wygaszanie zamiast skoku 0↔full.
  useFrame((_, delta) => {
    const next = THREE.MathUtils.damp(intensityRef.current, targetRef.current, 12, delta);
    if (Math.abs(next - intensityRef.current) < 0.0005) return;
    intensityRef.current = next;
    for (const m of materials) m.emissiveIntensity = next;
  });

  return (
    <group
      // stopPropagation → zdarzenie łapie tylko najbliższa część, nie te za nią.
      onClick={(e) => {
        e.stopPropagation();
        setSelectedPart(part);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(part);
      }}
      onPointerMove={(e) => {
        e.stopPropagation();
        onHover(part);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onUnhover();
      }}
    >
      <primitive object={object} />
    </group>
  );
}

function AssembledPC() {
  const data = useCatalog();
  // Jedno źródło prawdy dla hovera — brak „zawieszonych" stanów per-część.
  const [hoveredPart, setHoveredPart] = useState<PartName | null>(null);
  const outTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (outTimer.current) window.clearTimeout(outTimer.current);
    },
    [],
  );

  // Najechanie: anuluj zaplanowane zgaszenie i ustaw aktualną część.
  const onHover = (part: PartName) => {
    if (outTimer.current) {
      window.clearTimeout(outTimer.current);
      outTimer.current = null;
    }
    setHoveredPart((prev) => (prev === part ? prev : part));
    document.body.style.cursor = 'pointer';
  };
  // Zejście: zgaś z opóźnieniem — natychmiastowy ruch nad inną częścią anuluje.
  const onUnhover = () => {
    if (outTimer.current) window.clearTimeout(outTimer.current);
    outTimer.current = window.setTimeout(() => {
      setHoveredPart(null);
      document.body.style.cursor = 'default';
    }, 100);
  };

  return (
    <>
      {ASSEMBLY_PARTS.map((part) => {
        const asset = data.assemblyByPart.get(part);
        if (!asset) return null;
        return (
          <AssemblyPart
            key={part}
            part={part}
            url={modelUrl(asset.file)}
            hovered={hoveredPart === part}
            onHover={onHover}
            onUnhover={onUnhover}
          />
        );
      })}
    </>
  );
}

export default function ExploreScene() {
  const setSelectedPart = useAppStore((s) => s.setSelectedPart);
  return (
    <Canvas
      camera={{ position: [0.55, 0.45, 0.75], fov: 45 }}
      dpr={[1, 2]}
      // Klik w tło (poza modelem) = odznaczenie.
      onPointerMissed={() => setSelectedPart(null)}
    >
      {/* Oświetlenie (offline, bez HDRI). Materiały PBR bez env-mapy są ciemne,
          więc świecimy z kilku stron. Ciepły fill = motyw „lampa". */}
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 5, 2]} intensity={2.6} />
      <directionalLight position={[-3, 2, -2]} intensity={1.0} color="#FFD9A0" />
      <directionalLight position={[1, 1, 4]} intensity={1.2} />

      <Suspense fallback={<LoadingScreen />}>
        <AssembledPC />
        <ContactShadows
          position={[0, 0, 0]}
          opacity={0.45}
          scale={1.4}
          blur={2.4}
          far={1}
          resolution={1024}
        />
      </Suspense>

      <OrbitControls
        makeDefault
        target={SCENE_TARGET}
        enablePan={false}
        minDistance={0.4}
        maxDistance={2.5}
        maxPolarAngle={Math.PI / 1.9}
      />
    </Canvas>
  );
}
