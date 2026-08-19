"use client"

import { Github, Chrome } from "lucide-react"

interface LoginScreenProps {
    props: any;
}

export default function LoginScreen({ props }: LoginScreenProps) {
    const { bgColor = "#FFFFFF", bgImage, backgroundType = "color" } = props;
    return (
        <div className="w-full h-full relative overflow-hidden rounded-[inherit] transition-all duration-500">
            {/* BACKGROUND LAYER - Fits exact view height/width */}
            <div
                style={{
                    backgroundColor: backgroundType === "color" ? bgColor : undefined,
                    backgroundImage: backgroundType === "image" && bgImage ? `url(${bgImage})` : undefined,
                    backgroundSize: "100% 100%",
                    backgroundPosition: "center",
                    position: "absolute",
                    inset: 0,
                    zIndex: 0,
                    // Border Radius Logic - Reduced for professional look (border sm)
                    borderRadius: "2px",
                }}
            />

            {/* CONTENT LAYER */}
            <div className="relative z-10 w-full h-full flex flex-col p-8 overflow-y-auto chat-scrollbar">
                {/* The content (titles, inputs, buttons) is now rendered as movable elements on the canvas */}

                <div className="h-10 shrink-0" />
            </div>
        </div>
    );
}
