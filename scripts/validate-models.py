"""Validate offline GLB data, identities, geometry and declared model coverage.

No third-party modules required. Run: python3 scripts/validate-models.py
"""
import json
import math
import struct
from pathlib import Path

PROJECT = Path(__file__).resolve().parents[1]
MODELS = PROJECT / 'frontend/public/models'
COMPONENTS = {5120:('b',1),5121:('B',1),5122:('h',2),5123:('H',2),5125:('I',4),5126:('f',4)}
WIDTH = {'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4,'MAT4':16}


def read_glb(path):
    raw=path.read_bytes()
    magic,version,length=struct.unpack_from('<III',raw)
    assert magic==0x46546C67 and version==2 and length==len(raw), path
    chunks=[]
    offset=12
    while offset<len(raw):
        size,kind=struct.unpack_from('<II',raw,offset)
        assert size%4==0 and offset+8+size<=len(raw), path
        chunks.append((kind,raw[offset+8:offset+8+size]))
        offset+=8+size
    assert chunks[0][0]==0x4E4F534A and chunks[1][0]==0x004E4942
    return json.loads(chunks[0][1]),chunks[1][1]


def values(document,binary,index):
    accessor=document['accessors'][index]
    view=document['bufferViews'][accessor['bufferView']]
    code,size=COMPONENTS[accessor['componentType']]
    width=WIDTH[accessor['type']]
    stride=view.get('byteStride',size*width)
    relative=accessor.get('byteOffset',0)
    end=relative+(accessor['count']-1)*stride+size*width
    assert accessor['count']>0 and end<=view['byteLength']
    start=view.get('byteOffset',0)+relative
    return [struct.unpack_from('<'+code*width,binary,start+i*stride) for i in range(accessor['count'])]


def validate(path,expected=None):
    doc,binary=read_glb(path)
    assert len(doc['buffers'])==1
    assert doc['buffers'][0]['byteLength']<=len(binary)
    assert all('uri' not in b for b in doc.get('buffers',[])), 'External buffer'
    assert all('uri' not in i for i in doc.get('images',[])), 'External image'
    assert not doc.get('images'), 'Models should be texture-free'
    assert not doc.get('cameras') and not doc.get('animations')
    assert not doc.get('extensionsRequired'), 'Unexpected decoder requirement'
    for view in doc['bufferViews']:
        assert view.get('buffer',0)==0
        assert view.get('byteOffset',0)+view['byteLength']<=doc['buffers'][0]['byteLength']
    roots=doc['scenes'][doc.get('scene',0)]['nodes']
    root_names=[doc['nodes'][i].get('name') for i in roots]
    for index in roots:
        node=doc['nodes'][index]
        assert node.get('translation',[0,0,0])==[0,0,0]
        assert node.get('rotation',[0,0,0,1])==[0,0,0,1]
        assert node.get('scale',[1,1,1])==[1,1,1]
    if expected:
        assert root_names==[expected['root']], (path,root_names,expected['root'])
    tris,draws=0,0
    for mesh in doc['meshes']:
        for primitive in mesh['primitives']:
            assert primitive.get('mode',4)==4
            positions=values(doc,binary,primitive['attributes']['POSITION'])
            assert all(all(math.isfinite(x) for x in p) for p in positions)
            normals=values(doc,binary,primitive['attributes']['NORMAL'])
            assert len(normals)==len(positions)
            assert all(.8<sum(x*x for x in n)<1.2 for n in normals), (path,'invalid normals')
            indices=[x[0] for x in values(doc,binary,primitive['indices'])]
            assert len(indices)%3==0 and min(indices)>=0 and max(indices)<len(positions)
            tris+=len(indices)//3
            draws+=1
    if expected:
        assert tris==expected['triangles'], (path,tris,expected['triangles'])
        assert draws==expected['draw_calls']
        assert all(expected['bounds_gltf'][1][i]>expected['bounds_gltf'][0][i] for i in range(3))
        assert tris<30000, (path,'Per-part polygon budget exceeded')
    return dict(file=path.name,bytes=path.stat().st_size,roots=root_names,triangles=tris,draw_calls=draws)


if __name__=='__main__':
    entries={}
    for name in ('assembly-manifest.json','supplementary-manifest.json'):
        manifest=json.loads((MODELS/name).read_text())
        entries.update({v['file']:v for v in manifest['assets'].values()})
    results=[validate(path,entries.get(path.name)) for path in sorted(MODELS.glob('*.glb'))]
    catalog=json.loads((MODELS/'catalog.json').read_text())
    for part in catalog['parts'].values():
        for variant in part['variants']:
            assert variant['model'] in entries, variant
            assert entries[variant['model']]['partId']==part['partId'], variant
    assert {p['file'] for p in results}==set(entries)|{'pc-assembly.glb'}
    report=dict(status='passed',files=len(results),assets=results,
                total_bytes=sum(r['bytes'] for r in results),
                note='Combined pc-assembly.glb duplicates the eight component files; load one representation only.')
    (PROJECT/'assets/model-validation.json').write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps({k:v for k,v in report.items() if k!='assets'},indent=2))
