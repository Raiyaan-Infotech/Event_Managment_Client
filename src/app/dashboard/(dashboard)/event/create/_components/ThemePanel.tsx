"use client"

import React, { useState } from "react"
import { Palette, ChevronDown, Check, RotateCcw, Smartphone, Zap } from "lucide-react"
import { THEMES, COLOR_PALETTES, EVENT_TYPES, ThemeConfig } from "./theme/themeConfig"
import { cn } from "@/lib/utils"
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
} from "@/components/ui/sidebar"

interface ThemePanelProps {
    onApplyTheme: (themeId: string, palette: string[], eventType: string) => void;
    onReset: () => void;
    currentThemeId: string;
    currentPalette: string[];
}

export default function ThemePanel({ onApplyTheme, onReset, currentThemeId, currentPalette }: ThemePanelProps) {
    const [eventName, setEventName] = useState("");
    const [selectedEventType, setSelectedEventType] = useState("");
    const [selectedLanguage, setSelectedLanguage] = useState("English");
    const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);
    const [selectedPaletteName, setSelectedPaletteName] = useState<string | null>(null);
    const [customPalette, setCustomPalette] = useState<string[]>(["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"]);
    const [isCustom, setIsCustom] = useState(false);
    const [isDesignsExpanded, setIsDesignsExpanded] = useState(true);
    const [isPaletteExpanded, setIsPaletteExpanded] = useState(true);
    const [showValidation, setShowValidation] = useState(false);

    const isComplete = eventName.trim() !== "" &&
        selectedEventType !== "" &&
        selectedLanguage !== "" &&
        selectedThemeId !== null &&
        selectedPaletteName !== null;

    const handleThemeSelect = (themeId: string) => {
        setSelectedThemeId(themeId);
        setIsCustom(false);
        // Removed automatic palette selection to keep radio buttons empty by default
    };

    const handlePaletteSelect = (name: string) => {
        setSelectedPaletteName(name);
        setIsCustom(false);
    };

    const handleCustomColorChange = (index: number, color: string) => {
        const newPalette = [...customPalette];
        newPalette[index] = color;
        setCustomPalette(newPalette);
        setIsCustom(true);
        setSelectedPaletteName("Custom");
    };

    const getActivePalette = () => {
        if (isCustom) return customPalette;
        if (selectedPaletteName && selectedPaletteName in COLOR_PALETTES) {
            return COLOR_PALETTES[selectedPaletteName as keyof typeof COLOR_PALETTES];
        }
        return currentPalette; // Use current applied palette as fallback
    };

    const filteredThemes = THEMES.filter(theme =>
        theme.eventTypes.includes(selectedEventType) || selectedEventType === "All"
    );

    return (
        <Sidebar
            side="right"
            collapsible="none"
            style={{ "--sidebar-width": "340px" } as React.CSSProperties}
            className="border-l border-border/50 bg-sidebar shadow-2xl h-full"
        >
            {/* Header */}
            <SidebarHeader className="h-[56px] border-b border-border/50 flex flex-col justify-center px-4 bg-sidebar/95 backdrop-blur-sm shrink-0">
                <div className="flex items-center gap-3">
                    <div className="size-10 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                        <Palette size={15} />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight leading-none mb-1">
                            Theme
                        </h2>
                        <p className="text-[10px] text-primary font-bold uppercase tracking-widest">
                            Customise UI
                        </p>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent className="chat-scrollbar overflow-y-scroll overflow-x-hidden">
                {/* Step 1: */}
                <div className="p-2 bg-slate-50/30 border-b border-border/50 space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[2px]">Step 1: Create Event</label>
                    <div className="space-y-2">
                        <input
                            type="text"
                            value={eventName}
                            onChange={(e) => setEventName(e.target.value)}
                            placeholder="Enter event name..."
                            className="w-full bg-white border border-slate-200 text-slate-800 text-sm font-semibold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                        />
                    </div>
                </div>

                {/* Event Type Section */}
                <div className="p-2 bg-slate-50/30 border-b border-border/50 space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[2px]">Step 2: Select Event Type</label>
                    <div className="relative group">
                        <select
                            value={selectedEventType}
                            onChange={(e) => {
                                const type = e.target.value;
                                setSelectedEventType(type);
                                if (type === "") {
                                    setSelectedThemeId(null);
                                    return;
                                }
                                const compatThemes = THEMES.filter(t => t.eventTypes.includes(type));
                                if (compatThemes.length > 0 && !compatThemes.some(t => t.id === selectedThemeId)) {
                                    setSelectedThemeId(null); // Force user to pick a compat theme
                                }
                            }}
                            className="w-full bg-white border border-slate-200 text-slate-800 text-sm font-semibold py-2 px-4 pr-10 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer shadow-sm"
                        >
                            <option value="">Select Event Type...</option>
                            {EVENT_TYPES.map(type => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-primary transition-colors" />
                    </div>
                </div>

                {/* Language Section */}
                <div className="p-2 bg-slate-50/30 border-b space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[2px]">Step 3: Language</label>
                    <div className="relative group">
                        <select
                            value={selectedLanguage}
                            onChange={(e) => setSelectedLanguage(e.target.value)}
                            className="w-full bg-white border border-slate-200 text-slate-800 text-sm font-semibold py-2 px-4 pr-10 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer shadow-sm"
                        >
                            <option value="English">English</option>
                            <option value="Tamil">Tamil</option>
                            <option value="Arabic">Arabic</option>
                            <option value="French">French</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                            <ChevronDown size={18} strokeWidth={2.5} />
                        </div>
                    </div>
                </div>

                <div className="p-2 space-y-8">
                    {/* Mobile Designs */}
                    <div className="space-y-4">
                        <button
                            onClick={() => setIsDesignsExpanded(!isDesignsExpanded)}
                            className="w-full flex items-center justify-between group/step"
                        >
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[2px] cursor-pointer group-hover/step:text-primary transition-colors">
                                Step 4: Choose Design Style
                            </label>
                            <ChevronDown
                                size={16}
                                className={cn(
                                    "text-slate-400 transition-transform duration-300",
                                    isDesignsExpanded ? "rotate-180" : "rotate-0"
                                )}
                            />
                        </button>

                        {isDesignsExpanded && (
                            <div className="space-y-3 transition-all duration-300">
                                {filteredThemes.map((theme) => (
                                    <button
                                        key={theme.id}
                                        onClick={() => handleThemeSelect(theme.id)}
                                        className={cn(
                                            "w-full flex items-center gap-4 p-3 rounded-2xl border transition-all text-left group",
                                            selectedThemeId === theme.id
                                                ? "border-primary bg-primary/5 ring-1 ring-primary"
                                                : "border-slate-100 bg-white hover:border-slate-300"
                                        )}
                                    >
                                        <div className="size-14 rounded-xl overflow-hidden shrink-0 shadow-sm">
                                            <img src={theme.image} alt={theme.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[12px] font-bold text-slate-800 leading-tight">{theme.name}</p>
                                            <p className="text-[10px] text-slate-400 font-medium truncate mt-1">{theme.description}</p>
                                        </div>
                                        {selectedThemeId === theme.id && (
                                            <div className="size-5 bg-primary rounded-full flex items-center justify-center text-white shrink-0">
                                                <Check size={12} strokeWidth={3} />
                                            </div>
                                        )}
                                    </button>
                                ))}
                                {filteredThemes.length === 0 && (
                                    <p className="text-xs text-slate-400 text-center py-4">
                                        {selectedEventType && selectedEventType !== ""
                                            ? "selected event type has no design choose another type"
                                            : "please select an event type."}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Color Palette */}
                    <div className="space-y-4">
                        <button
                            onClick={() => setIsPaletteExpanded(!isPaletteExpanded)}
                            className="w-full flex items-center justify-between group/step"
                        >
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[2px] cursor-pointer group-hover/step:text-primary transition-colors">
                                Step 5: Color Palette
                            </label>
                            <ChevronDown
                                size={16}
                                className={cn(
                                    "text-slate-400 transition-transform duration-300",
                                    isPaletteExpanded ? "rotate-180" : "rotate-0"
                                )}
                            />
                        </button>

                        {isPaletteExpanded && (
                            <div className="space-y-4 pt-1 transition-all duration-300">
                                {Object.entries(COLOR_PALETTES).map(([name, colors]) => (
                                    <div key={name} className="flex items-center justify-between group">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <div className="relative flex items-center justify-center">
                                                <input
                                                    type="radio"
                                                    name="palette"
                                                    checked={selectedPaletteName === name && !isCustom}
                                                    onChange={() => handlePaletteSelect(name)}
                                                    className="peer appearance-none size-5 rounded-full border-2 border-slate-200 checked:border-primary transition-all cursor-pointer"
                                                />
                                                <div className="absolute size-2.5 rounded-full bg-primary scale-0 peer-checked:scale-100 transition-transform" />
                                            </div>
                                            <span className={cn(
                                                "text-xs font-bold transition-colors",
                                                selectedPaletteName === name && !isCustom ? "text-primary" : "text-slate-600"
                                            )}>{name}</span>
                                        </label>
                                        <div className="flex gap-1.5 p-1.5 bg-slate-50 rounded-xl border border-slate-100">
                                            {colors.map((color, i) => (
                                                <div
                                                    key={i}
                                                    className="size-4 rounded-md shadow-sm border border-white/50"
                                                    style={{ backgroundColor: color }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                {/* Custom Palette */}
                                <div className="flex items-center justify-between pt-2">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <div className="relative flex items-center justify-center">
                                            <input
                                                type="radio"
                                                name="palette"
                                                checked={selectedPaletteName === "Custom" || isCustom}
                                                onChange={() => setIsCustom(true)}
                                                className="peer appearance-none size-5 rounded-full border-2 border-slate-200 checked:border-primary transition-all cursor-pointer"
                                            />
                                            <div className="absolute size-2.5 rounded-full bg-primary scale-0 peer-checked:scale-100 transition-transform" />
                                        </div>
                                        <span className={cn(
                                            "text-xs font-bold transition-colors",
                                            (selectedPaletteName === "Custom" || isCustom) ? "text-primary" : "text-slate-600"
                                        )}>Custom</span>
                                    </label>
                                    <div className="flex gap-1.5 p-1.5 bg-slate-50 rounded-xl border border-slate-100">
                                        {customPalette.map((color, i) => (
                                            <div key={i} className="relative size-4 rounded-md group/color cursor-pointer overflow-hidden border border-white/50">
                                                <input
                                                    type="color"
                                                    value={color}
                                                    onChange={(e) => handleCustomColorChange(i, e.target.value)}
                                                    className="absolute inset-0 size-full opacity-0 cursor-pointer"
                                                />
                                                <div className="size-full" style={{ backgroundColor: color }} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </SidebarContent>

            {/* Footer Buttons */}
            <div className="p-4 sm:p-6 border-t bg-slate-50/50 flex flex-col gap-3 sm:gap-4 shrink-0">
                {!isComplete && showValidation && (
                    <div className="bg-red-50 border border-red-100 p-2 sm:p-3 rounded-lg animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <p className="text-[9px] sm:text-[10px] text-red-500 font-black uppercase tracking-widest text-center">
                            Please complete all 5 steps
                        </p>
                    </div>
                )}

                <div className="flex gap-2 sm:gap-4">
                    <button
                        onClick={onReset}
                        className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-3 sm:py-4 px-2 sm:px-4 bg-white border border-red-200 text-red-500 rounded-sm text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-all shadow-sm"
                    >
                        <RotateCcw size={14} className="sm:size-4" /> Reset
                    </button>
                    <button
                        onClick={() => {
                            if (isComplete) {
                                if (selectedThemeId) {
                                    onApplyTheme(selectedThemeId, getActivePalette(), selectedEventType);
                                }
                            } else {
                                setShowValidation(true);
                                setTimeout(() => setShowValidation(false), 3000);
                            }
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-3 sm:py-4 px-2 sm:px-4 bg-primary text-white rounded-sm text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20"
                    >
                        Create Event
                    </button>
                </div>
            </div>
        </Sidebar>
    )
}
