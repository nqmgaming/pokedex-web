'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import type { Pokemon, PokemonListResponse } from './types';
import PokemonList from './components/PokemonList';
import styles from './page.module.css';

// Dynamic import for ParticleBackground (heavy component)
const ParticleBackground = dynamic(
  () => import('./components/ParticleBackground'),
  { ssr: false }
);

// Pagination config
const POKEMON_PER_PAGE = 20;
const TOTAL_POKEMON = 1025; // Total Pokemon in API
const TOTAL_PAGES = Math.ceil(TOTAL_POKEMON / POKEMON_PER_PAGE);

/**
 * Home Page Content - Contains the actual page logic
 * Separated to wrap useSearchParams in Suspense
 */
function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get current page from URL params (default: 1)
  const currentPage = Math.max(1, Math.min(TOTAL_PAGES, parseInt(searchParams.get('page') || '1', 10)));

  // Fetch Pokemon for current page
  const fetchPokemons = useCallback(async (page: number) => {
    setIsLoading(true);
    setError(null);

    const offset = (page - 1) * POKEMON_PER_PAGE;

    try {
      // Step 1: Get list of Pokemon names/URLs
      const listResponse = await fetch(
        `https://pokeapi.co/api/v2/pokemon?limit=${POKEMON_PER_PAGE}&offset=${offset}`
      );

      if (!listResponse.ok) {
        throw new Error('Không thể kết nối đến server');
      }

      const listData: PokemonListResponse = await listResponse.json();

      // Step 2: Fetch details for each Pokemon in parallel
      const pokemonPromises = listData.results.map(async (item) => {
        const response = await fetch(item.url);
        if (!response.ok) {
          throw new Error(`Không thể lấy thông tin ${item.name}`);
        }
        const data: Pokemon = await response.json();
        return data;
      });

      const pokemonDetails = await Promise.all(pokemonPromises);

      // Sort by ID
      pokemonDetails.sort((a, b) => a.id - b.id);
      setPokemons(pokemonDetails);
    } catch (err) {
      console.error('Error fetching Pokemon:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Đã xảy ra lỗi khi tải dữ liệu Pokémon'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch when page changes
  useEffect(() => {
    fetchPokemons(currentPage);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage, fetchPokemons]);

  // Navigate to a specific page
  const goToPage = (page: number) => {
    if (page >= 1 && page <= TOTAL_PAGES) {
      router.push(`/?page=${page}`, { scroll: false });
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const showPages = 5; // Number of page buttons to show

    let start = Math.max(1, currentPage - Math.floor(showPages / 2));
    let end = Math.min(TOTAL_PAGES, start + showPages - 1);

    // Adjust start if we're near the end
    if (end - start < showPages - 1) {
      start = Math.max(1, end - showPages + 1);
    }

    // Always show first page
    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push('ellipsis');
    }

    // Middle pages
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Always show last page
    if (end < TOTAL_PAGES) {
      if (end < TOTAL_PAGES - 1) pages.push('ellipsis');
      pages.push(TOTAL_PAGES);
    }

    return pages;
  };

  return (
    <>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logo}>
            {/* Poké Ball Icon */}
            <svg
              className={styles.pokeballIcon}
              viewBox="0 0 100 100"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="50" cy="50" r="48" fill="#DC0A2D" stroke="#1D1D1D" strokeWidth="4" />
              <rect x="0" y="46" width="100" height="8" fill="#1D1D1D" />
              <circle cx="50" cy="50" r="48" fill="white" clipPath="url(#bottom)" />
              <defs>
                <clipPath id="bottom">
                  <rect x="0" y="50" width="100" height="50" />
                </clipPath>
              </defs>
              <circle cx="50" cy="50" r="16" fill="white" stroke="#1D1D1D" strokeWidth="4" />
              <circle cx="50" cy="50" r="8" fill="#1D1D1D" />
            </svg>
            <div>
              <h1 className={styles.title}>Pokédex</h1>
              <p className={styles.subtitle}>Bắt tất cả Pokémon!</p>
            </div>
          </div>

          {/* Page Info */}
          <div className={styles.pageInfo}>
            <span className={styles.pageNumber}>Trang {currentPage}</span>
            <span className={styles.pageTotal}>/ {TOTAL_PAGES}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        <PokemonList
          pokemons={pokemons}
          isLoading={isLoading}
          error={error}
          onRetry={() => fetchPokemons(currentPage)}
        />

        {/* Pagination */}
        {!isLoading && !error && (
          <nav className={styles.pagination}>
            {/* Previous Button */}
            <button
              className={`${styles.pageButton} ${styles.navButton}`}
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Trang trước"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Trước</span>
            </button>

            {/* Page Numbers */}
            <div className={styles.pageNumbers}>
              {getPageNumbers().map((page, index) => (
                page === 'ellipsis' ? (
                  <span key={`ellipsis-${index}`} className={styles.ellipsis}>...</span>
                ) : (
                  <button
                    key={page}
                    className={`${styles.pageButton} ${currentPage === page ? styles.active : ''}`}
                    onClick={() => goToPage(page)}
                    aria-label={`Trang ${page}`}
                    aria-current={currentPage === page ? 'page' : undefined}
                  >
                    {page}
                  </button>
                )
              ))}
            </div>

            {/* Next Button */}
            <button
              className={`${styles.pageButton} ${styles.navButton}`}
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === TOTAL_PAGES}
              aria-label="Trang sau"
            >
              <span>Sau</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </nav>
        )}
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>
          Dữ liệu từ{' '}
          <a href="https://pokeapi.co" target="_blank" rel="noopener noreferrer">
            PokéAPI
          </a>{' '}
          • Pokémon và các nhân vật liên quan là thương hiệu của Nintendo
        </p>
      </footer>
    </>
  );
}

/**
 * Loading fallback for Suspense
 */
function LoadingFallback() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logo}>
            <svg
              className={styles.pokeballIcon}
              viewBox="0 0 100 100"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="50" cy="50" r="48" fill="#DC0A2D" stroke="#1D1D1D" strokeWidth="4" />
              <rect x="0" y="46" width="100" height="8" fill="#1D1D1D" />
              <circle cx="50" cy="50" r="48" fill="white" clipPath="url(#bottom-loading)" />
              <defs>
                <clipPath id="bottom-loading">
                  <rect x="0" y="50" width="100" height="50" />
                </clipPath>
              </defs>
              <circle cx="50" cy="50" r="16" fill="white" stroke="#1D1D1D" strokeWidth="4" />
              <circle cx="50" cy="50" r="8" fill="#1D1D1D" />
            </svg>
            <div>
              <h1 className={styles.title}>Pokédex</h1>
              <p className={styles.subtitle}>Đang tải...</p>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}

/**
 * Home Page - Pokemon List with Pagination
 * Wrapped in Suspense for useSearchParams
 */
export default function Home() {
  return (
    <div className={styles.page}>
      {/* Particle Background */}
      <ParticleBackground />

      <Suspense fallback={<LoadingFallback />}>
        <HomeContent />
      </Suspense>
    </div>
  );
}
