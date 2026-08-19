"use client"

import { Calendar, MapPin, Bell, Heart, Share2, Compass, Layers, Zap, Home, User } from "lucide-react"

interface HomeScreenProps {
    props: any;
}

export default function HomeScreen({ props }: HomeScreenProps) {
    const { bgColor = "#F9FAFB", bgImage, backgroundType = "color" } = props;

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
                    zIndex: 0
                }}
            />

            {/* CONTENT LAYER */}
            <div className="relative z-10 w-full h-full overflow-y-auto chat-scrollbar">
                {/* All home screen content is now rendered as movable elements on the canvas */}
            </div>
        </div>
    );
}
