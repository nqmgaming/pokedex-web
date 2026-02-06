'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import type { Pokemon } from '../../types';
import EvolutionChain from '../../components/EvolutionChain';
import AbilitiesSection from '../../components/AbilitiesSection';
import MovesSection from '../../components/MovesSection';
import SpeciesInfo from '../../components/SpeciesInfo';
import SpriteGallery from '../../components/SpriteGallery';
import styles from './page.module.css';

interface PageProps {
    params: Promise<{ id: string }>;
}

/**
 * Pokemon Detail Page
 * Shows detailed info about a single Pokemon
 * Features sprite animation using front/back sprites from API
 */
export default function PokemonDetail({ params }: PageProps) {
    const { id } = use(params);
    const router = useRouter();
    const [pokemon, setPokemon] = useState<Pokemon | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isHovered, setIsHovered] = useState(false);

    // Fetch Pokemon data
    useEffect(() => {
        const fetchPokemon = async () => {
            try {
                const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
                if (!response.ok) {
                    throw new Error('Pokemon không tồn tại');
                }
                const data: Pokemon = await response.json();
                setPokemon(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
            } finally {
                setIsLoading(false);
            }
        };

        fetchPokemon();
    }, [id]);

    // Get stat bar color class
    const getStatClass = (statName: string) => {
        const classMap: Record<string, string> = {
            'hp': styles.hp,
            'attack': styles.attack,
            'defense': styles.defense,
            'special-attack': styles.specialAttack,
            'special-defense': styles.specialDefense,
            'speed': styles.speed,
        };
        return classMap[statName] || '';
    };

    // Get stat label
    const getStatLabel = (statName: string) => {
        const labelMap: Record<string, string> = {
            'hp': 'HP',
            'attack': 'ATK',
            'defense': 'DEF',
            'special-attack': 'SP.A',
            'special-defense': 'SP.D',
            'speed': 'SPD',
        };
        return labelMap[statName] || statName;
    };

    // Loading state
    if (isLoading) {
        return (
            <div className={styles.page}>
                <div className={styles.loading}>
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        style={{ fontSize: '3rem' }}
                    >
                        ⚪
                    </motion.div>
                    <p className={styles.loadingText}>Đang tải thông tin...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !pokemon) {
        return (
            <div className={styles.page}>
                <button className={styles.backButton} onClick={() => router.back()}>
                    ← Quay lại
                </button>
                <div className={styles.error}>
                    <span style={{ fontSize: '3rem' }}>😢</span>
                    <p className={styles.errorText}>{error || 'Không tìm thấy Pokemon'}</p>
                </div>
            </div>
        );
    }

    // Get sprites
    const frontSprite = pokemon.sprites.front_default;
    const backSprite = pokemon.sprites.back_default;
    const officialArtwork = pokemon.sprites.other?.['official-artwork']?.front_default;

    return (
        <motion.div
            className={styles.page}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
        >
            {/* Back Button */}
            <motion.button
                className={styles.backButton}
                onClick={() => router.back()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                ← Quay lại Pokédex
            </motion.button>

            {/* Detail Card */}
            <motion.div
                className={styles.card}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
            >
                {/* Card Header with Sprite */}
                <div className={styles.cardHeader}>
                    <span className={styles.idBadge}>#{String(pokemon.id).padStart(3, '0')}</span>

                    <div
                        className={styles.spriteContainer}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        style={{ cursor: 'pointer' }}
                    >
                        {frontSprite && backSprite ? (
                            <Image
                                src={isHovered ? backSprite : frontSprite}
                                alt={pokemon.name}
                                width={200}
                                height={200}
                                className={styles.sprite}
                                unoptimized
                                priority
                            />
                        ) : officialArtwork ? (
                            <Image
                                src={officialArtwork}
                                alt={pokemon.name}
                                width={200}
                                height={200}
                                className={styles.sprite}
                                unoptimized
                                priority
                            />
                        ) : frontSprite ? (
                            <Image
                                src={frontSprite}
                                alt={pokemon.name}
                                width={200}
                                height={200}
                                className={styles.sprite}
                                unoptimized
                                priority
                            />
                        ) : null}
                    </div>
                </div>

                {/* Card Body */}
                <div className={styles.cardBody}>
                    <h1 className={styles.name}>{pokemon.name}</h1>

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

                    {/* Info Grid */}
                    <div className={styles.infoGrid}>
                        <div className={styles.infoItem}>
                            <p className={styles.infoLabel}>Chiều cao</p>
                            <p className={styles.infoValue}>{(pokemon.height / 10).toFixed(1)} m</p>
                        </div>
                        <div className={styles.infoItem}>
                            <p className={styles.infoLabel}>Cân nặng</p>
                            <p className={styles.infoValue}>{(pokemon.weight / 10).toFixed(1)} kg</p>
                        </div>
                    </div>

                    {/* Stats */}
                    <h2 className={styles.statsTitle}>Chỉ số cơ bản</h2>
                    <div className={styles.stats}>
                        {pokemon.stats.map((stat) => (
                            <div key={stat.stat.name} className={styles.statRow}>
                                <span className={styles.statLabel}>
                                    {getStatLabel(stat.stat.name)}
                                </span>
                                <div className={styles.statBarContainer}>
                                    <motion.div
                                        className={`${styles.statBar} ${getStatClass(stat.stat.name)}`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min((stat.base_stat / 200) * 100, 100)}%` }}
                                        transition={{ duration: 0.6, delay: 0.3 }}
                                    />
                                </div>
                                <span className={styles.statValue}>{stat.base_stat}</span>
                            </div>
                        ))}
                    </div>

                    {/* Species Info */}
                    <SpeciesInfo pokemonId={pokemon.id} />
                </div>

                {/* Sprite Gallery */}
                <SpriteGallery sprites={pokemon.sprites} pokemonName={pokemon.name} />

                {/* Abilities Section */}
                <AbilitiesSection abilities={pokemon.abilities} />

                {/* Evolution Chain */}
                <EvolutionChain pokemonId={pokemon.id} />

                {/* Moves Section */}
                <MovesSection moves={pokemon.moves} />
            </motion.div>
        </motion.div >
    );
}
