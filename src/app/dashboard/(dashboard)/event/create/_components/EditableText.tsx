"use client"

import React from "react"
import { cn } from "@/lib/utils"

interface EditableTextProps {
    value: string;
    style?: React.CSSProperties;
    className?: string;
    isSelected?: boolean;
    onClick?: () => void;
    as?: "h1" | "h2" | "h3" | "p" | "span" | "label";
}

export default function EditableText({
    value,
    style,
    className,
    isSelected,
    onClick,
    as: Component = "span"
}: EditableTextProps) {
    return (
        <Component
            onClick={(e) => {
                e.stopPropagation();
                onClick?.();
            }}
            style={style}
            className={cn(
                "cursor-pointer transition-all hover:bg-primary/5 rounded-sm p-0.5",
                isSelected && "ring-2 ring-primary ring-offset-2 bg-primary/5",
                className
            )}
        >
            {value}
        </Component>
    );
}
