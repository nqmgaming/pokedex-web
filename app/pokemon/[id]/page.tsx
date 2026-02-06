import type { Metadata } from 'next';
import PokemonDetailClient from './PokemonDetailClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://pokemon.pwhs.app/';

interface Props {
    params: Promise<{ id: string }>;
}

/**
 * Generate dynamic metadata for Pokemon detail page
 * Supports Open Graph for social sharing and deep linking
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;

    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`, {
            next: { revalidate: 86400 }, // Cache for 24 hours
        });
        if (!response.ok) throw new Error('Pokemon not found');

        const pokemon = await response.json();
        const pokemonName = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
        const pokemonId = String(pokemon.id).padStart(3, '0');
        const spriteUrl = pokemon.sprites?.other?.['official-artwork']?.front_default
            || pokemon.sprites?.front_default
            || '';

        const title = `${pokemonName} #${pokemonId} | Pokédex`;
        const description = `Xem thông tin chi tiết về ${pokemonName}: chỉ số, chiêu thức, tiến hóa và hơn thế nữa!`;
        const pageUrl = `${SITE_URL}/pokemon/${id}`;

        // Deep link URL for mobile app
        const appDeepLink = `pokemon://pokemon/${id}`;

        return {
            title,
            description,
            alternates: {
                canonical: pageUrl,
            },
            openGraph: {
                title,
                description,
                url: pageUrl,
                siteName: 'Pokédex',
                images: spriteUrl ? [
                    {
                        url: spriteUrl,
                        width: 475,
                        height: 475,
                        alt: pokemonName,
                    },
                ] : [],
                locale: 'vi_VN',
                type: 'website',
            },
            twitter: {
                card: 'summary',
                title,
                description,
                images: spriteUrl ? [spriteUrl] : [],
            },
            other: {
                // Android App Links
                'al:android:url': appDeepLink,
                'al:android:package': 'app.pwhs.pokemon',
                'al:android:app_name': 'Pokédex',
                // iOS App Links (for future use)
                'al:ios:url': appDeepLink,
                'al:ios:app_name': 'Pokédex',
                // Web fallback
                'al:web:url': pageUrl,
            },
        };
    } catch {
        return {
            title: 'Pokemon | Pokédex',
            description: 'Xem thông tin chi tiết về Pokemon trong Pokédex!',
        };
    }
}

/**
 * Pokemon Detail Page (Server Component wrapper)
 * Renders the client component with metadata support
 */
export default async function PokemonDetailPage({ params }: Props) {
    return <PokemonDetailClient params={params} />;
}
