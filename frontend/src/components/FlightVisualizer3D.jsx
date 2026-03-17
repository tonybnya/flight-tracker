import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';

// ─── Coordinate Util ─────────────────────────────────────────────────────────
const latLon2Vec = (lat, lng, r) => {
  const phi   = (90 - lat)  * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
     r * Math.cos(phi),
     r * Math.sin(phi) * Math.sin(theta)
  );
};

const R = 5;

// ─── Procedural City Lights Texture ─────────────────────────────────────────
const buildNightTexture = () => {
  const w = 2048, h = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, w, h);

  const cities = [
    [-74, 40.7, 18, 0.9], [-73, 42, 10, 0.7], [-77, 38.9, 14, 0.8],
    [-87, 41.8, 15, 0.85], [-118, 34, 18, 0.85], [-122, 37.7, 14, 0.8],
    [-0.1, 51.5, 16, 0.95], [2.35, 48.85, 15, 0.9],
    [13.4, 52.5, 14, 0.85], [12.5, 41.9, 13, 0.85],
    [4.9, 52.4, 12, 0.8],  [28.9, 41.0, 12, 0.8],
    [37.6, 55.75, 14, 0.85], [30.5, 50.4, 10, 0.75],
    [139.7, 35.7, 22, 0.98], [121.5, 31.2, 18, 0.9],
    [116.4, 39.9, 18, 0.9],  [126.9, 37.5, 14, 0.85],
    [103.8, 1.35, 12, 0.85], [114.2, 22.3, 14, 0.85],
    [72.8, 19, 14, 0.85],    [77.2, 28.6, 12, 0.8],
    [88.4, 22.6, 12, 0.8],   [55.3, 25.2, 12, 0.8],
    [31.2, 30, 12, 0.8],     [-46.6, -23.5, 14, 0.85],
    [151.2, -33.9, 10, 0.75], [18.4, -33.9, 8, 0.7],
  ];

  cities.forEach(([lng, lat, radius, alpha]) => {
    const x = ((lng + 180) / 360) * w;
    const y = ((90 - lat) / 180) * h;
    const g = ctx.createRadialGradient(x, y, 0, x, y, radius * 2.5);
    g.addColorStop(0,   `rgba(255, 220, 120, ${alpha * 0.9})`);
    g.addColorStop(0.4, `rgba(255, 180,  60, ${alpha * 0.3})`);
    g.addColorStop(1,   'rgba(255, 100,   0, 0)');
    ctx.beginPath(); ctx.arc(x, y, radius * 2.5, 0, Math.PI * 2);
    ctx.fillStyle = g; ctx.fill();
  });

  return new THREE.CanvasTexture(canvas);
};

// ─── Plane Icon (fuselage + wings + tail) ───────────────────────────────────
const PlaneIcon = () => (
  <group>
    {/* Fuselage */}
    <mesh>
      <cylinderGeometry args={[0.025, 0.04, 0.35, 8]} />
      <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
    </mesh>
    {/* Wings */}
    <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0, 0]}>
      <boxGeometry args={[0.28, 0.025, 0.06]} />
      <meshStandardMaterial color="#ffffff" emissive="#e0e7ff" emissiveIntensity={0.4} />
    </mesh>
    {/* Tail fin */}
    <mesh position={[0, -0.14, 0]} rotation={[0, 0, Math.PI / 2]}>
      <boxGeometry args={[0.12, 0.02, 0.05]} />
      <meshStandardMaterial color="#ffffff" emissive="#e0e7ff" emissiveIntensity={0.4} />
    </mesh>
    {/* Glow */}
    <pointLight intensity={3} distance={1.5} color="#60a5fa" />
  </group>
);

const Scene = ({ origin, destination }) => {
  const planeRef = useRef();

  // load local day texture (served from /public/textures/)
  const dayTex  = useLoader(THREE.TextureLoader, '/textures/earth-day.jpg');
  // emissive city lights overlay
  const nightTex = useMemo(() => buildNightTexture(), []);

  const startPos = useMemo(
    () => latLon2Vec(parseFloat(origin.latitude), parseFloat(origin.longitude), R),
    [origin]
  );
  const endPos = useMemo(
    () => latLon2Vec(parseFloat(destination.latitude), parseFloat(destination.longitude), R),
    [destination]
  );

  const { curve, arcPoints } = useMemo(() => {
    const mid = new THREE.Vector3().addVectors(startPos, endPos).multiplyScalar(0.5);
    const dist = startPos.distanceTo(endPos);
    mid.normalize().multiplyScalar(R + Math.max(dist * 0.38, 1.4));
    const c = new THREE.QuadraticBezierCurve3(startPos, mid, endPos);
    return { curve: c, arcPoints: c.getPoints(120) };
  }, [startPos, endPos]);

  const arcGeo = useMemo(
    () => new THREE.BufferGeometry().setFromPoints(arcPoints),
    [arcPoints]
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    // Plane animates along arc, no globe rotation
    if (planeRef.current) {
      const p   = (t * 0.1) % 1;
      const pos = curve.getPoint(p);
      planeRef.current.position.copy(pos);
      const next = curve.getPoint((p + 0.02) % 1);
      // Point plane along direction of travel
      const dir = next.clone().sub(pos).normalize();
      const up  = pos.clone().normalize(); // radial "up"
      const right = new THREE.Vector3().crossVectors(dir, up).normalize();
      const correctedDir = new THREE.Vector3().crossVectors(up, right).normalize();
      const m = new THREE.Matrix4().makeBasis(right, up, correctedDir.negate());
      planeRef.current.setRotationFromMatrix(m);
    }
  });

  return (
    <group>
      {/* Earth with day texture and city lights overlay */}
      <mesh>
        <sphereGeometry args={[R, 72, 72]} />
        <meshStandardMaterial
          map={dayTex}
          emissiveMap={nightTex}
          emissive={new THREE.Color('#ffffff')}
          emissiveIntensity={0.25}
          roughness={0.9}
          metalness={0.0}
        />
      </mesh>

      {/* Atmosphere rim */}
      <mesh>
        <sphereGeometry args={[R * 1.04, 48, 48]} />
        <meshBasicMaterial
          color={new THREE.Color('#1e3a8a')}
          side={THREE.BackSide}
          transparent opacity={0.3}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[R * 1.10, 48, 48]} />
        <meshBasicMaterial
          color={new THREE.Color('#1d4ed8')}
          side={THREE.BackSide}
          transparent opacity={0.09}
        />
      </mesh>

      {/* Flight arc — red */}
      <line geometry={arcGeo} renderOrder={1}>
        <lineBasicMaterial color="#ef4444" />
      </line>

      {/* Origin marker — blue */}
      <mesh position={startPos}>
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshBasicMaterial color="#3b82f6" />
      </mesh>

      {/* Destination marker — red */}
      <mesh position={endPos}>
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>

      {/* Animated plane */}
      <group ref={planeRef}>
        <PlaneIcon />
      </group>
    </group>
  );
};

// ─── Error Boundary ───────────────────────────────────────────────────────────
class ErrBound extends React.Component {
  constructor(p) { super(p); this.state = { err: null }; }
  static getDerivedStateFromError(e) { return { err: e }; }
  componentDidCatch(e) { console.error('[3D]', e); }
  render() {
    if (this.state.err) return (
      <div style={{ display:'flex', height:'100%', alignItems:'center',
        justifyContent:'center', textAlign:'center', padding:'2rem' }}>
        <p style={{ color:'#f87171', fontWeight:700 }}>
          3D render error: {String(this.state.err?.message)}
        </p>
      </div>
    );
    return this.props.children;
  }
}

// ─── Main Export — plain React, NO R3F hooks ─────────────────────────────────
const FlightVisualizer3D = ({ origin, destination }) => {
  if (!origin?.latitude || !destination?.latitude) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
        height:'100%', minHeight:500, background:'#020617', borderRadius:24,
        color:'#64748b', fontSize:13, fontFamily:'system-ui' }}>
        No coordinate data available.
      </div>
    );
  }

  return (
    <div style={{
      width:'100%', height:'100%', minHeight:500,
      background:'#000408', borderRadius:20, overflow:'hidden',
      position:'relative', border:'2px solid #0f172a',
      boxShadow:'0 25px 60px rgba(0,0,0,0.9)',
    }}>
      {/* HUD */}
      <div style={{ position:'absolute', top:16, left:16, zIndex:10,
        pointerEvents:'none', fontFamily:'system-ui, sans-serif' }}>
        <div style={{
          background:'rgba(2,6,23,0.85)', backdropFilter:'blur(12px)',
          border:'1px solid rgba(59,130,246,0.3)', borderRadius:12,
          padding:'10px 14px',
        }}>
          <p style={{ color:'#fff', fontWeight:900, fontSize:11,
            textTransform:'uppercase', letterSpacing:'0.12em', margin:0 }}>
            Flight Path
          </p>
          <p style={{ color:'#60a5fa', fontSize:10, fontWeight:700,
            textTransform:'uppercase', letterSpacing:'0.1em', margin:'4px 0 0',
            display:'flex', alignItems:'center', gap:6 }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'#3b82f6', display:'inline-block' }} />
            {origin.code}
            <span style={{ color:'#ef4444' }}>→</span>
            <span style={{ color:'#ef4444' }}>{destination.code}</span>
          </p>
        </div>
      </div>

      {/* Hint */}
      <div style={{ position:'absolute', top:16, right:16, zIndex:10, pointerEvents:'none', fontFamily:'system-ui' }}>
        <span style={{
          background:'rgba(2,6,23,0.6)', border:'1px solid rgba(255,255,255,0.05)',
          borderRadius:9999, padding:'4px 10px', color:'rgba(255,255,255,0.3)',
          fontSize:8, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.2em',
        }}>Drag · Scroll</span>
      </div>

      {/* Canvas */}
      <ErrBound>
        <React.Suspense fallback={
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
            height:'100%', background:'#000408' }}>
            <div>
              <div style={{ width:36, height:36, border:'2px solid #3b82f6',
                borderTopColor:'transparent', borderRadius:'50%',
                animation:'spin 1s linear infinite', margin:'0 auto 10px' }} />
              <p style={{ color:'rgba(255,255,255,0.3)', fontSize:9, fontWeight:700,
                textTransform:'uppercase', letterSpacing:'0.3em', textAlign:'center' }}>
                Loading Earth...
              </p>
            </div>
          </div>
        }>
          <Canvas camera={{ position:[0, 3, 14], fov:45 }}>
            <Stars radius={300} depth={80} count={7000} factor={6} saturation={0} fade speed={0.3} />
            <ambientLight intensity={1.2} />
            <pointLight position={[20, 10, 20]} intensity={2.5} />
            <pointLight position={[-15, -5, 10]} intensity={1.0} color="#a0c0ff" />
            <pointLight position={[0, -20, -10]} intensity={0.5} color="#1d4ed8" />
            <Scene origin={origin} destination={destination} />
            <OrbitControls enableDamping dampingFactor={0.07} rotateSpeed={0.45}
              minDistance={7} maxDistance={24} enablePan={false} />
          </Canvas>
        </React.Suspense>
      </ErrBound>

      {/* Legend */}
      <div style={{
        position:'absolute', bottom:14, left:'50%', transform:'translateX(-50%)',
        zIndex:10, pointerEvents:'none', display:'flex', alignItems:'center',
        gap:12, fontFamily:'system-ui',
        background:'rgba(2,6,23,0.75)', backdropFilter:'blur(8px)',
        border:'1px solid rgba(255,255,255,0.07)', borderRadius:9999, padding:'6px 18px',
      }}>
        <span style={{ display:'flex', gap:6, alignItems:'center', color:'#60a5fa',
          fontSize:10, fontWeight:900, textTransform:'uppercase', letterSpacing:'0.12em' }}>
          <span style={{ width:9, height:9, borderRadius:'50%', background:'#3b82f6', display:'inline-block' }} />
          {origin.code}&nbsp;·&nbsp;{origin.city}
        </span>
        <span style={{ color:'#334155', fontSize:12 }}>──</span>
        <span style={{ display:'flex', gap:6, alignItems:'center', color:'#f87171',
          fontSize:10, fontWeight:900, textTransform:'uppercase', letterSpacing:'0.12em' }}>
          <span style={{ width:9, height:9, borderRadius:'50%', background:'#ef4444', display:'inline-block' }} />
          {destination.code}&nbsp;·&nbsp;{destination.city}
        </span>
      </div>
    </div>
  );
};

export default FlightVisualizer3D;
