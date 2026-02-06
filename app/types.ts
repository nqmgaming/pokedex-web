/* Pokemon Types - Type definitions for the app */

/** Single Pokemon type (e.g., fire, water, grass) */
export interface PokemonType {
    type: {
        name: string;
        url: string;
    };
}

/** Pokemon stat (e.g., hp, attack, defense) */
export interface PokemonStat {
    base_stat: number;
    stat: {
        name: string;
        url: string;
    };
}

/** Pokemon sprites/images */
export interface PokemonSprites {
    front_default: string | null;
    back_default: string | null;
    front_shiny: string | null;
    back_shiny: string | null;
    front_female: string | null;
    back_female: string | null;
    front_shiny_female: string | null;
    back_shiny_female: string | null;
    other?: {
        'official-artwork'?: {
            front_default: string | null;
            front_shiny: string | null;
        };
        dream_world?: {
            front_default: string | null;
            front_female: string | null;
        };
        home?: {
            front_default: string | null;
            front_shiny: string | null;
            front_female: string | null;
            front_shiny_female: string | null;
        };
        showdown?: {
            front_default: string | null;
            back_default: string | null;
            front_shiny: string | null;
            back_shiny: string | null;
        };
    };
    versions?: {
        [generation: string]: {
            [game: string]: {
                front_default?: string | null;
                back_default?: string | null;
                front_shiny?: string | null;
                back_shiny?: string | null;
            };
        };
    };
}

/** Full Pokemon data from PokéAPI */
export interface Pokemon {
    id: number;
    name: string;
    types: PokemonType[];
    stats: PokemonStat[];
    sprites: PokemonSprites;
    height: number;
    weight: number;
    abilities: Array<{
        ability: {
            name: string;
            url: string;
        };
        is_hidden: boolean;
        slot: number;
    }>;
    moves: Array<{
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
    }>;
}

/** Simplified Pokemon for list display */
export interface PokemonBasic {
    name: string;
    url: string;
}

/** PokéAPI list response */
export interface PokemonListResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: PokemonBasic[];
}

/* ============================================
   Pokemon Species (from /pokemon-species/{id})
   ============================================ */

/** Flavor text entry for Pokemon species */
export interface FlavorTextEntry {
    flavor_text: string;
    language: {
        name: string;
        url: string;
    };
    version: {
        name: string;
        url: string;
    };
}

/** Genus (category) for Pokemon species */
export interface Genus {
    genus: string;
    language: {
        name: string;
        url: string;
    };
}

/** Pokemon Species data */
export interface PokemonSpecies {
    id: number;
    name: string;
    base_happiness: number;
    capture_rate: number;
    color: {
        name: string;
        url: string;
    };
    egg_groups: Array<{
        name: string;
        url: string;
    }>;
    evolution_chain: {
        url: string;
    };
    flavor_text_entries: FlavorTextEntry[];
    genera: Genus[];
    generation: {
        name: string;
        url: string;
    };
    growth_rate: {
        name: string;
        url: string;
    };
    habitat: {
        name: string;
        url: string;
    } | null;
    is_baby: boolean;
    is_legendary: boolean;
    is_mythical: boolean;
}

/* ============================================
   Evolution Chain (from /evolution-chain/{id})
   ============================================ */

/** Evolution trigger details */
export interface EvolutionDetail {
    gender: number | null;
    held_item: { name: string; url: string } | null;
    item: { name: string; url: string } | null;
    known_move: { name: string; url: string } | null;
    known_move_type: { name: string; url: string } | null;
    location: { name: string; url: string } | null;
    min_affection: number | null;
    min_beauty: number | null;
    min_happiness: number | null;
    min_level: number | null;
    needs_overworld_rain: boolean;
    party_species: { name: string; url: string } | null;
    party_type: { name: string; url: string } | null;
    relative_physical_stats: number | null;
    time_of_day: string;
    trade_species: { name: string; url: string } | null;
    trigger: {
        name: string;
        url: string;
    };
    turn_upside_down: boolean;
}

/** Chain link in evolution chain */
export interface ChainLink {
    is_baby: boolean;
    species: {
        name: string;
        url: string;
    };
    evolution_details: EvolutionDetail[];
    evolves_to: ChainLink[];
}

/** Full evolution chain data */
export interface EvolutionChain {
    id: number;
    baby_trigger_item: { name: string; url: string } | null;
    chain: ChainLink;
}

/* ============================================
   Abilities (from /ability/{id or name})
   ============================================ */

/** Ability effect entry */
export interface AbilityEffectEntry {
    effect: string;
    short_effect: string;
    language: {
        name: string;
        url: string;
    };
}

/** Full ability data */
export interface Ability {
    id: number;
    name: string;
    is_main_series: boolean;
    generation: {
        name: string;
        url: string;
    };
    effect_entries: AbilityEffectEntry[];
    names: Array<{
        name: string;
        language: {
            name: string;
            url: string;
        };
    }>;
}

/** Ability slot in Pokemon data */
export interface AbilitySlot {
    ability: {
        name: string;
        url: string;
    };
    is_hidden: boolean;
    slot: number;
}

/* ============================================
   Moves (from /move/{id or name})
   ============================================ */

/** Move data */
export interface Move {
    id: number;
    name: string;
    accuracy: number | null;
    power: number | null;
    pp: number;
    priority: number;
    damage_class: {
        name: string;
        url: string;
    };
    type: {
        name: string;
        url: string;
    };
    effect_entries: Array<{
        effect: string;
        short_effect: string;
        language: {
            name: string;
            url: string;
        };
    }>;
}

/** Move slot in Pokemon data */
export interface MoveSlot {
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

/* ============================================
   Type Relations (from /type/{id or name})
   ============================================ */

/** Type damage relations */
export interface TypeRelations {
    double_damage_from: Array<{ name: string; url: string }>;
    double_damage_to: Array<{ name: string; url: string }>;
    half_damage_from: Array<{ name: string; url: string }>;
    half_damage_to: Array<{ name: string; url: string }>;
    no_damage_from: Array<{ name: string; url: string }>;
    no_damage_to: Array<{ name: string; url: string }>;
}

/** Full type data */
export interface TypeData {
    id: number;
    name: string;
    damage_relations: TypeRelations;
    pokemon: Array<{
        slot: number;
        pokemon: {
            name: string;
            url: string;
        };
    }>;
    moves: Array<{
        name: string;
        url: string;
    }>;
}
