'use client';

import React, { useRef, useEffect } from 'react';
import Image from 'next/image';
import { Lens } from './Lens';

export default function InfiniteMenu({ items = [], scale = 1 }) {
    const containerRef = useRef(null);
    const wrapperRef = useRef(null);

    // Manual infinite scroll logic
    useEffect(() => {
        const container = containerRef.current;
        const wrapper = wrapperRef.current;
        if (!container || !wrapper) return;

        let y = 0;
        let speed = 0.5; // slow auto scroll
        let isHovered = false;

        container.addEventListener('mouseenter', () => (isHovered = true));
        container.addEventListener('mouseleave', () => (isHovered = false));

        // Let user scroll take over
        const handleWheel = (e) => {
            e.preventDefault();
            speed = e.deltaY * 0.1;
        };
        container.addEventListener('wheel', handleWheel, { passive: false });

        let raf;
        const loop = () => {
            // Decelerate scroll if user scrolled
            if (!isHovered) {
                speed = speed * 0.95 + 0.5 * 0.05; // ease back to auto scroll
            } else {
                speed = speed * 0.9; // stop when hovered
            }

            y -= speed;

            // Infinite loop logic:
            // Since we duplicated items, we reset position when passing half height
            const height = wrapper.scrollHeight / 2;
            if (y <= -height) {
                y += height;
            } else if (y > 0) {
                y -= height;
            }

            wrapper.style.transform = `translateY(${y}px)`;
            raf = requestAnimationFrame(loop);
        };
        loop();

        return () => {
            cancelAnimationFrame(raf);
            container.removeEventListener('wheel', handleWheel);
        };
    }, []);

    const duplicatedItems = [...items, ...items]; // clone for seamless loop

    return (
        <div
            ref={containerRef}
            className="w-full h-full overflow-hidden relative"
            style={{ transform: `scale(${scale})` }}
        >
            <div ref={wrapperRef} className="flex flex-col gap-6 p-4">
                {duplicatedItems.map((item, index) => (
                    <div
                        key={index}
                        className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden shrink-0 group border border-white/10 shadow-xl"
                    >
                        <Lens zoomFactor={1.7} lensSize={200}>
                            <Image
                                src={item.image || item.url}
                                alt={item.title || `Product Image ${index}`}
                                fill
                                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                            {/* Gradient Overlay */}
                            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

                            <div className="absolute bottom-6 left-6 right-6 text-white text-left opacity-0 translate-y-4 transition-all duration-500 ease-out group-hover:opacity-100 group-hover:translate-y-0 pointer-events-none z-10">
                                {item.title && <h3 className="text-xl font-medium mb-1" style={{ fontFamily: 'var(--font-playfair)' }}>{item.title}</h3>}
                                {item.description && <p className="text-sm text-white/70 max-w-sm">{item.description}</p>}
                            </div>
                        </Lens>
                    </div>
                ))}
            </div>

            {/* Fade bounds */}
            <div className="absolute top-0 w-full h-12 bg-gradient-to-b from-[#050505] to-transparent pointer-events-none" />
            <div className="absolute bottom-0 w-full h-12 bg-gradient-to-t from-[#050505] to-transparent pointer-events-none" />
        </div>
    );
}
