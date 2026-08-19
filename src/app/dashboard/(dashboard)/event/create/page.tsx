"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import { cn } from "@/lib/utils"
import { useRouter, useSearchParams } from "next/navigation"
import { BuilderNode, ScreenType, ViewMode, HistoryState, SCREEN_TEMPLATES, CanvasElement } from "./_components/types"
import ThemeLeftSidebar from "./_components/ThemeLeftSidebar"
import Toolbar from "./_components/Toolbar"
import ThemePanel from "./_components/ThemePanel"
import CustomizePanel from "./_components/CustomizePanel"
import Canvas from "./_components/Canvas"
import { THEMES, COLOR_PALETTES } from "./_components/theme/themeConfig"
import { Plus, Minus, PanelLeft, PanelRight, Palette } from "lucide-react"
import {
    SidebarProvider,
    SidebarInset,
    Sidebar,
    SidebarContent,
} from "@/components/ui/sidebar"
import { useIsMobile } from "@/hooks/use-mobile"

const THEME_CONTENT: Record<string, Record<ScreenType, Record<string, string>>> = {
    "south-indian-marriage": {
        theme: {},
        splash: { "splash-title": "Aditya & Sahana", "splash-description": "A Divine Union of Hearts" },
        splash2: {},
        splash3: {},
        register: {
            "reg-title": "JOIN THE CELEBRATION",
            "reg-description": "Create your guest account for the wedding",
            "reg-button": "REGISTER NOW"
        },
        login: { "login-title": "GUEST PORTAL", "login-description": "Enter your invitation code", "login-button": "ENTER CELEBRATION" },
        home: { "home-title": "Welcome to Sams family wedding", "home-description": "We are honored to have you celebrate this sacred union with us.", "home-button": "JOIN THE WEDDING" },
        agenda: { "agenda-title": "Wedding Schedule", "agenda-description": "FRI 24 MAY", "agenda-list": "06:30 AM - Mangala Snanam & Pooja\n\n09:15 AM - The Knotting (Muhurtham)\n\n12:30 PM - Grand South Indian Feast\n\n07:00 PM - Wedding Reception" },
        relatives: {
            "relatives-title": "DISTINGUISHED RELATIVES",
            "relatives-description": "Our Beloved Family",
            "relatives-list": "Mr. Srinivasan - Father of the Groom\n\nMrs. Lakshmi - Mother of the Groom\n\nMr. Rajesh - Father of the Bride\n\nMrs. Meena - Mother of the Bride"
        },
        participants: { "participants-title": "Confirm Attendance", "participants-description": "Confirm your presence with us", "part-button": "CONFIRM ATTENDANCE" },
        eventInfo: { "event-title": "The Grand Wedding", "event-description": "Witness the sacred union celebrating two families with vibrant Vedic rituals and cultural heritage." },
        venue: { "venue-title": "Venue & Directions", "venue-description": "Royal Heritage Palace\n123 Temple Road, Chennai", "venue-button": "NAVIGATE TO VENUE" }
    },
    "corporate-event": {
        theme: {},
        splash: { "splash-title": "Global Tech Summit", "splash-description": "Innovating the Future" },
        splash2: {},
        splash3: {},
        register: {
            "reg-title": "EVENT REGISTRATION",
            "reg-description": "Create your corporate pass for the summit",
            "reg-button": "GET ACCESS"
        },
        login: { "login-title": "Corporate Login", "login-description": "Use your corporate credentials", "login-button": "ENTER SUMMIT" },
        home: { "home-title": "Welcome to the Tech Summit", "home-description": "Connecting industry leaders and innovators from across the globe.", "home-button": "VIEW SESSIONS" },
        agenda: { "agenda-title": "Full Schedule", "agenda-description": "MON 12 AUG", "agenda-list": "09:00 AM - Opening Keynote\n\n11:00 AM - AI & Future Panel\n\n01:00 PM - Networking Lunch\n\n03:00 PM - Technical Workshops" },
        relatives: {
            "relatives-title": "KEYNOTE SPEAKERS",
            "relatives-description": "Industry Leaders",
            "relatives-list": "Satya Nadella - CEO, Microsoft\n\nSundar Pichai - CEO, Google\n\nElon Musk - CEO, Tesla\n\nMark Zuckerberg - CEO, Meta"
        },
        participants: { "participants-title": "Registration", "participants-description": "Secure your business pass", "part-button": "SUBMIT REGISTRATION" },
        eventInfo: { "event-title": "Strategic Conference", "event-description": "A 3-day immersive networking event for top industrial leaders and developers." },
        venue: { "venue-title": "Conference Venue", "venue-description": "Metropolitan Center\nGrand Plaza, New York", "venue-button": "GET DIRECTIONS" }
    }
}

export default function BuilderPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const screenParam = searchParams.get("screen") as ScreenType

    const [nodes, setNodes] = useState<BuilderNode[]>([])
    const [selectedScreen, setSelectedScreenState] = useState<ScreenType>("theme")

    // Sync state with URL param on mount and when param changes
    useEffect(() => {
        if (screenParam && screenParam !== selectedScreen) {
            setSelectedScreenState(screenParam)
        }
    }, [screenParam])

    const setSelectedScreen = useCallback((screen: ScreenType) => {
        setSelectedScreenState(screen)
        // Update URL without a full refresh
        const params = new URLSearchParams(searchParams.toString())
        params.set("screen", screen)
        router.push(`?${params.toString()}`, { scroll: false })
    }, [router, searchParams])

    const [view, setView] = useState<ViewMode>("iphone-7")
    const [zoom, setZoom] = useState(50)
    const [mounted, setMounted] = useState(false)
    const [currentThemeId, setCurrentThemeId] = useState(THEMES[0].id)
    const [currentPalette, setCurrentPalette] = useState(COLOR_PALETTES.Winter)
    const isMobile = useIsMobile()
    const [leftSidebarOpen, setLeftSidebarOpen] = useState(true)
    const [rightSidebarOpen, setRightSidebarOpen] = useState(true)
    const [isThemeApplied, setIsThemeApplied] = useState(false)
    const [numSplashScreens, setNumSplashScreens] = useState(1)

    // Close sidebars on mobile by default
    useEffect(() => {
        if (isMobile) {
            setLeftSidebarOpen(false)
            setRightSidebarOpen(false)
        } else {
            setLeftSidebarOpen(true)
            setRightSidebarOpen(true)
        }
    }, [isMobile])

    // Select the current active node based on selectedScreen
    const selectedId = nodes.find(n => n.type === selectedScreen)?.id || null
    const selectedNode = nodes.find(n => n.id === selectedId) || null

    // Ensure component is mounted before rendering to avoid SSR/CSR mismatches
    useEffect(() => {
        setMounted(true)
        // Initialize nodes if empty
        setNodes(prev => {
            const screenTypes = ["theme", "register", "login", "splash", "home", "agenda", "relatives", "participants", "eventInfo", "venue"] as ScreenType[];

            // If completely empty, initialize all
            if (prev.length === 0) {
                return screenTypes.map(type => {
                    const template = SCREEN_TEMPLATES[type]
                    return {
                        id: crypto.randomUUID(),
                        type,
                        props: { ...template.defaultProps },
                        elements: template.defaultElements ? template.defaultElements.map(el => ({ ...el })) : []
                    }
                })
            }

            // Ensure existing list elements follow the new 'straight-line' professional alignment
            return prev.map(node => {
                let updatedElements = node.elements || [];

                if (updatedElements.length === 0) {
                    const template = SCREEN_TEMPLATES[node.type];
                    if (template?.defaultElements) {
                        updatedElements = template.defaultElements.map(el => ({ ...el }));
                    }
                } else {
                    // Migration: Reset 'theme' screen to new minimalist design if it contains old elements
                    if (node.type === "theme" && updatedElements.some(el => el.id === "theme-description" || el.id === "theme-agenda")) {
                        const template = SCREEN_TEMPLATES.theme;
                        if (template.defaultElements) {
                            updatedElements = template.defaultElements.map(el => ({ ...el }));
                        }
                    }

                    // Migration: Force left alignment for list elements if they are still centered
                    updatedElements = updatedElements.map(el => {
                        if (el.id.includes("list") && el.style?.textAlign === "center") {
                            return {
                                ...el,
                                x: 45,
                                width: 300,
                                style: { ...el.style, textAlign: "left" }
                            };
                        }
                        return el;
                    });
                }

                return { ...node, elements: updatedElements };
            });
        })
    }, [])

    const handleUpdateNode = useCallback((id: string, newProps: any) => {
        setNodes((prev) => prev.map(node =>
            node.id === id ? { ...node, props: { ...node.props, ...newProps } } : node
        ))
    }, [])

    const handleUpdateNumSplashScreens = useCallback((count: number) => {
        setNumSplashScreens(count);
        setNodes(prev => {
            const typesToAdd: ScreenType[] = [];
            if (count >= 2 && !prev.find(n => n.type === "splash2")) typesToAdd.push("splash2");
            if (count >= 3 && !prev.find(n => n.type === "splash3")) typesToAdd.push("splash3");

            let newNodes = [...prev];

            // Add missing ones
            typesToAdd.forEach(type => {
                const template = SCREEN_TEMPLATES[type];
                newNodes.push({
                    id: crypto.randomUUID(),
                    type,
                    props: { ...template.defaultProps, bgColor: currentPalette[0] },
                    elements: template.defaultElements ? template.defaultElements.map(el => ({
                        ...el,
                        style: {
                            ...el.style,
                            backgroundColor: el.type === "button" ? currentPalette[2] : el.style?.backgroundColor,
                            color: el.type === "button" ? "#FFFFFF" : (el.id.includes("title") ? currentPalette[4] : currentPalette[3])
                        }
                    })) : []
                });
            });

            // Ensure order is correct or logical (maybe not strictly necessary but nice)
            return newNodes;
        });
    }, [currentPalette]);

    const handleUpdateElements = useCallback((nodeId: string, newElements: any[]) => {
        setNodes((prev) => prev.map(node =>
            node.id === nodeId ? { ...node, elements: newElements } : node
        ))
    }, [])

    const applyThemeToNodes = useCallback((themeId: string, palette: string[], eventType: string) => {
        setCurrentThemeId(themeId)
        setCurrentPalette(palette)
        setIsThemeApplied(true)

        // Force theme choice if corporate event is selected
        const actualThemeId = (eventType === "Corporate Event") ? "corporate-event" : themeId;
        const themeContentOverrides = THEME_CONTENT[actualThemeId] || {}

        setNodes(prev => {
            // Generate initial nodes if they don't exist yet
            let currentNodes = prev;
            if (prev.length === 0) {
                currentNodes = (["theme", "register", "login", "splash", "home", "agenda", "relatives", "participants", "eventInfo", "venue"] as ScreenType[]).map(type => {
                    const template = SCREEN_TEMPLATES[type]
                    return {
                        id: crypto.randomUUID(),
                        type,
                        props: { ...template.defaultProps },
                        elements: template.defaultElements ? template.defaultElements.map(el => ({ ...el })) : []
                    }
                })
            }

            return currentNodes.map(node => {
                const newProps = { ...node.props }
                const screenOverrides = { ...(themeContentOverrides[node.type] || {}) }

                // Pull elements from template if the current node has none (handles stale state)
                let baseElements = node.elements || [];
                if (baseElements.length === 0) {
                    baseElements = SCREEN_TEMPLATES[node.type].defaultElements?.map(el => ({ ...el })) || [];
                }

                // Apply background color from palette
                newProps.bgColor = palette[0]

                const newElements = baseElements.map(el => {
                    const newStyle = { ...el.style }
                    let newContent = el.content

                    // Apply content overrides based on element ID
                    if (screenOverrides[el.id]) {
                        newContent = screenOverrides[el.id]
                    }

                    // Border Radius Logic - Responsive to element type
                    const radius = "8px";
                    const buttonRadius = "25px"; // Rounded for buttons

                    // Color & Style Logic based on 5-color palette
                    if (el.type === "button" || el.id.includes("badge") || el.id.includes("cta") || el.id.includes("nav-bg")) {
                        newStyle.backgroundColor = palette[2]
                        newStyle.color = "#FFFFFF"
                        newStyle.borderRadius = el.style?.borderRadius || buttonRadius
                    } else if (el.type === "text") {
                        if (el.id.includes("title") || el.id.includes("header")) {
                            newStyle.color = palette[4]
                        } else {
                            newStyle.color = palette[3]
                        }
                    } else if (el.type === "input") {
                        newStyle.borderColor = palette[1]
                        newStyle.color = palette[3]
                        newStyle.backgroundColor = "#FFFFFF"
                        newStyle.borderRadius = radius
                    } else if (el.type === "divider" || el.id.includes("divider")) {
                        newStyle.backgroundColor = palette[1]
                    } else if (el.type === "icon") {
                        newStyle.color = palette[2]
                        newStyle.borderRadius = "20px"
                    } else if (el.type === "image") {
                        newStyle.borderRadius = radius
                    }

                    return { ...el, style: newStyle, content: newContent }
                })

                return { ...node, props: newProps, elements: newElements }
            })
        })
    }, [])

    const handleReset = useCallback(() => {
        const resetNodes: BuilderNode[] = (["theme", "register", "login", "splash", "home", "agenda", "relatives", "participants", "eventInfo", "venue"] as ScreenType[]).map(type => {
            const template = SCREEN_TEMPLATES[type]
            return {
                id: crypto.randomUUID(),
                type,
                props: { ...template.defaultProps },
                elements: template.defaultElements ? template.defaultElements.map(el => ({ ...el })) : []
            }
        })

        // Re-apply personal message upon reset
        const themedReset = resetNodes.map(node => {
            if (node.type === "splash") {
                const splashTitle = node.elements?.find(el => el.id === "splash-title")
                if (splashTitle) splashTitle.content = "Welcome to Mr. Sam's Family Wedding"
            }
            return node
        })

        setNodes(themedReset)
        setCurrentPalette(COLOR_PALETTES.Winter)
        setCurrentThemeId(THEMES[0].id)
        setIsThemeApplied(false)
    }, [])

    const screenIndex = (["theme", "register", "login", "splash", "home", "agenda", "relatives", "participants", "eventInfo", "venue"] as ScreenType[]).indexOf(selectedScreen) + 1;

    if (!mounted) return null

    return (
        <SidebarProvider open={leftSidebarOpen} onOpenChange={setLeftSidebarOpen} className="flex-1 flex flex-col min-h-0 overflow-hidden bg-[#F8FAFC]">
            <div className="flex-1 flex min-h-0 overflow-hidden relative">
                {/* Sidebar 2: Left Sidebar (Menu) */}
                {leftSidebarOpen && (
                    <ThemeLeftSidebar
                        selectedScreen={selectedScreen}
                        onSelectScreen={setSelectedScreen}
                        isThemeApplied={isThemeApplied}
                        numSplashScreens={numSplashScreens}
                    />
                )}

                {/* Main Content Area */}
                <SidebarInset className="flex-1 flex flex-col min-w-0 relative bg-[#F1F5F9] overflow-hidden">
                    <div className="flex-1 flex min-h-0 overflow-hidden relative">
                        <div className="flex-1 relative flex flex-col min-h-0 overflow-hidden">
                            <Toolbar
                                view={view}
                                setView={setView}
                                leftSidebarOpen={leftSidebarOpen}
                                setLeftSidebarOpen={setLeftSidebarOpen}
                                rightSidebarOpen={rightSidebarOpen}
                                setRightSidebarOpen={setRightSidebarOpen}
                                zoom={zoom}
                                setZoom={setZoom}
                            />

                            <div className="flex-1 relative overflow-auto chat-scrollbar bg-[#F1F5F9]">
                                {!isThemeApplied && selectedScreen !== "theme" ? (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-slate-50/80 backdrop-blur-sm z-50">
                                        <div className="size-20 bg-white rounded-3xl shadow-xl flex items-center justify-center text-primary mb-6">
                                            <Palette size={40} />
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight mb-2">Select Theme First</h3>
                                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs max-w-xs leading-relaxed">
                                            Please complete the 5 steps in the <span className="text-primary font-black">Theme</span> tab and click <span className="text-primary font-black">Create Event</span> to unlock this page.
                                        </p>
                                        <button
                                            onClick={() => setSelectedScreen("theme")}
                                            className="mt-8 px-8 py-3 bg-primary text-white rounded-full text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
                                        >
                                            Take me to Theme
                                        </button>
                                    </div>
                                ) : (
                                    <Canvas
                                        nodes={nodes.filter(n => n.type === selectedScreen)}
                                        selectedId={selectedId}
                                        setSelectedId={() => { }} // Lock selection for this theme view
                                        selectedElementId={null}
                                        setSelectedElementId={() => { }}
                                        onUpdate={handleUpdateNode}
                                        onUpdateElements={handleUpdateElements}
                                        view={view}
                                        zoom={zoom}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Sidebar 3: Right Sidebar (Customize) */}
                        {rightSidebarOpen && (
                            selectedScreen === "theme" ? (
                                <ThemePanel
                                    onApplyTheme={applyThemeToNodes}
                                    onReset={handleReset}
                                    currentThemeId={currentThemeId}
                                    currentPalette={currentPalette}
                                />
                            ) : isThemeApplied ? (
                                <CustomizePanel
                                    selectedNode={selectedNode}
                                    onUpdateProps={handleUpdateNode}
                                    onUpdateElements={handleUpdateElements}
                                    onReset={handleReset}
                                    numSplashScreens={numSplashScreens}
                                    onUpdateNumSplashScreens={handleUpdateNumSplashScreens}
                                />
                            ) : (
                                <Sidebar
                                    side="right"
                                    collapsible="none"
                                    className="border-l border-border/50 bg-sidebar shadow-2xl h-full w-[340px]"
                                >
                                    <SidebarContent className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-slate-50/30">
                                        <div className="size-16 bg-white rounded-[24px] shadow-sm flex items-center justify-center text-slate-200 mb-6">
                                            <Palette size={32} />
                                        </div>

                                        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest leading-relaxed">
                                            Apply a theme to<br />unlock customization
                                        </p>
                                    </SidebarContent>
                                </Sidebar>
                            )
                        )}

                        {/* Mobile Overlay */}
                        {isMobile && (leftSidebarOpen || rightSidebarOpen) && (
                            <div
                                className="fixed inset-0 bg-black/5 backdrop-blur-[2px] z-40 transition-opacity"
                                onClick={() => {
                                    setLeftSidebarOpen(false)
                                    setRightSidebarOpen(false)
                                }}
                            />
                        )}
                    </div>
                </SidebarInset>
            </div>
        </SidebarProvider>
    )
}
