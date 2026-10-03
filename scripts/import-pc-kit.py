"""Copy the supplied PC kit without changing its assembly coordinate system.

python3 scripts/import-pc-kit.py /path/to/pc-kit
Only the PC_Case node name is adapted to the application's Case identifier.
"""
import json
import shutil
import struct
import sys
from pathlib import Path

PROJECT = Path(__file__).resolve().parents[1]
OUT = PROJECT / 'frontend/public/models'
source = Path(sys.argv[1]).expanduser().resolve()
names = ['pc-case', 'motherboard', 'gpu', 'cpu', 'ram', 'ssd', 'psu', 'cooler', 'pc-assembly']
OUT.mkdir(parents=True, exist_ok=True)
for name in names:
    path = source / (name + '.glb')
    raw = path.read_bytes()
    if name in ('pc-case', 'pc-assembly'):
        length, kind = struct.unpack_from('<II', raw, 12)
        assert kind == 0x4E4F534A
        document = json.loads(raw[20:20+length])
        for node in document['nodes']:
            if node.get('name') == 'PC_Case':
                node['name'] = 'Case'
        payload = json.dumps(document, separators=(',', ':')).encode()
        payload += b' ' * (-len(payload) % 4)
        tail = raw[20+length:]
        raw = struct.pack('<III', 0x46546C67, 2, 20+len(payload)+len(tail))
        raw += struct.pack('<II', len(payload), kind) + payload + tail
    (OUT / path.name).write_bytes(raw)
manifest = json.loads((source / 'asset-manifest.json').read_text())
manifest['assets']['pc-case']['root'] = 'Case'
for entry in manifest['assets'].values():
    entry['partId'] = entry['root']
    entry['usage'] = 'assembly'
(OUT / 'assembly-manifest.json').write_text(json.dumps(manifest, indent=2)+'\n')
native = PROJECT / 'assets/blender'
native.mkdir(parents=True, exist_ok=True)
shutil.copy2(source/'pc-master.blend', native/'pc-original.blend')
shutil.copy2(source/'README.md', native/'original-kit-README.md')
print('Imported 8 assembly parts, combined assembly, manifest and original Blender source.')
