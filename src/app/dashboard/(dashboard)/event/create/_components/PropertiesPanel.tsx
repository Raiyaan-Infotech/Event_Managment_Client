"use client"

import React, { useRef } from "react"
import { BuilderNode, ViewMode, CanvasElement, ScreenType } from "./types"
import {
    X,
    Trash2,
    Copy,
    Settings2,
    Upload,
    Plus,
    Image as ImageIcon,
    Type,
    Palette,
    Layers,
    Layout,
    StickyNote,
    Bold,
    Italic,
    Underline,
    AlignCenter,
    AlignLeft,
    AlignRight,
    MousePointer2
} from "lucide-react"
import { cn } from "@/lib/utils"

interface PropertiesPanelProps {
    selectedNode: BuilderNode | null;
    selectedElementId?: string | null;
    onUpdate: (id: string, props: any) => void;
    onDelete: (id: string) => void;
    onDuplicate: (id: string) => void;
    onClose: () => void;
    onAddElement?: (type: "text" | "image" | "png" | "icon" | "loader" | "divider") => void;
    onUpdateElements?: (nodeId: string, elements: any[]) => void;
}

const PROPERTY_CONFIG: Record<string, { label: string; type: "text" | "color" | "number" | "image" | "boolean" }> = {
    bgColor: { label: "Background Color", type: "color" },
    title: { label: "Main Title", type: "text" },
    subtitle: { label: "Sub Title", type: "text" },
    titleColor: { label: "Title Color", type: "color" },
    subtitleColor: { label: "Sub Title Color", type: "color" },
    titleSize: { label: "Title Font Size", type: "number" },
    subtitleSize: { label: "Sub Title Font Size", type: "number" },
    buttonText: { label: "Button Label", type: "text" },
    buttonBg: { label: "Button Background", type: "color" },
    buttonColor: { label: "Button Text Color", type: "color" },
    inputRadius: { label: "Input Border Radius", type: "number" },
    cardRadius: { label: "Card Border Radius", type: "number" },
    headerTitle: { label: "Header Title", type: "text" },
    showSearch: { label: "Show Search Bar", type: "boolean" },
    listStyle: { label: "List Layout Style", type: "text" },
    location: { label: "Venue Location Name", type: "text" },
}

export default function PropertiesPanel({
    selectedNode,
    selectedElementId,
    onUpdate,
    onDelete,
    onDuplicate,
    onClose,
    onAddElement,
    onUpdateElements
}: PropertiesPanelProps) {
    const bgInputRef = useRef<HTMLInputElement>(null)
    const logoInputRef = useRef<HTMLInputElement>(null)

    if (!selectedNode) {
        return (
            <div className="w-[300px] border-l bg-[#F8FAFC] flex flex-col items-center justify-center p-10 text-center shrink-0">
                <div className="size-20 bg-white shadow-sm border border-slate-100 rounded-[2.5rem] flex items-center justify-center mb-8">
                    <Settings2 size={32} className="text-slate-300 animate-spin-slow" />
                </div>
                <h3 className="text-[12px] font-black text-slate-400 uppercase tracking-[3px] leading-relaxed">Studio Selection<br /><span className="text-primary/40 font-bold">Pick a Screen</span></h3>
            </div>
        )
    }

    const { id, type, props, elements = [] } = selectedNode

    // Virtual selected element for template props (e.g., prop:title)
    let selectedElement = elements.find(el => el.id === selectedElementId)

    if (!selectedElement && selectedElementId?.startsWith("prop:")) {
        const propKey = selectedElementId.replace("prop:", "");
        // Create a virtual element so the styling controls appear
        selectedElement = {
            id: selectedElementId,
            type: "text",
            x: 0, y: 0, width: 0, height: 0,
            content: props[propKey] || "",
            style: {
                color: props[`${propKey}Color`] || "#000000",
                fontSize: `${props[`${propKey}Size`] || 16}px`,
                fontWeight: props[`${propKey}Weight`] || "normal",
                textAlign: props[`${propKey}Align`] || "center",
            }
        }
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
        const file = e.target.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onloadend = () => onUpdate(id, { [key]: reader.result as string })
        reader.readAsDataURL(file)
    }

    const handleUpdateSelectedElement = (updates: Partial<CanvasElement>) => {
        if (!selectedElementId) return;

        if (selectedElementId.startsWith("prop:")) {
            const propKey = selectedElementId.replace("prop:", "");
            if (updates.content !== undefined) {
                onUpdate(id, { [propKey]: updates.content });
            }
            if (updates.style) {
                const s = updates.style as any;
                const newProps: any = {};
                if (s.color) newProps[`${propKey}Color`] = s.color;
                if (s.fontSize) newProps[`${propKey}Size`] = parseInt(s.fontSize);
                if (s.fontWeight) newProps[`${propKey}Weight`] = s.fontWeight;
                if (s.textAlign) newProps[`${propKey}Align`] = s.textAlign;
                onUpdate(id, newProps);
            }
            return;
        }

        const newElements = elements.map(el =>
            el.id === selectedElementId ? { ...el, ...updates } : el
        );
        onUpdateElements?.(id, newElements);
    }

    const handleUpdateElementStyle = (styleUpdates: Partial<Exclude<CanvasElement['style'], undefined>>) => {
        if (!selectedElement) return;
        handleUpdateSelectedElement({
            style: { ...selectedElement.style, ...styleUpdates } as any
        });
    }

    const handleAddCanvasPNG = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onloadend = () => {
            const newElem = {
                id: crypto.randomUUID(),
                type: "png" as const,
                content: reader.result as string,
                width: 120,
                height: 120,
                x: 0,
                y: 0
            }
            onUpdateElements?.(id, [...elements, newElem])
        }
        reader.readAsDataURL(file)
    }

    const removeElement = (elemId: string) => {
        onUpdateElements?.(id, elements.filter((el: any) => el.id !== elemId))
    }

    const toggleStyle = (key: keyof Exclude<CanvasElement['style'], undefined>, value: string) => {
        const currentStyle = selectedElement?.style || {};
        const isSet = (currentStyle as any)[key] === value;
        handleUpdateElementStyle({ [key]: isSet ? "normal" : value });
    }

    return (
        <div className="w-[340px] border-l bg-white flex flex-col h-full shadow-2xl z-30 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                    <div className="size-10 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20 transition-transform">
                        {selectedElementId ? <MousePointer2 size={20} className="animate-pulse" /> : <Layout size={20} />}
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight leading-none mb-1">
                            {selectedElementId ? "Element Edit" : "Screen Edit"}
                        </h2>
                        <p className="text-[10px] text-primary font-bold uppercase tracking-widest">
                            {selectedElementId ? selectedElement?.type : type}
                        </p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all border border-transparent hover:border-slate-100">
                    <X size={18} className="text-slate-400" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto chat-scrollbar scroll-smooth bg-white">

                {/* ELEMENT SPECIFIC EDITING (CANVA STYLE) */}
                {selectedElementId && selectedElement ? (
                    <div className="p-6 space-y-8 animate-in slide-in-from-right-4">

                        {/* Text Styling Bar */}
                        {selectedElement.type === "text" && (
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Text Typography</label>
                                    <div className="flex flex-wrap gap-1 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                                        <button
                                            onClick={() => toggleStyle("fontWeight", "bold")}
                                            className={cn(
                                                "size-9 rounded-xl flex items-center justify-center transition-all",
                                                selectedElement.style?.fontWeight === "bold" ? "bg-primary text-white shadow-md shadow-primary/20" : "text-slate-500 hover:bg-white"
                                            )}
                                        >
                                            <Bold size={16} />
                                        </button>
                                        <button
                                            onClick={() => toggleStyle("fontStyle", "italic")}
                                            className={cn(
                                                "size-9 rounded-xl flex items-center justify-center transition-all",
                                                selectedElement.style?.fontStyle === "italic" ? "bg-primary text-white shadow-md shadow-primary/20" : "text-slate-500 hover:bg-white"
                                            )}
                                        >
                                            <Italic size={16} />
                                        </button>
                                        <button
                                            onClick={() => toggleStyle("textDecoration", "underline")}
                                            className={cn(
                                                "size-9 rounded-xl flex items-center justify-center transition-all",
                                                selectedElement.style?.textDecoration === "underline" ? "bg-primary text-white shadow-md shadow-primary/20" : "text-slate-500 hover:bg-white"
                                            )}
                                        >
                                            <Underline size={16} />
                                        </button>
                                        <div className="w-[1px] h-6 bg-slate-200 mx-1 self-center" />
                                        <button
                                            onClick={() => handleUpdateElementStyle({ textAlign: "left" })}
                                            className={cn(
                                                "size-9 rounded-xl flex items-center justify-center transition-all",
                                                selectedElement.style?.textAlign === "left" || !selectedElement.style?.textAlign ? "bg-white text-primary shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:bg-white"
                                            )}
                                        >
                                            <AlignLeft size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleUpdateElementStyle({ textAlign: "center" })}
                                            className={cn(
                                                "size-9 rounded-xl flex items-center justify-center transition-all",
                                                selectedElement.style?.textAlign === "center" ? "bg-white text-primary shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:bg-white"
                                            )}
                                        >
                                            <AlignCenter size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleUpdateElementStyle({ textAlign: "right" })}
                                            className={cn(
                                                "size-9 rounded-xl flex items-center justify-center transition-all",
                                                selectedElement.style?.textAlign === "right" ? "bg-white text-primary shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:bg-white"
                                            )}
                                        >
                                            <AlignRight size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Text Color</label>
                                    <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100 group hover:bg-white hover:shadow-lg transition-all">
                                        <input
                                            type="color"
                                            value={selectedElement.style?.color || "#000000"}
                                            onChange={(e) => handleUpdateElementStyle({ color: e.target.value })}
                                            className="size-10 rounded-xl cursor-pointer border-none bg-transparent"
                                        />
                                        <span className="text-xs font-black font-mono text-slate-500 uppercase tracking-widest">{selectedElement.style?.color || "#000000"}</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Font Size</label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="range"
                                            min="8"
                                            max="120"
                                            value={parseInt(selectedElement.style?.fontSize || "16")}
                                            onChange={(e) => handleUpdateElementStyle({ fontSize: `${e.target.value}px` })}
                                            className="flex-1 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary"
                                        />
                                        <span className="text-[11px] font-black text-primary px-3 py-1 bg-primary/5 rounded-xl min-w-[50px] text-center">{selectedElement.style?.fontSize || "16px"}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Input Specific Styling */}
                        {selectedElement.type === "input" && (
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Placeholder Text</label>
                                    <input
                                        type="text"
                                        value={selectedElement.content || ""}
                                        onChange={(e) => handleUpdateSelectedElement({ content: e.target.value })}
                                        className="w-full bg-slate-50 border-transparent focus:bg-white border focus:border-primary/20 rounded-2xl h-12 px-5 text-[13px] font-bold text-slate-700 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Border Color</label>
                                    <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                        <input
                                            type="color"
                                            value={selectedElement.style?.borderColor || "#E5E7EB"}
                                            onChange={(e) => handleUpdateElementStyle({ borderColor: e.target.value })}
                                            className="size-10 rounded-xl cursor-pointer border-none bg-transparent"
                                        />
                                        <span className="text-xs font-black font-mono text-slate-500 uppercase tracking-widest">{selectedElement.style?.borderColor || "#E5E7EB"}</span>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Corner Radius</label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="range"
                                            min="0"
                                            max="40"
                                            value={parseInt(selectedElement.style?.borderRadius || "12")}
                                            onChange={(e) => handleUpdateElementStyle({ borderRadius: `${e.target.value}px` })}
                                            className="flex-1 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary"
                                        />
                                        <span className="text-[11px] font-black text-primary px-3 py-1 bg-primary/5 rounded-xl min-w-[50px] text-center">{selectedElement.style?.borderRadius || "12px"}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Button Specific Styling */}
                        {selectedElement.type === "button" && (
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Button Text</label>
                                    <input
                                        type="text"
                                        value={selectedElement.content || ""}
                                        onChange={(e) => handleUpdateSelectedElement({ content: e.target.value })}
                                        className="w-full bg-slate-50 border-transparent focus:bg-white border focus:border-primary/20 rounded-2xl h-12 px-5 text-[13px] font-bold text-slate-700 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Background Color</label>
                                    <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                        <input
                                            type="color"
                                            value={selectedElement.style?.backgroundColor || "#4F46E5"}
                                            onChange={(e) => handleUpdateElementStyle({ backgroundColor: e.target.value })}
                                            className="size-10 rounded-xl cursor-pointer border-none bg-transparent"
                                        />
                                        <span className="text-xs font-black font-mono text-slate-500 uppercase tracking-widest">{selectedElement.style?.backgroundColor || "#4F46E5"}</span>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Text Color</label>
                                    <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                        <input
                                            type="color"
                                            value={selectedElement.style?.color || "#FFFFFF"}
                                            onChange={(e) => handleUpdateElementStyle({ color: e.target.value })}
                                            className="size-10 rounded-xl cursor-pointer border-none bg-transparent"
                                        />
                                        <span className="text-xs font-black font-mono text-slate-500 uppercase tracking-widest">{selectedElement.style?.color || "#FFFFFF"}</span>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Corner Radius</label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="range"
                                            min="0"
                                            max="40"
                                            value={parseInt(selectedElement.style?.borderRadius || "12")}
                                            onChange={(e) => handleUpdateElementStyle({ borderRadius: `${e.target.value}px` })}
                                            className="flex-1 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary"
                                        />
                                        <span className="text-[11px] font-black text-primary px-3 py-1 bg-primary/5 rounded-xl min-w-[50px] text-center">{selectedElement.style?.borderRadius || "12px"}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Image Specific Info */}
                        {(selectedElement.type === "image" || selectedElement.type === "png") && (
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Asset Info</label>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <img src={selectedElement.content} className="h-20 w-fit mx-auto object-contain rounded-lg shadow-sm" alt="Preview" />
                                    <p className="text-[9px] text-center text-slate-400 font-extrabold uppercase mt-3">{selectedElement.type} Asset</p>
                                </div>
                            </div>
                        )}

                        {/* Icon Specific Styling */}
                        {selectedElement.type === "icon" && (
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Icon Color</label>
                                    <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                        <input
                                            type="color"
                                            value={selectedElement.style?.color || "#FFFFFF"}
                                            onChange={(e) => handleUpdateElementStyle({ color: e.target.value })}
                                            className="size-10 rounded-xl cursor-pointer border-none bg-transparent"
                                        />
                                        <span className="text-xs font-black font-mono text-slate-500 uppercase tracking-widest">{selectedElement.style?.color || "#FFFFFF"}</span>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Background Color</label>
                                    <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                        <input
                                            type="color"
                                            value={selectedElement.style?.backgroundColor || "rgba(255,255,255,0.1)"}
                                            onChange={(e) => handleUpdateElementStyle({ backgroundColor: e.target.value })}
                                            className="size-10 rounded-xl cursor-pointer border-none bg-transparent"
                                        />
                                        <span className="text-xs font-black font-mono text-slate-500 uppercase tracking-widest">{selectedElement.style?.backgroundColor || "rgba(255,255,255,0.1)"}</span>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Corner Radius</label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={parseInt(selectedElement.style?.borderRadius || "24")}
                                            onChange={(e) => handleUpdateElementStyle({ borderRadius: `${e.target.value}px` })}
                                            className="flex-1 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary"
                                        />
                                        <span className="text-[11px] font-black text-primary px-3 py-1 bg-primary/5 rounded-xl min-w-[50px] text-center">{selectedElement.style?.borderRadius || "24px"}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Loader Specific Styling */}
                        {selectedElement.type === "loader" && (
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Dot Color</label>
                                    <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                        <input
                                            type="color"
                                            value={selectedElement.style?.color || "#FFFFFF"}
                                            onChange={(e) => handleUpdateElementStyle({ color: e.target.value })}
                                            className="size-10 rounded-xl cursor-pointer border-none bg-transparent"
                                        />
                                        <span className="text-xs font-black font-mono text-slate-500 uppercase tracking-widest">{selectedElement.style?.color || "#FFFFFF"}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Divider Specific Styling */}
                        {selectedElement.type === "divider" && (
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Divider Color</label>
                                    <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                        <input
                                            type="color"
                                            value={selectedElement.style?.backgroundColor || "#E5E7EB"}
                                            onChange={(e) => handleUpdateElementStyle({ backgroundColor: e.target.value })}
                                            className="size-10 rounded-xl cursor-pointer border-none bg-transparent"
                                        />
                                        <span className="text-xs font-black font-mono text-slate-500 uppercase tracking-widest">{selectedElement.style?.backgroundColor || "#E5E7EB"}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={() => removeElement(selectedElementId)}
                            className="w-full py-4 mt-10 bg-red-50 text-red-500 text-[11px] font-black uppercase tracking-widest rounded-3xl hover:bg-red-500 hover:text-white transition-all shadow-sm flex items-center justify-center gap-2"
                        >
                            <Trash2 size={16} /> Remove Element
                        </button>
                    </div>
                ) : (
                    <>
                        {/* SCREEN EDITING (Standard Properties) */}
                        <div className="p-6 border-b space-y-4 bg-slate-50/30">
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Quick Add</label>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    onClick={() => onAddElement?.("text")}
                                    className="flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                                >
                                    <Plus size={14} /> Text
                                </button>
                                {type === "splash" && (
                                    <button
                                        onClick={() => onAddElement?.("icon")}
                                        className="flex items-center justify-center gap-2 py-2.5 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                                    >
                                        <Plus size={14} /> Icon
                                    </button>
                                )}
                                <button
                                    onClick={() => onAddElement?.("loader")}
                                    className="flex items-center justify-center gap-2 py-2.5 bg-amber-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 transition-all shadow-lg shadow-amber-100"
                                >
                                    <Plus size={14} /> Loader
                                </button>
                                <button
                                    onClick={() => onAddElement?.("divider")}
                                    className="flex items-center justify-center gap-2 py-2.5 bg-slate-400 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-500 transition-all shadow-lg shadow-slate-100"
                                >
                                    <Plus size={14} /> Line
                                </button>
                                <button
                                    onClick={() => logoInputRef.current?.click()}
                                    className="flex items-center justify-center gap-2 py-2.5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                                >
                                    <Plus size={14} /> PNG
                                </button>
                            </div>
                            <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleAddCanvasPNG} />
                        </div>

                        <div className="p-6 space-y-8">
                            {/* Visual Assets Section */}
                            {type === "splash" && (
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-[2.5px]">
                                            <ImageIcon size={14} /> Background Media
                                        </label>
                                        <div
                                            onClick={() => bgInputRef.current?.click()}
                                            className={cn(
                                                "relative w-full aspect-video rounded-3xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:border-primary hover:bg-primary/[0.02]",
                                                props.bgImage ? "border-primary/20 bg-primary/5" : "border-slate-200 bg-slate-50"
                                            )}
                                        >
                                            {props.bgImage ? (
                                                <div className="absolute inset-0 p-2">
                                                    <img src={props.bgImage} className="w-full h-full object-cover rounded-2xl shadow-xl" />
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); onUpdate(id, { bgImage: "" }) }}
                                                        className="absolute top-4 right-4 size-8 bg-white text-red-500 rounded-full flex items-center justify-center shadow-lg hover:bg-red-500 hover:text-white transition-all"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="size-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-400">
                                                        <Upload size={20} />
                                                    </div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Background Image</p>
                                                </>
                                            )}
                                            <input type="file" ref={bgInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, "bgImage")} />
                                        </div>
                                    </div>

                                </div>
                            )}

                            {/* Active Elements List */}
                            {elements.length > 0 && (
                                <div className="space-y-4">
                                    <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-[2.5px]">
                                        <Layers size={14} /> Screen Elements
                                    </label>
                                    <div className="grid grid-cols-1 gap-2">
                                        {elements.map((el: any) => (
                                            <div key={el.id} className="group flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white hover:shadow-md transition-all">
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <div className="size-8 rounded-lg bg-white flex items-center justify-center shrink-0">
                                                        {el.type === "text" ? <Type size={14} className="text-slate-400" /> : <Layers size={14} className="text-slate-400" />}
                                                    </div>
                                                    <p className="text-[11px] font-bold text-slate-700 truncate max-w-[150px]">
                                                        {el.type === "text" ? el.content : "PNG Overlay"}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => removeElement(el.id)}
                                                    className="size-7 bg-red-50 text-red-500 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Standard Properties (Auto-Config) */}
                            <div className="space-y-8">
                                {Object.entries(props).map(([key, value]) => {
                                    const config = PROPERTY_CONFIG[key]
                                    if (!config) return null
                                    if (key === "logos" || key === "showDefaultIcon") return null
                                    if (key === "bgImage" && type === "splash") return null

                                    return (
                                        <div key={key} className="space-y-3">
                                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">
                                                {config.type === "color" && <Palette size={12} />}
                                                {config.type === "text" && <Type size={12} />}
                                                {config.type === "number" && <Layout size={12} />}
                                                {config.label}
                                            </label>

                                            {config.type === "text" && (
                                                <input
                                                    type="text"
                                                    value={value}
                                                    onChange={(e) => onUpdate(id, { [key]: e.target.value })}
                                                    className="w-full bg-slate-50 border-transparent focus:bg-white border focus:border-primary/20 rounded-2xl h-12 px-5 text-[13px] font-bold text-slate-700 focus:shadow-xl focus:shadow-primary/5 outline-none transition-all"
                                                />
                                            )}

                                            {config.type === "color" && (
                                                <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100 group hover:bg-white hover:shadow-lg transition-all">
                                                    <input type="color" value={value} onChange={(e) => onUpdate(id, { [key]: e.target.value })} className="size-10 rounded-xl cursor-pointer border-none bg-transparent" />
                                                    <span className="text-xs font-black font-mono text-slate-500 uppercase tracking-widest">{value}</span>
                                                </div>
                                            )}

                                            {config.type === "number" && (
                                                <div className="space-y-3 px-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[11px] font-black text-primary px-3 py-1 bg-primary/5 rounded-xl">{value}px</span>
                                                    </div>
                                                    <input type="range" min="0" max="500" value={value} onChange={(e) => onUpdate(id, { [key]: parseInt(e.target.value) })} className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary" />
                                                </div>
                                            )}

                                            {config.type === "boolean" && (
                                                <button onClick={() => onUpdate(id, { [key]: !value })} className={cn("w-full py-3 rounded-2xl text-[10px] font-black uppercase tracking-[2px] transition-all border shadow-sm", value ? "bg-primary text-white border-primary shadow-primary/20" : "bg-white text-slate-400 border-slate-100 hover:border-slate-200")}>
                                                    {value ? "Active" : "Disabled"}
                                                </button>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Scene Actions */}
                            <div className="pt-8 flex gap-3 border-t">
                                <button onClick={() => onDuplicate(id)} className="flex-1 flex items-center justify-center gap-2 py-4 text-[11px] font-black uppercase tracking-widest bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white hover:shadow-md transition-all text-slate-600">
                                    <Copy size={14} /> Clone Screen
                                </button>
                                <button onClick={() => onDelete(id)} className="flex-1 flex items-center justify-center gap-2 py-4 text-[11px] font-black uppercase tracking-widest bg-red-50 text-red-500 border border-red-100 rounded-2xl hover:bg-red-500 hover:text-white transition-all">
                                    <Trash2 size={14} /> Delete
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
