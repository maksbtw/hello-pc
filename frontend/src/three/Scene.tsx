import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Bounds, useGLTF, Html } from '@react-three/drei';

/**
 * Pojedynczy obracalny viewer modelu (.glb). Auto-dopasowanie kadru (Bounds),
 * oświetlenie offline (bez HDRI z CDN), tylko obracanie (bez zoomu/pana).
 */

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

function ModelLoader({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

export interface SceneProps {
  /** Ścieżka do .glb w public/models/. Brak → placeholder-bryła. */
  modelUrl?: string;
}

export default function Scene({ modelUrl }: SceneProps) {
  return (
    <Canvas camera={{ position: [2, 1.4, 2.4], fov: 45, near: 0.01 }} dpr={[1, 2]}>
      {/* Oświetlenie offline (materiały PBR bez env-mapy są ciemne). */}
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 5, 2]} intensity={2.4} />
      <directionalLight position={[-3, 2, -2]} intensity={1.0} color="#FFD9A0" />
      <directionalLight position={[1, 1, 4]} intensity={1.1} />

      <Suspense fallback={<LoadingScreen />}>
        {/* Bounds dopasowuje kamerę do rozmiaru modelu (observe → re-fit po zmianie). */}
        <Bounds key={modelUrl} fit clip observe margin={1.15}>
          {modelUrl ? <ModelLoader url={modelUrl} /> : <PlaceholderMesh />}
        </Bounds>
      </Suspense>

      {/* Tylko obracanie — bez zoomu i przesuwania. */}
      <OrbitControls makeDefault enableZoom={false} enablePan={false} />
    </Canvas>
  );
}
