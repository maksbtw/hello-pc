# Modele 3D (.glb)

Konwencja dla plików modeli komputera.

- **Jeden plik `.glb` na część.**
- Nazwy node'ów (głównych mesh/grup) muszą odpowiadać częściom:

  `Case`, `Motherboard`, `CPU`, `Cooler`, `RAM`, `GPU`, `SSD`, `PSU`, `Mouse`, `Monitor`

- Pliki trzymamy w tym katalogu (`public/models/`). Są ładowane przez
  `useGLTF('/models/<nazwa>.glb')` w `src/three/Scene.tsx`.
- Dopóki pliku nie ma, scena pokazuje placeholder-bryłę.
- `.glb` są binarne — patrz `.gitattributes` w roocie.
