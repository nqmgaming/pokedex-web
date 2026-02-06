'use client';

import { useMemo, useState, useEffect } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import type { ISourceOptions } from '@tsparticles/engine';

/**
 * ParticleBackground - Sparkle/energy particle effect background
 * Uses tsParticles for performant particle rendering
 */
export default function ParticleBackground() {
    const [init, setInit] = useState(false);

    // Initialize tsParticles engine once
    useEffect(() => {
        initParticlesEngine(async (engine) => {
            await loadSlim(engine);
        }).then(() => {
            setInit(true);
        });
    }, []);

    // Particle configuration - memoized to prevent re-renders
    const options: ISourceOptions = useMemo(() => ({
        fullScreen: {
            enable: true,
            zIndex: -1, // Behind all content
        },
        fpsLimit: 60,
        particles: {
            number: {
                value: 30, // Low count for performance
                density: {
                    enable: true,
                },
            },
            color: {
                value: ['#FFCB05', '#F8D030', '#FFE066', '#DC0A2D'], // Yellow and red - Pokemon colors
            },
            shape: {
                type: 'star',
            },
            opacity: {
                value: { min: 0.3, max: 0.7 },
                animation: {
                    enable: true,
                    speed: 0.5,
                    sync: false,
                },
            },
            size: {
                value: { min: 2, max: 5 },
                animation: {
                    enable: true,
                    speed: 2,
                    sync: false,
                },
            },
            move: {
                enable: true,
                speed: 1,
                direction: 'none',
                random: true,
                straight: false,
                outModes: {
                    default: 'bounce',
                },
            },
            twinkle: {
                particles: {
                    enable: true,
                    frequency: 0.05,
                    opacity: 1,
                },
            },
        },
        interactivity: {
            events: {
                onHover: {
                    enable: true,
                    mode: 'repulse',
                },
            },
            modes: {
                repulse: {
                    distance: 100,
                    duration: 0.4,
                },
            },
        },
        detectRetina: true,
    }), []);

    if (!init) {
        return null;
    }

    return (
        <Particles
            id="tsparticles-bg"
            options={options}
        />
    );
}
