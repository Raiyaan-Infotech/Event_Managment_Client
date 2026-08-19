"use client"

import { useState, useEffect } from "react"
import { LayoutGrid, Check, Settings2, Sparkle, LogIn, Home, CalendarDays, Users, Info, MapPin } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

const menuItems = [
    { id: "splash", label: "Splash Screen", icon: Sparkle, description: "Initial welcome animation and logo" },
    { id: "login", label: "Login Screen", icon: LogIn, description: "Authentication and user sign in" },
    { id: "home", label: "Home Screen", icon: Home, description: "Main dashboard/feed for events" },
    { id: "agenda", label: "Agenda", icon: CalendarDays, description: "Event schedule and timelines" },
    { id: "participants", label: "Create Participants", icon: Users, description: "Registration and attendee management" },
    { id: "eventInfo", label: "Event Info", icon: Info, description: "Detailed description and details" },
    { id: "venue", label: "Venue", icon: MapPin, description: "Location maps and address details" },
]

export default function MenuSettingsPage() {
    const [visibility, setVisibility] = useState<Record<string, boolean>>({})
    const [isSaving, setIsSaving] = useState(false)
    const [hasLoaded, setHasLoaded] = useState(false)

    useEffect(() => {
        const saved = localStorage.getItem("event-builder-menu-settings")
        if (saved) {
            setVisibility(JSON.parse(saved))
        } else {
            // Default all to true
            const defaults = menuItems.reduce((acc, item) => ({ ...acc, [item.id]: true }), {})
            setVisibility(defaults)
        }
        setHasLoaded(true)
    }, [])

    const handleToggle = (id: string) => {
        const newVisibility = { ...visibility, [id]: !visibility[id] }
        setVisibility(newVisibility)
    }

    const handleSave = () => {
        setIsSaving(true)
        localStorage.setItem("event-builder-menu-settings", JSON.stringify(visibility))
        setTimeout(() => {
            setIsSaving(false)
            toast.success("Menu settings updated successfully!", {
                description: "Your changes are now live in the Event Builder.",
                icon: <Check className="text-emerald-500" size={16} strokeWidth={3} />
            })
        }, 800)
    }

    if (!hasLoaded) return null

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <Settings2 className="text-primary size-8" />
                        Menu Settings
                    </h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[11px] mt-1 ml-11">
                        Manage Event Builder Components
                    </p>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-primary hover:bg-primary/90 text-white font-black px-8 h-12 rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-95"
                >
                    {isSaving ? "Saving..." : "Save Changes"}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {menuItems.map((item) => {
                    const Icon = item.icon
                    const isActive = visibility[item.id] !== false

                    return (
                        <Card
                            key={item.id}
                            className={`border-2 transition-all duration-300 rounded-[24px] overflow-hidden ${isActive ? "border-primary/10 bg-white" : "border-slate-100 bg-slate-50/50 grayscale opacity-60"
                                }`}
                        >
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`size-14 rounded-2xl flex items-center justify-center transition-all ${isActive ? "bg-primary/10 text-primary scale-110" : "bg-slate-200 text-slate-400"
                                            }`}>
                                            <Icon size={24} strokeWidth={2.5} />
                                        </div>
                                        <div>
                                            <h3 className="text-[17px] font-black text-slate-900 leading-tight">
                                                {item.label}
                                            </h3>
                                            <p className="text-[12px] font-medium text-slate-500 mt-0.5 max-w-[200px]">
                                                {item.description}
                                            </p>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={isActive}
                                        onCheckedChange={() => handleToggle(item.id)}
                                        className="data-[state=checked]:bg-primary"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* <div className="bg-slate-900 rounded-[32px] p-8 mt-12 overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform duration-500">
                    <LayoutGrid size={120} />
                </div>
                <div className="relative z-10 space-y-4">
                    <div className="size-12 rounded-2xl bg-primary flex items-center justify-center shadow-xl shadow-primary/40">
                        <Check className="text-white" size={24} strokeWidth={3} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white tracking-tight">Configuration Dynamic</h3>
                        <p className="text-slate-400 text-sm font-bold max-w-md mt-1 leading-relaxed">
                            Changes made here will immediately reflect in the "Create Event" page builder sidebar.
                            Use this to simplify your workflow by hiding unused screens.
                        </p>
                    </div>
                </div>
            </div> */}
        </div>
    )
}
