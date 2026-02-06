'use client';

import { useEffect, useState } from 'react';
import type { PokemonSpecies } from '../types';
import styles from './SpeciesInfo.module.css';

interface SpeciesInfoProps {
    pokemonId: number;
}

interface SpeciesData {
    flavorText: string;
    genus: string;
    habitat: string | null;
    generation: string;
    captureRate: number;
    baseHappiness: number;
    growthRate: string;
    eggGroups: string[];
    isLegendary: boolean;
    isMythical: boolean;
    isBaby: boolean;
}

/**
 * SpeciesInfo component
 * Displays Pokemon species information like flavor text, genus, habitat
 */
export default function SpeciesInfo({ pokemonId }: SpeciesInfoProps) {
    const [data, setData] = useState<SpeciesData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSpecies = async () => {
            setIsLoading(true);

            try {
                const res = await fetch(
                    `https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`
                );
                if (!res.ok) throw new Error('Failed to fetch species');
                const species: PokemonSpecies = await res.json();

                // Get English flavor text (prefer latest version)
                const englishFlavors = species.flavor_text_entries
                    .filter((e) => e.language.name === 'en')
                    .reverse();
                const flavorText = englishFlavors[0]?.flavor_text
                    .replace(/\f/g, ' ')
                    .replace(/\n/g, ' ') || '';

                // Get English genus
                const genus = species.genera.find((g) => g.language.name === 'en')?.genus || '';

                setData({
                    flavorText,
                    genus,
                    habitat: species.habitat?.name || null,
                    generation: species.generation.name.replace('generation-', 'Gen ').toUpperCase(),
                    captureRate: species.capture_rate,
                    baseHappiness: species.base_happiness,
                    growthRate: species.growth_rate.name.replace(/-/g, ' '),
                    eggGroups: species.egg_groups.map((g) => g.name.replace(/-/g, ' ')),
                    isLegendary: species.is_legendary,
                    isMythical: species.is_mythical,
                    isBaby: species.is_baby,
                });
            } catch (err) {
                console.error('Error fetching species:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSpecies();
    }, [pokemonId]);

    if (isLoading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>Đang tải...</div>
            </div>
        );
    }

    if (!data) {
        return null;
    }

    return (
        <div className={styles.container}>
            {/* Badges */}
            <div className={styles.badges}>
                {data.isLegendary && (
                    <span className={`${styles.badge} ${styles.legendary}`}>
                        ⭐ Huyền thoại
                    </span>
                )}
                {data.isMythical && (
                    <span className={`${styles.badge} ${styles.mythical}`}>
                        ✨ Thần thoại
                    </span>
                )}
                {data.isBaby && (
                    <span className={`${styles.badge} ${styles.baby}`}>
                        🍼 Baby
                    </span>
                )}
            </div>

            {/* Genus */}
            {data.genus && (
                <p className={styles.genus}>{data.genus}</p>
            )}

            {/* Flavor Text */}
            {data.flavorText && (
                <p className={styles.flavorText}>{data.flavorText}</p>
            )}

            {/* Info Grid */}
            <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Thế hệ</span>
                    <span className={styles.infoValue}>{data.generation}</span>
                </div>
                {data.habitat && (
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Môi trường</span>
                        <span className={styles.infoValue}>{data.habitat}</span>
                    </div>
                )}
                <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Tỷ lệ bắt</span>
                    <span className={styles.infoValue}>{data.captureRate}</span>
                </div>
                <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Độ hạnh phúc</span>
                    <span className={styles.infoValue}>{data.baseHappiness}</span>
                </div>
                <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Tốc độ lớn</span>
                    <span className={styles.infoValue}>{data.growthRate}</span>
                </div>
                {data.eggGroups.length > 0 && (
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Nhóm trứng</span>
                        <span className={styles.infoValue}>
                            {data.eggGroups.join(', ')}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
