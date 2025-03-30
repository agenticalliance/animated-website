import { useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import { ConvexGeometry } from 'three/examples/jsm/geometries/ConvexGeometry.js';

type SkillNodeProps = {
  position: [number, number, number];
  text: string;
  cameraPosition: THREE.Vector3;
  visible: boolean;
};

const SkillNode = ({ position, text, cameraPosition, visible }: SkillNodeProps) => {
  const textRef = useRef<HTMLDivElement>(null);
  const [opacity, setOpacity] = useState(0);
  const positionVector = new THREE.Vector3(...position);

  useEffect(() => {
    if (!visible) {
      setOpacity(0);
      return;
    }

    // Calculate the dot product to determine if this node is facing the camera
    const normalizedPos = positionVector.clone().normalize();
    const cameraToPoint = positionVector.clone().sub(cameraPosition);
    const distance = cameraToPoint.length();
    const dotProduct = normalizedPos.dot(cameraPosition.clone().normalize());

    // Use distance and orientation to fade text similar to fog effect
    // Fog is configured from 2 to 8 units
    if (dotProduct < -0.3 || distance > 7.5) {
      setOpacity(0); // Behind the buckyball or too far away
    } else if (distance < 5) {
      setOpacity(Math.min((10 - distance) / 5, 1)); // Fade with distance, clamped to 1.0 max
    } else {
      setOpacity(0.5); // On the edge - 50% visible as requested
    }
  }, [position, cameraPosition, visible]);

  if (!visible) return null;

  return (
    <Html position={position} zIndexRange={[0, 0]}>
      <div 
        ref={textRef}
        className="text-white text-sm font-mono whitespace-nowrap pointer-events-none"
        style={{ 
          opacity: opacity * 0.7, // Set text to 70% alpha for better visibility
          transition: "opacity 0.3s ease-in-out",
          background: "linear-gradient(90deg, #FFD700, #DAA520)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          padding: "2px 8px",
          backdropFilter: "blur(1px)",
          transform: "translateX(10px)",
          textShadow: "0 0 5px rgba(255,215,0,0.3)",
          pointerEvents: "none" // Ensure text doesn't interfere with interactions
        }}
      >
        {text}
      </div>
    </Html>
  );
};

const BUCKYBALL_RADIUS = 2;

// Function to generate 60 vertices for a C60 Buckminsterfullerene (Truncated Icosahedron)
const getC60Vertices = (radius: number): Array<[number, number, number]> => {
  const phi = (1 + Math.sqrt(5)) / 2;
  const preciseCoords: Array<[number, number, number]> = [];
  const add = (v: [number, number, number]) => preciseCoords.push(v);

  // Generate coordinates based on standard C60 vertex types
  // Type 1: (0, ±1, ±3φ) and its 2 cyclic permutations (12 vertices)
  add([0, 1, 3*phi]); add([0, 1, -3*phi]); add([0, -1, 3*phi]); add([0, -1, -3*phi]);
  add([1, 3*phi, 0]); add([-1, 3*phi, 0]); add([1, -3*phi, 0]); add([-1, -3*phi, 0]);
  add([3*phi, 0, 1]); add([-3*phi, 0, 1]); add([3*phi, 0, -1]); add([-3*phi, 0, -1]);

  // Type 2: (±2, ±(1+2φ), ±φ) and its 2 cyclic permutations (24 vertices)
  const p1 = [2, 1+2*phi, phi];
  const p2 = [1+2*phi, phi, 2];
  const p3 = [phi, 2, 1+2*phi];
  [p1, p2, p3].forEach(p => {
      add([ p[0],  p[1],  p[2]]); add([ p[0],  p[1], -p[2]]);
      add([ p[0], -p[1],  p[2]]); add([ p[0], -p[1], -p[2]]);
      add([-p[0],  p[1],  p[2]]); add([-p[0],  p[1], -p[2]]);
      add([-p[0], -p[1],  p[2]]); add([-p[0], -p[1], -p[2]]);
  });

  // Type 3: (±1, ±(2+φ), ±2φ) and its 2 cyclic permutations (24 vertices)
  const p4 = [1, 2+phi, 2*phi];
  const p5 = [2+phi, 2*phi, 1];
  const p6 = [2*phi, 1, 2+phi];
  [p4, p5, p6].forEach(p => {
      add([ p[0],  p[1],  p[2]]); add([ p[0],  p[1], -p[2]]);
      add([ p[0], -p[1],  p[2]]); add([ p[0], -p[1], -p[2]]);
      add([-p[0],  p[1],  p[2]]); add([-p[0],  p[1], -p[2]]);
      add([-p[0], -p[1],  p[2]]); add([-p[0], -p[1], -p[2]]);
  });

  // Calculate normalization factor
  const normFactor = Math.sqrt(10 + 9 * phi);

  // Normalize and scale
  const scaledVertices = preciseCoords.map(v => {
    const normalized = v.map(coord => coord / normFactor) as [number, number, number];
    return normalized.map(coord => coord * radius) as [number, number, number];
  });

  // Use a Map to ensure uniqueness based on rounded coordinates (handles potential floating point issues)
  const uniqueVerticesMap = new Map<string, [number, number, number]>();
  scaledVertices.forEach(v => {
    const key = v.map(c => c.toFixed(5)).join(',');
    if (!uniqueVerticesMap.has(key)) {
        uniqueVerticesMap.set(key, v);
    }
  });

  const finalVertices = Array.from(uniqueVerticesMap.values());
  if (finalVertices.length !== 60) {
      // This should ideally not happen with the corrected logic, but log if it does
      console.warn(`Generated ${finalVertices.length} vertices instead of 60 for C60. Check vertex generation logic.`);
  }

  return finalVertices;
};

const BuckyballScene = ({ skills }: { skills: string[] }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [cameraPos, setCameraPos] = useState(new THREE.Vector3(0, 0, 11));
  const [nodeSkills, setNodeSkills] = useState<number[]>([]);
  const [nodesToUpdate, setNodesToUpdate] = useState<number[]>([]);
  const [frameCount, setFrameCount] = useState(0);
  const verticesVectors = useMemo(() => {
    const vertexPositions = getC60Vertices(BUCKYBALL_RADIUS);
    return vertexPositions.map(pos => new THREE.Vector3(...pos));
  }, []);

  const wireframeGeometry = useMemo(() => {
    if (verticesVectors.length === 0) return new THREE.BufferGeometry();
    const convexGeom = new ConvexGeometry(verticesVectors);
    return new THREE.EdgesGeometry(convexGeom);
  }, [verticesVectors]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.002;
      groupRef.current.rotation.x += 0.0005;
    }
    setCameraPos(state.camera.position);
    setFrameCount(prev => (prev + 1) % 10);

    if (frameCount === 0) {
      const newNodesToUpdate: number[] = [];

      verticesVectors.forEach((vec, nodeIndex) => {
        const positionVector = vec.clone();
        const cameraToPoint = positionVector.clone().sub(state.camera.position);
        const distance = cameraToPoint.length();
        const dotProduct = positionVector.clone().normalize().dot(state.camera.position.normalize());
        
        if (dotProduct < -0.5 && distance > 6) {
          newNodesToUpdate.push(nodeIndex);
        }
      });

      if (newNodesToUpdate.length > 0) {
        setNodesToUpdate(newNodesToUpdate);
      }
    }
  });

  useEffect(() => {
    if (nodeSkills.length === 0) {
      const totalNodes = verticesVectors.length;
      const initialSkills: number[] = new Array(totalNodes);

      for (let i = 0; i < totalNodes; i++) {
        initialSkills[i] = i % skills.length;
      }

      for (let i = initialSkills.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [initialSkills[i], initialSkills[j]] = [initialSkills[j], initialSkills[i]];
      }

      setNodeSkills(initialSkills);
    }
  }, [skills]);

  useEffect(() => {
    if (nodesToUpdate.length > 0) {
      setNodeSkills(prev => {
        const newSkills = [...prev];
        for (const nodeIndex of nodesToUpdate) {
          newSkills[nodeIndex] = Math.floor(Math.random() * skills.length);
        }
        return newSkills;
      });
      setNodesToUpdate([]);
    }
  }, [nodesToUpdate, skills]);

  return (
    <group ref={groupRef}>
      <lineSegments geometry={wireframeGeometry}>
        <lineBasicMaterial color="#3b82f6" transparent opacity={0.5} fog={true} />
      </lineSegments>
      
      {verticesVectors.map((vec, i) => {
        const position: [number, number, number] = [vec.x, vec.y, vec.z];
        let text = skills[nodeSkills[i] || 0] || "";
        const visible = true;

        if (!text) {
          text = skills[0];
        }
        
        return (
          <SkillNode 
            key={i}
            position={position}
            text={text}
            cameraPosition={cameraPos}
            visible={visible}
          />
        );
      })}
    </group>
  );
};

interface BuckyBallProps {
  skills: string[];
}

export const BuckyBall = ({ skills }: BuckyBallProps) => {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 11], fov: 45 }}
        gl={{ antialias: true }}
        dpr={[1, 2]}
      >
        <fog attach="fog" args={['#080820', 2, 10]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <BuckyballScene skills={skills} />
        <OrbitControls 
          enableZoom={false}
          enablePan={false}
          rotateSpeed={0.5}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
};
