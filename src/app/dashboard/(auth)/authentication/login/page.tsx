"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons"
import { faFacebook, faGoogle } from "@fortawesome/free-brands-svg-icons"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";
import { loginUser } from "@/lib/auth-api";
import SocialAuthButtons from "@/components/features/auth/SocialAuthButtons";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({ email: "", password: "" });
  const [touched, setTouched] = useState({ email: false, password: false });

  // ── Validation ───────────────────────────────────────────────────────────────
  const validateEmail = (v: string) => {
    if (!v.trim()) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()))
      return "Enter a valid email address.";
    return "";
  };

  const validatePassword = (v: string) => {
    if (!v) return "Password is required.";
    return "";
  };

  const handleBlurEmail = () => {
    setTouched((p) => ({ ...p, email: true }));
    setErrors((p) => ({ ...p, email: validateEmail(email) }));
  };

  const handleBlurPassword = () => {
    setTouched((p) => ({ ...p, password: true }));
    setErrors((p) => ({ ...p, password: validatePassword(password) }));
  };

  // ── Submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);

    setErrors({ email: emailErr, password: passwordErr });
    setTouched({ email: true, password: true });

    if (emailErr || passwordErr) return;

    setLoading(true);
    try {
      const result = await loginUser({ email, password });

      // Persist token & user
      if (rememberMe) {
        localStorage.setItem("token", result.token ?? "");
        localStorage.setItem("user", JSON.stringify(result.user));
      } else {
        sessionStorage.setItem("token", result.token ?? "");
        sessionStorage.setItem("user", JSON.stringify(result.user));
      }

      toast.success("Login successful! Redirecting...");
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Field helper ─────────────────────────────────────────────────────────────
  const fieldClass = (field: keyof typeof errors) =>
    touched[field] && errors[field]
      ? "rounded-sm border-red-500 focus-visible:ring-red-500"
      : touched[field] && !errors[field]
        ? "rounded-sm border-green-500 focus-visible:ring-green-500"
        : "rounded-sm";

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4 py-12 overflow-y-auto">
      <style jsx global>{`
        /* Hide password reveal button in Edge/IE */
        input::-ms-reveal,
        input::-ms-clear {
          display: none;
        }
      `}</style>

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

        <Card className="w-full shadow-lg border-0 pt-6">
          <CardHeader className="items-center pb-0 pt-2">
            <h4 className="text-2xl font-bold tracking-tight text-[#071437]">Login</h4>
            <p className="text-sm text-muted-foreground mt-1">Thank you for coming back, let's access the best recommendation for you.</p>
          </CardHeader>

          <CardContent className="pb-1">
            <form onSubmit={handleSubmit} noValidate className="space-y-3">

              {/* Email */}
              <div className="space-y-0.5">
                <Label htmlFor="email" className="text-xs">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((p) => ({ ...p, email: "" }));
                  }}
                  onBlur={handleBlurEmail}
                  className={fieldClass("email")}
                />
                {touched.email && errors.email && (
                  <p className="text-xs text-red-500">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-0.5">
                <Label htmlFor="password" className="text-xs">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((p) => ({ ...p, password: "" }));
                    }}
                    onBlur={handleBlurPassword}
                    className={`pr-10 ${fieldClass("password")}`}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <FontAwesomeIcon icon={faEye} /> : <FontAwesomeIcon icon={faEyeSlash} />}
                  </button>
                </div>
                {touched.password && errors.password && (
                  <p className="text-xs text-red-500">{errors.password}</p>
                )}
              </div>

              {/* Remember me + Forgot password */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2 group">
                  <Checkbox
                    id="rememberMe"
                    checked={rememberMe}
                    onCheckedChange={(v) => setRememberMe(!!v)}
                    className="w-[18px] h-[18px] rounded-[4px] data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <Label
                    htmlFor="rememberMe"
                    className="text-sm font-medium cursor-pointer select-none"
                  >
                    Remember Me
                  </Label>
                </div>
                <Link
                  href="/dashboard/authentication/reset-password"
                  className="text-sm font-semibold text-primary hover:opacity-80 transition-opacity"
                >
                  Forget password?
                </Link>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full uppercase tracking-widest font-semibold h-9 mt-1"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>

              {/* OR divider */}
              <div className="relative flex items-center gap-2 my-1.5">
                <div className="flex-1 h-[1px] bg-border"></div>
                <span className="text-xs font-black text-muted-foreground uppercase tracking-[2px]">OR</span>
                <div className="flex-1 h-[1px] bg-border"></div>
              </div>

              {/* Social buttons */}
              <SocialAuthButtons variant="login" />

              {/* Registration Footer */}
              <div className="text-center pt-0 pb-0">
                <p className="text-sm text-muted-foreground">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/dashboard/authentication/register"
                    className="text-primary font-semibold hover:underline underline-offset-4"
                  >
                    Create an Account
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
