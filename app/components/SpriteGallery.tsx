'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import type { PokemonSprites } from '../types';
import styles from './SpriteGallery.module.css';

interface SpriteGalleryProps {
    sprites: PokemonSprites;
    pokemonName: string;
}

interface SpriteItem {
    url: string;
    label: string;
    category: string;
}

type Category = 'all' | 'default' | 'shiny' | 'artwork' | 'animated';

/**
 * SpriteGallery component
 * Displays all available Pokemon sprites in a gallery format
 */
export default function SpriteGallery({ sprites, pokemonName }: SpriteGalleryProps) {
    const [selectedSprite, setSelectedSprite] = useState<SpriteItem | null>(null);
    const [filter, setFilter] = useState<Category>('all');

    // Extract all sprites into a flat array
    const allSprites = useMemo(() => {
        const items: SpriteItem[] = [];

        // Default sprites
        if (sprites.front_default) {
            items.push({ url: sprites.front_default, label: 'Mặt trước', category: 'default' });
        }
        if (sprites.back_default) {
            items.push({ url: sprites.back_default, label: 'Mặt sau', category: 'default' });
        }
        if (sprites.front_female) {
            items.push({ url: sprites.front_female, label: 'Mặt trước (♀)', category: 'default' });
        }
        if (sprites.back_female) {
            items.push({ url: sprites.back_female, label: 'Mặt sau (♀)', category: 'default' });
        }

        // Shiny sprites
        if (sprites.front_shiny) {
            items.push({ url: sprites.front_shiny, label: 'Shiny mặt trước', category: 'shiny' });
        }
        if (sprites.back_shiny) {
            items.push({ url: sprites.back_shiny, label: 'Shiny mặt sau', category: 'shiny' });
        }
        if (sprites.front_shiny_female) {
            items.push({ url: sprites.front_shiny_female, label: 'Shiny mặt trước (♀)', category: 'shiny' });
        }
        if (sprites.back_shiny_female) {
            items.push({ url: sprites.back_shiny_female, label: 'Shiny mặt sau (♀)', category: 'shiny' });
        }

        // Official artwork
        if (sprites.other?.['official-artwork']?.front_default) {
            items.push({ url: sprites.other['official-artwork'].front_default, label: 'Artwork chính thức', category: 'artwork' });
        }
        if (sprites.other?.['official-artwork']?.front_shiny) {
            items.push({ url: sprites.other['official-artwork'].front_shiny, label: 'Artwork Shiny', category: 'artwork' });
        }

        // Dream World
        if (sprites.other?.dream_world?.front_default) {
            items.push({ url: sprites.other.dream_world.front_default, label: 'Dream World', category: 'artwork' });
        }

        // Home
        if (sprites.other?.home?.front_default) {
            items.push({ url: sprites.other.home.front_default, label: 'Pokémon HOME', category: 'artwork' });
        }
        if (sprites.other?.home?.front_shiny) {
            items.push({ url: sprites.other.home.front_shiny, label: 'HOME Shiny', category: 'artwork' });
        }

        // Showdown (animated)
        if (sprites.other?.showdown?.front_default) {
            items.push({ url: sprites.other.showdown.front_default, label: 'Showdown', category: 'animated' });
        }
        if (sprites.other?.showdown?.back_default) {
            items.push({ url: sprites.other.showdown.back_default, label: 'Showdown sau', category: 'animated' });
        }
        if (sprites.other?.showdown?.front_shiny) {
            items.push({ url: sprites.other.showdown.front_shiny, label: 'Showdown Shiny', category: 'animated' });
        }

        return items;
    }, [sprites]);

    // Filter sprites
    const filteredSprites = useMemo(() => {
        if (filter === 'all') return allSprites;
        return allSprites.filter(s => s.category === filter);
    }, [allSprites, filter]);

    // Count by category
    const counts = useMemo(() => {
        const result = { all: allSprites.length, default: 0, shiny: 0, artwork: 0, animated: 0 };
        allSprites.forEach(s => {
            result[s.category as keyof typeof result]++;
        });
        return result;
    }, [allSprites]);

    const categoryLabels: Record<Category, string> = {
        all: 'Tất cả',
        default: 'Mặc định',
        shiny: 'Shiny ✨',
        artwork: 'Artwork',
        animated: 'Động',
    };

    if (allSprites.length === 0) {
        return null;
    }

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>
                Bộ sưu tập hình ảnh
                <span className={styles.count}>({allSprites.length})</span>
            </h2>

            {/* Filter Tabs */}
            <div className={styles.filters}>
                {(['all', 'default', 'shiny', 'artwork', 'animated'] as Category[]).map(cat => (
                    counts[cat] > 0 && (
                        <button
                            key={cat}
                            className={`${styles.filterButton} ${filter === cat ? styles.active : ''}`}
                            onClick={() => setFilter(cat)}
                        >
                            {categoryLabels[cat]} ({counts[cat]})
                        </button>
                    )
                ))}
            </div>

            {/* Sprite Grid */}
            <div className={styles.grid}>
                {filteredSprites.map((sprite, index) => (
                    <motion.div
                        key={sprite.url}
                        className={styles.spriteCard}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.03 }}
                        onClick={() => setSelectedSprite(sprite)}
                    >
                        <div className={styles.spriteImage}>
                            <Image
                                src={sprite.url}
                                alt={`${pokemonName} - ${sprite.label}`}
                                width={96}
                                height={96}
                                style={{ objectFit: 'contain' }}
                                unoptimized
                            />
                        </div>
                        <span className={styles.spriteLabel}>{sprite.label}</span>
                    </motion.div>
                ))}
            </div>

            {/* Lightbox */}
            <AnimatePresence>
                {selectedSprite && (
                    <motion.div
                        className={styles.lightbox}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedSprite(null)}
                    >
                        <motion.div
                            className={styles.lightboxContent}
                            initial={{ scale: 0.5 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.5 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <button
                                className={styles.closeButton}
                                onClick={() => setSelectedSprite(null)}
                                aria-label="Đóng"
                            >
                                ✕
                            </button>
                            <Image
                                src={selectedSprite.url}
                                alt={`${pokemonName} - ${selectedSprite.label}`}
                                width={300}
                                height={300}
                                style={{ objectFit: 'contain' }}
                                unoptimized
                            />
                            <p className={styles.lightboxLabel}>{selectedSprite.label}</p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
