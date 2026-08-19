"use client"

interface SplashScreenProps {
    props: any;
}

export default function SplashScreen({ props }: SplashScreenProps) {
    const {
        bgColor = "#4F46E5",
        bgImage,
        backgroundType = "color"
    } = props;

    const style = {
        backgroundColor: backgroundType === "color" ? bgColor : undefined,
        backgroundImage: backgroundType === "image" && bgImage ? `url(${bgImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    };

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
            <div className="relative z-10 w-full h-full p-8 overflow-hidden">
                {/* All content is rendered as movable elements on the canvas */}
            </div>
        </div>
    );
}
