'use client';

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Lens({
    children,
    zoomFactor = 1.5,
    lensSize = 170,
    isStatic = false,
    position = { x: 200, y: 150 },
    hovering,
    setHovering,
}) {
    const containerRef = useRef(null);
    const [localHovering, setLocalHovering] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 100, y: 100 });

    const isHovering = hovering !== undefined ? hovering : localHovering;
    const updateHovering = setHovering || setLocalHovering;

    const handleMouseMove = (e) => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            setMousePosition({ x, y });
        }
    };

    return (
        <div
            ref={containerRef}
            className="relative overflow-hidden rounded-2xl w-full h-full cursor-crosshair group"
            onMouseEnter={() => updateHovering(true)}
            onMouseLeave={() => updateHovering(false)}
            onMouseMove={handleMouseMove}
        >
            {/* Base layer */}
            {children}

            {/* Lens layer */}
            <AnimatePresence>
                {(isHovering || isStatic) && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="absolute pointer-events-none z-50 border-[1.5px] border-white/30 shadow-[0_0_30px_rgba(0,0,0,0.5)] rounded-full overflow-hidden"
                        style={{
                            width: lensSize,
                            height: lensSize,
                            left: isStatic ? position.x - lensSize / 2 : mousePosition.x - lensSize / 2,
                            top: isStatic ? position.y - lensSize / 2 : mousePosition.y - lensSize / 2,
                            boxShadow: 'inset 0 0 20px rgba(255,255,255,0.1), 0 0 30px rgba(0,0,0,0.5)'
                        }}
                    >
                        <div
                            className="absolute pointer-events-none"
                            style={{
                                width: "100%",
                                height: "100%",
                            }}
                        >
                            <div
                                className="absolute pointer-events-none"
                                style={{
                                    width: containerRef.current?.offsetWidth || "100%",
                                    height: containerRef.current?.offsetHeight || "100%",
                                    left: -(isStatic ? position.x - lensSize / 2 : mousePosition.x - lensSize / 2),
                                    top: -(isStatic ? position.y - lensSize / 2 : mousePosition.y - lensSize / 2),
                                    transformOrigin: `${isStatic ? position.x : mousePosition.x}px ${isStatic ? position.y : mousePosition.y}px`,
                                    transform: `scale(${zoomFactor})`,
                                }}
                            >
                                {children}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10 pointer-events-none" />
        </div>
    );
}
