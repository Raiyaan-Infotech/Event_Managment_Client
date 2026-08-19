"use client"

import React, { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

interface ResizableProps {
    width: string;
    height: string;
    left: string;
    top: string;
    logicalWidth: number;
    logicalHeight: number;
    logicalX: number;
    logicalY: number;
    onResize: (w: number, h: number) => void;
    onMove?: (x: number, y: number) => void;
    onEnd?: () => void;
    onRemove?: () => void;
    children: React.ReactNode;
    className?: string;
    isSelected?: boolean;
}

export default function Resizable({
    width,
    height,
    left,
    top,
    logicalWidth,
    logicalHeight,
    logicalX,
    logicalY,
    onResize,
    onMove,
    onEnd,
    onRemove,
    children,
    className,
    isSelected,
}: ResizableProps) {
    const [isResizing, setIsResizing] = useState(false)
    const [isMoving, setIsMoving] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const dragData = useRef({ startX: 0, startY: 0, startW: 0, startH: 0, startLeft: 0, startTop: 0 })

    const handleResizeStart = (e: React.MouseEvent) => {
        if (!isSelected) return
        e.stopPropagation()
        e.preventDefault()

        setIsResizing(true)
        dragData.current = {
            startX: e.clientX,
            startY: e.clientY,
            startW: logicalWidth,
            startH: logicalHeight,
            startLeft: logicalX,
            startTop: logicalY
        }
    }

    const handleMoveStart = (e: React.MouseEvent) => {
        if (!isSelected) return

        // Don't start move if clicking on an editable element for focus
        if ((e.target as HTMLElement).isContentEditable) return

        e.stopPropagation()

        setIsMoving(true)
        dragData.current = {
            startX: e.clientX,
            startY: e.clientY,
            startW: logicalWidth,
            startH: logicalHeight,
            startLeft: logicalX,
            startTop: logicalY
        }
    }

    useEffect(() => {
        if (!isResizing && !isMoving) return

        const handleMouseMove = (e: MouseEvent) => {
            const parentWidth = containerRef.current?.offsetParent?.clientWidth || 375;
            const parentHeight = containerRef.current?.offsetParent?.clientHeight || 667;

            // Convert screen pixel delta to logical coordinate delta
            const dx = (e.clientX - dragData.current.startX) * (375 / parentWidth);
            const dy = (e.clientY - dragData.current.startY) * (667 / parentHeight);

            if (isResizing) {
                onResize(
                    Math.max(20, Math.round(dragData.current.startW + dx)),
                    Math.max(20, Math.round(dragData.current.startH + dy))
                )
            } else if (isMoving && onMove) {
                onMove(
                    Math.round(dragData.current.startLeft + dx),
                    Math.round(dragData.current.startTop + dy)
                )
            }
        }

        const handleMouseUp = () => {
            setIsResizing(false)
            setIsMoving(false)
            onEnd?.()
        }

        window.addEventListener("mousemove", handleMouseMove)
        window.addEventListener("mouseup", handleMouseUp)

        return () => {
            window.removeEventListener("mousemove", handleMouseMove)
            window.removeEventListener("mouseup", handleMouseUp)
        }
    }, [isResizing, isMoving, onResize, onMove, onEnd])

    return (
        <div
            ref={containerRef}
            style={{
                width,
                height,
                left,
                top,
                position: "absolute",
                zIndex: isSelected ? 50 : 10
            }}
            className={cn("group cursor-move absolute", className)}
            onMouseDown={handleMoveStart}
        >
            {children}

            {isSelected && (
                <>
                    {/* Outline */}
                    <div className="absolute inset-[-4px] border-2 border-primary rounded-md pointer-events-none z-50 animate-in fade-in" />

                    {/* Resize Handle */}
                    <div
                        onMouseDown={handleResizeStart}
                        className="absolute -right-2 -bottom-2 size-4 bg-primary border-2 border-white rounded-full z-[60] cursor-nwse-resize shadow-md hover:scale-125 transition-transform"
                    />

                    {/* Remove Button */}
                    <button
                        onMouseDown={(e) => { e.stopPropagation(); onRemove?.() }}
                        className="absolute -right-2 -top-2 size-5 bg-red-500 text-white rounded-full z-[60] flex items-center justify-center shadow-md hover:bg-red-600 transition-all hover:scale-125 focus:outline-none"
                        title="Remove Element"
                    >
                        <X size={12} strokeWidth={3} />
                    </button>
                </>
            )}
        </div>
    )
}
