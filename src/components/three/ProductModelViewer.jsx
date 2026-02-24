'use client';

import { useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Center, Environment, ContactShadows } from '@react-three/drei';

function Model({ url }) {
    const { scene } = useGLTF(url);
    return (
        <Center>
            <primitive object={scene} />
        </Center>
    );
}

function ModelSkeleton() {
    return (
        <mesh>
            <torusGeometry args={[1, 0.05, 16, 48]} />
            <meshStandardMaterial color="#C4622D" opacity={0.3} transparent />
        </mesh>
    );
}

export default function ProductModelViewer({ modelUrl, productTitle }) {
    const controlsRef = useRef();

    if (!modelUrl) return null;

    return (
        <div className="relative w-full rounded-2xl overflow-hidden" style={{ height: '450px', background: 'rgba(15,15,20,0.95)' }}>
            <Canvas
                camera={{ position: [0, 0, 4], fov: 45 }}
                gl={{ antialias: true, alpha: true }}
                shadows
            >
                <Suspense fallback={<ModelSkeleton />}>
                    <Model url={modelUrl} />
                </Suspense>

                <Environment preset="studio" />
                <ContactShadows opacity={0.3} scale={5} blur={2} far={4} />

                <OrbitControls
                    ref={controlsRef}
                    enableZoom={true}
                    enablePan={false}
                    autoRotate={true}
                    autoRotateSpeed={1.2}
                    maxPolarAngle={Math.PI / 1.5}
                />
            </Canvas>

            {/* Overlay controls */}
            <div className="absolute bottom-4 left-4 flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-full text-[10px] bg-white/10 backdrop-blur-md text-white/50">
                    🔄 Drag to rotate
                </span>
            </div>

            {productTitle && (
                <div className="absolute top-4 left-4">
                    <span className="px-3 py-1.5 rounded-full text-[10px] bg-[#8B5CF6]/20 backdrop-blur-md text-[#8B5CF6] font-medium border border-[#8B5CF6]/30">
                        ✦ 3D View
                    </span>
                </div>
            )}
        </div>
    );
}
