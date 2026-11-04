// The hero mascot: a sitting puppy wearing a stethoscope. It is built from primitives rather than a
// model file, so the head, ears, tail, eyes and tongue can each be animated on their own.
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { SphereGeometry } from 'three';

const FUR = '#cf9455';
const MUZZLE = '#efd0a4';
const DARK_BROWN = '#43240f';
const PATCH = '#5a3216';
const INK = '#1d110a';
const TONGUE = '#ee8fa0';
const TUBE = '#14283b';
const STEEL = '#dfe4e8';

const SPHERE = new SphereGeometry(1, 48, 32);

// An ellipsoid: `scale` holds its radius along each axis.
function Blob({ color = FUR, roughness = 0.72, metalness = 0, ...rest }) {
  return (
    <mesh geometry={SPHERE} {...rest}>
      <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />
    </mesh>
  );
}

const Eye = ({ side, innerRef }) => (
  <group position={[side * 0.43, 0.1, 0.98]} rotation={[0, side * 0.4, 0]}>
    <group ref={innerRef}>
      <Blob color={INK} roughness={0.08} scale={[0.19, 0.22, 0.12]} />
      <Blob color="#ffffff" roughness={0.2} position={[-0.055, 0.08, 0.1]} scale={[0.058, 0.058, 0.03]} />
      <Blob color="#ffffff" roughness={0.2} position={[0.06, -0.06, 0.105]} scale={[0.026, 0.026, 0.016]} />
    </group>
  </group>
);

const Ear = ({ side, innerRef }) => (
  <group ref={innerRef} position={[side * 0.9, 0.62, -0.02]}>
    <Blob color={DARK_BROWN} position={[0, -0.55, 0]} rotation={[0, side * 0.25, 0]} scale={[0.36, 0.68, 0.2]} />
  </group>
);

const Smile = ({ side }) => (
  <mesh position={[side * 0.13, -0.37, 1.27]} rotation={[0, side * 0.22, Math.PI]}>
    <torusGeometry args={[0.13, 0.016, 10, 28, Math.PI]} />
    <meshStandardMaterial color={INK} roughness={0.5} />
  </mesh>
);

const Paw = ({ x, z, width = 0.27 }) => <Blob position={[x, -1.77, z]} scale={[width, 0.18, width * 1.3]} />;

export default function Puppy({ mouse, still = false }) {
  const root = useRef();
  const body = useRef();
  const head = useRef();
  const earL = useRef();
  const earR = useRef();
  const eyeL = useRef();
  const eyeR = useRef();
  const tail = useRef();
  const tongue = useRef();

  useFrame(({ clock }, dt) => {
    const t = still ? 0 : clock.elapsedTime;
    const k = Math.min(1, dt * 5);
    const look = still ? { x: 0, y: 0 } : mouse.current;

    // Pop in once on load, then a slow sway so the whole dog keeps drifting.
    const grow = root.current.scale.x + (1 - root.current.scale.x) * (still ? 1 : Math.min(1, dt * 3.5));
    root.current.scale.setScalar(grow);
    const sway = -0.28 + Math.sin(t * 0.5) * 0.1;
    root.current.rotation.y = sway;

    body.current.scale.y = 1 + Math.sin(t * 2.6) * 0.012;

    // The head undoes the body's sway, then turns toward the cursor with a curious tilt.
    head.current.rotation.y += (look.x * 0.32 - sway - head.current.rotation.y) * k;
    head.current.rotation.x += (-look.y * 0.18 + Math.sin(t * 1.1) * 0.03 - head.current.rotation.x) * k;
    head.current.rotation.z = Math.sin(t * 0.7) * 0.07;

    const flop = Math.sin(t * 2.4) * 0.05;
    earL.current.rotation.z = -0.2 - flop;
    earR.current.rotation.z = 0.2 + flop;

    tail.current.rotation.z = -0.7 + Math.sin(t * 9) * 0.38;
    tongue.current.scale.y = 1 + Math.sin(t * 7) * 0.13;

    // Blink for a moment every few seconds.
    const lid = !still && t % 4.2 < 0.14 ? 0.1 : 1;
    eyeL.current.scale.y += (lid - eyeL.current.scale.y) * Math.min(1, dt * 30);
    eyeR.current.scale.y = eyeL.current.scale.y;
  });

  return (
    <group ref={root} scale={still ? 1 : 0.6}>
      <group ref={body}>
        <Blob position={[0, -0.72, 0]} scale={[0.95, 1.05, 0.85]} />
        <Blob position={[-0.74, -1.36, -0.1]} scale={[0.52, 0.52, 0.62]} />
        <Blob position={[0.74, -1.36, -0.1]} scale={[0.52, 0.52, 0.62]} />

        {[-0.34, 0.34].map((x) => (
          <mesh key={x} position={[x, -1.28, 0.55]}>
            <capsuleGeometry args={[0.22, 0.55, 10, 24]} />
            <meshStandardMaterial color={FUR} roughness={0.72} />
          </mesh>
        ))}
        <Paw x={-0.34} z={0.72} />
        <Paw x={0.34} z={0.72} />
        <Paw x={-0.84} z={0.34} />
        <Paw x={0.84} z={0.34} />

        <mesh position={[0, 0, 0.04]} rotation={[Math.PI / 2 + 0.42, 0, 0]} scale={[0.86, 1, 1]}>
          <torusGeometry args={[0.92, 0.035, 12, 96]} />
          <meshStandardMaterial color={TUBE} roughness={0.45} />
        </mesh>
        <group position={[0, -0.47, 0.92]} rotation={[-0.2, 0, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.19, 0.19, 0.07, 36]} />
            <meshStandardMaterial color={STEEL} roughness={0.25} metalness={0.85} />
          </mesh>
          <mesh position={[0, 0, 0.04]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.02, 32]} />
            <meshStandardMaterial color={TUBE} roughness={0.4} />
          </mesh>
        </group>

        <group ref={tail} position={[0.5, -1.2, -0.62]}>
          <group rotation={[-0.5, 0, 0]}>
            <mesh position={[0, 0.68, 0]}>
              <capsuleGeometry args={[0.15, 1.05, 10, 20]} />
              <meshStandardMaterial color={FUR} roughness={0.72} />
            </mesh>
            <Blob color={DARK_BROWN} position={[0, 1.32, 0]} scale={[0.17, 0.24, 0.17]} />
          </group>
        </group>
      </group>

      {/* Pivots at the neck so nods and turns read as a head, not a floating ball. */}
      <group ref={head} position={[0, 0.3, 0.12]}>
        <group position={[0, 0.95, 0.12]}>
          <Blob scale={[1.2, 1.06, 1.08]} />
          <Blob color={PATCH} position={[0.46, 0.16, 0.86]} rotation={[0, 0.42, 0]} scale={[0.42, 0.48, 0.2]} />
          <Ear side={-1} innerRef={earL} />
          <Ear side={1} innerRef={earR} />
          <Eye side={-1} innerRef={eyeL} />
          <Eye side={1} innerRef={eyeR} />

          <Blob color={MUZZLE} position={[0, -0.3, 0.84]} scale={[0.56, 0.4, 0.46]} />
          <Blob color={INK} roughness={0.18} position={[0, -0.14, 1.24]} scale={[0.17, 0.125, 0.1]} />
          <Blob color="#ffffff" roughness={0.2} position={[-0.05, -0.09, 1.325]} scale={[0.035, 0.022, 0.012]} />
          <mesh position={[0, -0.3, 1.29]}>
            <capsuleGeometry args={[0.012, 0.11, 4, 8]} />
            <meshStandardMaterial color={INK} roughness={0.5} />
          </mesh>
          <Smile side={-1} />
          <Smile side={1} />
          <group ref={tongue} position={[0, -0.44, 1.2]} rotation={[-0.3, 0, 0]}>
            <Blob color={TONGUE} roughness={0.45} position={[0, -0.13, 0]} scale={[0.13, 0.18, 0.05]} />
          </group>
        </group>
      </group>
    </group>
  );
}
