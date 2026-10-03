import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html, ContactShadows } from '@react-three/drei';
import { useGLTF } from '@react-three/drei';
import gsap from 'gsap';
import {
  ASSEMBLY_PARTS,
  boundsCenter,
  boundsSize,
  getVariantModels,
  modelUrl,
  useCatalog,
  variantRowLayout,
} from './catalog';
import type { VariantModel } from './catalog';
import { useAppStore } from '../store/useAppStore';
import type { PartName } from '../data/parts';

// Kolor podświetlenia = token --accent z design systemu.
const HIGHLIGHT_COLOR = '#F5A524';
// Siła emissive dla zaznaczonego/wyróżnionego (niższa = subtelniejsze oznaczenie).
const HIGHLIGHT_SELECTED = 0.16;

// Dystans kamery w widoku całego PC.
const DEFAULT_VIEW_DISTANCE = 1.0;

// Pożądana orientacja kamery po wyborze części (Euler w stopniach).
const SELECT_EULER = new THREE.Euler(
  THREE.MathUtils.degToRad(-90),
  THREE.MathUtils.degToRad(90),
  THREE.MathUtils.degToRad(90),
  'XYZ',
);

/**
 * Scena eksploracji (Max): złożony PC z 8 modeli montażowych w origin.
 * Offline-first — bez Environment/HDRI z CDN; oświetlenie trójpunktowe
 * z ciepłym fillem w kolorze motywu „lampa". Klikanie/podświetlanie
 * dochodzi w kolejnych krokach.
 */

// Środek złożonego PC (ok. środek obudowy) — target dla OrbitControls.
const SCENE_TARGET: [number, number, number] = [0, 0.23, 0];

// Wysunięcie wybranego komponentu z kompa wzdłuż X (otwarty bok = +X).
// Obudowa jako wyjątek jedzie w przeciwną stronę (-X), reszta zostaje w miejscu.
const EXTRACT_DIST = 0.3;
const extractOffsetX = (part: PartName, selected: boolean): number =>
  selected ? (part === 'Case' ? -EXTRACT_DIST : EXTRACT_DIST) : 0;

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
  /** Część ma ≥2 modele wariantów → po wyborze ukrywamy ją (pokaże je rząd). */
  hasVariants: boolean;
  onHover: (part: PartName) => void;
  onUnhover: () => void;
}

function AssemblyPart({ part, url, hovered, hasVariants, onHover, onUnhover }: AssemblyPartProps) {
  const { scene } = useGLTF(url);
  const setSelectedPart = useAppStore((s) => s.setSelectedPart);
  const isSelected = useAppStore((s) => s.selectedPart === part);
  const anySelected = useAppStore((s) => s.selectedPart !== null);

  // Wybrana część z wariantami jest ukrywana jak reszta (zamiast wysuwana) —
  // jej odmiany pokaże VariantRow. Bez wariantów → wysuwa się i świeci jak dotąd.
  const showExtracted = isSelected && !hasVariants;

  const groupRef = useRef<THREE.Group>(null);
  const emisRef = useRef(0); // bieżąca siła emissive
  const opacityRef = useRef(1); // bieżąca opacity
  const emisTargetRef = useRef(0);
  const opacityTargetRef = useRef(1);
  const offsetTargetRef = useRef(0); // docelowe wysunięcie w X

  // Klon sceny z WŁASNYMI materiałami — nie mutujemy współdzielonego cache
  // GLTF (README). Zbieramy WSZYSTKIE materiały (sterowanie opacity przy
  // zanikaniu); emissive dostaje kolor akcentu + siłę 0. transparent=true od
  // razu, by animacja opacity nie wymagała needsUpdate.
  const { object, materials } = useMemo(() => {
    const object = scene.clone(true);
    const materials: THREE.Material[] = [];
    object.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh || !mesh.material) return;
      const cloneOne = (m: THREE.Material) => {
        const c = m.clone();
        c.transparent = true;
        c.opacity = 1;
        if ('emissive' in c) {
          const sm = c as THREE.MeshStandardMaterial;
          sm.emissive.set(HIGHLIGHT_COLOR);
          sm.emissiveIntensity = 0;
        }
        materials.push(c);
        return c;
      };
      mesh.material = Array.isArray(mesh.material)
        ? mesh.material.map(cloneOne)
        : cloneOne(mesh.material);
    });
    return { object, materials };
  }, [scene]);

  // Cele wg stanu. Hover-glow tylko poza trybem wyboru. Wysunięcie: wybrana
  // część jedzie w X (obudowa w przeciwną stronę). Niezaznaczone, gdy coś jest
  // wybrane → opacity 0 (i potem przestają się renderować).
  emisTargetRef.current = showExtracted ? HIGHLIGHT_SELECTED : hovered && !anySelected ? 0.22 : 0;
  opacityTargetRef.current = !anySelected || showExtracted ? 1 : 0;
  offsetTargetRef.current = extractOffsetX(part, showExtracted);

  // Płynne dochodzenie emissive + opacity + pozycji (damp, niezależne od FPS).
  useFrame((_, delta) => {
    // emissive
    const emis = THREE.MathUtils.damp(emisRef.current, emisTargetRef.current, 12, delta);
    if (Math.abs(emis - emisRef.current) >= 0.0005) {
      emisRef.current = emis;
      for (const m of materials) (m as THREE.MeshStandardMaterial).emissiveIntensity = emis;
    }

    // opacity + widoczność: renderuj póki się nie wygasi do zera (lub gdy wraca)
    const op = THREE.MathUtils.damp(opacityRef.current, opacityTargetRef.current, 7, delta);
    if (Math.abs(op - opacityRef.current) >= 0.0005) {
      opacityRef.current = op;
      for (const m of materials) m.opacity = op;
    }
    const g = groupRef.current;
    if (g) {
      // Przestań renderować dopiero po wygaśnięciu; pokaż z powrotem gdy wraca.
      g.visible = op > 0.01 || opacityTargetRef.current > 0;
      const x = THREE.MathUtils.damp(g.position.x, offsetTargetRef.current, 8, delta);
      if (Math.abs(x - g.position.x) >= 0.00002) g.position.x = x;
    }
  });

  return (
    <group
      ref={groupRef}
      onClick={(e) => {
        e.stopPropagation();
        if (e.delta > 5) return; // to był drag (obrót), nie klik
        // Brak wyboru → wybierz tę część. W trybie wyboru klik w cokolwiek poza
        // wybraną (nawet w wysunięty inny komponent) → odznacz bieżącą.
        if (!anySelected) setSelectedPart(part);
        else if (!isSelected) setSelectedPart(null);
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
            hasVariants={getVariantModels(data, part).length >= 2}
            onHover={onHover}
            onUnhover={onUnhover}
          />
        );
      })}
    </>
  );
}

// --- Rząd wariantów: modele odmian wybranej części, obok siebie wzdłuż Z. ---

function VariantInspectModel({
  model,
  z,
  y,
  focused,
}: {
  model: VariantModel;
  z: number;
  y: number;
  focused: boolean;
}) {
  const { scene } = useGLTF(modelUrl(model.file));
  const setFocusedVariant = useAppStore((s) => s.setFocusedVariant);
  const [hovered, setHovered] = useState(false);
  const emisRef = useRef(0);
  const emisTargetRef = useRef(0);

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

  emisTargetRef.current = focused ? HIGHLIGHT_SELECTED : hovered ? 0.22 : 0;
  useFrame((_, delta) => {
    const emis = THREE.MathUtils.damp(emisRef.current, emisTargetRef.current, 12, delta);
    if (Math.abs(emis - emisRef.current) < 0.0005) return;
    emisRef.current = emis;
    for (const m of materials) m.emissiveIntensity = emis;
  });

  const [px, py, pz] = model.pivot;
  const labelY = model.bounds[0][1] - py - 0.03; // tuż pod modelem

  return (
    <group
      position={[0, y, z]}
      onClick={(e) => {
        e.stopPropagation();
        if (e.delta > 5) return; // drag (obrót), nie klik
        setFocusedVariant(model.id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'default';
      }}
    >
      {/* Wycentrowanie modelu: pivot inspekcji w origin grupy (README). */}
      <group position={[-px, -py, -pz]}>
        <primitive object={object} />
      </group>
      <Html center position={[0, labelY, 0]} distanceFactor={1.2} pointerEvents="none">
        <div
          className={`whitespace-nowrap rounded-md border px-2 py-0.5 font-ui text-xs ${
            focused
              ? 'border-accent bg-accent text-bg'
              : 'border-border bg-panel/85 text-text-muted'
          }`}
        >
          {model.label}
        </div>
      </Html>
    </group>
  );
}

function VariantRow() {
  const data = useCatalog();
  const selectedPart = useAppStore((s) => s.selectedPart);
  const focusedVariant = useAppStore((s) => s.focusedVariant);
  const layout = selectedPart ? variantRowLayout(data, selectedPart) : null;
  if (!layout) return null;

  // Brak jawnego wyboru → pierwszy wariant traktujemy jako domyślnie wyróżniony.
  const focusId = focusedVariant ?? layout.models[0]?.id;

  return (
    <>
      {layout.models.map((m, i) => (
        <VariantInspectModel
          key={m.file}
          model={m}
          z={layout.positionsZ[i]}
          y={layout.y}
          focused={m.id === focusId}
        />
      ))}
    </>
  );
}

// Minimalny interfejs OrbitControls, którego potrzebuje rig.
type OrbitLike = { target: THREE.Vector3; update: () => void };

/**
 * Przelot kamery: na zmianę selectedPart animuje (GSAP) target OrbitControls
 * do środka części i podjeżdża kamerą na dystans dobrany z bounds, zachowując
 * bieżący kąt orbity. Odznaczenie → powrót do widoku całego PC.
 */
function CameraRig() {
  const data = useCatalog();
  const selectedPart = useAppStore((s) => s.selectedPart);
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const controls = useThree((s) => s.controls) as OrbitLike | null;
  const tween = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    if (!controls) return;

    let targetVec: THREE.Vector3;
    let distance: number;

    if (selectedPart) {
      const layout = variantRowLayout(data, selectedPart);
      if (layout) {
        // Część z wariantami → kadrujemy cały rząd (rozpiętość wzdłuż Z = poziom).
        targetVec = new THREE.Vector3(0, layout.y, 0);
        const vfov = THREE.MathUtils.degToRad(camera.fov);
        const aspect = camera.aspect || 1;
        const fitV = layout.maxHeight / 2 / Math.tan(vfov / 2);
        const fitH = layout.rowDepth / 2 / (Math.tan(vfov / 2) * aspect);
        distance = Math.max(fitV, fitH, 0.12) * 1.3;
      } else {
        const asset = data.assemblyByPart.get(selectedPart);
        if (!asset) return;
        // Target na WYSUNIĘTEJ pozycji części (środek + offset X).
        const [cx, cy, cz] = boundsCenter(asset);
        targetVec = new THREE.Vector3(cx + extractOffsetX(selectedPart, true), cy, cz);
        const [sx, sy, sz] = boundsSize(asset);
        const radius = 0.5 * Math.max(sx, sy, sz, 0.02);
        const fov = THREE.MathUtils.degToRad(camera.fov);
        distance = Math.max((radius / Math.sin(fov / 2)) * 1.6, 0.12);
      }
    } else {
      targetVec = new THREE.Vector3(...SCENE_TARGET);
      distance = DEFAULT_VIEW_DISTANCE;
    }

    // Pozycja docelowa kamery — zawsze wyrównana do SELECT_EULER (tak samo przy
    // wyborze i przy wycofaniu zaznaczenia). Kierunek = lokalne -Z obrócone
    // Eulerem; kamerę stawiamy po przeciwnej stronie targetu, OrbitControls
    // (lookAt + up=+Y) odtwarza ten sam kąt.
    const forward = new THREE.Vector3(0, 0, -1).applyEuler(SELECT_EULER);
    const camDest = targetVec.clone().addScaledVector(forward, -distance);

    tween.current?.kill();
    const s = {
      cx: camera.position.x,
      cy: camera.position.y,
      cz: camera.position.z,
      tx: controls.target.x,
      ty: controls.target.y,
      tz: controls.target.z,
    };
    tween.current = gsap.to(s, {
      cx: camDest.x,
      cy: camDest.y,
      cz: camDest.z,
      tx: targetVec.x,
      ty: targetVec.y,
      tz: targetVec.z,
      duration: 0.9,
      ease: 'power3.out',
      onUpdate: () => {
        camera.position.set(s.cx, s.cy, s.cz);
        controls.target.set(s.tx, s.ty, s.tz);
        controls.update();
      },
    });

    return () => {
      tween.current?.kill();
    };
  }, [selectedPart, data, camera, controls]);

  return null;
}

export default function ExploreScene() {
  const setSelectedPart = useAppStore((s) => s.setSelectedPart);
  // Pozycja wciśnięcia LPM — do odróżnienia KLIKU od DRAG-a (obrotu).
  const downPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      downPos.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('pointerdown', onDown);
    return () => window.removeEventListener('pointerdown', onDown);
  }, []);

  return (
    <Canvas
      camera={{ position: [0.55, 0.45, 0.75], fov: 45, near: 0.01 }}
      dpr={[1, 2]}
      // Odznaczenie tylko na KLIK poza modelem — nie po puszczeniu drag-a
      // (obrót kończący się poza sprzętem nie ma odznaczać).
      onPointerMissed={(e) => {
        const d = downPos.current;
        const moved = d ? Math.hypot(e.clientX - d.x, e.clientY - d.y) : 0;
        if (moved < 6) setSelectedPart(null);
      }}
    >
      {/* Oświetlenie (offline, bez HDRI). Materiały PBR bez env-mapy są ciemne,
          więc świecimy z kilku stron. Ciepły fill = motyw „lampa". */}
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 5, 2]} intensity={2.6} />
      <directionalLight position={[-3, 2, -2]} intensity={1.0} color="#FFD9A0" />
      <directionalLight position={[1, 1, 4]} intensity={1.2} />

      <Suspense fallback={<LoadingScreen />}>
        <AssembledPC />
        <CameraRig />
        {/* Rząd wariantów ładuje się leniwie — własny Suspense, by nie migać sceną. */}
        <Suspense fallback={null}>
          <VariantRow />
        </Suspense>
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
        minDistance={0.1}
        maxDistance={2.5}
        // 135° = poziom (90°) + 45° z dołu. Góra bez ograniczeń.
        maxPolarAngle={(3 * Math.PI) / 4}
      />
    </Canvas>
  );
}
