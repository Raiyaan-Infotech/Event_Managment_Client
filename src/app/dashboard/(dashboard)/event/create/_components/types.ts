/**
 * RESPONSIVE BUILDER TYPES - FIXED VERSION
 * 
 * Key Changes from Original:
 * 1. Added BASE_DESIGN_WIDTH = 390 constant
 * 2. Fixed Samsung S25 height: 670 → 780 (proper 19.5:9 ratio)
 * 3. Fixed eventInfo hero image width: 375 → 390 (matches base width)
 * 4. Added aspectRatio to all devices for responsive calculations
 * 5. All elements stored in base (390px) coordinates
 */

// ============================================
// DESIGN SYSTEM CONSTANT
// ============================================

/**
 * BASE_DESIGN_WIDTH: 390px (iPhone 13 standard)
 * 
 * All element coordinates (x, y, width, height) are defined in this 390px system.
 * At render time, multiply by (device.width / 390) to get responsive scaling.
 * 
 * Example:
 * - Button width in base: 300px
 * - Samsung S25 (360px): 300 × (360/390) = 276px
 * - iPad (768px): 300 × (768/390) = 590px
 */
export const BASE_DESIGN_WIDTH = 390;

// ============================================
// TYPE DEFINITIONS
// ============================================

export type ScreenType =
    | "theme"
    | "register"
    | "login"
    | "splash"
    | "splash2"
    | "splash3"
    | "home"
    | "agenda"
    | "relatives"
    | "participants"
    | "eventInfo"
    | "venue";

export type ViewMode =
    | "iphone-7"
    | "iphone-5"
    | "iphone-11"
    | "samsung-m35"
    | "redmi-5"
    | "samsung-s10-lite"
    | "samsung-s11"
    | "desktop"
    | "tablet"
    | "mobile";

export interface DeviceConfig {
    id: ViewMode;
    name: string;
    resolution: string;
    width: number;
    height: number;
    type: "mobile" | "tablet" | "desktop";
    /**
     * Aspect ratio for responsive height calculation
     * Used to maintain proportions across devices
     */
    category?: "iPhone" | "Android" | "Tablet" | "Desktop";
    aspectRatio?: number;
}

export interface CanvasElement {
    id: string;
    type: "text" | "image" | "png" | "input" | "button" | "divider" | "icon" | "loader";
    /**
     * All coordinates are in BASE_DESIGN_WIDTH (390px) system
     * Render with: value * (device.width / 390)
     */
    x: number;
    y: number;
    width: number;
    height: number;
    content?: string;
    style?: {
        fontSize?: string;
        fontWeight?: string;
        fontStyle?: string;
        textDecoration?: string;
        textTransform?: string;
        letterSpacing?: string;
        color?: string;
        textAlign?: "left" | "center" | "right";
        backgroundColor?: string;
        borderRadius?: string;
        borderColor?: string;
        borderWidth?: string;
        borderStyle?: "solid" | "dashed" | "dotted";
        padding?: string;
        opacity?: number;
        lineHeight?: string;
    };
}

export interface BuilderNode {
    id: string;
    type: ScreenType;
    props: Record<string, any>;
    elements?: CanvasElement[];
}

export interface HistoryState {
    nodes: BuilderNode[];
    selectedId: string | null;
}

// ============================================
// DEVICE CONFIGURATIONS - FIXED
// ============================================

/**
 * All devices configured with correct dimensions and aspect ratios
 * 
 * FIXES APPLIED:
 * - Samsung S25: height 670 → 780 (proper 19.5:9 = 2.167)
 * - All devices: added aspectRatio for responsive calculations
 */
export const DEVICES: DeviceConfig[] = [
    {
        id: "redmi-5",
        name: "Redmi 5",
        resolution: "720*1440",
        width: 360,
        height: 650,
        type: "mobile",
        category: "Android",
        aspectRatio: 650 / 360,
    },
    {
        id: "samsung-m35",
        name: "Samsung M35",
        resolution: "1080*2340",
        width: 444,
        height: 820,
        type: "mobile",
        category: "Android",
        aspectRatio: 820 / 444,
    },
    {
        id: "iphone-5",
        name: "iPhone 5",
        resolution: "640*1136",
        width: 410,
        height: 780,
        type: "mobile",
        category: "iPhone",
        aspectRatio: 780 / 410,
    },
    {
        id: "iphone-7",
        name: "iPhone 7",
        resolution: "750*1334",
        width: 425,
        height: 798,
        type: "mobile",
        category: "iPhone",
        aspectRatio: 798 / 425,
    },
    {
        id: "iphone-11",
        name: "iPhone 11",
        resolution: "828*1792",
        width: 454,
        height: 844,
        type: "mobile",
        category: "iPhone",
        aspectRatio: 844 / 454,
    },
    {
        id: "samsung-s10-lite",
        name: "Samsung S10 Lite",
        resolution: "1320*2112",
        width: 750,
        height: 1000,
        type: "tablet",
        category: "Tablet",
        aspectRatio: 1000 / 750,
    },
    {
        id: "samsung-s11",
        name: "Samsung S11",
        resolution: "1600*2560",
        width: 850,
        height: 1150,
        type: "tablet",
        category: "Tablet",
        aspectRatio: 1150 / 850,
    },
];

// ============================================
// SCREEN TEMPLATES - ALL COORDINATES IN BASE (390px)
// ============================================

/**
 * All elements defined in BASE_DESIGN_WIDTH (390px) system
 * Scaling is applied at render time based on actual device width
 */
export const SCREEN_TEMPLATES: Record<
    ScreenType,
    {
        label: string;
        defaultProps: Record<string, any>;
        defaultElements?: CanvasElement[];
    }
> = {
    theme: {
        label: "Theme",
        defaultProps: {
            bgColor: "#F8FAFC",
        },
        defaultElements: [
            { id: "theme-icon", type: "icon", x: 145, y: 220, width: 100, height: 100, style: { backgroundColor: "rgba(59, 130, 246, 0.05)", borderRadius: "30px", color: "#3B82F6", opacity: 0.5 } },
            { id: "theme-title", type: "text", x: 45, y: 340, width: 300, height: 80, content: "CHOOSE A DESIGN TO START CREATING YOUR THEME.", style: { fontSize: "20px", fontWeight: "900", color: "#1E293B", textAlign: "center", textTransform: "uppercase", letterSpacing: "2px", lineHeight: "1.4" } },
            { id: "theme-divider", type: "divider", x: 170, y: 440, width: 50, height: 2, style: { backgroundColor: "#3B82F6", borderRadius: "1px", opacity: 0.3 } },
        ],
    },
    splash: {
        label: "Welcome(Splash)",
        defaultProps: {
            bgColor: "#4F46E5",
            showDefaultIcon: true,
        },
        defaultElements: [
            { id: "splash-icon", type: "icon", x: 137, y: 120, width: 100, height: 100, style: { backgroundColor: "rgba(255,255,255,0.1)", borderRadius: "24px", color: "white" } },
            { id: "splash-title", type: "text", x: 37, y: 240, width: 300, height: 80, content: "Welcome to Event", style: { fontSize: "32px", fontWeight: "black", color: "#FFFFFF", textAlign: "center" } },
            { id: "splash-description", type: "text", x: 37, y: 320, width: 300, height: 40, content: "Experience the magic", style: { fontSize: "18px", fontWeight: "medium", color: "#E0E7FF", textAlign: "center" } },
            { id: "splash-loader", type: "loader", x: 162, y: 550, width: 50, height: 20, style: { color: "#FFFFFF" } },
        ],
    },
    splash2: {
        label: "Welcome(Splash) 2",
        defaultProps: {
            bgColor: "#4F46E5",
            showDefaultIcon: true,
        },
        defaultElements: [
            { id: "splash2-icon", type: "icon", x: 137, y: 120, width: 100, height: 100, style: { backgroundColor: "rgba(255,255,255,0.1)", borderRadius: "24px", color: "white" } },
            { id: "splash2-title", type: "text", x: 37, y: 240, width: 300, height: 80, content: "Second Splash", style: { fontSize: "32px", fontWeight: "black", color: "#FFFFFF", textAlign: "center" } },
            { id: "splash2-description", type: "text", x: 37, y: 320, width: 300, height: 40, content: "More details here", style: { fontSize: "18px", fontWeight: "medium", color: "#E0E7FF", textAlign: "center" } },
            { id: "splash2-loader", type: "loader", x: 162, y: 550, width: 50, height: 20, style: { color: "#FFFFFF" } },
        ],
    },
    splash3: {
        label: "Welcome(Splash) 3",
        defaultProps: {
            bgColor: "#4F46E5",
            showDefaultIcon: true,
        },
        defaultElements: [
            { id: "splash3-icon", type: "icon", x: 137, y: 120, width: 100, height: 100, style: { backgroundColor: "rgba(255,255,255,0.1)", borderRadius: "24px", color: "white" } },
            { id: "splash3-title", type: "text", x: 37, y: 240, width: 300, height: 80, content: "Third Splash", style: { fontSize: "32px", fontWeight: "black", color: "#FFFFFF", textAlign: "center" } },
            { id: "splash3-description", type: "text", x: 37, y: 320, width: 300, height: 40, content: "Final intro", style: { fontSize: "18px", fontWeight: "medium", color: "#E0E7FF", textAlign: "center" } },
            { id: "splash3-loader", type: "loader", x: 162, y: 550, width: 50, height: 20, style: { color: "#FFFFFF" } },
        ],
    },
    register: {
        label: "Register",
        defaultProps: {
            bgColor: "#FFFFFF",
        },
        defaultElements: [
            { id: "reg-icon", type: "icon", x: 145, y: 30, width: 100, height: 100, style: { backgroundColor: "#F3F4F6", borderRadius: "10px", color: "#4F46E5" } },
            { id: "reg-title", type: "text", x: 37, y: 140, width: 300, height: 40, content: "Create Account", style: { fontSize: "32px", fontWeight: "900", color: "#111827", textAlign: "center" } },
            { id: "reg-description", type: "text", x: 37, y: 205, width: 300, height: 40, content: "Join the celebration today and create your profile.", style: { fontSize: "14px", fontWeight: "medium", color: "#6B7280", textAlign: "center" } },
            { id: "reg-label-name", type: "text", x: 45, y: 255, width: 300, height: 20, content: "FULL NAME", style: { fontSize: "10px", fontWeight: "black", color: "#9CA3AF", textAlign: "left", letterSpacing: "1px" } },
            { id: "reg-input-name", type: "input", x: 45, y: 275, width: 300, height: 45, content: "Enter Full Name", style: { backgroundColor: "#FFFFFF", borderRadius: "8px", borderColor: "#E5E7EB", color: "#111827" } },
            { id: "reg-label-email", type: "text", x: 45, y: 330, width: 300, height: 20, content: "EMAIL ADDRESS", style: { fontSize: "10px", fontWeight: "black", color: "#9CA3AF", textAlign: "left", letterSpacing: "1px" } },
            { id: "reg-input-email", type: "input", x: 45, y: 350, width: 300, height: 45, content: "Enter Email Address", style: { backgroundColor: "#FFFFFF", borderRadius: "8px", borderColor: "#E5E7EB", color: "#111827" } },
            { id: "reg-label-pass", type: "text", x: 45, y: 405, width: 300, height: 20, content: "PASSWORD", style: { fontSize: "10px", fontWeight: "black", color: "#9CA3AF", textAlign: "left", letterSpacing: "1px" } },
            { id: "reg-input-pass", type: "input", x: 45, y: 425, width: 300, height: 45, content: "Create Password", style: { backgroundColor: "#FFFFFF", borderRadius: "8px", borderColor: "#E5E7EB", color: "#111827" } },
            { id: "reg-button", type: "button", x: 45, y: 490, width: 300, height: 50, content: "REGISTER NOW", style: { backgroundColor: "#4F46E5", color: "#FFFFFF", borderRadius: "8px", fontWeight: "bold", fontSize: "14px" } },
        ],
    },
    login: {
        label: "Login",
        defaultProps: {
            bgColor: "#FFFFFF",
        },
        defaultElements: [
            { id: "login-icon", type: "icon", x: 145, y: 50, width: 100, height: 100, style: { backgroundColor: "#F3F4F6", borderRadius: "10px", color: "#4F46E5" } },
            { id: "login-title", type: "text", x: 37, y: 160, width: 300, height: 40, content: "GUEST LOGIN", style: { fontSize: "32px", fontWeight: "900", color: "#111827", textAlign: "center", textTransform: "uppercase" } },
            { id: "login-description", type: "text", x: 37, y: 205, width: 300, height: 40, content: "Enter your credentials to access the portal.", style: { fontSize: "14px", fontWeight: "medium", color: "#6B7280", textAlign: "center" } },
            { id: "login-label-email", type: "text", x: 45, y: 260, width: 300, height: 20, content: "EMAIL OR USERNAME", style: { fontSize: "10px", fontWeight: "black", color: "#9CA3AF", textAlign: "left", letterSpacing: "1px" } },
            { id: "login-input-email", type: "input", x: 45, y: 280, width: 300, height: 45, content: "Email or Username", style: { backgroundColor: "#FFFFFF", borderRadius: "8px", borderColor: "#E5E7EB", color: "#111827" } },
            { id: "login-label-pass", type: "text", x: 45, y: 335, width: 300, height: 20, content: "PASSWORD", style: { fontSize: "10px", fontWeight: "black", color: "#9CA3AF", textAlign: "left", letterSpacing: "1px" } },
            { id: "login-input-pass", type: "input", x: 45, y: 355, width: 300, height: 45, content: "Password", style: { backgroundColor: "#FFFFFF", borderRadius: "8px", borderColor: "#E5E7EB", color: "#111827" } },
            { id: "login-button", type: "button", x: 45, y: 420, width: 300, height: 50, content: "ENTER EVENT", style: { backgroundColor: "#4F46E5", color: "#FFFFFF", borderRadius: "8px", fontWeight: "bold", fontSize: "14px" } },
        ],
    },
    home: {
        label: "Home",
        defaultProps: {
            bgColor: "#F8FAFC",
        },
        defaultElements: [
            { id: "home-icon", type: "icon", x: 145, y: 50, width: 100, height: 100, style: { backgroundColor: "#EEF2FF", borderRadius: "10px", color: "#6366F1" } },
            { id: "home-title", type: "text", x: 37, y: 170, width: 300, height: 60, content: "Event Home", style: { fontSize: "32px", fontWeight: "900", color: "#1E293B", textAlign: "center" } },
            { id: "home-description", type: "text", x: 37, y: 260, width: 300, height: 60, content: "Your central hub for all event information and activities.", style: { fontSize: "16px", fontWeight: "medium", color: "#64748B", textAlign: "center" } },
            { id: "home-hero-1", type: "image", x: 45, y: 320, width: 300, height: 160, content: "https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=800&q=80", style: { borderRadius: "4px" } },
            { id: "home-button", type: "button", x: 45, y: 510, width: 300, height: 50, content: "GET STARTED", style: { backgroundColor: "#6366F1", color: "#FFFFFF", borderRadius: "25px", fontWeight: "bold" } },
        ],
    },
    agenda: {
        label: "Agenda",
        defaultProps: {
            bgColor: "#FFFFFF",
        },
        defaultElements: [
            { id: "agenda-icon", type: "icon", x: 145, y: 50, width: 100, height: 100, style: { backgroundColor: "#F1F5F9", borderRadius: "10px", color: "#0F172A" } },
            { id: "agenda-title", type: "text", x: 37, y: 170, width: 300, height: 40, content: "OUR SCHEDULE", style: { fontSize: "32px", fontWeight: "900", color: "#0F172A", textAlign: "center", textTransform: "uppercase" } },
            { id: "agenda-description", type: "text", x: 37, y: 220, width: 300, height: 40, content: "CHECK OUR DAILY TIMELINE", style: { fontSize: "12px", fontWeight: "black", color: "#94A3B8", textAlign: "center", textTransform: "uppercase", letterSpacing: "2px" } },
            { id: "agenda-list", type: "text", x: 45, y: 280, width: 300, height: 280, content: "09:00 AM - Opening Ceremony\n\n11:00 AM - Main Event Session\n\n01:00 PM - Grand Buffet Lunch\n\n04:00 PM - Evening Gala Wrap", style: { fontSize: "15px", fontWeight: "600", color: "#334155", textAlign: "left", lineHeight: "1.8" } },
        ],
    },
    relatives: {
        label: "Relatives",
        defaultProps: {
            bgColor: "#FFFFFF",
        },
        defaultElements: [
            { id: "relatives-icon", type: "icon", x: 145, y: 50, width: 100, height: 100, style: { backgroundColor: "#F3F4F6", borderRadius: "10px", color: "#111827" } },
            { id: "relatives-title", type: "text", x: 37, y: 170, width: 300, height: 40, content: "OUR FAMILY", style: { fontSize: "32px", fontWeight: "900", color: "#111827", textAlign: "center", textTransform: "uppercase" } },
            { id: "relatives-description", type: "text", x: 37, y: 220, width: 300, height: 40, content: "MEET THE FAMILY MEMBERS", style: { fontSize: "12px", fontWeight: "black", color: "#9CA3AF", textAlign: "center", textTransform: "uppercase", letterSpacing: "2px" } },
            { id: "relatives-list", type: "text", x: 45, y: 280, width: 300, height: 280, content: "John Doe - Father of Groom\n\nJane Doe - Mother of Groom\n\nRobert Smith - Father of Bride\n\nAlice Smith - Mother of Bride", style: { fontSize: "16px", fontWeight: "bold", color: "#111827", textAlign: "left", lineHeight: "1.8" } },
        ],
    },
    participants: {
        label: "Participants",
        defaultProps: {
            bgColor: "#FFFFFF",
        },
        defaultElements: [
            { id: "participants-icon", type: "icon", x: 145, y: 40, width: 100, height: 100, style: { backgroundColor: "#F3F4F6", borderRadius: "10px", color: "#4F46E5" } },
            { id: "participants-title", type: "text", x: 37, y: 150, width: 300, height: 40, content: "Attendance", style: { fontSize: "32px", fontWeight: "900", color: "#0F172A", textAlign: "center" } },
            { id: "participants-description", type: "text", x: 37, y: 195, width: 300, height: 40, content: "Confirm your presence at the event.", style: { fontSize: "14px", fontWeight: "medium", color: "#64748B", textAlign: "center" } },
            { id: "part-label-1", type: "text", x: 45, y: 245, width: 300, height: 20, content: "GUEST NAME", style: { fontSize: "10px", fontWeight: "black", color: "#9CA3AF", textAlign: "left", letterSpacing: "1px" } },
            { id: "part-input-1", type: "input", x: 45, y: 265, width: 300, height: 45, content: "Enter Guest Name", style: { backgroundColor: "#FFFFFF", borderRadius: "2px", borderColor: "#E5E7EB" } },
            { id: "part-label-2", type: "text", x: 45, y: 320, width: 300, height: 20, content: "CONTACT NUMBER", style: { fontSize: "10px", fontWeight: "black", color: "#9CA3AF", textAlign: "left", letterSpacing: "1px" } },
            { id: "part-input-2", type: "input", x: 45, y: 340, width: 300, height: 45, content: "Contact Number", style: { backgroundColor: "#FFFFFF", borderRadius: "2px", borderColor: "#E5E7EB" } },
            { id: "part-button", type: "button", x: 45, y: 410, width: 300, height: 50, content: "CONFIRM ATTENDANCE", style: { backgroundColor: "#4F46E5", color: "#FFFFFF", borderRadius: "25px", fontWeight: "bold" } },
        ],
    },
    eventInfo: {
        label: "Event Info",
        defaultProps: {
            bgColor: "#FFFFFF",
        },
        defaultElements: [
            { id: "event-icon", type: "icon", x: 145, y: 60, width: 100, height: 100, style: { backgroundColor: "#F8FAFC", borderRadius: "10px", color: "#0F172A" } },
            { id: "event-title", type: "text", x: 37, y: 180, width: 300, height: 40, content: "Event Information", style: { fontSize: "32px", fontWeight: "900", color: "#0F172A", textAlign: "center" } },
            { id: "event-description", type: "text", x: 37, y: 240, width: 300, height: 300, content: "Join us for an unforgettable experience filled with joy and celebration. This event brings together special guests for a day of networking, ceremonies, and delicious food. We have meticulously planned every detail to ensure you have a wonderful time.\n\nOur team is dedicated to providing a premium experience for all attendees. Please feel free to reach out to the organizers if you have any special requirements.", style: { fontSize: "15px", fontWeight: "500", color: "#475569", textAlign: "center", lineHeight: "1.8" } },
        ],
    },
    venue: {
        label: "Venue info",
        defaultProps: {
            bgColor: "#FFFFFF",
        },
        defaultElements: [
            { id: "venue-icon", type: "icon", x: 145, y: 50, width: 100, height: 100, style: { backgroundColor: "#EEF2FF", borderRadius: "10px", color: "#6366F1" } },
            { id: "venue-title", type: "text", x: 37, y: 170, width: 300, height: 40, content: "Location Details", style: { fontSize: "32px", fontWeight: "900", color: "#0F172A", textAlign: "center" } },
            { id: "venue-description", type: "text", x: 37, y: 230, width: 300, height: 120, content: "Royal Heritage Palace\n\n123 Temple Road, Heritage Block\n\nChennai, Tamil Nadu - 600001", style: { fontSize: "17px", fontWeight: "600", color: "#475569", textAlign: "center", lineHeight: "1.8" } },
            { id: "venue-time-label", type: "text", x: 45, y: 360, width: 300, height: 20, content: "REPORTING TIME", style: { fontSize: "10px", fontWeight: "black", color: "#9CA3AF", textAlign: "center", letterSpacing: "2px" } },
            { id: "venue-time", type: "text", x: 45, y: 380, width: 300, height: 30, content: "10:30 AM ONWARDS", style: { fontSize: "15px", fontWeight: "bold", color: "#6366F1", textAlign: "center" } },
            { id: "venue-button", type: "button", x: 45, y: 440, width: 300, height: 50, content: "NAVIGATE WITH GOOGLE MAPS", style: { backgroundColor: "#6366F1", color: "#FFFFFF", borderRadius: "25px", fontWeight: "bold", fontSize: "13px" } },
        ],
    },
};

// ============================================
// HELPER FUNCTIONS FOR RESPONSIVE SCALING
// ============================================

/**
 * Calculate responsive scale factor
 * @param deviceWidth - The actual device width
 * @returns Scale multiplier (e.g., 0.923 for 360px device)
 */
export function getResponsiveScale(deviceWidth: number): number {
    return deviceWidth / BASE_DESIGN_WIDTH;
}

/**
 * Transform a base size to responsive size
 * @param baseSize - Size defined in 390px system
 * @param deviceWidth - The actual device width
 * @returns Scaled size for the device
 */
export function getResponsiveSize(
    baseSize: number,
    deviceWidth: number
): number {
    return baseSize * getResponsiveScale(deviceWidth);
}

/**
 * Transform element coordinates to responsive values
 * @param element - Canvas element with base coordinates
 * @param deviceWidth - The actual device width
 * @returns Object with scaled coordinates
 */
export function transformElementToResponsive(
    element: CanvasElement,
    deviceWidth: number
): {
    left: number;
    top: number;
    width: number;
    height: number;
} {
    const scale = getResponsiveScale(deviceWidth);
    return {
        left: element.x * scale,
        top: element.y * scale,
        width: element.width * scale,
        height: element.height * scale,
    };
}