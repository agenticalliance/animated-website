
import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";

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

const buckyballVertices = () => {
  const phi = (1 + Math.sqrt(5)) / 2; // Golden ratio
  const vertices = [];
  
  // Generate icosahedron vertices
  for (let i = -1; i <= 1; i += 2) {
    for (let j = -1; j <= 1; j += 2) {
      vertices.push([0, i, j * phi]);
      vertices.push([i, j * phi, 0]);
      vertices.push([j * phi, 0, i]);
    }
  }

  // Scale to desired radius
  return vertices.map((v) => 
    v.map((coord) => (coord * BUCKYBALL_RADIUS) / Math.sqrt(1 + phi * phi)) as [number, number, number]
  );
};

const BuckyballScene = ({ skills }: { skills: string[] }) => {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const [cameraPos, setCameraPos] = useState(new THREE.Vector3(0, 0, 5));
  const [visibleNodes, setVisibleNodes] = useState<number[]>([]);
  const vertices = useRef(buckyballVertices());
  
  // Rotate the group and update camera position for skills visibility calculation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.002;
      groupRef.current.rotation.x += 0.0005;
    }
    setCameraPos(state.camera.position);
  });

  // Update visible nodes - show more nodes at once
  useEffect(() => {
    const updateVisibleNodes = () => {
      const totalNodes = vertices.current.length;
      // Show even more nodes - 10 instead of 8
      const numVisibleNodes = Math.min(10, skills.length);
      const newVisibleNodes = [];
      
      // Select random nodes to display skills
      while (newVisibleNodes.length < numVisibleNodes) {
        const randomIndex = Math.floor(Math.random() * totalNodes);
        if (!newVisibleNodes.includes(randomIndex)) {
          newVisibleNodes.push(randomIndex);
        }
      }
      
      setVisibleNodes(newVisibleNodes);
    };

    updateVisibleNodes();
    // Change more frequently
    const interval = setInterval(updateVisibleNodes, 2000);
    
    return () => clearInterval(interval);
  }, [skills]);

  return (
    <group ref={groupRef}>
      {/* Create edges for the buckyball wireframe */}
      <lineSegments>
        <edgesGeometry args={[new THREE.IcosahedronGeometry(BUCKYBALL_RADIUS, 1)]} />
        <lineBasicMaterial color="#3b82f6" transparent opacity={0.5} fog={true} />
      </lineSegments>

      {/* Create the invisible buckyball mesh for reference */}
      <mesh ref={meshRef} visible={false}>
        <icosahedronGeometry args={[BUCKYBALL_RADIUS, 1]} />
        <meshBasicMaterial color="white" wireframe />
      </mesh>

      {/* Place skill nodes at vertex positions */}
      {vertices.current.map((position, i) => {
        const visible = visibleNodes.includes(i);
        const skillIndex = visibleNodes.indexOf(i);
        const text = visible && skillIndex < skills.length ? skills[skillIndex] : "";
        
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
        camera={{ position: [0, 0, 7], fov: 50 }}
        gl={{ antialias: true }}
        dpr={[1, 2]} // Responsive rendering quality
      >
        {/* Fog starts at 2 units from camera and extends to 8 units */}
        {/* This ensures the buckyball fades out appropriately with the camera at position [0,0,7] */}
        <fog attach="fog" args={['#080820', 2, 8]} />
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
