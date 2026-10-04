import { Suspense, useEffect, useMemo } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Pojedynczy obracalny viewer modelu (.glb).
 * Każdy model jest wyśrodkowany do własnego środka geometrii (pivot w origin)
 * i znormalizowany do wspólnego rozmiaru → obrót leci wokół środka modelu,
 * a kadr jest identyczny dla każdego kroku. Tylko obracanie (bez zoomu/pana).
 */

// Do jakiego maks. wymiaru skalujemy każdy model (jednostki sceny).
const TARGET_SIZE = 2.1;
// Stała pozycja kamery (widok 3/4 od przodu-góry).
const CAM: [number, number, number] = [2, 1.4, 2.4];

function LoadingScreen() {
  return (
    <Html center>
      <div className="font-mono text-sm text-text-muted">Ładowanie modelu…</div>
    </Html>
  );
}

function PlaceholderMesh() {
  return (
    <mesh rotation={[0.4, 0.8, 0]}>
      <boxGeometry args={[1.2, 1.2, 1.2]} />
      <meshStandardMaterial color="#F5A524" metalness={0.3} roughness={0.4} />
    </mesh>
  );
}

/** Wczytuje model, wyśrodkowuje go do origin i normalizuje rozmiar. */
function CenteredModel({ url, rotation }: { url: string; rotation: [number, number, number] }) {
  const { scene } = useGLTF(url);

  const obj = useMemo(() => {
    const clone = scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const s = TARGET_SIZE / maxDim;
    // Po przeskalowaniu środek bbox ląduje dokładnie w (0,0,0).
    clone.scale.setScalar(s);
    clone.position.set(-center.x * s, -center.y * s, -center.z * s);
    return clone;
  }, [scene]);

  // rotation na grupie zewnętrznej → obrót wokół origin = środka modelu.
  return (
    <group rotation={rotation}>
      <primitive object={obj} />
    </group>
  );
}

/** Widok domyślny: pozycja kamery + punkt patrzenia (target). */
export type View = { camera: [number, number, number]; target: [number, number, number] };

/** Przy zmianie modelu ustawia kamerę i target na widok domyślny danego modelu. */
function ViewReset({ dep, view }: { dep: string; view?: View }) {
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls) as
    | { target: THREE.Vector3; update: () => void }
    | null;
  useEffect(() => {
    const cam = view?.camera ?? CAM;
    const tgt = view?.target ?? [0, 0, 0];
    camera.position.set(cam[0], cam[1], cam[2]);
    camera.updateProjectionMatrix();
    if (controls) {
      controls.target.set(tgt[0], tgt[1], tgt[2]);
      controls.update();
    }
  }, [dep, camera, controls, view]);
  return null;
}

/** Debug: wystawia window.pcView() → bieżąca pozycja kamery + target + model. */
function DebugView({ modelUrl }: { modelUrl: string }) {
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls) as { target: THREE.Vector3 } | null;
  useEffect(() => {
    const r = (v: number) => Math.round(v * 1000) / 1000;
    const fn = () => {
      const c = camera.position;
      const t = controls?.target ?? new THREE.Vector3();
      const out = {
        model: modelUrl,
        camera: [r(c.x), r(c.y), r(c.z)] as [number, number, number],
        target: [r(t.x), r(t.y), r(t.z)] as [number, number, number],
      };
      // Czytelny wydruk + zwrot obiektu (możesz zrobić copy(pcView())).
      console.log('[pcView]', JSON.stringify(out));
      return out;
    };
    (window as unknown as { pcView: () => unknown }).pcView = fn;
    return () => {
      delete (window as unknown as { pcView?: unknown }).pcView;
    };
  }, [camera, controls, modelUrl]);
  return null;
}

export interface SceneProps {
  /** Ścieżka do .glb w public/models/. Brak → placeholder-bryła. */
  modelUrl?: string;
  /** Domyślna orientacja modelu (radiany) — opcjonalna korekta osi modelu. */
  rotation?: [number, number, number];
  /** Domyślny widok (pozycja kamery + target) dla tego modelu. */
  view?: View;
}

export default function Scene({ modelUrl, rotation = [0, 0, 0], view }: SceneProps) {
  return (
    <Canvas camera={{ position: view?.camera ?? CAM, fov: 45, near: 0.01 }} dpr={[1, 2]}>
      {/* Oświetlenie offline (materiały PBR bez env-mapy są ciemne). */}
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 5, 2]} intensity={2.4} />
      <directionalLight position={[-3, 2, -2]} intensity={1.0} color="#FFD9A0" />
      <directionalLight position={[1, 1, 4]} intensity={1.1} />

      <Suspense fallback={<LoadingScreen />}>
        {modelUrl ? (
          <CenteredModel key={modelUrl} url={modelUrl} rotation={rotation} />
        ) : (
          <group rotation={rotation}>
            <PlaceholderMesh />
          </group>
        )}
      </Suspense>

      <ViewReset dep={modelUrl ?? 'placeholder'} view={view} />
      <DebugView modelUrl={modelUrl ?? 'placeholder'} />

      {/* Tylko obracanie — bez zoomu i przesuwania. */}
      <OrbitControls makeDefault enableZoom={false} enablePan={false} target={view?.target ?? [0, 0, 0]} />
    </Canvas>
  );
}
