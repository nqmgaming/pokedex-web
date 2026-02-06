'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import Image from 'next/image';
import type { Pokemon } from '../types';
import styles from './PokemonCard.module.css';

interface PokemonCardProps {
    pokemon: Pokemon;
    index: number; // For stagger animation
}

/**
 * PokemonCard - Individual Pokemon card with animations
 * - Load: fade + slide up (staggered)
 * - Hover: scale
 * - Click: Navigate to detail page
 */
export default function PokemonCard({ pokemon, index }: PokemonCardProps) {
    // Get Pokemon image URL (official artwork preferred)
    const imageUrl =
        pokemon.sprites.other?.['official-artwork']?.front_default ||
        pokemon.sprites.other?.dream_world?.front_default ||
        pokemon.sprites.front_default ||
        '/pokeball.png';

    // Get primary stats (HP, Attack, Defense, Speed)
    const primaryStats = pokemon.stats.filter((stat) =>
        ['hp', 'attack', 'defense', 'speed'].includes(stat.stat.name)
    );

    // Stat bar color class
    const getStatClass = (statName: string) => {
        const shortName = statName.replace('special-', '');
        return styles[shortName as keyof typeof styles] || '';
    };

    return (
        <Link href={`/pokemon/${pokemon.id}`} style={{ textDecoration: 'none' }}>
            <motion.div
                className={styles.card}
                // Load animation: fade + slide up
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                    duration: 0.3,
                    delay: index * 0.05, // Stagger effect
                    ease: 'easeOut',
                }}
                // Hover animation: simple scale
                whileHover={{
                    scale: 1.03,
                    transition: { duration: 0.2 },
                }}
                whileTap={{ scale: 0.98 }}
            >
                {/* Pokemon ID Badge */}
                <span className={styles.idBadge}>#{String(pokemon.id).padStart(3, '0')}</span>

                {/* Pokemon Image */}
                <div className={styles.imageContainer}>
                    <Image
                        src={imageUrl}
                        alt={pokemon.name}
                        width={120}
                        height={120}
                        className={styles.pokemonImage}
                        priority={index < 4}
                        unoptimized
                    />
                </div>

                {/* Card Content */}
                <div className={styles.content}>
                    {/* Pokemon Name */}
                    <h3 className={styles.name}>{pokemon.name}</h3>

                    {/* Type Badges */}
                    <div className={styles.types}>
                        {pokemon.types.map((t) => (
                            <span
                                key={t.type.name}
                                className={`${styles.typeBadge} type-${t.type.name}`}
                            >
                                {t.type.name}
                            </span>
                        ))}
                    </div>

                    {/* Stats Bars */}
                    <div className={styles.stats}>
                        {primaryStats.map((stat) => (
                            <div key={stat.stat.name} className={styles.statRow}>
                                <span className={styles.statLabel}>
                                    {stat.stat.name.replace('special-', 'sp.').slice(0, 3).toUpperCase()}
                                </span>
                                <div className={styles.statBarContainer}>
                                    <motion.div
                                        className={`${styles.statBar} ${getStatClass(stat.stat.name)}`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min((stat.base_stat / 150) * 100, 100)}%` }}
                                        transition={{ duration: 0.5, delay: index * 0.05 + 0.2 }}
                                    />
                                </div>
                                <span className={styles.statValue}>{stat.base_stat}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </Link>
    );
}
