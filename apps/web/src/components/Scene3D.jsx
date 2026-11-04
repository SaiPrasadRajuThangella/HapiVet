// Hero 3D scene: the puppy mascot with medicines orbiting it, styled after the matte pebbles in the
// UI reference. Lit by local Lightformers so no HDR file is downloaded.
import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Environment, Float, Lightformer, RoundedBox } from '@react-three/drei';
import Puppy from './Puppy';

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const ORBIT_RADIUS = 2.55;
// Tipped so the near side of the orbit passes the chest, never in front of the face.
const ORBIT_TILT = 0.3;

function Agent({ offset, speed = 0.22, children }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = reduced() ? offset : clock.elapsedTime * speed + offset;
    const depth = Math.sin(t) * ORBIT_RADIUS;
    ref.current.position.set(Math.cos(t) * ORBIT_RADIUS, -depth * Math.sin(ORBIT_TILT), depth * Math.cos(ORBIT_TILT));
    ref.current.rotation.y = t * 1.4;
    ref.current.rotation.x = t * 0.6;
  });
  return <group ref={ref}>{children}</group>;
}

function Rig({ mouse, children }) {
  const ref = useRef();
  useFrame((_, dt) => {
    if (!ref.current) return;
    const k = Math.min(1, dt * 2.5);
    ref.current.rotation.y += (mouse.current.x * 0.12 - ref.current.rotation.y) * k;
    ref.current.rotation.x += (-mouse.current.y * 0.1 - ref.current.rotation.x) * k;
  });
  return <group ref={ref}>{children}</group>;
}

export default function Scene3D() {
  const host = useRef(null);
  const mouse = useRef({ x: 0, y: 0 });
  const [visible, setVisible] = useState(true);
  const [still] = useState(reduced);

  // Stop rendering once the hero scrolls out of view.
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    io.observe(host.current);
    return () => io.disconnect();
  }, []);

  // Tracks the cursor across the whole page, measured from the middle of the stage.
  useEffect(() => {
    if (still) return;
    const clamp = (v) => Math.max(-1, Math.min(1, v));
    const onMove = (e) => {
      const r = host.current.getBoundingClientRect();
      mouse.current.x = clamp((e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2));
      mouse.current.y = clamp((r.top + r.height / 2 - e.clientY) / (window.innerHeight / 2));
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [still]);

  return (
    // Canvas bleeds past the column and fades out at the bottom so nothing shows a hard edge.
    <div
      ref={host}
      role="img"
      aria-label="3D illustration of a friendly puppy wearing a stethoscope, with medicines orbiting it"
      style={{
        position: 'absolute',
        inset: '-6% -12%',
        zIndex: 1,
        pointerEvents: 'none',
        maskImage: 'linear-gradient(to bottom, #000 80%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, #000 80%, transparent 100%)',
      }}
    >
      <Canvas
        camera={{ position: [0, 0.5, 9.2], fov: 42 }}
        dpr={[1, window.innerWidth < 768 ? 1.25 : 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        frameloop={visible ? 'always' : 'never'}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[3, 6, 6]} intensity={1.7} />
        <Environment resolution={64}>
          <Lightformer form="circle" intensity={2.2} position={[0, 5, 3]} scale={8} />
          <Lightformer intensity={1.2} position={[-5, 0, 2]} scale={[4, 8, 1]} color="#cfe3ea" />
          <Lightformer intensity={0.9} position={[5, -1, 2]} scale={[4, 8, 1]} color="#8dbccb" />
        </Environment>

        <Rig mouse={mouse}>
          <Float speed={still ? 0 : 1.4} rotationIntensity={0.1} floatIntensity={0.6}>
            <group scale={1.15}>
              <Puppy mouse={mouse} still={still} />
            </group>
          </Float>

          <mesh rotation={[Math.PI / 2 + ORBIT_TILT, 0, 0]}>
            <torusGeometry args={[ORBIT_RADIUS, 0.008, 12, 160]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.65} />
          </mesh>

          <Agent offset={0}>
            <mesh>
              <sphereGeometry args={[0.36, 48, 48]} />
              <meshStandardMaterial color="#f5f4ef" roughness={0.35} />
            </mesh>
          </Agent>
          <Agent offset={Math.PI / 2}>
            <RoundedBox args={[0.58, 0.58, 0.58]} radius={0.15} smoothness={5}>
              <meshStandardMaterial color="#14283b" roughness={0.3} metalness={0.2} />
            </RoundedBox>
          </Agent>
          <Agent offset={Math.PI}>
            <mesh>
              <capsuleGeometry args={[0.2, 0.42, 12, 32]} />
              <meshStandardMaterial color="#c9d0d4" roughness={0.45} />
            </mesh>
          </Agent>
          <Agent offset={(3 * Math.PI) / 2}>
            <mesh>
              <torusGeometry args={[0.27, 0.12, 24, 64]} />
              <meshStandardMaterial color="#cfe3ea" roughness={0.25} metalness={0.1} />
            </mesh>
          </Agent>
        </Rig>

        <ContactShadows position={[0, -2.45, 0]} opacity={0.26} scale={9} blur={2.6} far={4} resolution={256} color="#14283b" />
      </Canvas>
    </div>
  );
}
