"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const validate = (v: string) => {
    if (!v.trim()) return "Email or username is required.";
    return "";
  };

  const handleBlur = () => {
    setTouched(true);
    setError(validate(emailOrUsername));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const err = validate(emailOrUsername);
    setError(err);
    setTouched(true);
    if (err) return;

    setLoading(true);
    try {
      // TODO: Replace with your actual reset-password API call
      // e.g. await fetch("/api/reset-password", { method: "POST", body: ... })
      await new Promise((r) => setTimeout(r, 1200)); // simulate request

      setSent(true);
      toast.success("Reset link sent! Check your email.");
    } catch {
      toast.error("Failed to send reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fieldClass =
    touched && error
      ? "border-red-500 focus-visible:ring-red-500"
      : touched && !error
        ? "border-green-500 focus-visible:ring-green-500"
        : "";

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4 py-12">
      <div className="w-full max-w-md relative">
        {/* Floating Logo Overlay */}
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-10">
          <div className="h-14 w-14 rounded-lg bg-white p-1 shadow-md border border-border/50 overflow-hidden relative">
            <div className="h-full w-full relative rounded-md overflow-hidden">
              <Image
                src="/ra_logo.png"
                alt="Logo"
                fill
                priority
                className="object-cover"
              />
            </div>
          </div>
        </div>

        <Card className="w-full shadow-lg border-0 pt-8">
          <CardHeader className="items-center pb-2 pt-4">
            <h4 className="text-2xl font-bold tracking-tight text-[#071437]">Reset</h4>
            <div className="text-sm text-muted-foreground text-center mt-1 leading-relaxed">
              <strong>Reset your username / password</strong>
              <p>Enter your email and a reset link will be sent to you.</p>
            </div>
          </CardHeader>

          <CardContent className="pb-6">
            {sent ? (
              // ── Success state ─────────────────────────────────────────────────
              <div className="text-center space-y-4 py-4">
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-green-100 text-green-600 mx-auto text-2xl">
                  ✓
                </div>
                <p className="text-sm text-muted-foreground">
                  We sent a reset link to <strong>{emailOrUsername}</strong>.
                  Please check your inbox.
                </p>
                <Link
                  href="/dashboard/authentication/login"
                  className="inline-block text-sm text-primary font-semibold hover:underline underline-offset-4"
                >
                  Back to Login
                </Link>
              </div>
            ) : (
              // ── Form ──────────────────────────────────────────────────────────
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="emailOrUsername">Email or Username</Label>
                  <Input
                    id="emailOrUsername"
                    placeholder="Email or Username"
                    value={emailOrUsername}
                    onChange={(e) => {
                      setEmailOrUsername(e.target.value);
                      if (error) setError("");
                    }}
                    onBlur={handleBlur}
                    className={fieldClass}
                  />
                  {touched && error && (
                    <p className="text-xs text-red-500">{error}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full uppercase tracking-widest font-semibold"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Reset Now"}
                </Button>

                <p className="text-center text-sm text-muted-foreground pt-1">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/dashboard/authentication/register"
                    className="text-primary font-semibold hover:underline underline-offset-4"
                  >
                    Create an Account
                  </Link>
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
