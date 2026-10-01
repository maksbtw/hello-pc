import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF, Html } from '@react-three/drei';

/**
 * Start sceny 3D (Max). Działający <Canvas> z OrbitControls, oświetleniem
 * i placeholder-bryłą. ModelLoader ładuje .glb przez useGLTF + <Suspense>.
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
    <Canvas camera={{ position: [3, 2, 3], fov: 50 }}>
      <Environment preset="city" />
      <directionalLight position={[5, 5, 5]} intensity={1.2} />
      <Suspense fallback={<LoadingScreen />}>
        {modelUrl ? <ModelLoader url={modelUrl} /> : <PlaceholderMesh />}
      </Suspense>
      <OrbitControls />
    </Canvas>
  );
}
