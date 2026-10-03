// Load exported assets with the same Three.js GLTFLoader as the app.
// Run from the repo root: node frontend/scripts/validate-models.mjs
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { Box3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const directory = new URL('../public/models/', import.meta.url);
const loader = new GLTFLoader();
const entries = [];
for (const name of ['assembly-manifest.json', 'supplementary-manifest.json']) {
  const document = JSON.parse(await readFile(new URL(name, directory), 'utf8'));
  entries.push(...Object.values(document.assets));
}
for (const entry of entries) {
  const bytes = await readFile(new URL(entry.file, directory));
  const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
  const gltf = await new Promise((resolve, reject) => loader.parse(buffer, '', resolve, reject));
  const root = gltf.scene.getObjectByName(entry.root);
  assert(root, `${entry.file}: expected ${entry.root}`);
  gltf.scene.updateMatrixWorld(true);
  const bounds = new Box3().setFromObject(root, true);
  for (const [actual, expected] of [[bounds.min.toArray(), entry.bounds_gltf[0]], [bounds.max.toArray(), entry.bounds_gltf[1]]]) {
    expected.forEach((value, index) => assert(Math.abs(value - actual[index]) < 0.00001,
      `${entry.file}: incorrect world bounds at axis ${index}`));
  }
  let triangles = 0;
  let meshes = 0;
  root.traverse((object) => {
    if (!object.isMesh) return;
    triangles += (object.geometry.index?.count ?? object.geometry.attributes.position.count) / 3;
    meshes += 1;
    object.geometry.dispose();
    for (const material of Array.isArray(object.material) ? object.material : [object.material]) material.dispose();
  });
  assert.equal(triangles, entry.triangles, entry.file);
  assert.equal(meshes, entry.draw_calls, entry.file);
}
console.log(`Three.js loaded ${entries.length} component GLBs; roots, geometry and world bounds match manifests.`);
console.log(`Assets: ${fileURLToPath(directory)}`);
