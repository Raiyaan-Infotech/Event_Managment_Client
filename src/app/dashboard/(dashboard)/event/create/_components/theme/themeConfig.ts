export type ColorPalette = string[];

export interface ThemeConfig {
    id: string;
    name: string;
    description: string;
    image: string;
    eventTypes: string[];
}

export const EVENT_TYPES = ["Marriage", "Corporate Event", "Party", "Conference"];

export const COLOR_PALETTES: Record<string, ColorPalette> = {
    Winter: ["#F0F9FF", "#BAE6FD", "#38BDF8", "#0369A1", "#0C4A6E"],
    Summer: ["#FFFBEB", "#FEF3C7", "#FBBF24", "#B45309", "#78350F"],
    Spring: ["#F0FDF4", "#BBF7D0", "#4ADE80", "#15803D", "#064E3B"],
    Autumn: ["#FFF7ED", "#FFEDD5", "#FB923C", "#C2410C", "#7C2D12"],
    Corporate: ["#F8FAFC", "#E2E8F0", "#0F172A", "#334155", "#020617"],
    Traditional: ["#FFF7ED", "#FDE68A", "#B45309", "#78350F", "#451A03"],
};

export const THEMES: ThemeConfig[] = [
    {
        id: "south-indian-marriage",
        name: "South Indian Marriage Style",
        description: "Tamilnadu, Kerala, Andhra pradesh and Karnataka",
        image: "https://images.unsplash.com/photo-1532323544230-7191fd51bc1b?w=400&q=80",
        eventTypes: ["Marriage"],
    },
    {
        id: "corporate-event",
        name: "Corporate Event Design",
        description: "Professional and sleek design for business events",
        image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400&q=80",
        eventTypes: ["Corporate Event"],
    },
];
