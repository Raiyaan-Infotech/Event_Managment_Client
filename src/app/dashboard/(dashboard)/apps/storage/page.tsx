"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faSearch,
    faPlus,
    faEllipsisH,
    faEllipsisV,
    faHome,
    faImage,
    faVideo,
    faFolder,
    faClock,
    faCog,
    faCheck,
    faEye,
    faHeart,
    faFolderOpen,
    faGripHorizontal,
    faListUl,
    faCloudArrowDown,
} from "@fortawesome/free-solid-svg-icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"

export default function StoragePage() {
    const { theme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    return (
        <div className="flex w-full h-full min-h-0 overflow-hidden bg-gray-50 dark:bg-slate-950">
            <style jsx global>{`
                .storage-scrollbar::-webkit-scrollbar { width: 5px; }
                .storage-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .storage-scrollbar::-webkit-scrollbar-thumb { background: #dfe2e6; border-radius: 10px; }
                .storage-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e0; }
                .dark .storage-scrollbar::-webkit-scrollbar-thumb { background: #334155; }
                .storage-scrollbar {
                    overflow-y: auto !important;
                    overflow-x: hidden !important;
                }
            `}</style>
            {/* Middle Section - Left Content */}
            <div className="w-80 h-full flex flex-col min-w-0 min-h-0 overflow-hidden border-r border-gray-200 dark:border-slate-800">
                {/* Header */}
                <div className="sticky top-0 z-20 h-20 border-b border-gray-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm flex items-center px-6 shrink-0">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white">Storage</h2>
                </div>

                <ScrollArea className="flex-1 bg-white dark:bg-slate-950 storage-scrollbar">
                    <div className="p-6">
                        {/* Upload Button */}
                        <Button className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-sm text-sm mb-8 flex items-center justify-center gap-2 shadow-md">
                            <FontAwesomeIcon icon={faCloudArrowDown} className="size-5" />
                            UPLOAD FILES
                        </Button>

                        {/* Navigation Items */}
                        <div className="space-y-1 mb-10">
                            {[
                                { icon: faHome, label: "Home" },
                                { icon: faImage, label: "Images" },
                                { icon: faVideo, label: "Videos" },
                                { icon: faFolder, label: "Folders", badge: "7" },
                                { icon: faClock, label: "History" },
                                { icon: faCog, label: "Settings" },
                            ].map((item, idx) => (
                                <button
                                    key={idx}
                                    className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-semibold text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all"
                                >
                                    <div className="flex items-center gap-3">
                                        <FontAwesomeIcon icon={item.icon} className="size-5 text-gray-600 dark:text-slate-400" />
                                        <span>{item.label}</span>
                                    </div>
                                    {item.badge && (
                                        <span className="size-6 flex items-center justify-center bg-red-500 text-white text-xs rounded-full font-bold">
                                            {item.badge}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Members Section */}
                        <div className="pt-6 border-t border-gray-200 dark:border-slate-800 mb-6">
                            <div className="flex items-center justify-between px-2 mb-4">
                                <span className="text-xs font-black text-gray-500 dark:text-slate-600 uppercase tracking-widest">Members</span>
                                <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
                                    <FontAwesomeIcon icon={faPlus} className="size-4" />
                                </button>
                            </div>
                            <div className="space-y-3">
                                {["Alls", "Users"].map((label, i) => (
                                    <div key={i} className="flex items-center gap-3 cursor-pointer group">
                                        <div className={cn(
                                            "size-4 rounded border flex items-center justify-center transition-colors",
                                            i === 0
                                                ? "bg-blue-600 border-blue-600"
                                                : "bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 group-hover:border-blue-600"
                                        )}>
                                            {i === 0 && <FontAwesomeIcon icon={faCheck} className="size-2.5 text-white" />}
                                        </div>
                                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* FILTER Section */}
                        <div className="pt-6 border-t border-gray-200 dark:border-slate-800">
                            <div className="flex items-center justify-between px-2 mb-4">
                                <span className="text-xs font-black text-gray-500 dark:text-slate-600 uppercase tracking-widest">Filter</span>
                                <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
                                    <FontAwesomeIcon icon={faPlus} className="size-4" />
                                </button>
                            </div>
                            <div className="space-y-2">
                                {[
                                    { icon: faClock, label: "Recent" },
                                    { icon: faHeart, label: "Favorite" },
                                    { icon: faClock, label: "Snoozed" },
                                    { icon: faClock, label: "Important", badge: "3" },
                                    { icon: faFolderOpen, label: "Shared Files" },
                                ].map((item, idx) => (
                                    <button
                                        key={idx}
                                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-semibold text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all"
                                    >
                                        <div className="flex items-center gap-3">
                                            <FontAwesomeIcon icon={item.icon} className="size-4 text-gray-600 dark:text-slate-400" />
                                            <span>{item.label}</span>
                                        </div>
                                        {item.badge && (
                                            <span className="size-5 flex items-center justify-center bg-teal-500 text-white text-xs rounded-full font-bold">
                                                {item.badge}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </div>

            {/* Right Section - Cloud Storage */}
            <div className="flex-1 h-full flex flex-col min-w-0 min-h-0 overflow-hidden">
                {/* Right Header */}
                <div className="sticky top-0 z-20 h-20 border-b border-gray-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm flex items-center justify-between px-8 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-lg bg-green-100 dark:bg-green-950 flex items-center justify-center">
                            <span className="text-xl">☁️</span>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">Dropbox</p>
                                <span className="text-xs text-gray-500 dark:text-slate-400">
                                    <FontAwesomeIcon icon={faCloudArrowDown} className="size-3" />
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800">
                            <FontAwesomeIcon icon={faEye} className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800">
                            <FontAwesomeIcon icon={faHeart} className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800">
                            <FontAwesomeIcon icon={faFolderOpen} className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800">
                            <FontAwesomeIcon icon={faGripHorizontal} className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800">
                            <FontAwesomeIcon icon={faListUl} className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800">
                            <FontAwesomeIcon icon={faPlus} className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800">
                            <FontAwesomeIcon icon={faEllipsisV} className="size-4" />
                        </Button>
                    </div>
                </div>

                <ScrollArea className="flex-1 storage-scrollbar">
                    <div className="w-full min-h-full bg-gray-50 dark:bg-slate-900 px-8 py-8">
                        {/* Cloud Storage Title Section */}
                        <div className="mb-8">
                            <div className="flex items-start justify-between mb-2">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Cloud Storage</h3>
                                <Button className="h-8 px-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 font-bold text-xs rounded hover:bg-gray-50 dark:hover:bg-slate-700">
                                    VIEW MORE
                                </Button>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-slate-400">Total Storage 100 GB (Free space 53.64 GB)</p>
                        </div>

                        {/* Storage Cards Grid */}
                        <div className="grid grid-cols-2 gap-6 mb-12">
                            {/* Local Storage */}
                            <div className="bg-white dark:bg-slate-800 rounded-lg p-5 border border-gray-200 dark:border-slate-700 hover:shadow-md transition-all">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="size-12 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-xl">
                                            ☁️
                                        </div>
                                        <div>
                                            <h6 className="text-sm font-bold text-gray-900 dark:text-white">Local Storage</h6>
                                            <p className="text-xs text-gray-600 dark:text-slate-400">286.45GB / 500.00GB</p>
                                        </div>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="size-8 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300">
                                                <FontAwesomeIcon icon={faEllipsisH} className="size-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-40">
                                            <DropdownMenuItem className="text-sm">Share</DropdownMenuItem>
                                            <DropdownMenuItem className="text-sm">Details</DropdownMenuItem>
                                            <DropdownMenuItem className="text-sm">Rename</DropdownMenuItem>
                                            <DropdownMenuItem className="text-sm">Download</DropdownMenuItem>
                                            <DropdownMenuItem className="text-sm">Copy to...</DropdownMenuItem>
                                            <DropdownMenuItem className="text-sm">Move to...</DropdownMenuItem>
                                            <DropdownMenuItem className="text-sm">Open with...</DropdownMenuItem>
                                            <DropdownMenuItem className="text-sm">Backup</DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-sm text-red-600 dark:text-red-400">Remove</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <p className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-tight mb-3">STORAGE</p>
                                <div className="mb-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-semibold text-gray-700 dark:text-slate-300">286.45GB USED</span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-orange-400 to-orange-500"
                                            style={{ width: "57%" }}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-1 text-gray-600 dark:text-slate-400">
                                    <FontAwesomeIcon icon={faClock} className="size-3" />
                                    <p className="text-xs">Last Activity: 36 Mins Ago</p>
                                </div>
                            </div>

                            {/* Dropbox Storage */}
                            <div className="bg-white dark:bg-slate-800 rounded-lg p-5 border border-gray-200 dark:border-slate-700 hover:shadow-md transition-all">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="size-12 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-xl">
                                            📦
                                        </div>
                                        <div>
                                            <h6 className="text-sm font-bold text-gray-900 dark:text-white">Dropbox Storage</h6>
                                            <p className="text-xs text-gray-600 dark:text-slate-400">5.68GB / 15.00GB</p>
                                        </div>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="size-8 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300">
                                                <FontAwesomeIcon icon={faEllipsisH} className="size-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-40">
                                            <DropdownMenuItem className="text-sm">Share</DropdownMenuItem>
                                            <DropdownMenuItem className="text-sm">Details</DropdownMenuItem>
                                            <DropdownMenuItem className="text-sm">Rename</DropdownMenuItem>
                                            <DropdownMenuItem className="text-sm">Download</DropdownMenuItem>
                                            <DropdownMenuItem className="text-sm">Copy to...</DropdownMenuItem>
                                            <DropdownMenuItem className="text-sm">Move to...</DropdownMenuItem>
                                            <DropdownMenuItem className="text-sm">Open with...</DropdownMenuItem>
                                            <DropdownMenuItem className="text-sm">Backup</DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-sm text-red-600 dark:text-red-400">Remove</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <p className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-tight mb-3">STORAGE</p>
                                <div className="mb-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-semibold text-gray-700 dark:text-slate-300">5.68GB USED</span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600"
                                            style={{ width: "38%" }}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-1 text-gray-600 dark:text-slate-400">
                                    <FontAwesomeIcon icon={faClock} className="size-3" />
                                    <p className="text-xs">Last Activity: 3 Hours Ago</p>
                                </div>
                            </div>

                            {/* Google Drive */}
                            <div className="bg-white dark:bg-slate-800 rounded-lg p-5 border border-gray-200 dark:border-slate-700 hover:shadow-md transition-all">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="size-12 rounded-lg bg-green-100 dark:bg-green-950 flex items-center justify-center text-xl">
                                            🎨
                                        </div>
                                        <div>
                                            <h6 className="text-sm font-bold text-gray-900 dark:text-white">Google Drive</h6>
                                            <p className="text-xs text-gray-600 dark:text-slate-400">4.75GB / 10GB</p>
                                        </div>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="size-8 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300">
                                                <FontAwesomeIcon icon={faEllipsisH} className="size-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-40">
                                            <DropdownMenuItem className="text-sm">Share</DropdownMenuItem>
                                            <DropdownMenuItem className="text-sm">Details</DropdownMenuItem>
                                            <DropdownMenuItem className="text-sm">Rename</DropdownMenuItem>
                                            <DropdownMenuItem className="text-sm">Download</DropdownMenuItem>
                                            <DropdownMenuItem className="text-sm">Copy to...</DropdownMenuItem>
                                            <DropdownMenuItem className="text-sm">Move to...</DropdownMenuItem>
                                            <DropdownMenuItem className="text-sm">Open with...</DropdownMenuItem>
                                            <DropdownMenuItem className="text-sm">Backup</DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-sm text-red-600 dark:text-red-400">Remove</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <p className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-tight mb-3">STORAGE</p>
                                <div className="mb-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-semibold text-gray-700 dark:text-slate-300">4.75GB USED</span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500"
                                            style={{ width: "48%" }}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-1 text-gray-600 dark:text-slate-400">
                                    <FontAwesomeIcon icon={faClock} className="size-3" />
                                    <p className="text-xs">Last Activity: 5 Hours Ago</p>
                                </div>
                            </div>

                            {/* Box Storage */}
                            <div className="bg-white dark:bg-slate-800 rounded-lg p-5 border border-gray-200 dark:border-slate-700 hover:shadow-md transition-all">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="size-12 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-xl">
                                            📁
                                        </div>
                                        <div>
                                            <h6 className="text-sm font-bold text-gray-900 dark:text-white">Box Storage</h6>
                                            <p className="text-xs text-gray-600 dark:text-slate-400">3.64GB / 10.00GB</p>
                                        </div>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="size-8 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300">
                                                <FontAwesomeIcon icon={faEllipsisH} className="size-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-40">
                                            <DropdownMenuItem className="text-sm">Share</DropdownMenuItem>
                                            <DropdownMenuItem className="text-sm">Details</DropdownMenuItem>
                                            <DropdownMenuItem className="text-sm">Rename</DropdownMenuItem>
                                            <DropdownMenuItem className="text-sm">Download</DropdownMenuItem>
                                            <DropdownMenuItem className="text-sm">Copy to...</DropdownMenuItem>
                                            <DropdownMenuItem className="text-sm">Move to...</DropdownMenuItem>
                                            <DropdownMenuItem className="text-sm">Open with...</DropdownMenuItem>
                                            <DropdownMenuItem className="text-sm">Backup</DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-sm text-red-600 dark:text-red-400">Remove</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <p className="text-xs font-bold text-cyan-700 dark:text-cyan-400 uppercase tracking-tight mb-3">STORAGE</p>
                                <div className="mb-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-semibold text-gray-700 dark:text-slate-300">3.64GB USED</span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-cyan-600"
                                            style={{ width: "36%" }}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-1 text-gray-600 dark:text-slate-400">
                                    <FontAwesomeIcon icon={faClock} className="size-3" />
                                    <p className="text-xs">Last Activity: 26 Aug, 2022</p>
                                </div>
                            </div>
                        </div>

                        {/* Recent Files Section */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Recent Files</h3>
                                    <p className="text-sm text-gray-600 dark:text-slate-400">Recent access files (Last access 24 min ago)</p>
                                </div>
                                <Button className="h-8 px-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white font-bold text-xs rounded hover:bg-gray-50 dark:hover:bg-slate-700">
                                    VIEW MORE
                                </Button>
                            </div>

                            {/* Recent Files Grid */}
                            <div className="grid grid-cols-2 gap-6">
                                {/* ZIP File Card */}
                                <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-gray-200 dark:border-slate-700 hover:shadow-md transition-all flex flex-col items-center justify-center min-h-52">
                                    <div className="relative mb-4">
                                        {/* File Icon with corner fold */}
                                        <svg className="w-20 h-24" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            {/* Main file body */}
                                            <rect x="10" y="10" width="70" height="100" rx="4" fill="#E5E7EB" />
                                            {/* Top corner fold */}
                                            <path d="M 80 10 L 80 30 L 60 30 Z" fill="#D1D5DB" />
                                            {/* ZIP Badge */}
                                            <rect x="20" y="45" width="60" height="30" rx="3" fill="#22C55E" />
                                            <text x="50" y="66" fontSize="20" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="Arial">ZIP</text>
                                        </svg>
                                    </div>
                                    <h6 className="text-sm font-bold text-gray-900 dark:text-white text-center">UI/UX Design Templates</h6>
                                    <p className="text-xs text-gray-600 dark:text-slate-400 text-center mt-2">PROJECT / DASHBOARD / WEBAPPS</p>
                                </div>

                                {/* PNG File Card */}
                                <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-gray-200 dark:border-slate-700 hover:shadow-md transition-all flex flex-col items-center justify-center min-h-52">
                                    <div className="relative mb-4">
                                        {/* File Icon with corner fold */}
                                        <svg className="w-20 h-24" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            {/* Main file body */}
                                            <rect x="10" y="10" width="70" height="100" rx="4" fill="#E5E7EB" />
                                            {/* Top corner fold */}
                                            <path d="M 80 10 L 80 30 L 60 30 Z" fill="#D1D5DB" />
                                            {/* PNG Badge */}
                                            <rect x="20" y="45" width="60" height="30" rx="3" fill="#8B5CF6" />
                                            <text x="50" y="66" fontSize="20" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="Arial">PNG</text>
                                        </svg>
                                    </div>
                                    <h6 className="text-sm font-bold text-gray-900 dark:text-white text-center">UI/UX Design Templates</h6>
                                    <p className="text-xs text-gray-600 dark:text-slate-400 text-center mt-2">PROJECT / DASHBOARD / WEBAPPS</p>
                                </div>

                                {/* PDF File Card */}
                                <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-gray-200 dark:border-slate-700 hover:shadow-md transition-all flex flex-col items-center justify-center min-h-52">
                                    <div className="relative mb-4">
                                        {/* File Icon with corner fold */}
                                        <svg className="w-20 h-24" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            {/* Main file body */}
                                            <rect x="10" y="10" width="70" height="100" rx="4" fill="#E5E7EB" />
                                            {/* Top corner fold */}
                                            <path d="M 80 10 L 80 30 L 60 30 Z" fill="#D1D5DB" />
                                            {/* PDF Badge */}
                                            <rect x="20" y="45" width="60" height="30" rx="3" fill="#EF4444" />
                                            <text x="50" y="66" fontSize="20" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="Arial">PDF</text>
                                        </svg>
                                    </div>
                                    <h6 className="text-sm font-bold text-gray-900 dark:text-white text-center">UI/UX Design Templates</h6>
                                    <p className="text-xs text-gray-600 dark:text-slate-400 text-center mt-2">PROJECT / DASHBOARD / WEBAPPS</p>
                                </div>

                                {/* PSD File Card */}
                                <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-gray-200 dark:border-slate-700 hover:shadow-md transition-all flex flex-col items-center justify-center min-h-52">
                                    <div className="relative mb-4">
                                        {/* File Icon with corner fold */}
                                        <svg className="w-20 h-24" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            {/* Main file body */}
                                            <rect x="10" y="10" width="70" height="100" rx="4" fill="#E5E7EB" />
                                            {/* Top corner fold */}
                                            <path d="M 80 10 L 80 30 L 60 30 Z" fill="#D1D5DB" />
                                            {/* PSD Badge */}
                                            <rect x="20" y="45" width="60" height="30" rx="3" fill="#06B6D4" />
                                            <text x="50" y="66" fontSize="20" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="Arial">PSD</text>
                                        </svg>
                                    </div>
                                    <h6 className="text-sm font-bold text-gray-900 dark:text-white text-center">UI/UX Design Templates</h6>
                                    <p className="text-xs text-gray-600 dark:text-slate-400 text-center mt-2">PROJECT / DASHBOARD / WEBAPPS</p>
                                </div>
                            </div>
                        </div>

                        {/* Folders Section */}
                        <div className="mt-12">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Folders</h3>
                                    <p className="text-sm text-gray-600 dark:text-slate-400">Recent access folders (Last access 2 hours ago)</p>
                                </div>
                                <Button className="h-8 px-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white font-bold text-xs rounded hover:bg-gray-50 dark:hover:bg-slate-700">
                                    VIEW MORE
                                </Button>
                            </div>

                            {/* Folders Grid */}
                            <div className="grid grid-cols-2 gap-6">
                                {/* Folder 1 - Green */}
                                <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700 hover:shadow-md transition-all">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 rounded-lg bg-green-100 dark:bg-green-950 flex items-center justify-center text-lg">
                                                📁
                                            </div>
                                            <div>
                                                <h6 className="text-sm font-bold text-gray-900 dark:text-white">UI/UX Templates</h6>
                                                <p className="text-xs text-gray-600 dark:text-slate-400">2,478 FILES</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="flex -space-x-2">
                                            {[0, 1, 2, 3].map((i) => (
                                                <div
                                                    key={i}
                                                    className="size-6 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 border-2 border-white dark:border-slate-800 flex items-center justify-center text-xs font-bold text-gray-700"
                                                >
                                                    {String.fromCharCode(65 + i)}
                                                </div>
                                            ))}
                                        </div>
                                        <span className="text-xs text-gray-600 dark:text-slate-400">862+ members recently access</span>
                                    </div>
                                </div>

                                {/* Folder 2 - Cyan */}
                                <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700 hover:shadow-md transition-all">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 rounded-lg bg-cyan-100 dark:bg-cyan-950 flex items-center justify-center text-lg">
                                                📁
                                            </div>
                                            <div>
                                                <h6 className="text-sm font-bold text-gray-900 dark:text-white">UI/UX Templates</h6>
                                                <p className="text-xs text-gray-600 dark:text-slate-400">2,478 FILES</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="flex -space-x-2">
                                            {[0, 1, 2, 3].map((i) => (
                                                <div
                                                    key={i}
                                                    className="size-6 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 border-2 border-white dark:border-slate-800 flex items-center justify-center text-xs font-bold text-gray-700"
                                                >
                                                    {String.fromCharCode(65 + i)}
                                                </div>
                                            ))}
                                        </div>
                                        <span className="text-xs text-gray-600 dark:text-slate-400">862+ members recently access</span>
                                    </div>
                                </div>

                                {/* Folder 3 - Purple */}
                                <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700 hover:shadow-md transition-all">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 rounded-lg bg-purple-100 dark:bg-purple-950 flex items-center justify-center text-lg">
                                                📁
                                            </div>
                                            <div>
                                                <h6 className="text-sm font-bold text-gray-900 dark:text-white">UI/UX Templates</h6>
                                                <p className="text-xs text-gray-600 dark:text-slate-400">2,478 FILES</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="flex -space-x-2">
                                            {[0, 1, 2, 3].map((i) => (
                                                <div
                                                    key={i}
                                                    className="size-6 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 border-2 border-white dark:border-slate-800 flex items-center justify-center text-xs font-bold text-gray-700"
                                                >
                                                    {String.fromCharCode(65 + i)}
                                                </div>
                                            ))}
                                        </div>
                                        <span className="text-xs text-gray-600 dark:text-slate-400">862+ members recently access</span>
                                    </div>
                                </div>

                                {/* Folder 4 - Orange */}
                                <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700 hover:shadow-md transition-all">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 rounded-lg bg-orange-100 dark:bg-orange-950 flex items-center justify-center text-lg">
                                                📁
                                            </div>
                                            <div>
                                                <h6 className="text-sm font-bold text-gray-900 dark:text-white">UI/UX Templates</h6>
                                                <p className="text-xs text-gray-600 dark:text-slate-400">2,478 FILES</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="flex -space-x-2">
                                            {[0, 1, 2, 3].map((i) => (
                                                <div
                                                    key={i}
                                                    className="size-6 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 border-2 border-white dark:border-slate-800 flex items-center justify-center text-xs font-bold text-gray-700"
                                                >
                                                    {String.fromCharCode(65 + i)}
                                                </div>
                                            ))}
                                        </div>
                                        <span className="text-xs text-gray-600 dark:text-slate-400">862+ members recently access</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Project Files Section */}
                        <div className="mt-12">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Project Files</h3>
                                    <p className="text-sm text-gray-600 dark:text-slate-400">Recent project files (Last access 24 min ago)</p>
                                </div>
                                <Button className="h-8 px-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white font-bold text-xs rounded hover:bg-gray-50 dark:hover:bg-slate-700">
                                    VIEW MORE
                                </Button>
                            </div>

                            {/* Table */}
                            <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
                                {/* Table Header */}
                                <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900">
                                    <div className="col-span-3">
                                        <span className="text-xs font-bold text-gray-600 dark:text-slate-400 uppercase tracking-wide">Name</span>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-xs font-bold text-gray-600 dark:text-slate-400 uppercase tracking-wide">Size</span>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-xs font-bold text-gray-600 dark:text-slate-400 uppercase tracking-wide">Upload</span>
                                    </div>
                                    <div className="col-span-3">
                                        <span className="text-xs font-bold text-gray-600 dark:text-slate-400 uppercase tracking-wide">Members</span>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-xs font-bold text-gray-600 dark:text-slate-400 uppercase tracking-wide">Action</span>
                                    </div>
                                </div>

                                {/* Table Rows */}
                                {[
                                    { type: "html", name: "HTML5 Webpages - V2.3.4", size: "5.34 MB", date: "25 March, 2023", members: "852+" },
                                    { type: "css", name: "CSS3 Stylesheet - V2.1.4", size: "2.67 MB", date: "20 March, 2023", members: "753+" },
                                    { type: "pdf", name: "PDF Documentations - V3.2.1", size: "2.85 MB", date: "20 March, 2023", members: "654+" },
                                    { type: "html", name: "HTML5 Webpages - V2.3.4", size: "5.34 MB", date: "25 March, 2023", members: "852+" },
                                    { type: "css", name: "CSS3 Stylesheet - V2.1.4", size: "2.67 MB", date: "20 March, 2023", members: "753+" },
                                    { type: "pdf", name: "PDF Documentations - V3.2.1", size: "2.85 MB", date: "20 March, 2023", members: "654+" },
                                ].map((file, idx) => (
                                    <div
                                        key={idx}
                                        className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all last:border-b-0"
                                    >
                                        {/* File Name */}
                                        <div className="col-span-3 flex items-center gap-3">
                                            {file.type === "html" && (
                                                <span className="text-sm font-bold bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-400 px-2 py-1 rounded">HTML</span>
                                            )}
                                            {file.type === "css" && (
                                                <span className="text-sm font-bold bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-400 px-2 py-1 rounded">CSS</span>
                                            )}
                                            {file.type === "pdf" && (
                                                <span className="text-sm font-bold bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-400 px-2 py-1 rounded">PDF</span>
                                            )}
                                            <span className="text-sm font-semibold text-gray-900 dark:text-white">{file.name}</span>
                                        </div>

                                        {/* Size */}
                                        <div className="col-span-2">
                                            <span className="text-sm text-gray-600 dark:text-slate-400">{file.size}</span>
                                        </div>

                                        {/* Upload Date */}
                                        <div className="col-span-2">
                                            <span className="text-sm text-gray-600 dark:text-slate-400">{file.date}</span>
                                        </div>

                                        {/* Members */}
                                        <div className="col-span-3 flex items-center gap-2">
                                            <div className="flex -space-x-2">
                                                {[0, 1, 2, 3].map((i) => (
                                                    <div
                                                        key={i}
                                                        className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 border-2 border-white dark:border-slate-800 flex items-center justify-center text-xs font-bold text-gray-700"
                                                    >
                                                        {String.fromCharCode(65 + i)}
                                                    </div>
                                                ))}
                                            </div>
                                            <span className="text-sm text-gray-600 dark:text-slate-400">{file.members} members</span>
                                        </div>

                                        {/* Action */}
                                        <div className="col-span-2 flex items-center justify-end">
                                            <Button variant="ghost" size="icon" className="size-8 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300">
                                                <FontAwesomeIcon icon={faEllipsisV} className="size-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </div>
        </div>
    )
}
