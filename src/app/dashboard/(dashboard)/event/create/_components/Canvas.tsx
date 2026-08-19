"use client"

import React from "react"
import { BuilderNode, ViewMode, CanvasElement, DEVICES, getResponsiveScale, transformElementToResponsive } from "./types"
import { cn } from "@/lib/utils"
import SplashScreen from "./screens/SplashScreen"
import LoginScreen from "./screens/LoginScreen"
import HomeScreen from "./screens/HomeScreen"
import AgendaScreen from "./screens/AgendaScreen"
import ParticipantsScreen from "./screens/ParticipantsScreen"
import EventInfoScreen from "./screens/EventInfoScreen"
import VenueScreen from "./screens/VenueScreen"
import RegisterScreen from "./screens/RegisterScreen"
import RelativesScreen from "./screens/RelativesScreen"
import ThemeScreen from "./screens/RegisterScreen" // Using RegisterScreen as base for Theme
import Resizable from "./Resizable"

interface CanvasProps {
    nodes: BuilderNode[];
    selectedId: string | null;
    setSelectedId: (id: string | null) => void;
    selectedElementId?: string | null;
    setSelectedElementId?: (id: string | null) => void;
    onUpdate: (id: string, props: any) => void;
    onUpdateElements?: (nodeId: string, elements: CanvasElement[]) => void;
    onCommit?: () => void;
    view: ViewMode;
    zoom: number;
}

const SCREENS: Record<string, any> = {
    splash: SplashScreen,
    splash2: SplashScreen,
    splash3: SplashScreen,
    register: RegisterScreen,
    login: LoginScreen,
    home: HomeScreen,
    agenda: AgendaScreen,
    relatives: RelativesScreen,
    participants: ParticipantsScreen,
    eventInfo: EventInfoScreen,
    venue: VenueScreen,
    theme: ThemeScreen
}

export default function Canvas({
    nodes,
    selectedId,
    setSelectedId,
    selectedElementId,
    setSelectedElementId,
    onUpdate,
    onUpdateElements,
    onCommit,
    view,
    zoom
}: CanvasProps) {

    const [editingId, setEditingId] = React.useState<string | null>(null);
    const currentDevice = DEVICES.find(d => d.id === view) || DEVICES[0];
    const responsiveScale = getResponsiveScale(currentDevice.width);

    const handleUpdateElement = (nodeId: string, elementId: string, updates: Partial<CanvasElement>) => {
        const node = nodes.find(n => n.id === nodeId);
        if (!node || !node.elements) return;

        const newElements = node.elements.map(el =>
            el.id === elementId ? { ...el, ...updates } : el
        );
        onUpdateElements?.(nodeId, newElements);
    };

    const renderDeviceFrame = (content: React.ReactNode, node?: BuilderNode) => {
        const id = node?.id;
        const isSelectedNode = !!(id && selectedId === id);

        return (
            <div
                key={id || "empty"}
                onClick={(e) => {
                    if (id) {
                        e.stopPropagation();
                        setSelectedId(id);
                        setSelectedElementId?.(null); // Deselect sub-element when clicking frame
                        setEditingId(null);
                    }
                }}
                className={cn(
                    "relative transition-all duration-500 ease-in-out group/device origin-top mx-auto",
                    isSelectedNode ? "z-20 scale-[1.02]" : "z-10"
                )}
                style={{
                    width: `${currentDevice.width}px`,
                    cursor: id ? "pointer" : "default",
                }}
            >

                {/* DEVICE FRAME WRAPPER */}
                <div
                    className={cn(
                        "relative mx-auto transition-all duration-500",
                        currentDevice.type === "mobile" && "bg-slate-900 rounded-[50px] border-[10px] border-slate-800 shadow-[0_0_0_2px_rgba(255,255,255,0.05),0_20px_50px_rgba(0,0,0,0.3)]",
                        currentDevice.type === "tablet" && "bg-slate-900 rounded-[30px] border-[12px] border-slate-800 shadow-2xl",
                        currentDevice.type === "desktop" && "bg-slate-900 rounded-[12px] border-[8px] border-slate-800 shadow-2xl"
                    )}
                    style={{
                        width: `${currentDevice.width}px`,
                        height: `${currentDevice.height}px`,
                        borderRadius: currentDevice.category === "Android" ? "32px" : undefined
                    }}
                >

                    {/* INTERNAL SCREEN AREA */}
                    <div
                        className={cn(
                            "w-full h-full bg-background overflow-hidden relative",
                            currentDevice.type === "mobile" && (currentDevice.category === "Android" ? "rounded-[28px]" : "rounded-[42px]"),
                            currentDevice.type === "tablet" && "rounded-[20px]",
                            currentDevice.type === "desktop" && "rounded-[6px]"
                        )}
                        onClick={(e) => {
                            // Clicking empty area of the screen deselects elements but selects the screen
                            e.stopPropagation();
                            if (id) setSelectedId(id);
                            setSelectedElementId?.(null);
                            setEditingId(null);
                        }}
                    >
                        {content && React.isValidElement(content) ? (
                            typeof (content as React.ReactElement).type === "string"
                                ? content // It's a DOM element like div, don't clone with custom props
                                : React.cloneElement(content as React.ReactElement, {
                                    selectedElementId,
                                    onSelectElement: (id: string) => {
                                        setSelectedId(node?.id || null);
                                        setSelectedElementId?.(id);
                                    }
                                } as any)
                        ) : content}

                        {/* Universal Elements Layer (Fluid Responsiveness with Screen Padding) */}
                        <div
                            className="absolute inset-0 pointer-events-none transition-all duration-500"
                        >
                            {node?.elements && node.elements.map((el) => {
                                const isElementSelected = selectedElementId === el.id;
                                const isEditing = editingId === el.id;

                                // Use helper function instead of hardcoded 360/640
                                const { left, top, width, height } = transformElementToResponsive(el, currentDevice.width);

                                // Convert to percentages
                                const leftPercent = (left / currentDevice.width) * 100;
                                const topPercent = (top / currentDevice.height) * 100;
                                const widthPercent = (width / currentDevice.width) * 100;
                                const heightScale = (currentDevice.type === "desktop") ? 1.1 : 1;
                                const heightPercent = (height / currentDevice.height) * 100 * heightScale;

                                return (
                                    <Resizable
                                        key={el.id}
                                        width={`${widthPercent}%`}
                                        height={`${heightPercent}%`}
                                        left={`${leftPercent}%`}
                                        top={`${topPercent}%`}
                                        logicalWidth={el.width}
                                        logicalHeight={el.height}
                                        logicalX={el.x}
                                        logicalY={el.y}
                                        isSelected={isElementSelected}
                                        onResize={(w, h) => handleUpdateElement(node.id, el.id, { width: w, height: h })}
                                        onMove={(x, y) => handleUpdateElement(node.id, el.id, { x, y })}
                                        onEnd={onCommit}
                                        onRemove={() => {
                                            const newElements = node.elements?.filter(e => e.id !== el.id) || [];
                                            onUpdateElements?.(node.id, newElements);
                                            setSelectedElementId?.(null);
                                            setEditingId(null);
                                        }}
                                        className="z-40 pointer-events-auto"
                                    >
                                        <div
                                            className="w-full h-full flex items-center justify-center"
                                            onMouseDown={(e) => {
                                                if (!isElementSelected) {
                                                    e.stopPropagation();
                                                    setSelectedId(node.id);
                                                    setSelectedElementId?.(el.id);
                                                    setEditingId(null);
                                                }
                                            }}
                                            onDoubleClick={(e) => {
                                                if (el.type === "text") {
                                                    e.stopPropagation();
                                                    setEditingId(el.id);
                                                }
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {el.type === "text" && (
                                                <div
                                                    ref={(elRef) => {
                                                        if (elRef && isEditing) {
                                                            if (document.activeElement !== elRef) elRef.focus();
                                                        }
                                                    }}
                                                    style={{
                                                        ...el.style,
                                                        fontSize: el.style?.fontSize
                                                            ? `calc(${el.style.fontSize} * ${responsiveScale})`
                                                            : undefined,
                                                        width: "100%",
                                                        height: "100%",
                                                        display: "flex",
                                                        alignItems: "center", // Always center vertically to prevent hidden text
                                                        justifyContent: el.style?.textAlign === "left" ? "flex-start" : el.style?.textAlign === "right" ? "flex-end" : "center",
                                                        overflow: "visible", // Never hide text in responsive view
                                                        cursor: isEditing ? "text" : "move",
                                                        userSelect: isEditing ? "text" : "none",
                                                        whiteSpace: "pre-wrap",
                                                        lineHeight: el.style?.lineHeight || 1.1
                                                    }}
                                                    className="p-0.5 break-words outline-none selection:bg-primary/20"
                                                    contentEditable={isEditing}
                                                    suppressContentEditableWarning
                                                    onBlur={(e) => {
                                                        setEditingId(null);
                                                        const newContent = e.currentTarget.textContent || "";
                                                        if (newContent !== el.content) {
                                                            handleUpdateElement(node.id, el.id, { content: newContent });
                                                            onCommit?.();
                                                        }
                                                    }}
                                                >
                                                    {el.content}
                                                </div>
                                            )}
                                            {el.type === "input" && (
                                                <div className="w-full h-full p-1">
                                                    <input
                                                        readOnly
                                                        placeholder={el.content}
                                                        style={{
                                                            ...el.style,
                                                            width: "100%",
                                                            height: "100%",
                                                            outline: "none",
                                                            cursor: isElementSelected ? "default" : "move"
                                                        }}
                                                        className="px-4 border transition-all"
                                                    />
                                                </div>
                                            )}
                                            {el.type === "button" && (
                                                <div className="w-full h-full p-1 overflow-hidden">
                                                    <button
                                                        style={{
                                                            ...el.style,
                                                            width: "100%",
                                                            height: "100%",
                                                            border: "none",
                                                            cursor: isElementSelected ? "default" : "move"
                                                        }}
                                                        className="flex items-center justify-center transition-all active:scale-95"
                                                    >
                                                        {el.content}
                                                    </button>
                                                </div>
                                            )}
                                            {(el.type === "image" || el.type === "png") && (
                                                <img
                                                    src={el.content}
                                                    className="w-full h-full object-cover pointer-events-none select-none rounded-[inherit]"
                                                    alt=""
                                                />
                                            )}
                                            {el.type === "icon" && (
                                                <div
                                                    className="flex items-center justify-center aspect-square overflow-hidden"
                                                    style={{
                                                        backgroundColor: el.content ? "transparent" : (el.style?.backgroundColor || "rgba(255,255,255,0.1)"),
                                                        borderRadius: el.style?.borderRadius || "24px",
                                                        height: "100%",
                                                        width: "auto",
                                                        backdropFilter: el.content ? undefined : "blur(8px)",
                                                        border: el.content ? undefined : "1px solid rgba(255,255,255,0.2)",
                                                        boxShadow: el.content ? undefined : "0 10px 25px rgba(0,0,0,0.1)",
                                                    }}
                                                >
                                                    {el.content && (el.content.startsWith("data:image") || el.content.startsWith("http")) ? (
                                                        <img src={el.content} className="size-full object-contain pointer-events-none select-none" alt="" />
                                                    ) : (
                                                        <div
                                                            style={{
                                                                width: "50%",
                                                                height: "50%",
                                                                backgroundColor: el.style?.color || "white",
                                                                borderRadius: "12px",
                                                                transform: "rotate(45deg)"
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                            )}
                                            {el.type === "loader" && (
                                                <div className="w-full h-full flex items-center justify-center gap-1.5">
                                                    <div className="size-2 rounded-full animate-bounce" style={{ backgroundColor: el.style?.color || "white", animationDelay: '0s' }} />
                                                    <div className="size-2 rounded-full animate-bounce" style={{ backgroundColor: el.style?.color || "white", animationDelay: '0.2s' }} />
                                                    <div className="size-2 rounded-full animate-bounce" style={{ backgroundColor: el.style?.color || "white", animationDelay: '0.4s' }} />
                                                </div>
                                            )}
                                            {el.type === "divider" && (
                                                <div
                                                    style={{
                                                        backgroundColor: el.style?.backgroundColor || "#E5E7EB",
                                                        width: "100%",
                                                        height: "1px"
                                                    }}
                                                />
                                            )}
                                        </div>
                                    </Resizable>
                                );
                            })}
                        </div>

                        {/* Selection Highlight for the whole screen node */}
                        {isSelectedNode && !selectedElementId && (
                            <div className="absolute inset-0 ring-4 ring-primary ring-inset pointer-events-none z-30 opacity-60" />
                        )}
                    </div>

                    {/* VIEW SPECIFIC HARDWARE ELEMENTS */}
                    {currentDevice.type === "mobile" && (
                        <>
                            {/* iPhone Specific: Classic Notch */}
                            {currentDevice.category === "iPhone" && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-8 bg-black rounded-b-[20px] z-40 flex items-center justify-center gap-3 overflow-hidden">
                                    {/* Speaker Grille */}
                                    <div className="w-12 h-1 bg-slate-800 rounded-full opacity-60" />
                                    {/* Camera Lens */}
                                    <div className="w-2 h-2 rounded-full bg-[#1a1c1e] border border-slate-800 flex items-center justify-center">
                                        <div className="w-1 h-1 rounded-full bg-indigo-500/20" />
                                    </div>
                                </div>
                            )}

                            {/* Android Specific: Clean Screen (No Punch Hole) */}

                            {/* Buttons: iPhone Style */}
                            {currentDevice.category === "iPhone" && (
                                <>
                                    <div className="absolute -left-[10px] top-24 w-[2px] h-10 bg-slate-700 rounded-l-md" />
                                    <div className="absolute -left-[10px] top-36 w-[2px] h-14 bg-slate-700 rounded-l-md" />
                                    <div className="absolute -left-[10px] top-52 w-[2px] h-14 bg-slate-700 rounded-l-md" />
                                    <div className="absolute -right-[10px] top-36 w-[2px] h-20 bg-slate-700 rounded-r-md" />
                                </>
                            )}

                            {/* Buttons: Android Style */}
                            {currentDevice.category === "Android" && (
                                <>
                                    <div className="absolute -right-[10px] top-32 w-[2px] h-12 bg-slate-700 rounded-r-md" />
                                    <div className="absolute -right-[10px] top-48 w-[2px] h-20 bg-slate-700 rounded-r-md" />
                                </>
                            )}
                        </>
                    )}

                    {currentDevice.type === "tablet" && (
                        <div className="absolute top-1/2 -right-3 -translate-y-1/2 w-1.5 h-12 bg-slate-700 rounded-r-sm" />
                    )}

                    {currentDevice.type === "desktop" && (
                        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-32 h-10 bg-slate-800 rounded-b-xl z-[-1] shadow-lg">
                            <div className="absolute inset-x-0 bottom-0 h-1.5 bg-slate-700 rounded-b-xl" />
                        </div>
                    )}
                </div>

            </div>
        );
    };

    return (
        <div
            className="flex-1 bg-[#F1F5F9] overflow-auto pt-2 pb-8 px-4 chat-scrollbar scroll-smooth relative"
            onClick={() => {
                setSelectedId(null);
                setSelectedElementId?.(null);
            }}
        >
            {/* Background Dot Grid */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.4] min-w-full min-h-full"
                style={{
                    backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)',
                    backgroundSize: '24px 24px'
                }}
            />
            <div
                className="transition-all duration-500 ease-in-out origin-top flex flex-col gap-6 relative z-10 w-fit mx-auto pt-2"
                style={{ transform: `scale(${zoom / 100})` }}
                onClick={(e) => e.stopPropagation()} // Click backdrop to deselect
            >
                {nodes.length === 0 ? (
                    renderDeviceFrame(
                        <div className="w-full h-full bg-background border-4 border-dashed border-border flex flex-col items-center justify-center text-center p-8 group transition-all">
                            <div className="size-16 bg-muted rounded-full flex items-center justify-center mb-6 shrink-0">
                                <div className="size-8 border-4 border-primary rounded-lg rotate-45 animate-pulse" />
                            </div>
                            <h3 className="text-lg font-black text-foreground uppercase tracking-widest mb-2 shrink-0">Canvas Empty</h3>
                            <p className="text-[11px] text-muted-foreground font-bold max-w-[200px] leading-relaxed uppercase tracking-wider">
                                Click a screen template from the left to start
                            </p>
                        </div>
                    )
                ) : (
                    nodes.map((node) => {
                        const ScreenComponent = SCREENS[node.type];
                        if (!ScreenComponent) return null;
                        const isNodeSelected = selectedId === node.id;
                        return renderDeviceFrame(
                            <ScreenComponent
                                props={node.props}
                                onUpdate={(newProps: any) => onUpdate(node.id, newProps)}
                                isSelected={isNodeSelected}
                            />,
                            node
                        );
                    })
                )}
            </div>
        </div>
    );
}
