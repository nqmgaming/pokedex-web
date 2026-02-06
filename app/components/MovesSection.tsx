'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './MovesSection.module.css';

interface MoveSlot {
    move: {
        name: string;
        url: string;
    };
    version_group_details: Array<{
        level_learned_at: number;
        move_learn_method: {
            name: string;
            url: string;
        };
        version_group: {
            name: string;
            url: string;
        };
    }>;
}

interface MovesSectionProps {
    moves: MoveSlot[];
}

interface MoveDetail {
    name: string;
    power: number | null;
    accuracy: number | null;
    pp: number;
    type: string;
    damageClass: string;
    effect: string;
}

type LearnMethod = 'all' | 'level-up' | 'machine' | 'egg' | 'tutor';

/**
 * MovesSection component
 * Displays Pokemon moves with filtering and detail dialog
 */
export default function MovesSection({ moves }: MovesSectionProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [filter, setFilter] = useState<LearnMethod>('all');
    const [selectedMove, setSelectedMove] = useState<{ name: string; url: string } | null>(null);
    const [moveDetail, setMoveDetail] = useState<MoveDetail | null>(null);
    const [isLoadingDetail, setIsLoadingDetail] = useState(false);

    // Fetch move detail from API
    const fetchMoveDetail = async (name: string, url: string) => {
        setSelectedMove({ name, url });
        setIsLoadingDetail(true);
        setMoveDetail(null);

        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();

            // Get English effect
            const effectEntry = data.effect_entries?.find(
                (e: { language: { name: string } }) => e.language.name === 'en'
            );

            setMoveDetail({
                name: data.name,
                power: data.power,
                accuracy: data.accuracy,
                pp: data.pp,
                type: data.type?.name || 'unknown',
                damageClass: data.damage_class?.name || 'status',
                effect: effectEntry?.short_effect || 'Không có mô tả.',
            });
        } catch (err) {
            console.error('Error fetching move:', err);
            setMoveDetail(null);
        } finally {
            setIsLoadingDetail(false);
        }
    };

    // Close dialog
    const closeDialog = () => {
        setSelectedMove(null);
        setMoveDetail(null);
    };

    // Process moves - get latest version group for each move
    const processedMoves = useMemo(() => {
        return moves.map((m) => {
            const latestDetail = m.version_group_details.reduce((latest, current) => {
                if (current.move_learn_method.name === 'level-up') {
                    return current;
                }
                return latest;
            }, m.version_group_details[0]);

            return {
                name: m.move.name,
                url: m.move.url,
                level: latestDetail?.level_learned_at || 0,
                method: latestDetail?.move_learn_method.name || 'unknown',
            };
        });
    }, [moves]);

    // Filter and sort moves
    const filteredMoves = useMemo(() => {
        let result = processedMoves;

        if (filter !== 'all') {
            result = result.filter((m) => m.method === filter);
        }

        return result.sort((a, b) => {
            if (filter === 'level-up') {
                return a.level - b.level;
            }
            return a.name.localeCompare(b.name);
        });
    }, [processedMoves, filter]);

    // Count moves by method
    const counts = useMemo(() => {
        const result = { all: processedMoves.length, 'level-up': 0, machine: 0, egg: 0, tutor: 0 };
        processedMoves.forEach((m) => {
            if (m.method in result) {
                result[m.method as keyof typeof result]++;
            }
        });
        return result;
    }, [processedMoves]);

    const getMethodLabel = (method: LearnMethod): string => {
        const labels: Record<LearnMethod, string> = {
            all: 'Tất cả',
            'level-up': 'Lên level',
            machine: 'TM/HM',
            egg: 'Di truyền',
            tutor: 'Gia sư',
        };
        return labels[method];
    };

    const getDamageClassLabel = (dc: string): string => {
        const labels: Record<string, string> = {
            physical: '⚔️ Vật lý',
            special: '✨ Đặc biệt',
            status: '🔮 Trạng thái',
        };
        return labels[dc] || dc;
    };

    if (moves.length === 0) {
        return null;
    }

    const displayMoves = isExpanded ? filteredMoves : filteredMoves.slice(0, 10);

    return (
        <div className={styles.container}>
            <div
                className={styles.header}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <h2 className={styles.title}>
                    Chiêu thức
                    <span className={styles.count}>({moves.length})</span>
                </h2>
                <svg
                    className={`${styles.chevron} ${isExpanded ? styles.expanded : ''}`}
                    width="20"
                    height="20"
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

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        className={styles.filters}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {(['all', 'level-up', 'machine', 'egg', 'tutor'] as LearnMethod[]).map(
                            (method) =>
                                counts[method] > 0 && (
                                    <button
                                        key={method}
                                        className={`${styles.filterButton} ${filter === method ? styles.active : ''}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setFilter(method);
                                        }}
                                    >
                                        {getMethodLabel(method)} ({counts[method]})
                                    </button>
                                )
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className={styles.moves}>
                {displayMoves.map((move, index) => (
                    <motion.div
                        key={move.name}
                        className={styles.move}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.02 }}
                        onClick={() => fetchMoveDetail(move.name, move.url)}
                    >
                        <span className={styles.moveName}>
                            {move.name.replace(/-/g, ' ')}
                        </span>
                        {move.method === 'level-up' && move.level > 0 && (
                            <span className={styles.moveLevel}>Lv.{move.level}</span>
                        )}
                        {move.method !== 'level-up' && (
                            <span className={styles.moveMethod}>
                                {getMethodLabel(move.method as LearnMethod)}
                            </span>
                        )}
                    </motion.div>
                ))}
            </div>

            {!isExpanded && filteredMoves.length > 10 && (
                <button
                    className={styles.showMore}
                    onClick={() => setIsExpanded(true)}
                >
                    Xem thêm {filteredMoves.length - 10} chiêu thức
                </button>
            )}

            {isExpanded && filteredMoves.length > 10 && (
                <button
                    className={styles.showMore}
                    onClick={() => setIsExpanded(false)}
                >
                    Thu gọn
                </button>
            )}

            {/* Move Detail Dialog */}
            <AnimatePresence>
                {selectedMove && (
                    <motion.div
                        className={styles.dialogOverlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeDialog}
                    >
                        <motion.div
                            className={styles.dialog}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button className={styles.closeButton} onClick={closeDialog}>
                                ✕
                            </button>

                            <h3 className={styles.dialogTitle}>
                                {selectedMove.name.replace(/-/g, ' ')}
                            </h3>

                            {isLoadingDetail ? (
                                <div className={styles.dialogLoading}>
                                    <div className={styles.spinner} />
                                    <span>Đang tải...</span>
                                </div>
                            ) : moveDetail ? (
                                <div className={styles.dialogContent}>
                                    {/* Type Badge */}
                                    <div className={styles.dialogType}>
                                        <span className={`${styles.typeBadge} type-${moveDetail.type}`}>
                                            {moveDetail.type}
                                        </span>
                                        <span className={styles.damageClass}>
                                            {getDamageClassLabel(moveDetail.damageClass)}
                                        </span>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className={styles.dialogStats}>
                                        <div className={styles.dialogStat}>
                                            <span className={styles.statLabel}>Sức mạnh</span>
                                            <span className={styles.statValue}>
                                                {moveDetail.power ?? '—'}
                                            </span>
                                        </div>
                                        <div className={styles.dialogStat}>
                                            <span className={styles.statLabel}>Độ chính xác</span>
                                            <span className={styles.statValue}>
                                                {moveDetail.accuracy ? `${moveDetail.accuracy}%` : '—'}
                                            </span>
                                        </div>
                                        <div className={styles.dialogStat}>
                                            <span className={styles.statLabel}>PP</span>
                                            <span className={styles.statValue}>{moveDetail.pp}</span>
                                        </div>
                                    </div>

                                    {/* Effect */}
                                    <div className={styles.dialogEffect}>
                                        <p>{moveDetail.effect}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className={styles.dialogError}>
                                    Không thể tải thông tin chiêu thức
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
