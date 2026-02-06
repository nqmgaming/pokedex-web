'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { EvolutionChain, ChainLink, PokemonSpecies } from '../types';
import styles from './EvolutionChain.module.css';

interface EvolutionChainProps {
    pokemonId: number;
}

interface EvolutionStage {
    name: string;
    id: number;
    sprite: string;
    minLevel: number | null;
    trigger: string | null;
    item: string | null;
}

/**
 * EvolutionChain component
 * Fetches and displays the evolution chain for a Pokemon
 */
export default function EvolutionChainComponent({ pokemonId }: EvolutionChainProps) {
    const [stages, setStages] = useState<EvolutionStage[][]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEvolutionChain = async () => {
            setIsLoading(true);
            setError(null);

            try {
                // Step 1: Get species data to find evolution chain URL
                const speciesRes = await fetch(
                    `https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`
                );
                if (!speciesRes.ok) throw new Error('Không thể tải species');
                const speciesData: PokemonSpecies = await speciesRes.json();

                // Step 2: Fetch evolution chain
                const chainRes = await fetch(speciesData.evolution_chain.url);
                if (!chainRes.ok) throw new Error('Không thể tải evolution chain');
                const chainData: EvolutionChain = await chainRes.json();

                // Step 3: Parse chain into stages
                const parsedStages = parseEvolutionChain(chainData.chain);
                setStages(parsedStages);
            } catch (err) {
                console.error('Error fetching evolution chain:', err);
                setError(err instanceof Error ? err.message : 'Lỗi');
            } finally {
                setIsLoading(false);
            }
        };

        fetchEvolutionChain();
    }, [pokemonId]);

    // Parse evolution chain into array of stages
    const parseEvolutionChain = (chain: ChainLink): EvolutionStage[][] => {
        const result: EvolutionStage[][] = [];

        const traverse = (node: ChainLink, depth: number) => {
            // Extract ID from species URL
            const urlParts = node.species.url.split('/');
            const id = parseInt(urlParts[urlParts.length - 2]);

            const stage: EvolutionStage = {
                name: node.species.name,
                id,
                sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
                minLevel: node.evolution_details[0]?.min_level || null,
                trigger: node.evolution_details[0]?.trigger?.name || null,
                item: node.evolution_details[0]?.item?.name || null,
            };

            if (!result[depth]) {
                result[depth] = [];
            }
            result[depth].push(stage);

            for (const evolution of node.evolves_to) {
                traverse(evolution, depth + 1);
            }
        };

        traverse(chain, 0);
        return result;
    };

    // Get evolution condition text
    const getEvolutionText = (stage: EvolutionStage): string => {
        if (stage.minLevel) return `Lv. ${stage.minLevel}`;
        if (stage.item) return stage.item.replace('-', ' ');
        if (stage.trigger === 'trade') return 'Đổi';
        if (stage.trigger === 'use-item') return 'Dùng vật phẩm';
        return '';
    };

    if (isLoading) {
        return (
            <div className={styles.container}>
                <h2 className={styles.title}>Chuỗi tiến hóa</h2>
                <div className={styles.loading}>Đang tải...</div>
            </div>
        );
    }

    if (error) {
        return null; // Silently fail for evolution chain
    }

    // Don't show if only one stage (no evolution)
    if (stages.length <= 1) {
        return (
            <div className={styles.container}>
                <h2 className={styles.title}>Chuỗi tiến hóa</h2>
                <p className={styles.noEvolution}>Pokémon này không tiến hóa</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Chuỗi tiến hóa</h2>
            <div className={styles.chain}>
                {stages.map((stageGroup, stageIndex) => (
                    <div key={stageIndex} className={styles.stageWrapper}>
                        {/* Arrow before stage (except first) */}
                        {stageIndex > 0 && (
                            <div className={styles.arrow}>
                                <span className={styles.arrowCondition}>
                                    {getEvolutionText(stageGroup[0])}
                                </span>
                                <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M9 18L15 12L9 6"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </div>
                        )}

                        {/* Pokemon stage(s) */}
                        <div className={styles.stageGroup}>
                            {stageGroup.map((pokemon) => (
                                <Link
                                    key={pokemon.id}
                                    href={`/pokemon/${pokemon.id}`}
                                    className={styles.stageLink}
                                >
                                    <motion.div
                                        className={`${styles.stage} ${pokemon.id === pokemonId ? styles.current : ''
                                            }`}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Image
                                            src={pokemon.sprite}
                                            alt={pokemon.name}
                                            width={80}
                                            height={80}
                                            unoptimized
                                        />
                                        <span className={styles.stageName}>
                                            {pokemon.name}
                                        </span>
                                        <span className={styles.stageId}>
                                            #{String(pokemon.id).padStart(3, '0')}
                                        </span>
                                    </motion.div>
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
