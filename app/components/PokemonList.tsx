'use client';

import { AnimatePresence, motion } from 'framer-motion';
import type { Pokemon } from '../types';
import PokemonCard from './PokemonCard';
import styles from './PokemonList.module.css';

interface PokemonListProps {
    pokemons: Pokemon[];
    isLoading?: boolean;
    error?: string | null;
    onRetry?: () => void;
}

/**
 * PokemonList - Grid display of Pokemon cards
 * Features:
 * - Responsive grid (1 → 2 → 3 → 4 columns)
 * - AnimatePresence for smooth card transitions
 * - Loading and error states
 */
export default function PokemonList({
    pokemons,
    isLoading = false,
    error = null,
    onRetry,
}: PokemonListProps) {
    // Loading State
    if (isLoading) {
        return (
            <div className={styles.loading}>
                <svg
                    className={styles.pokeball}
                    viewBox="0 0 100 100"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {/* Poké Ball SVG */}
                    <circle cx="50" cy="50" r="48" fill="#DC0A2D" stroke="#1D1D1D" strokeWidth="4" />
                    <rect x="0" y="46" width="100" height="8" fill="#1D1D1D" />
                    <circle cx="50" cy="50" r="48" fill="white" clipPath="url(#bottom-half)" />
                    <defs>
                        <clipPath id="bottom-half">
                            <rect x="0" y="50" width="100" height="50" />
                        </clipPath>
                    </defs>
                    <circle cx="50" cy="50" r="16" fill="white" stroke="#1D1D1D" strokeWidth="4" />
                    <circle cx="50" cy="50" r="8" fill="#1D1D1D" />
                </svg>
                <p className={styles.loadingText}>Đang bắt Pokémon...</p>
            </div>
        );
    }

    // Error State
    if (error) {
        return (
            <div className={styles.error}>
                <span className={styles.errorIcon}>😢</span>
                <p className={styles.errorText}>{error}</p>
                {onRetry && (
                    <button className={styles.retryButton} onClick={onRetry}>
                        Thử lại
                    </button>
                )}
            </div>
        );
    }

    // Empty State
    if (pokemons.length === 0) {
        return (
            <div className={styles.empty}>
                <span className={styles.errorIcon}>🔍</span>
                <p className={styles.emptyText}>Không tìm thấy Pokémon nào!</p>
            </div>
        );
    }

    // Pokemon Grid with AnimatePresence
    return (
        <motion.div
            className={styles.grid}
            initial="hidden"
            animate="visible"
            variants={{
                hidden: { opacity: 0 },
                visible: {
                    opacity: 1,
                    transition: {
                        staggerChildren: 0.08,
                    },
                },
            }}
        >
            <AnimatePresence mode="popLayout">
                {pokemons.map((pokemon, index) => (
                    <PokemonCard key={pokemon.id} pokemon={pokemon} index={index} />
                ))}
            </AnimatePresence>
        </motion.div>
    );
}
