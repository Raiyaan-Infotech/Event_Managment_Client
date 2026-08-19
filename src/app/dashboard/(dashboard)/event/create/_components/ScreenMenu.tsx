import { useState, useEffect } from "react"
import { ScreenType, SCREEN_TEMPLATES } from "./types"
import {
    Sparkle,
    LogIn,
    Home,
    CalendarDays,
    Users,
    Info,
    MapPin
} from "lucide-react"

const icons: Record<string, any> = {
    splash: Sparkle,
    login: LogIn,
    home: Home,
    agenda: CalendarDays,
    participants: Users,
    eventInfo: Info,
    venue: MapPin,
}

interface ScreenMenuProps {
    onAdd: (type: ScreenType) => void;
}

export default function ScreenMenu({ onAdd }: ScreenMenuProps) {
    const [visibility, setVisibility] = useState<Record<string, boolean>>({})

    useEffect(() => {
        const saved = localStorage.getItem("event-builder-menu-settings")
        if (saved) {
            setVisibility(JSON.parse(saved))
        } else {
            // Default all to true if nothing saved
            const defaults = (Object.keys(SCREEN_TEMPLATES) as ScreenType[]).reduce((acc, type) => ({
                ...acc, [type]: true
            }), {})
            setVisibility(defaults)
        }
    }, [])

    return (
        <div className="w-[300px] border-r bg-white flex flex-col h-full shrink-0">
            <div className="p-3 border-b border-slate-100">
                <h2 className="text-[18px] font-black text-slate-900 leading-tight">Menu Items</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-0">
                {(Object.keys(SCREEN_TEMPLATES) as ScreenType[])
                    .filter((type) => visibility[type] !== false) // Filter based on settings
                    .map((type) => {
                        const config = SCREEN_TEMPLATES[type];
                        const Icon = icons[type];

                        return (
                            <button
                                key={type}
                                onClick={() => onAdd(type)}
                                className="w-full flex items-center gap-4 p-3.5 rounded-2xl bg-slate-50 border border-transparent hover:bg-slate-100 hover:border-slate-200 transition-all group mb-3"
                            >
                                <div className="size-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                                    <Icon size={20} strokeWidth={2.5} />
                                </div>
                                <div className="text-left leading-tight">
                                    <p className="text-[12.5px] font-bold text-slate-800 tracking-tight">{config.label}</p>
                                    <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest mt-0.5">{type}</p>
                                </div>
                            </button>
                        )
                    })}
            </div>
        </div>
    )
}
