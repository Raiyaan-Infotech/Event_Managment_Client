"use client"

import { ChevronDown, PanelLeft, PanelRight, Smartphone, Monitor, Tablet as TabletIcon, ZoomIn, ZoomOut, Search } from "lucide-react"
import { ViewMode, DEVICES } from "./types"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ToolbarProps {
    view: ViewMode;
    setView: (view: ViewMode) => void;
    leftSidebarOpen: boolean;
    setLeftSidebarOpen: (open: boolean) => void;
    rightSidebarOpen: boolean;
    setRightSidebarOpen: (open: boolean) => void;
    zoom: number;
    setZoom: (zoom: number) => void;
}

export default function Toolbar({
    view,
    setView,
    leftSidebarOpen,
    setLeftSidebarOpen,
    rightSidebarOpen,
    setRightSidebarOpen,
    zoom,
    setZoom,
}: ToolbarProps) {
    return (
        <div className="h-[56px] border-b border-border bg-card/80 backdrop-blur-md px-2 sm:px-4 flex items-center justify-between shadow-sm z-20 sticky top-0">
            {/* Left Section: Sidebar Toggle */}
            <div className="flex-1 flex items-center">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
                    className="w-8 h-8 flex items-center justify-center rounded-sm border border-border bg-transparent text-muted-foreground hover:bg-accent hover:text-primary hover:border-primary transition-all duration-200"
                    title={leftSidebarOpen ? "Collapse Event Menu" : "Expand Event Menu"}
                >
                    <PanelLeft size={16} />
                </Button>
            </div>

            {/* Middle Section: Device Selector & Zoom Controls - SEPARATED */}
            <div className="flex items-center gap-2 sm:gap-4">
                {/* Device Selector Pill */}
                <div className="flex items-center bg-slate-100/50 rounded-full py-0.5 px-2 border border-slate-200/60 shadow-inner">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-1.5 hover:bg-white/80 rounded-full flex items-center gap-1 transition-all"
                            >
                                <Smartphone size={13} className="text-primary" />
                                <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider hidden sm:inline-block">
                                    {DEVICES.find(d => d.id === view)?.name || view}
                                </span>
                                <ChevronDown size={11} className="text-slate-400" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="center" className="w-56 p-2">
                            <DropdownMenuLabel className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 py-1.5">
                                Android
                            </DropdownMenuLabel>
                            <DropdownMenuGroup>
                                {DEVICES.filter(d => d.category === "Android").map((device) => (
                                    <DropdownMenuItem
                                        key={device.id}
                                        onClick={() => setView(device.id)}
                                        className={cn(
                                            "flex items-center justify-between py-2 px-2 cursor-pointer rounded-md transition-colors",
                                            view === device.id ? "bg-primary/10 text-primary font-bold" : "text-slate-600 hover:bg-slate-50"
                                        )}
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-[11px]">{device.name}</span>
                                            <span className="text-[9px] text-slate-400">{device.resolution}</span>
                                        </div>
                                        {view === device.id && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuGroup>

                            <DropdownMenuSeparator className="my-1" />

                            <DropdownMenuLabel className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 py-1.5">
                                iPhone
                            </DropdownMenuLabel>
                            <DropdownMenuGroup>
                                {DEVICES.filter(d => d.category === "iPhone").map((device) => (
                                    <DropdownMenuItem
                                        key={device.id}
                                        onClick={() => setView(device.id)}
                                        className={cn(
                                            "flex items-center justify-between py-2 px-2 cursor-pointer rounded-md transition-colors",
                                            view === device.id ? "bg-primary/10 text-primary font-bold" : "text-slate-600 hover:bg-slate-50"
                                        )}
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-[11px]">{device.name}</span>
                                            <span className="text-[9px] text-slate-400">{device.resolution}</span>
                                        </div>
                                        {view === device.id && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuGroup>

                            <DropdownMenuSeparator className="my-1" />

                            <DropdownMenuLabel className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 py-1.5">
                                Tablet
                            </DropdownMenuLabel>
                            <DropdownMenuGroup>
                                {DEVICES.filter(d => d.category === "Tablet").map((device) => (
                                    <DropdownMenuItem
                                        key={device.id}
                                        onClick={() => setView(device.id)}
                                        className={cn(
                                            "flex items-center justify-between py-2 px-2 cursor-pointer rounded-md transition-colors",
                                            view === device.id ? "bg-primary/10 text-primary font-bold" : "text-slate-600 hover:bg-slate-50"
                                        )}
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-[11px]">{device.name}</span>
                                            <span className="text-[9px] text-slate-400">{device.resolution}</span>
                                        </div>
                                        {view === device.id && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                {/* Zoom Controls Pill - More Compact */}
                <div className="flex items-center gap-0.5 bg-slate-100/50 rounded-full py-1 px-1.5 border border-slate-200/60 shadow-inner group/zoom">
                    <button
                        onClick={() => setZoom(Math.max(10, zoom - 10))}
                        disabled={zoom <= 10}
                        className="p-0.5 text-slate-400 hover:text-primary disabled:opacity-30 transition-colors"
                        title="Zoom Out"
                    >
                        <ZoomOut size={10} />
                    </button>

                    <div className="relative flex items-center h-3 w-10 sm:w-16 group">
                        <input
                            type="range"
                            min="10"
                            max="100"
                            step="10"
                            value={zoom}
                            onChange={(e) => setZoom(parseInt(e.target.value))}
                            className="w-full h-[2px] bg-slate-200 rounded-full appearance-none cursor-pointer accent-primary hover:bg-slate-300 transition-all custom-slider"
                            style={{
                                backgroundImage: `linear-gradient(to right, #3b82f6 ${zoom}%, #e2e8f0 ${zoom}%)`
                            }}
                        />
                        <style jsx>{`
            .custom-slider::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: white;
                border: 1px solid #3b82f6;
                cursor: pointer;
                box-shadow: 0 1px 1px rgba(0,0,0,0.1);
                transition: all 0.2s;
            }
            .custom-slider::-webkit-slider-thumb:hover {
                transform: scale(1.2);
            }
        `}</style>
                    </div>

                    <button
                        onClick={() => setZoom(Math.min(100, zoom + 10))}
                        disabled={zoom >= 100}
                        className="p-0.5 text-slate-400 hover:text-primary disabled:opacity-30 transition-colors"
                        title="Zoom In"
                    >
                        <ZoomIn size={12} className="sm:size-[10px]" />
                    </button>

                    <span className="text-[9px] sm:text-[8px] font-black text-slate-500 w-6 sm:w-5 text-right tabular-nums">
                        {zoom}%
                    </span>
                </div>
            </div>

            {/* Right Section: Sidebar Toggle */}
            <div className="flex-1 flex items-center justify-end">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
                    className="w-8 h-8 flex items-center justify-center rounded-sm border border-border bg-transparent text-muted-foreground hover:bg-accent hover:text-primary hover:border-primary transition-all duration-200"
                    title={rightSidebarOpen ? "Collapse Customize Panel" : "Expand Customize Panel"}
                >
                    <PanelRight size={16} />
                </Button>
            </div>
        </div>
    )
}
