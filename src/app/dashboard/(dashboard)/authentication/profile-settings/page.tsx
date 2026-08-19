"use client";

import { useState } from "react";
import {
    Activity,
    Shield,
    Bell,
    Edit,
    Lock,
    MapPin,
    Phone,
    Mail,
    Briefcase,
    ChevronRight,
    Check,
    Save,
    X,
    Download,
    User,
    Key,
    Smartphone,
    AlertTriangle,
    FileText,
    RefreshCw,
    LogIn,
    Settings,
    Archive,
} from "lucide-react";

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState("activity");
    const [basicInfoEdit, setBasicInfoEdit] = useState(false);
    const [editSuccess, setEditSuccess] = useState(false);
    const [passwordModal, setPasswordModal] = useState(false);
    const [twoFAModal, setTwoFAModal] = useState(false);
    const [sessionModal, setSessionModal] = useState(false);

    const [basicInfo, setBasicInfo] = useState({
        email: "admin@example.com",
        phone: "+1 (555) 123-4567",
        location: "New York, USA",
        department: "IT Operations",
    });

    const [originalBasicInfo] = useState({
        email: "admin@example.com",
        phone: "+1 (555) 123-4567",
        location: "New York, USA",
        department: "IT Operations",
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [twoFAStatus, setTwoFAStatus] = useState(true);
    const [twoFAVerification, setTwoFAVerification] = useState("");

    const [activeSessions, setActiveSessions] = useState([
        { id: 1, device: "Chrome on Windows", location: "New York, USA", lastActive: "2 hours ago", current: true },
        { id: 2, device: "Safari on MacBook Pro", location: "San Francisco, USA", lastActive: "1 day ago", current: false },
        { id: 3, device: "Chrome Mobile on iPhone", location: "New York, USA", lastActive: "3 days ago", current: false },
    ]);

    const [notificationPrefs, setNotificationPrefs] = useState({
        emailNotifications: true,
        securityAlerts: true,
        marketingEmails: false,
        systemNotifications: true,
    });

    const [securityStatus, setSecurityStatus] = useState({
        twoFactorEnabled: true,
        lastPasswordChange: "7 days ago",
        securityScore: "95/100",
    });

    const recentActivities = [
        { id: 1, title: "Password changed", description: "Changed from web browser (Chrome)", date: "March 15, 2024 10:30 AM", Icon: Key, color: "bg-emerald-100 text-emerald-600" },
        { id: 2, title: "Login from new device", description: "MacBook Pro - New York, USA", date: "March 14, 2024 3:45 PM", Icon: LogIn, color: "bg-yellow-100 text-yellow-600" },
        { id: 3, title: "Profile updated", description: "Updated contact information", date: "March 13, 2024 2:15 PM", Icon: User, color: "bg-blue-100 text-blue-600" },
        { id: 4, title: "Security settings modified", description: "Enabled 2FA authentication", date: "March 12, 2024 11:20 AM", Icon: Shield, color: "bg-emerald-100 text-emerald-600" },
        { id: 5, title: "Document downloaded", description: "Downloaded annual report", date: "March 11, 2024 9:15 AM", Icon: FileText, color: "bg-orange-100 text-orange-600" },
        { id: 6, title: "Failed login attempt", description: "Invalid credentials from unknown IP", date: "March 10, 2024 8:20 PM", Icon: AlertTriangle, color: "bg-red-100 text-red-500" },
        { id: 7, title: "Account recovery initiated", description: "Password reset requested", date: "March 9, 2024 4:15 PM", Icon: RefreshCw, color: "bg-yellow-100 text-yellow-600" },
        { id: 8, title: "New device registered", description: "iPhone 13 - New York, USA", date: "March 8, 2024 1:30 PM", Icon: Smartphone, color: "bg-blue-100 text-blue-600" },
        { id: 9, title: "Security alert", description: "Suspicious activity detected", date: "March 7, 2024 10:45 AM", Icon: AlertTriangle, color: "bg-red-100 text-red-500" },
        { id: 10, title: "Backup completed", description: "System backup successful", date: "March 6, 2024 9:00 AM", Icon: Archive, color: "bg-emerald-100 text-emerald-600" },
        { id: 11, title: "New device registered", description: "redmi note 5 - Tamilnadu,India", date: "March 8, 2024 1:30 PM", Icon: Smartphone, color: "bg-blue-100 text-blue-600" },
    ];

    const handleBasicInfoChange = (field: string, value: string) => {
        setBasicInfo((prev) => ({ ...prev, [field]: value }));
    };

    const handleSaveBasicInfo = () => {
        setEditSuccess(true);
        setTimeout(() => { setEditSuccess(false); setBasicInfoEdit(false); }, 2000);
    };

    const handleCancelEdit = () => {
        setBasicInfo(originalBasicInfo);
        setBasicInfoEdit(false);
    };

    const handlePasswordChange = () => {
        if (!passwordForm.currentPassword) { alert("Please enter your current password"); return; }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) { alert("New passwords do not match"); return; }
        if (passwordForm.newPassword.length < 8) { alert("Password must be at least 8 characters"); return; }
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setPasswordModal(false);
        alert("Password changed successfully!");
    };

    const handlePasswordFieldChange = (field: string, value: string) => {
        setPasswordForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleToggleTwoFA = () => {
        if (!twoFAStatus) {
            setTwoFAModal(true);
        } else {
            if (window.confirm("Are you sure you want to disable 2FA? This will make your account less secure.")) {
                setTwoFAStatus(false);
                setSecurityStatus((prev) => ({ ...prev, twoFactorEnabled: false }));
            }
        }
    };

    const handleEnableTwoFA = () => {
        if (twoFAVerification.length === 6) {
            setTwoFAStatus(true);
            setSecurityStatus((prev) => ({ ...prev, twoFactorEnabled: true }));
            setTwoFAVerification("");
            setTwoFAModal(false);
            alert("2FA has been enabled successfully!");
        } else {
            alert("Please enter a valid 6-digit code");
        }
    };

    const handleRemoveSession = (sessionId: number) => {
        if (window.confirm("Are you sure you want to sign out from this device?")) {
            setActiveSessions((prev) => prev.filter((s) => s.id !== sessionId));
        }
    };

    const handleNotificationChange = (field: string) => {
        setNotificationPrefs((prev) => ({ ...prev, [field]: !prev[field as keyof typeof prev] }));
    };

    const handleDownloadData = () => {
        alert("Downloading your profile data...");
    };

    const inputClass = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white";

    return (
        <div className="bg-gray-100 -mt-6 -mx-6 -mb-6 min-h-screen">
            {/* Page Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
                <p className="text-gray-500 text-sm mt-0.5">Manage your profile settings and account preferences.</p>
            </div>

            {/* Main Content */}
            <div className="px-6 pt-6 pb-4 min-h-[calc(100vh-120px)]">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">

                    {/* ── LEFT COLUMN ── */}
                    <div className="lg:col-span-1 flex flex-col bg-gray-100">
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex-1">

                            {/* Avatar & Name */}
                            <div className="flex flex-col items-center text-center px-6 pt-8 pb-6 border-b border-gray-100">
                                <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mb-3 text-white font-bold text-2xl shadow-md">
                                    JD
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">John Doe</h2>
                                <p className="text-gray-500 text-sm mt-0.5">System Administrator</p>
                            </div>

                            {/* Basic Information */}
                            <div className="px-6 py-5 border-b border-gray-100">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center gap-2">
                                        <User className="w-4 h-4 text-gray-400" />
                                        <span className="font-semibold text-gray-900 text-sm">Basic Information</span>
                                    </div>
                                    {!basicInfoEdit && (
                                        <button
                                            onClick={() => setBasicInfoEdit(true)}
                                            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 transition-colors"
                                        >
                                            <Edit className="w-3.5 h-3.5" /> Edit
                                        </button>
                                    )}
                                </div>

                                {basicInfoEdit ? (
                                    <div className="space-y-3">
                                        {[
                                            { label: "Email", field: "email", type: "email" },
                                            { label: "Phone", field: "phone", type: "tel" },
                                            { label: "Location", field: "location", type: "text" },
                                            { label: "Department", field: "department", type: "text" },
                                        ].map(({ label, field, type }) => (
                                            <div key={field}>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                                                <input
                                                    type={type}
                                                    value={basicInfo[field as keyof typeof basicInfo]}
                                                    onChange={(e) => handleBasicInfoChange(field, e.target.value)}
                                                    className={inputClass}
                                                    placeholder={label}
                                                />
                                            </div>
                                        ))}
                                        <div className="flex gap-2 pt-1">
                                            <button onClick={handleSaveBasicInfo} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 transition-colors">
                                                <Save className="w-3.5 h-3.5" /> Save
                                            </button>
                                            <button onClick={handleCancelEdit} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 transition-colors">
                                                <X className="w-3.5 h-3.5" /> Cancel
                                            </button>
                                        </div>
                                        {editSuccess && (
                                            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-2 rounded-lg text-sm flex items-center gap-2">
                                                <Check className="w-4 h-4" /> Changes saved successfully!
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-0 divide-y divide-gray-50">
                                        {[
                                            { Icon: Mail, label: "Email", value: basicInfo.email },
                                            { Icon: Phone, label: "Phone", value: basicInfo.phone },
                                            { Icon: MapPin, label: "Location", value: basicInfo.location },
                                            { Icon: Briefcase, label: "Department", value: basicInfo.department },
                                        ].map(({ Icon, label, value }) => (
                                            <div key={label} className="flex items-center justify-between py-2.5">
                                                <div className="flex items-center gap-2.5 text-gray-500">
                                                    <Icon className="w-4 h-4 shrink-0" />
                                                    <span className="text-sm text-gray-500">{label}</span>
                                                </div>
                                                <span className="text-sm font-medium text-gray-900 text-right max-w-[55%] truncate">{value}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Security Status */}
                            <div className="px-6 py-5 border-b border-gray-100">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center gap-2">
                                        <Shield className="w-4 h-4 text-gray-400" />
                                        <span className="font-semibold text-gray-900 text-sm">Security Status</span>
                                    </div>
                                    <button
                                        onClick={() => setPasswordModal(true)}
                                        className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                                    >
                                        Change Password
                                    </button>
                                </div>
                                <div className="space-y-0 divide-y divide-gray-50">
                                    <div className="flex items-center justify-between py-2.5">
                                        <span className="text-sm text-gray-500">2FA Status</span>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${twoFAStatus ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                                            {twoFAStatus ? "Enabled" : "Disabled"}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between py-2.5">
                                        <span className="text-sm text-gray-500">Last Password Change</span>
                                        <span className="text-sm font-medium text-gray-900">{securityStatus.lastPasswordChange}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2.5">
                                        <span className="text-sm text-gray-500">Security Score</span>
                                        <span className="text-sm font-medium text-gray-900">{securityStatus.securityScore}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="px-6 py-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <Settings className="w-4 h-4 text-gray-400" />
                                    <span className="font-semibold text-gray-900 text-sm">Quick Actions</span>
                                </div>
                                <div className="space-y-2">
                                    {[
                                        { Icon: Edit, label: "Edit Profile", onClick: () => setBasicInfoEdit(true) },
                                        { Icon: Lock, label: "Change Password", onClick: () => setPasswordModal(true) },
                                        { Icon: Download, label: "Download Data", onClick: handleDownloadData },
                                    ].map(({ Icon, label, onClick }) => (
                                        <button
                                            key={label}
                                            onClick={onClick}
                                            className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Icon className="w-4 h-4 text-gray-500 group-hover:text-blue-600 transition-colors" />
                                                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{label}</span>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── RIGHT COLUMN ── */}
                    <div className="lg:col-span-2 flex flex-col bg-gray-100">
                        {/* Tab Navigation */}
                        <div className="bg-white rounded-xl border border-gray-200 mb-4 overflow-hidden sticky top-6">
                            <div className="flex">
                                {[
                                    { id: "activity", label: "Activity", Icon: Activity },
                                    { id: "security", label: "Security", Icon: Shield },
                                    { id: "notifications", label: "Notifications", Icon: Bell },
                                ].map(({ id, label, Icon }) => (
                                    <button
                                        key={id}
                                        onClick={() => setActiveTab(id)}
                                        className={`flex-1 py-4 px-6 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-all ${
                                            activeTab === id
                                                ? "border-blue-600 text-blue-600 bg-blue-50/50"
                                                : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                                        }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* ── ACTIVITY TAB ── */}
                        {activeTab === "activity" && (
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex-1">
                                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
                                    <h3 className="text-base font-semibold text-gray-900">Recent Activity</h3>
                                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors">View All</button>
                                </div>
                                <div className="divide-y divide-gray-50">
                                    {recentActivities.map((activity) => (
                                        <div key={activity.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50/50 transition-colors">
                                            <div className={`flex-shrink-0 w-9 h-9 rounded-full ${activity.color} flex items-center justify-center`}>
                                                <activity.Icon className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-900 leading-tight">{activity.title}</p>
                                                <p className="text-sm text-gray-500 leading-tight mt-0.5">{activity.description}</p>
                                            </div>
                                            <div className="flex-shrink-0 text-right">
                                                <p className="text-xs text-gray-400 whitespace-nowrap">{activity.date}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── SECURITY TAB ── */}
                        {activeTab === "security" && (
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex-1">
                                <div className="px-6 py-4 border-b border-gray-100">
                                    <h3 className="text-base font-semibold text-gray-900">Security Settings</h3>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {/* Two-Factor Auth */}
                                    <div className="px-6 py-5">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Smartphone className="w-4 h-4 text-gray-400" />
                                                    <h4 className="font-semibold text-gray-900 text-sm">Two-Factor Authentication</h4>
                                                </div>
                                                <p className="text-sm text-gray-500 ml-6">Add an extra layer of security to your account.</p>
                                                <div className="ml-6 mt-3">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold mb-3 ${twoFAStatus ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${twoFAStatus ? "bg-emerald-500" : "bg-gray-400"}`} />
                                                        {twoFAStatus ? "Active" : "Inactive"}
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={handleToggleTwoFA}
                                                className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors shrink-0 ${twoFAStatus ? "bg-red-500 hover:bg-red-600" : "bg-blue-600 hover:bg-blue-700"}`}
                                            >
                                                {twoFAStatus ? "Disable 2FA" : "Enable 2FA"}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Password */}
                                    <div className="px-6 py-5">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Key className="w-4 h-4 text-gray-400" />
                                                    <h4 className="font-semibold text-gray-900 text-sm">Password</h4>
                                                </div>
                                                <p className="text-sm text-gray-500 ml-6">Change your password regularly to keep your account secure.</p>
                                                <p className="text-xs text-gray-400 ml-6 mt-2">Last changed: {securityStatus.lastPasswordChange}</p>
                                            </div>
                                            <button
                                                onClick={() => setPasswordModal(true)}
                                                className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors shrink-0"
                                            >
                                                Change Password
                                            </button>
                                        </div>
                                    </div>

                                    {/* Active Sessions */}
                                    <div className="px-6 py-5">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Activity className="w-4 h-4 text-gray-400" />
                                                    <h4 className="font-semibold text-gray-900 text-sm">Active Sessions</h4>
                                                </div>
                                                <p className="text-sm text-gray-500 ml-6">Manage devices that have access to your account.</p>
                                                <p className="text-xs text-gray-400 ml-6 mt-2">{activeSessions.length} active session{activeSessions.length !== 1 ? "s" : ""}</p>
                                            </div>
                                            <button
                                                onClick={() => setSessionModal(true)}
                                                className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors shrink-0"
                                            >
                                                View Sessions ({activeSessions.length})
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── NOTIFICATIONS TAB ── */}
                        {activeTab === "notifications" && (
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex-1">
                                <div className="px-6 py-4 border-b border-gray-100">
                                    <h3 className="text-base font-semibold text-gray-900">Notification Preferences</h3>
                                    <p className="text-sm text-gray-500 mt-0.5">Control how and when you receive notifications.</p>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {[
                                        { field: "emailNotifications", label: "Email Notifications", desc: "Receive email updates about important activities" },
                                        { field: "securityAlerts", label: "Security Alerts", desc: "Get notified of suspicious activities" },
                                        { field: "marketingEmails", label: "Marketing Emails", desc: "Receive news and updates from our team" },
                                        { field: "systemNotifications", label: "System Notifications", desc: "Get notified about system maintenance and updates" },
                                    ].map(({ field, label, desc }) => (
                                        <label key={field} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 cursor-pointer transition-colors">
                                            <div className="flex-1">
                                                <p className="text-sm font-semibold text-gray-900">{label}</p>
                                                <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                                            </div>
                                            <div className="relative ml-4 shrink-0">
                                                <input
                                                    type="checkbox"
                                                    checked={notificationPrefs[field as keyof typeof notificationPrefs]}
                                                    onChange={() => handleNotificationChange(field)}
                                                    className="sr-only peer"
                                                />
                                                <div className={`w-10 h-6 rounded-full transition-colors peer-checked:bg-blue-600 ${notificationPrefs[field as keyof typeof notificationPrefs] ? "bg-blue-600" : "bg-gray-200"}`} />
                                                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${notificationPrefs[field as keyof typeof notificationPrefs] ? "translate-x-4" : "translate-x-0"}`} />
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── PASSWORD MODAL ── */}
            {passwordModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
                        <div className="flex justify-between items-center mb-5">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Change Password</h3>
                                <p className="text-sm text-gray-500 mt-0.5">Choose a strong, unique password.</p>
                            </div>
                            <button onClick={() => setPasswordModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            {[
                                { label: "Current Password", field: "currentPassword" },
                                { label: "New Password", field: "newPassword" },
                                { label: "Confirm Password", field: "confirmPassword" },
                            ].map(({ label, field }) => (
                                <div key={field}>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                                    <input
                                        type="password"
                                        value={passwordForm[field as keyof typeof passwordForm]}
                                        onChange={(e) => handlePasswordFieldChange(field, e.target.value)}
                                        className={inputClass}
                                        placeholder={`Enter ${label.toLowerCase()}`}
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={handlePasswordChange} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-semibold text-sm transition-colors">
                                Change Password
                            </button>
                            <button onClick={() => setPasswordModal(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl font-semibold text-sm transition-colors">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── 2FA MODAL ── */}
            {twoFAModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
                        <div className="flex justify-between items-center mb-5">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Enable Two-Factor Auth</h3>
                                <p className="text-sm text-gray-500 mt-0.5">Scan the QR code with your authenticator app.</p>
                            </div>
                            <button onClick={() => setTwoFAModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="bg-gray-50 border border-gray-200 p-6 rounded-xl mb-5 flex items-center justify-center h-44">
                            <div className="text-center">
                                <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">QR Code</p>
                                <p className="text-4xl tracking-widest">■□■□■</p>
                                <p className="text-xs text-gray-400 mt-2">Scan with Google Authenticator</p>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Enter 6-digit verification code</label>
                            <input
                                type="text"
                                maxLength={6}
                                value={twoFAVerification}
                                onChange={(e) => setTwoFAVerification(e.target.value.replace(/\D/g, ""))}
                                className="w-full px-3 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl tracking-[0.5em] font-mono bg-gray-50"
                                placeholder="000000"
                            />
                        </div>
                        <div className="flex gap-3 mt-5">
                            <button onClick={handleEnableTwoFA} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-semibold text-sm transition-colors">
                                Verify & Enable
                            </button>
                            <button onClick={() => setTwoFAModal(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl font-semibold text-sm transition-colors">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── SESSIONS MODAL ── */}
            {sessionModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-5">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Active Sessions</h3>
                                <p className="text-sm text-gray-500 mt-0.5">{activeSessions.length} device{activeSessions.length !== 1 ? "s" : ""} currently signed in</p>
                            </div>
                            <button onClick={() => setSessionModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-3">
                            {activeSessions.map((session) => (
                                <div key={session.id} className="border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-start gap-3">
                                            <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                                                <Smartphone className="w-4 h-4 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                                                    {session.device}
                                                    {session.current && (
                                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">Current</span>
                                                    )}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-0.5">{session.location}</p>
                                                <p className="text-xs text-gray-400 mt-1">Last active: {session.lastActive}</p>
                                            </div>
                                        </div>
                                        {!session.current && (
                                            <button
                                                onClick={() => handleRemoveSession(session.id)}
                                                className="text-red-500 hover:text-red-600 text-xs font-semibold px-2 py-1 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => setSessionModal(false)} className="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl font-semibold text-sm transition-colors">
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
