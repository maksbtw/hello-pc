import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html, ContactShadows } from '@react-three/drei';
import { useGLTF } from '@react-three/drei';
import { ASSEMBLY_PARTS, modelUrl, useCatalog } from './catalog';

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

function AssemblyPart({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

function AssembledPC() {
  const data = useCatalog();
  return (
    <>
      {ASSEMBLY_PARTS.map((part) => {
        const asset = data.assemblyByPart.get(part);
        if (!asset) return null;
        return <AssemblyPart key={part} url={modelUrl(asset.file)} />;
      })}
    </>
  );
}

export default function ExploreScene() {
  return (
    <Canvas camera={{ position: [0.55, 0.45, 0.75], fov: 45 }} dpr={[1, 2]}>
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
