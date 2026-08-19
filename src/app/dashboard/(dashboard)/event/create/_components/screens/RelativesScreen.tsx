"use client"

interface RelativesScreenProps {
    props: any;
}

export default function RelativesScreen({ props }: RelativesScreenProps) {
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
                    zIndex: 0
                }}
            />

            {/* CONTENT LAYER */}
            <div className="relative z-10 w-full h-full flex flex-col overflow-y-auto chat-scrollbar">
                {/* Relative cards are rendered by Canvas elements layer */}
            </div>
        </div>
    );
}
