'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Ability } from '../types';
import styles from './AbilitiesSection.module.css';

interface AbilityData {
    name: string;
    isHidden: boolean;
    effect: string;
    shortEffect: string;
}

interface AbilitiesSectionProps {
    abilities: Array<{
        ability: { name: string; url: string };
        is_hidden: boolean;
        slot: number;
    }>;
}

/**
 * AbilitiesSection component
 * Displays Pokemon abilities with descriptions
 */
export default function AbilitiesSection({ abilities }: AbilitiesSectionProps) {
    const [abilityData, setAbilityData] = useState<AbilityData[]>([]);
    const [expandedAbility, setExpandedAbility] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAbilities = async () => {
            setIsLoading(true);

            try {
                const abilityPromises = abilities.map(async (slot) => {
                    const res = await fetch(slot.ability.url);
                    if (!res.ok) return null;
                    const data: Ability = await res.json();

                    // Get English effect
                    const effectEntry = data.effect_entries.find(
                        (e) => e.language.name === 'en'
                    );

                    return {
                        name: slot.ability.name,
                        isHidden: slot.is_hidden,
                        effect: effectEntry?.effect || '',
                        shortEffect: effectEntry?.short_effect || '',
                    };
                });

                const results = await Promise.all(abilityPromises);
                setAbilityData(results.filter((a): a is AbilityData => a !== null));
            } catch (err) {
                console.error('Error fetching abilities:', err);
            } finally {
                setIsLoading(false);
            }
        };

        if (abilities.length > 0) {
            fetchAbilities();
        }
    }, [abilities]);

    const toggleAbility = (name: string) => {
        setExpandedAbility(expandedAbility === name ? null : name);
    };

    if (isLoading) {
        return (
            <div className={styles.container}>
                <h2 className={styles.title}>Đặc tính</h2>
                <div className={styles.loading}>Đang tải...</div>
            </div>
        );
    }

    if (abilityData.length === 0) {
        return null;
    }

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Đặc tính</h2>
            <div className={styles.abilities}>
                {abilityData.map((ability) => (
                    <motion.div
                        key={ability.name}
                        className={`${styles.ability} ${ability.isHidden ? styles.hidden : ''
                            }`}
                        onClick={() => toggleAbility(ability.name)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <div className={styles.abilityHeader}>
                            <span className={styles.abilityName}>
                                {ability.name.replace('-', ' ')}
                            </span>
                            {ability.isHidden && (
                                <span className={styles.hiddenBadge}>ẩn</span>
                            )}
                            <svg
                                className={`${styles.chevron} ${expandedAbility === ability.name ? styles.expanded : ''
                                    }`}
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                            >
                                <path
                                    d="M6 9L12 15L18 9"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>
                        <p className={styles.shortEffect}>{ability.shortEffect}</p>

                        <AnimatePresence>
                            {expandedAbility === ability.name && ability.effect && (
                                <motion.div
                                    className={styles.fullEffect}
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <p>{ability.effect}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
