"use client"

import React, { useState, useEffect } from "react"
import {
    ChevronDown,
    ChevronUp,
    Minus,
    Plus,
    Type,
    ImageIcon,
    Palette,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Bold,
    Italic,
    Underline,
    RotateCcw,
    Save,
    Trash2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { BuilderNode, CanvasElement, ScreenType } from "./types"
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarFooter,
} from "@/components/ui/sidebar"

interface CustomizePanelProps {
    selectedNode: BuilderNode | null;
    onUpdateProps: (id: string, props: any) => void;
    onUpdateElements: (nodeId: string, elements: CanvasElement[]) => void;
    onReset: () => void;
    numSplashScreens: number;
    onUpdateNumSplashScreens: (count: number) => void;
}

export default function CustomizePanel({
    selectedNode,
    onUpdateProps,
    onUpdateElements,
    onReset,
    numSplashScreens,
    onUpdateNumSplashScreens
}: CustomizePanelProps) {
    const [expanded, setExpanded] = useState<string | null>("background")
    const [imageError, setImageError] = useState<string | null>(null)
    const [iconError, setIconError] = useState<string | null>(null)
    const [iconMode, setIconMode] = useState<"default" | "custom">("default")

    useEffect(() => {
        if (selectedNode) {
            const mapping = getElementIdMapping(selectedNode.type as ScreenType)
            const icon = selectedNode.elements?.find(el => el.id === mapping.icon)
            setIconMode(icon?.content ? "custom" : "default")
        }
    }, [selectedNode?.id])

    if (!selectedNode) return null

    const { id, type, props, elements = [] } = selectedNode

    // Accordion toggle
    const toggle = (id: string) => {
        setExpanded(expanded === id ? null : id)
        setIconError(null)
    }

    // Helper to find specific elements for Title/Description
    const getElementIdMapping = (screenType: ScreenType) => {
        switch (screenType) {
            case "splash": return { title: "splash-title", desc: "splash-description", icon: "splash-icon" };
            case "splash2": return { title: "splash2-title", desc: "splash2-description", icon: "splash2-icon" };
            case "splash3": return { title: "splash3-title", desc: "splash3-description", icon: "splash3-icon" };
            case "register": return { title: "reg-title", desc: "reg-description", icon: "reg-icon" };
            case "login": return { title: "login-title", desc: "login-description", icon: "login-icon" };
            case "home": return { title: "home-title", desc: "home-description", icon: "home-icon" };
            case "agenda": return { title: "agenda-title", desc: "agenda-description", icon: "agenda-icon", list: "agenda-list" };
            case "relatives": return { title: "relatives-title", desc: "relatives-description", icon: "relatives-icon", list: "relatives-list" };
            case "participants": return { title: "participants-title", desc: "participants-description", icon: "participants-icon" };
            case "eventInfo": return { title: "event-title", desc: "event-description", icon: "event-icon" };
            case "venue": return { title: "venue-title", desc: "venue-description", icon: "venue-icon" };
            case "theme": return { title: "theme-title", desc: "theme-description", icon: "theme-icon", list: "theme-agenda", relatives: "theme-relatives" };
            default: return { title: "", desc: "", icon: "" };
        }
    }

    const mapping = getElementIdMapping(type)
    const titleElement = elements.find(el => el.id === mapping.title)
    const descElement = elements.find(el => el.id === mapping.desc)
    const iconElement = elements.find(el => el.id === mapping.icon)
    const listElement = elements.find(el => el.id === (mapping as any).list)
    const secondaryListElement = elements.find(el => el.id === (mapping as any).relatives)

    const updateElement = (elementId: string, updates: Partial<CanvasElement>) => {
        const newElements = elements.map(el =>
            el.id === elementId ? { ...el, ...updates, style: { ...el.style, ...(updates.style || {}) } } : el
        )
        onUpdateElements(id, newElements as CanvasElement[])
    }

    const updateElementStyle = (elementId: string, styleUpdates: any) => {
        const el = elements.find(e => e.id === elementId)
        if (!el) return
        updateElement(elementId, { style: { ...el.style, ...styleUpdates } })
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        setImageError(null)

        if (!file) return

        // Check format
        const validTypes = ['image/jpeg', 'image/jpg']
        if (!validTypes.includes(file.type)) {
            setImageError("Only JPG/JPEG files are accepted")
            return
        }

        // Check size (20MB)
        const maxSize = 20 * 1024 * 1024
        if (file.size > maxSize) {
            setImageError("File size must be under 20MB")
            return
        }

        const reader = new FileReader()
        reader.onload = (event) => {
            if (event.target?.result) {
                onUpdateProps(id, { bgImage: event.target.result as string, backgroundType: "image" })
            }
        }
        reader.readAsDataURL(file)
    }

    const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        setIconError(null)

        if (!file) return

        // Check format - PNG only
        if (file.type !== 'image/png') {
            setIconError("Only PNG files are accepted")
            return
        }

        // Check size (2MB)
        const maxSize = 2 * 1024 * 1024
        if (file.size > maxSize) {
            setIconError("File size must be under 2MB")
            return
        }

        const reader = new FileReader()
        reader.onload = (event) => {
            if (event.target?.result && iconElement) {
                updateElement(iconElement.id, { content: event.target.result as string })
            }
        }
        reader.readAsDataURL(file)
    }

    // Sync bgType with props
    const bgType = props.backgroundType || (props.bgImage ? "image" : "color")
    const setBgType = (type: "color" | "image") => onUpdateProps(id, { backgroundType: type })

    const toggleStyle = (elementId: string, key: string, value: string, defaultValue: string = "normal") => {
        const el = elements.find(e => e.id === elementId)
        if (!el) return
        const currentStyle = el.style || {}
        const isSet = (currentStyle as any)[key] === value
        updateElementStyle(elementId, { [key]: isSet ? defaultValue : value })
    }

    const deleteElement = (elementId: string) => {
        const newElements = elements.filter(el => el.id !== elementId)
        onUpdateElements(id, newElements)
    }

    return (
        <Sidebar
            side="right"
            collapsible="none"
            style={{ "--sidebar-width": "340px" } as React.CSSProperties}
            className="border-l border-border/50 bg-sidebar shadow-2xl h-full"
        >
            {/* Header */}
            <SidebarHeader className="h-[52px] border-b border-border/50 flex flex-col justify-center px-4 bg-sidebar/95 backdrop-blur-sm shrink-0">
                <div className="flex items-center gap-2.5">
                    <div className="size-9 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                        <Palette size={16} />
                    </div>
                    <div>
                        <h2 className="text-[13px] font-black text-slate-800 uppercase tracking-tight leading-none mb-1">Theme</h2>
                        <p className="text-[9px] text-primary font-bold uppercase tracking-widest">Customize UI</p>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent className="chat-scrollbar overflow-y-auto pb-20">
                {/* No of Screen Control - Only for Splash */}
                {(type === "splash" || type === "splash2" || type === "splash3") && (
                    <div className="p-4 bg-slate-50/30 border-b border-border/50 space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Step 1: Screen Count</p>
                                <p className="text-[9px] text-slate-400 font-bold">(Maximum 3 screens)</p>
                            </div>
                            <div className="flex items-center bg-white rounded-xl p-1 gap-2 border border-slate-200 shadow-sm">
                                <button
                                    onClick={() => onUpdateNumSplashScreens(Math.max(1, numSplashScreens - 1))}
                                    className="size-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-600 hover:text-primary transition-all active:scale-90"
                                >
                                    <Minus size={14} />
                                </button>
                                <span className="text-sm font-black text-slate-800 px-2 min-w-[30px] text-center">{numSplashScreens}</span>
                                <button
                                    onClick={() => onUpdateNumSplashScreens(Math.min(3, numSplashScreens + 1))}
                                    className="size-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-600 hover:text-primary transition-all active:scale-90"
                                >
                                    <Plus size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* BACKGROUND SECTION */}
                <div className="border-b border-border/50 group">
                    <button
                        onClick={() => toggle("background")}
                        className="w-full h-11 px-4 flex items-center justify-between hover:bg-slate-50 transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-[11px] font-black text-slate-800 uppercase tracking-[2px]">Background</span>
                        </div>
                        {expanded === "background" ? <ChevronUp size={14} className="text-primary" /> : <ChevronDown size={14} className="text-slate-300" />}
                    </button>
                    {expanded === "background" && (
                        <div className="px-4 pb-5 pt-0 space-y-4 animate-in slide-in-from-top-2 duration-200">
                            <div className="flex gap-4 p-0.5 bg-slate-100 rounded-lg w-fit">
                                <button
                                    onClick={() => setBgType("color")}
                                    className={cn(
                                        "px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest transition-all",
                                        bgType === "color" ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
                                    )}
                                >
                                    Color
                                </button>
                                <button
                                    onClick={() => setBgType("image")}
                                    className={cn(
                                        "px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest transition-all",
                                        bgType === "image" ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
                                    )}
                                >
                                    Image
                                </button>
                            </div>

                            {bgType === "color" ? (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Color</label>
                                    <div className="flex items-center gap-3 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm transition-all group-hover:border-slate-300">
                                        <div
                                            className="size-8 rounded-lg shadow-inner ring-1 ring-slate-200 overflow-hidden shrink-0 relative"
                                            style={{ backgroundColor: String(props?.bgColor || "#FFFFFF") }}
                                        >
                                            <input
                                                key={`${id}-bg-color`}
                                                type="color"
                                                value={String(props?.bgColor || "#FFFFFF")}
                                                onChange={(e) => onUpdateProps(id, { bgColor: e.target.value })}
                                                className="absolute inset-0 size-full opacity-0 cursor-pointer"
                                            />
                                        </div>
                                        <input
                                            key={`${id}-bg-text`}
                                            type="text"
                                            value={String(props?.bgColor || "#FFFFFF")}
                                            onChange={(e) => onUpdateProps(id, { bgColor: e.target.value })}
                                            className="flex-1 bg-transparent text-[13px] font-black text-slate-700 uppercase tracking-widest outline-none"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="relative group/upload h-16">
                                        <input
                                            type="file"
                                            accept=".jpg,.jpeg"
                                            onChange={handleImageUpload}
                                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                        />
                                        <div className="size-full border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-1.5 group-hover/upload:border-primary group-hover/upload:bg-primary/5 transition-all text-slate-400 group-hover/upload:text-primary">
                                            {props.bgImage ? (
                                                <div className="flex items-center gap-3 overflow-hidden px-4">
                                                    <div className="size-10 rounded-lg overflow-hidden border border-slate-200 ring-2 ring-white shadow-sm shrink-0">
                                                        <img src={props.bgImage} className="size-full object-cover" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <span className="text-[9px] font-black uppercase block truncate text-slate-800">Background Mask</span>
                                                        <span className="text-[8px] font-bold text-primary block mt-0.5 underline">Change Image</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <ImageIcon size={16} />
                                                    <div className="text-center">
                                                        <span className="text-[9px] font-black uppercase tracking-widest block">Upload JPG</span>
                                                        <span className="text-[8px] font-bold text-slate-300">Under 20MB</span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    {imageError && (
                                        <div className="flex items-center gap-2 bg-red-50 p-2.5 rounded-xl border border-red-100 animate-in fade-in slide-in-from-top-1">
                                            <div className="size-1.5 rounded-full bg-red-500 animate-pulse" />
                                            <p className="text-[9px] text-red-500 font-black uppercase tracking-widest">
                                                {imageError}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ICON SECTION */}
                <div className="border-b border-border/50 group">
                    <div className="w-full flex items-center pr-4">
                        <button
                            onClick={() => toggle("icon")}
                            className="flex-1 h-11 px-4 flex items-center justify-between hover:bg-slate-50 transition-all text-left"
                        >
                            <span className="text-[11px] font-black text-slate-800 uppercase tracking-[2px]">Icon</span>
                            {expanded === "icon" ? <ChevronUp size={14} className="text-primary" /> : <ChevronDown size={14} className="text-slate-300" />}
                        </button>
                        {iconElement && (
                            <button
                                onClick={() => deleteElement(iconElement.id)}
                                className="size-7 rounded-lg flex items-center justify-center text-red-300 hover:text-red-500 hover:bg-red-50 transition-all active:scale-90"
                                title="Delete Icon"
                            >
                                <Trash2 size={13} />
                            </button>
                        )}
                    </div>
                    {expanded === "icon" && (
                        <div className="px-4 pb-5 pt-0 space-y-4 animate-in slide-in-from-top-2">
                            {!iconElement ? (
                                <button
                                    onClick={() => {
                                        const mapping = getElementIdMapping(type);
                                        const newElements = [...elements, {
                                            id: mapping.icon,
                                            type: "icon",
                                            x: 145, y: 80, width: 100, height: 100,
                                            style: { backgroundColor: "#F3F4F6", borderRadius: "24px", color: "#4F46E5" }
                                        }];
                                        onUpdateElements(id, newElements as CanvasElement[]);
                                    }}
                                    className="w-full h-20 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5 transition-all text-slate-400 hover:text-primary group"
                                >
                                    <Plus size={20} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Add Icon</span>
                                </button>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex gap-1.5 p-0.5 bg-slate-100 rounded-lg w-full">
                                        <button
                                            onClick={() => {
                                                setIconMode("default")
                                                updateElement(iconElement.id, { content: "" })
                                            }}
                                            className={cn(
                                                "flex-1 py-1 rounded-md text-[9px] font-black uppercase tracking-widest transition-all",
                                                iconMode === "default" ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
                                            )}
                                        >
                                            Default
                                        </button>
                                        <button
                                            onClick={() => setIconMode("custom")}
                                            className={cn(
                                                "flex-1 py-1 rounded-md text-[9px] font-black uppercase tracking-widest transition-all",
                                                iconMode === "custom" ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
                                            )}
                                        >
                                            Custom
                                        </button>
                                    </div>

                                    {iconMode === "custom" && (
                                        <div className="relative group/upload h-16 animate-in zoom-in-95 duration-200">
                                            <input
                                                type="file"
                                                accept=".png"
                                                onChange={handleIconUpload}
                                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                            />
                                            <div className="size-full border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-1.5 group-hover/upload:border-primary group-hover/upload:bg-primary/5 transition-all text-slate-400 group-hover/upload:text-primary overflow-hidden">
                                                {iconElement.content ? (
                                                    <div className="flex items-center gap-4 px-4 w-full">
                                                        <div className="size-11 rounded-lg overflow-hidden border border-slate-200 ring-2 ring-white shadow-md shrink-0 bg-white flex items-center justify-center">
                                                            <img src={iconElement.content} className="size-full object-contain" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <span className="text-[9px] font-black uppercase block truncate text-slate-800 tracking-wider">Icon Active</span>
                                                            <span className="text-[8px] font-bold text-primary block mt-0.5 underline uppercase italic">Change PNG</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <Plus size={16} className="text-slate-300" />
                                                        <div className="text-center">
                                                            <span className="text-[9px] font-black uppercase tracking-widest block">Upload PNG</span>
                                                            <span className="text-[8px] font-bold text-slate-300">Size under 2MB</span>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {iconError && (
                                        <div className="flex items-center gap-2 bg-red-50 p-2.5 rounded-xl border border-red-100 animate-in fade-in slide-in-from-top-1">
                                            <div className="size-1.5 rounded-full bg-red-500 animate-pulse" />
                                            <p className="text-[9px] text-red-500 font-black uppercase tracking-widest">{iconError}</p>
                                        </div>
                                    )}

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alignment</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                { label: 'Left', icon: AlignLeft, x: 45 },
                                                { label: 'Center', icon: AlignCenter, x: 145 },
                                                { label: 'Right', icon: AlignRight, x: 245 }
                                            ].map((align) => (
                                                <button
                                                    key={align.label}
                                                    onClick={() => updateElement(iconElement.id, { x: align.x })}
                                                    className={cn(
                                                        "h-9 rounded-lg border flex flex-col items-center justify-center transition-all",
                                                        iconElement.x === align.x
                                                            ? "bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-102"
                                                            : "bg-white border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600"
                                                    )}
                                                >
                                                    <align.icon size={13} />
                                                    <span className="text-[8px] font-black uppercase tracking-tighter mt-0.5">{align.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* TITLE SECTION */}
                <div className="border-b border-border/50 group">
                    <div className="w-full flex items-center pr-4">
                        <button
                            onClick={() => toggle("title")}
                            className="flex-1 h-11 px-4 flex items-center justify-between hover:bg-slate-50 transition-all text-left"
                        >
                            <span className="text-[11px] font-black text-slate-800 uppercase tracking-[2px]">Title</span>
                            {expanded === "title" ? <ChevronUp size={14} className="text-primary" /> : <ChevronDown size={14} className="text-slate-300" />}
                        </button>
                        {titleElement && (
                            <button
                                onClick={() => deleteElement(titleElement.id)}
                                className="size-7 rounded-lg flex items-center justify-center text-red-300 hover:text-red-500 hover:bg-red-50 transition-all active:scale-90"
                                title="Delete Title"
                            >
                                <Trash2 size={13} />
                            </button>
                        )}
                    </div>
                    {expanded === "title" && (
                        <div className="px-4 pb-5 pt-0 space-y-4 animate-in slide-in-from-top-2">
                            {!titleElement ? (
                                <button
                                    onClick={() => {
                                        const mapping = getElementIdMapping(type);
                                        const newElements = [...elements, {
                                            id: mapping.title,
                                            type: "text",
                                            x: 37, y: 200, width: 300, height: 40,
                                            content: "Title Text",
                                            style: { fontSize: "32px", fontWeight: "900", color: "#111827", textAlign: "center" }
                                        }];
                                        onUpdateElements(id, newElements as CanvasElement[]);
                                    }}
                                    className="w-full h-20 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5 transition-all text-slate-400 hover:text-primary"
                                >
                                    <Plus size={20} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Add Title</span>
                                </button>
                            ) : (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center px-1">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Content</label>
                                            <span className="text-[9px] font-bold text-slate-300 uppercase tracking-wider">{(titleElement?.content || "").length}/25</span>
                                        </div>
                                        <textarea
                                            maxLength={25}
                                            value={titleElement?.content || ""}
                                            onChange={(e) => updateElement(titleElement.id, { content: e.target.value })}
                                            className="w-full p-3 bg-white border border-slate-200 rounded-xl text-[13px] font-bold text-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none min-h-[70px] chat-scrollbar shadow-sm transition-all"
                                            placeholder="Enter title text..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Color</label>
                                            <div className="flex items-center gap-3 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm relative group/input">
                                                <div
                                                    className="size-7 rounded-lg border border-slate-200 shrink-0 relative overflow-hidden ring-1 ring-white"
                                                    style={{ backgroundColor: String(titleElement?.style?.color || "#111827") }}
                                                >
                                                    <input
                                                        type="color"
                                                        value={String(titleElement?.style?.color || "#111827")}
                                                        onChange={(e) => updateElementStyle(titleElement.id, { color: e.target.value })}
                                                        className="absolute inset-0 size-full opacity-0 cursor-pointer"
                                                    />
                                                </div>
                                                <span className="text-[10px] font-black text-slate-500 font-mono uppercase truncate">{String(titleElement?.style?.color || "#111827")}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Size</label>
                                            <div className="flex items-center bg-white rounded-lg p-0.5 gap-1 border border-slate-200 shadow-sm">
                                                <button
                                                    onClick={() => {
                                                        const cur = parseInt(titleElement.style?.fontSize || "32")
                                                        updateElementStyle(titleElement.id, { fontSize: `${Math.max(8, cur - 1)}px` })
                                                    }}
                                                    className="size-6 bg-slate-50 rounded-md flex items-center justify-center text-slate-400 hover:text-primary transition-all active:scale-90"
                                                >
                                                    <Minus size={11} />
                                                </button>
                                                <span className="text-[10px] font-black text-slate-800 flex-1 text-center">{parseInt(titleElement?.style?.fontSize || "32")}</span>
                                                <button
                                                    onClick={() => {
                                                        const cur = parseInt(titleElement.style?.fontSize || "32")
                                                        updateElementStyle(titleElement.id, { fontSize: `${Math.min(120, cur + 1)}px` })
                                                    }}
                                                    className="size-6 bg-slate-50 rounded-md flex items-center justify-center text-slate-400 hover:text-primary transition-all active:scale-90"
                                                >
                                                    <Plus size={11} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Text Style</label>
                                        <div className="flex gap-1.5 p-0.5 bg-slate-100 rounded-lg w-fit">
                                            {[
                                                { id: 'bold', icon: Bold, key: 'fontWeight', target: 'bold', def: 'normal' },
                                                { id: 'italic', icon: Italic, key: 'fontStyle', target: 'italic', def: 'normal' },
                                                { id: 'underline', icon: Underline, key: 'textDecoration', target: 'underline', def: 'none' }
                                            ].map((style) => {
                                                const isActive = (titleElement?.style as any)[style.key] === style.target;
                                                return (
                                                    <button
                                                        key={style.id}
                                                        onClick={() => toggleStyle(titleElement.id, style.key, style.target, style.def)}
                                                        className={cn(
                                                            "size-8 rounded-md flex items-center justify-center transition-all",
                                                            isActive ? "bg-white text-primary shadow-sm ring-1 ring-slate-200" : "text-slate-400 hover:text-slate-600"
                                                        )}
                                                    >
                                                        <style.icon size={12} strokeWidth={isActive ? 3 : 2} />
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alignment</label>
                                        <div className="grid grid-cols-3 gap-1.5 p-0.5 bg-slate-100 rounded-lg">
                                            {['Left', 'Center', 'Right'].map((align) => {
                                                const isActive = titleElement?.style?.textAlign === align.toLowerCase();
                                                return (
                                                    <button
                                                        key={align}
                                                        onClick={() => updateElementStyle(titleElement.id, { textAlign: align.toLowerCase() })}
                                                        className={cn(
                                                            "h-7.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest transition-all",
                                                            isActive ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
                                                        )}
                                                    >
                                                        {align}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* DESCRIPTION SECTION */}
                <div className="border-b border-border/50 group">
                    <div className="w-full flex items-center pr-4">
                        <button
                            onClick={() => toggle("desc")}
                            className="flex-1 h-11 px-4 flex items-center justify-between hover:bg-slate-50 transition-all text-left"
                        >
                            <span className="text-[11px] font-black text-slate-800 uppercase tracking-[2px]">Description</span>
                            {expanded === "desc" ? <ChevronUp size={14} className="text-primary" /> : <ChevronDown size={14} className="text-slate-300" />}
                        </button>
                        {descElement && (
                            <button
                                onClick={() => deleteElement(descElement.id)}
                                className="size-7 rounded-lg flex items-center justify-center text-red-300 hover:text-red-500 hover:bg-red-50 transition-all active:scale-90"
                                title="Delete Description"
                            >
                                <Trash2 size={13} />
                            </button>
                        )}
                    </div>
                    {expanded === "desc" && (
                        <div className="px-4 pb-5 pt-0 space-y-4 animate-in slide-in-from-top-2">
                            {!descElement ? (
                                <button
                                    onClick={() => {
                                        const mapping = getElementIdMapping(type);
                                        const newElements = [...elements, {
                                            id: mapping.desc,
                                            type: "text",
                                            x: 37, y: 250, width: 300, height: 60,
                                            content: "Description Text",
                                            style: { fontSize: "16px", fontWeight: "medium", color: "#6B7280", textAlign: "center" }
                                        }];
                                        onUpdateElements(id, newElements as CanvasElement[]);
                                    }}
                                    className="w-full h-20 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5 transition-all text-slate-400 hover:text-primary"
                                >
                                    <Plus size={20} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Add Description</span>
                                </button>
                            ) : (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center px-1">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Content</label>
                                            <span className="text-[9px] font-bold text-slate-300 uppercase tracking-wider">{(descElement?.content || "").length}/50</span>
                                        </div>
                                        <textarea
                                            maxLength={50}
                                            value={descElement?.content || ""}
                                            onChange={(e) => updateElement(descElement.id, { content: e.target.value })}
                                            className="w-full p-3 bg-white border border-slate-200 rounded-xl text-[13px] font-bold text-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none min-h-[90px] chat-scrollbar shadow-sm transition-all"
                                            placeholder="Enter description text..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Color</label>
                                            <div className="flex items-center gap-3 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm relative group/input">
                                                <div
                                                    className="size-7 rounded-lg border border-slate-200 shrink-0 relative overflow-hidden ring-1 ring-white"
                                                    style={{ backgroundColor: String(descElement?.style?.color || "#6B7280") }}
                                                >
                                                    <input
                                                        type="color"
                                                        value={String(descElement?.style?.color || "#6B7280")}
                                                        onChange={(e) => updateElementStyle(descElement.id, { color: e.target.value })}
                                                        className="absolute inset-0 size-full opacity-0_cursor-pointer"
                                                    />
                                                </div>
                                                <span className="text-[10px] font-black text-slate-500 font-mono uppercase truncate">{String(descElement?.style?.color || "#6B7280")}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Size</label>
                                            <div className="flex items-center bg-white rounded-lg p-0.5 gap-1 border border-slate-200 shadow-sm">
                                                <button
                                                    onClick={() => {
                                                        const cur = parseInt(descElement.style?.fontSize || "16")
                                                        updateElementStyle(descElement.id, { fontSize: `${Math.max(8, cur - 1)}px` })
                                                    }}
                                                    className="size-6 bg-slate-50 rounded-md flex items-center justify-center text-slate-400 hover:text-primary transition-all active:scale-90"
                                                >
                                                    <Minus size={11} />
                                                </button>
                                                <span className="text-[10px] font-black text-slate-800 flex-1 text-center">{parseInt(descElement?.style?.fontSize || "16")}</span>
                                                <button
                                                    onClick={() => {
                                                        const cur = parseInt(descElement.style?.fontSize || "16")
                                                        updateElementStyle(descElement.id, { fontSize: `${Math.min(120, cur + 1)}px` })
                                                    }}
                                                    className="size-6 bg-slate-50 rounded-md flex items-center justify-center text-slate-400 hover:text-primary transition-all active:scale-90"
                                                >
                                                    <Plus size={11} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Text Style</label>
                                        <div className="flex gap-1.5 p-0.5 bg-slate-100 rounded-lg w-fit">
                                            {[
                                                { id: 'bold', icon: Bold, key: 'fontWeight', target: 'bold', def: 'normal' },
                                                { id: 'italic', icon: Italic, key: 'fontStyle', target: 'italic', def: 'normal' },
                                                { id: 'underline', icon: Underline, key: 'textDecoration', target: 'underline', def: 'none' }
                                            ].map((style) => {
                                                const isActive = (descElement?.style as any)[style.key] === style.target;
                                                return (
                                                    <button
                                                        key={style.id}
                                                        onClick={() => toggleStyle(descElement.id, style.key, style.target, style.def)}
                                                        className={cn(
                                                            "size-8 rounded-md flex items-center justify-center transition-all",
                                                            isActive ? "bg-white text-primary shadow-sm ring-1 ring-slate-200" : "text-slate-400 hover:text-slate-600"
                                                        )}
                                                    >
                                                        <style.icon size={12} strokeWidth={isActive ? 3 : 2} />
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alignment</label>
                                        <div className="grid grid-cols-3 gap-1.5 p-0.5 bg-slate-100 rounded-lg">
                                            {['Left', 'Center', 'Right'].map((align) => {
                                                const isActive = descElement?.style?.textAlign === align.toLowerCase();
                                                return (
                                                    <button
                                                        key={align}
                                                        onClick={() => updateElementStyle(descElement.id, { textAlign: align.toLowerCase() })}
                                                        className={cn(
                                                            "h-7.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest transition-all",
                                                            isActive ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
                                                        )}
                                                    >
                                                        {align}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* AGENDA/LIST SECTION */}
                {(type === "agenda" || type === "relatives" || type === "theme") && (
                    <div className="border-b border-border/50 group">
                        <button
                            onClick={() => toggle("list")}
                            className="w-full h-11 px-4 flex items-center justify-between hover:bg-slate-50 transition-all text-left"
                        >
                            <span className="text-[11px] font-black text-slate-800 uppercase tracking-[2px]">
                                {type === "agenda" ? "Agenda Items" : type === "relatives" ? "Relatives List" : "Theme Schedule"}
                            </span>
                            {expanded === "list" ? <ChevronUp size={14} className="text-primary" /> : <ChevronDown size={14} className="text-slate-300" />}
                        </button>
                        {expanded === "list" && (
                            <div className="px-4 pb-5 pt-0 space-y-4 animate-in slide-in-from-top-2">
                                {listElement ? (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center px-1">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">List Content</label>
                                            </div>
                                            <textarea
                                                value={listElement?.content || ""}
                                                onChange={(e) => updateElement(listElement.id, { content: e.target.value })}
                                                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-[12px] font-semibold text-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none min-h-[150px] chat-scrollbar shadow-sm transition-all leading-relaxed"
                                                placeholder="Enter list items (one per line)..."
                                            />
                                            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Note: Use double Enter for better spacing.</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Color</label>
                                                <div className="flex items-center gap-3 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm relative group/input">
                                                    <div
                                                        className="size-7 rounded-lg border border-slate-200 shrink-0 relative overflow-hidden ring-1 ring-white"
                                                        style={{ backgroundColor: String(listElement?.style?.color || "#334155") }}
                                                    >
                                                        <input
                                                            type="color"
                                                            value={String(listElement?.style?.color || "#334155")}
                                                            onChange={(e) => updateElementStyle(listElement.id, { color: e.target.value })}
                                                            className="absolute inset-0 size-full opacity-0 cursor-pointer"
                                                        />
                                                    </div>
                                                    <span className="text-[10px] font-black text-slate-500 font-mono uppercase truncate">{String(listElement?.style?.color || "#334155")}</span>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Size</label>
                                                <div className="flex items-center bg-white rounded-lg p-0.5 gap-1 border border-slate-200 shadow-sm">
                                                    <button
                                                        onClick={() => {
                                                            const cur = parseInt(listElement.style?.fontSize || "15")
                                                            updateElementStyle(listElement.id, { fontSize: `${Math.max(8, cur - 1)}px` })
                                                        }}
                                                        className="size-6 bg-slate-50 rounded-md flex items-center justify-center text-slate-400 hover:text-primary transition-all active:scale-90"
                                                    >
                                                        <Minus size={11} />
                                                    </button>
                                                    <span className="text-[10px] font-black text-slate-800 flex-1 text-center">{parseInt(listElement?.style?.fontSize || "15")}</span>
                                                    <button
                                                        onClick={() => {
                                                            const cur = parseInt(listElement.style?.fontSize || "15")
                                                            updateElementStyle(listElement.id, { fontSize: `${Math.min(60, cur + 1)}px` })
                                                        }}
                                                        className="size-6 bg-slate-50 rounded-md flex items-center justify-center text-slate-400 hover:text-primary transition-all active:scale-90"
                                                    >
                                                        <Plus size={11} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Line Spacing</label>
                                            <div className="flex items-center bg-white rounded-lg p-0.5 gap-1 border border-slate-200 shadow-sm">
                                                <button
                                                    onClick={() => {
                                                        const cur = parseFloat(listElement.style?.lineHeight || "1.1")
                                                        updateElementStyle(listElement.id, { lineHeight: (Math.max(1, cur - 0.1)).toFixed(1) })
                                                    }}
                                                    className="size-6 bg-slate-50 rounded-md flex items-center justify-center text-slate-400 hover:text-primary transition-all active:scale-90"
                                                >
                                                    <Minus size={11} />
                                                </button>
                                                <span className="text-[10px] font-black text-slate-800 flex-1 text-center">{parseFloat(listElement?.style?.lineHeight || "1.1")}</span>
                                                <button
                                                    onClick={() => {
                                                        const cur = parseFloat(listElement.style?.lineHeight || "1.1")
                                                        updateElementStyle(listElement.id, { lineHeight: (Math.min(4, cur + 0.1)).toFixed(1) })
                                                    }}
                                                    className="size-6 bg-slate-50 rounded-md flex items-center justify-center text-slate-400 hover:text-primary transition-all active:scale-90"
                                                >
                                                    <Plus size={11} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alignment</label>
                                            <div className="grid grid-cols-3 gap-1.5 p-0.5 bg-slate-100 rounded-lg">
                                                {['Left', 'Center', 'Right'].map((align) => {
                                                    const isActive = (listElement?.style?.textAlign || "left") === align.toLowerCase();
                                                    return (
                                                        <button
                                                            key={align}
                                                            onClick={() => updateElementStyle(listElement.id, { textAlign: align.toLowerCase() })}
                                                            className={cn(
                                                                "h-7 py-1 rounded-md text-[9px] font-black uppercase tracking-widest transition-all",
                                                                isActive ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
                                                            )}
                                                        >
                                                            {align}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-[10px] text-slate-400 font-bold text-center py-4">List element not found on this screen.</p>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* RELATIVES/SECONDARY LIST SECTION */}
                {type === "theme" && secondaryListElement && (
                    <div className="border-b border-border/50 group">
                        <button
                            onClick={() => toggle("secondaryList")}
                            className="w-full h-11 px-4 flex items-center justify-between hover:bg-slate-50 transition-all text-left"
                        >
                            <span className="text-[11px] font-black text-slate-800 uppercase tracking-[2px]">Theme Guest List</span>
                            {expanded === "secondaryList" ? <ChevronUp size={14} className="text-primary" /> : <ChevronDown size={14} className="text-slate-300" />}
                        </button>
                        {expanded === "secondaryList" && (
                            <div className="px-4 pb-5 pt-0 space-y-4 animate-in slide-in-from-top-2">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <textarea
                                            value={secondaryListElement.content || ""}
                                            onChange={(e) => updateElement(secondaryListElement.id, { content: e.target.value })}
                                            className="w-full p-3 bg-white border border-slate-200 rounded-xl text-[12px] font-semibold text-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none min-h-[100px] chat-scrollbar shadow-sm transition-all shadow-sm leading-relaxed"
                                            placeholder="Enter featured guests..."
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Color</label>
                                            <div className="flex items-center gap-3 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm relative group/input">
                                                <div
                                                    className="size-7 rounded-lg border border-slate-200 shrink-0 relative overflow-hidden ring-1 ring-white"
                                                    style={{ backgroundColor: String(secondaryListElement?.style?.color || "#334155") }}
                                                >
                                                    <input
                                                        type="color"
                                                        value={String(secondaryListElement?.style?.color || "#334155")}
                                                        onChange={(e) => updateElementStyle(secondaryListElement.id, { color: e.target.value })}
                                                        className="absolute inset-0 size-full opacity-0 cursor-pointer"
                                                    />
                                                </div>
                                                <span className="text-[10px] font-black text-slate-500 font-mono uppercase truncate">{String(secondaryListElement?.style?.color || "#334155")}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Size</label>
                                            <div className="flex items-center bg-white rounded-lg p-0.5 gap-1 border border-slate-200 shadow-sm">
                                                <button
                                                    onClick={() => {
                                                        const cur = parseInt(secondaryListElement.style?.fontSize || "14")
                                                        updateElementStyle(secondaryListElement.id, { fontSize: `${Math.max(8, cur - 1)}px` })
                                                    }}
                                                    className="size-6 bg-slate-50 rounded-md flex items-center justify-center text-slate-400 hover:text-primary transition-all active:scale-90"
                                                >
                                                    <Minus size={11} />
                                                </button>
                                                <span className="text-[10px] font-black text-slate-800 flex-1 text-center">{parseInt(secondaryListElement?.style?.fontSize || "14")}</span>
                                                <button
                                                    onClick={() => {
                                                        const cur = parseInt(secondaryListElement.style?.fontSize || "14")
                                                        updateElementStyle(secondaryListElement.id, { fontSize: `${Math.min(60, cur + 1)}px` })
                                                    }}
                                                    className="size-6 bg-slate-50 rounded-md flex items-center justify-center text-slate-400 hover:text-primary transition-all active:scale-90"
                                                >
                                                    <Plus size={11} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alignment</label>
                                        <div className="grid grid-cols-3 gap-1.5 p-0.5 bg-slate-100 rounded-lg">
                                            {['Left', 'Center', 'Right'].map((align) => {
                                                const isActive = (secondaryListElement?.style?.textAlign || "left") === align.toLowerCase();
                                                return (
                                                    <button
                                                        key={align}
                                                        onClick={() => updateElementStyle(secondaryListElement.id, { textAlign: align.toLowerCase() })}
                                                        className={cn(
                                                            "h-7 py-1 rounded-md text-[9px] font-black uppercase tracking-widest transition-all",
                                                            isActive ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
                                                        )}
                                                    >
                                                        {align}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

            </SidebarContent>

            {/* Footer Actions */}
            <SidebarFooter className="p-3 bg-white border-t border-slate-100 flex flex-row gap-2.5 shadow-2xl shrink-0">
                <button
                    onClick={onReset}
                    className="flex-1 h-10 rounded-lg border border-slate-200 text-slate-600 text-[9px] font-black uppercase tracking-widest hover:bg-slate-50 hover:text-red-500 hover:border-red-100 transition-all flex items-center justify-center gap-2"
                >
                    <RotateCcw size={13} strokeWidth={3} /> Reset
                </button>
                <button
                    className="flex-[1.5] h-10 rounded-lg bg-primary text-white text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-primary/10 hover:bg-primary/90 active:scale-95 transition-all"
                >
                    <Save size={13} strokeWidth={3} /> Save Change
                </button>
            </SidebarFooter>
        </Sidebar >
    )
}
