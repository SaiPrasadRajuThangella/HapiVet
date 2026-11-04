// Hero 3D scene: a soft "unified brain" orb with four orbiting agents, styled after the matte
// pebbles in the UI reference. Lit by local Lightformers so no HDR file is downloaded.
import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Environment, Float, Lightformer, MeshDistortMaterial, RoundedBox } from '@react-three/drei';

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function Agent({ offset, radius = 2.2, speed = 0.22, tilt = 0.32, children }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = reduced() ? offset : clock.elapsedTime * speed + offset;
    ref.current.position.set(Math.cos(t) * radius, Math.sin(t) * radius * tilt, Math.sin(t) * radius);
    ref.current.rotation.y = t * 1.4;
    ref.current.rotation.x = t * 0.6;
  });
  return <group ref={ref}>{children}</group>;
}

function Rig({ children }) {
  const ref = useRef();
  useFrame(({ pointer }, dt) => {
    if (!ref.current) return;
    const k = Math.min(1, dt * 2.5);
    ref.current.rotation.y += (pointer.x * 0.35 - ref.current.rotation.y) * k;
    ref.current.rotation.x += (-pointer.y * 0.18 - ref.current.rotation.x) * k;
  });
  return <group ref={ref}>{children}</group>;
}

export default function Scene3D() {
  const host = useRef(null);
  const [visible, setVisible] = useState(true);

  // Stop rendering once the hero scrolls out of view.
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    io.observe(host.current);
    return () => io.disconnect();
  }, []);

  return (
    // Canvas bleeds past the column and fades out at the bottom so nothing shows a hard edge.
    <div
      ref={host}
      style={{
        position: 'absolute',
        inset: '-6% -12%',
        maskImage: 'linear-gradient(to bottom, #000 80%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, #000 80%, transparent 100%)',
      }}
    >
      <Canvas
        camera={{ position: [0, 0.5, 8.2], fov: 42 }}
        dpr={[1, window.innerWidth < 768 ? 1.25 : 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        frameloop={visible ? 'always' : 'never'}
      >
        <ambientLight intensity={0.55} />
        <directionalLight position={[4, 6, 5]} intensity={1.5} />
        <Environment resolution={64}>
          <Lightformer form="circle" intensity={2.2} position={[0, 5, 3]} scale={8} />
          <Lightformer intensity={1.2} position={[-5, 0, 2]} scale={[4, 8, 1]} color="#cfe3ea" />
          <Lightformer intensity={0.9} position={[5, -1, 2]} scale={[4, 8, 1]} color="#8dbccb" />
        </Environment>

        <Rig>
          <Float speed={1.4} rotationIntensity={0.25} floatIntensity={0.6}>
            <mesh>
              <sphereGeometry args={[1.2, 64, 64]} />
              <MeshDistortMaterial color="#5b9bb0" distort={0.24} speed={1.5} roughness={0.38} metalness={0.05} />
            </mesh>
          </Float>

          <mesh rotation={[Math.PI / 2 - 0.32, 0, 0]}>
            <torusGeometry args={[2.2, 0.008, 12, 160]} />
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

        <ContactShadows position={[0, -2.1, 0]} opacity={0.26} scale={9} blur={2.6} far={4} resolution={256} color="#14283b" />
      </Canvas>
    </div>
  );
}
