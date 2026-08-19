"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEyeSlash,
  faCircleCheck,
} from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";
import { registerUser, checkFieldExists } from "@/lib/auth-api";

/* ───────────── Validation Helpers ───────────── */

function validateFullName(v: string) {
  if (!v.trim()) return "Full name is required.";
  if (v.trim().length < 2) return "Full name must be at least 2 characters.";
  if (v.trim().length > 50) return "Full name cannot exceed 50 characters.";
  if (!/^[\p{L}]+(?:[ '-][\p{L}]+)*$/u.test(v.trim()))
    return "Full name can contain only letters, spaces, hyphens, and apostrophes.";
  return "";
}

function validateUsername(v: string) {
  if (!v.trim()) return "Username is required.";
  if (v.trim().length < 4) return "Username must be at least 4 characters.";
  if (v.trim().length > 30) return "Username cannot exceed 30 characters.";
  if (!/^[A-Za-z]/.test(v)) return "Username must start with a letter.";
  if (!/^(?!.*__)[A-Za-z][A-Za-z0-9_]{3,29}$/.test(v))
    return "Username can contain only letters, numbers, and underscores.";
  return "";
}

function validateMobile(v: string) {
  if (!v.trim()) return "Mobile number is required.";
  if (!/^[0-9]{10}$/.test(v.trim()))
    return "Enter a valid 10-digit mobile number.";
  return "";
}

function validateEmail(v: string) {
  const value = v.trim();

  if (!value) return "Email address is required.";

  const emailRegex =
    /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

  if (!emailRegex.test(value))
    return "Enter a valid email address (example: name@email.com).";

  return "";
}
function validatePassword(v: string) {
  if (!v) return "Password is required.";
  if (v.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(v)) return "Include at least one uppercase letter.";
  if (!/[0-9]/.test(v)) return "Include at least one number.";
  if (!/[^A-Za-z0-9]/.test(v)) return "Include at least one special character.";
  return "";
}

function validateConfirmPassword(v: string, password: string) {
  if (!v) return "Please confirm your password.";
  if (v !== password) return "Passwords do not match.";
  return "";
}

/* ───────────── Types ───────────── */

type FormFields = {
  fullName: string;
  username: string;
  mobile: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type Errors = Partial<Record<keyof FormFields, string>>;

/* ───────────── Required Label ───────────── */

const RequiredLabel = ({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}) => (
  <Label htmlFor={htmlFor} className="flex items-center gap-1">
    {children}
    <span className="text-red-500">*</span>
  </Label>
);

/* ───────────── Component ───────────── */

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState<FormFields>({
    fullName: "",
    username: "",
    mobile: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<
    Partial<Record<keyof FormFields, boolean>>
  >({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState<Partial<Record<keyof FormFields, boolean>>>({});

  /* ───────────── Strength ───────────── */

  const getStrength = (p: string) => {
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  };

  const strengthColors = ["", "bg-red-500", "bg-orange-400", "bg-yellow-400", "bg-green-500"];
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];
  const strength = getStrength(form.password);

  /* ───────────── Logic ───────────── */

  const getFieldError = (field: keyof FormFields, value: string) => {
    switch (field) {
      case "fullName": return validateFullName(value);
      case "username": return validateUsername(value);
      case "mobile": return validateMobile(value);
      case "email": return validateEmail(value);
      case "password": return validatePassword(value);
      case "confirmPassword":
        return validateConfirmPassword(value, form.password);
      default: return "";
    }
  };

  const handleChange =
    (field: keyof FormFields) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value =
          field === "mobile"
            ? e.target.value.replace(/\D/g, "").slice(0, 10)
            : e.target.value;

        setForm((prev) => ({ ...prev, [field]: value }));
        setTouched((prev) => ({ ...prev, [field]: true }));

        // Clear only local errors on change, keep async errors until next blur
        const error = getFieldError(field, value);
        if (error) {
          setErrors((prev) => ({ ...prev, [field]: error }));
        } else {
          // If local validation passes, we still clear error to avoid showing "taken" for a modified value
          setErrors((prev) => ({ ...prev, [field]: "" }));
        }
      };

  /* ───────────── Debounced Existence Check ───────────── */

  const checkExistence = useCallback(async (field: "username" | "email", value: string) => {
    if (!value.trim()) return;

    const formatError = getFieldError(field, value);
    if (formatError) return;

    setValidating((prev) => ({ ...prev, [field]: true }));
    try {
      const { exists, message } = await checkFieldExists(field, value);
      if (exists) {
        setErrors((prev) => ({ ...prev, [field]: message }));
      }
    } catch (err) {
      console.error(`Error checking ${field} existence:`, err);
    } finally {
      setValidating((prev) => ({ ...prev, [field]: false }));
    }
  }, []);

  useEffect(() => {
    const usernameTimer = setTimeout(() => {
      if (touched.username && form.username) {
        checkExistence("username", form.username);
      }
    }, 600);

    const emailTimer = setTimeout(() => {
      if (touched.email && form.email) {
        checkExistence("email", form.email);
      }
    }, 600);

    return () => {
      clearTimeout(usernameTimer);
      clearTimeout(emailTimer);
    };
  }, [form.username, form.email, touched.username, touched.email, checkExistence]);

  const handleBlur = (field: keyof FormFields) => async () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    // Existence check also runs on blur for finality
    if (field === "username" || field === "email") {
      checkExistence(field, form[field]);
    }
  };

  const handleMouseDown = (field: keyof FormFields) => (e: React.MouseEvent<HTMLInputElement>) => {
    const fieldOrder: (keyof FormFields)[] = [
      "fullName",
      "username",
      "mobile",
      "email",
      "password",
      "confirmPassword",
    ];
    const currentIndex = fieldOrder.indexOf(field);

    fieldOrder.slice(0, currentIndex).forEach((f) => {
      setTouched((prev) => ({ ...prev, [f]: true }));
      // DON'T call setErrors here as it wipes async existence errors
      // The onBlur event will handle setting the formatting and existence errors
    });
  };

  const fieldClass = (field: keyof FormFields) => {
    const value = form[field];
    const error = errors[field];
    const isTouched = touched[field];

    if (!isTouched || validating[field]) return "rounded-sm";

    if (!value.trim()) {
      return "rounded-sm border-red-500 focus-visible:ring-red-500";
    }

    if (error) {
      return "rounded-sm border-red-500 focus-visible:ring-red-500";
    }

    return "rounded-sm border-green-500 focus-visible:ring-green-500";
  };

  const isValid = (field: keyof FormFields) =>
    touched[field] &&
    !validating[field] &&
    form[field].trim() !== "" &&
    !errors[field];

  /* ───────────── Submit ───────────── */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Errors = {};
    (Object.keys(form) as (keyof FormFields)[]).forEach((field) => {
      const err = getFieldError(field, form[field]);
      if (err) newErrors[field] = err;
    });

    setErrors(newErrors);
    setTouched({
      fullName: true,
      username: true,
      mobile: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      await registerUser({
        fullName: form.fullName,
        username: form.username,
        mobile: form.mobile,
        email: form.email,
        password: form.password,
      });

      toast.success("Account created successfully! Redirecting to login...");
      setTimeout(() => router.push("/dashboard/authentication/login"), 2500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Server error.";

      // Map specific backend errors to fields
      if (message.toLowerCase().includes("username already exists")) {
        setErrors(prev => ({ ...prev, username: "Username already exists" }));
      } else if (message.toLowerCase().includes("email id already registered")) {
        setErrors(prev => ({ ...prev, email: "Email id already registered" }));
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  /* ───────────── UI ───────────── */

  const renderIcon = (field: keyof FormFields, right = "right-3") => (
    <>
      {validating[field] ? (
        <div className={`absolute ${right} top-1/2 -translate-y-1/2`}>
          <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        isValid(field) && (
          <FontAwesomeIcon
            icon={faCircleCheck}
            className={`absolute ${right} top-1/2 -translate-y-1/2 text-green-500 text-sm pointer-events-none`}
          />
        )
      )}
    </>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4 py-12">
      <div className="w-full max-w-md relative">

        {/* Floating Logo */}
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-10">
          <div className="h-14 w-14 rounded-lg bg-white p-1 shadow-md border border-border/50 overflow-hidden relative">
            <Image
              src="/ra_logo.png"
              alt="Logo"
              fill
              priority
              className="object-cover rounded-md"
            />
          </div>
        </div>

        <Card className="w-full shadow-lg border-0 pt-8">
          <CardHeader className="items-center pb-2 pt-4">
            <h4 className="text-2xl font-bold tracking-tight text-[#071437]">
              Register
            </h4>
            <p className="text-sm text-muted-foreground mt-1">
              Manage all your dashboard records
            </p>
          </CardHeader>

          <CardContent className="pb-6">
            <form onSubmit={handleSubmit} noValidate className="space-y-4">

              {/* Full Name */}
              <div className="space-y-1">
                <RequiredLabel htmlFor="fullName">Full Name</RequiredLabel>
                <div className="relative">
                  <Input
                    id="fullName"
                    placeholder="Full Name"
                    value={form.fullName}
                    onChange={handleChange("fullName")}
                    onBlur={handleBlur("fullName")}
                    onMouseDown={handleMouseDown("fullName")}
                    className={`pr-10 ${fieldClass("fullName")}`}
                  />
                  {renderIcon("fullName")}
                </div>
                {touched.fullName && (errors.fullName || !form.fullName.trim()) && (
                  <p className="text-xs text-red-500">{errors.fullName || "Full name is required."}</p>
                )}
              </div>

              {/* Username */}
              <div className="space-y-1">
                <RequiredLabel htmlFor="username">Username</RequiredLabel>
                <div className="relative">
                  <Input
                    id="username"
                    placeholder="Username"
                    value={form.username}
                    onChange={handleChange("username")}
                    onBlur={handleBlur("username")}
                    onMouseDown={handleMouseDown("username")}
                    className={`pr-10 ${fieldClass("username")}`}
                  />
                  {renderIcon("username")}
                </div>
                {touched.username && (errors.username || !form.username.trim()) && (
                  <p className="text-xs text-red-500">{errors.username || "Username is required."}</p>
                )}
              </div>

              {/* Mobile */}
              <div className="space-y-1">
                <RequiredLabel htmlFor="mobile">Mobile</RequiredLabel>
                <div className="relative">
                  <Input
                    id="mobile"
                    placeholder="Mobile Number"
                    inputMode="numeric"
                    maxLength={10}
                    value={form.mobile}
                    onChange={handleChange("mobile")}
                    onBlur={handleBlur("mobile")}
                    onMouseDown={handleMouseDown("mobile")}
                    className={`pr-10 ${fieldClass("mobile")}`}
                  />
                  {renderIcon("mobile")}
                </div>
                {touched.mobile && (errors.mobile || !form.mobile.trim()) && (
                  <p className="text-xs text-red-500">{errors.mobile || "Mobile number is required."}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1">
                <RequiredLabel htmlFor="email">Email</RequiredLabel>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange("email")}
                    onBlur={handleBlur("email")}
                    onMouseDown={handleMouseDown("email")}
                    className={`pr-10 ${fieldClass("email")}`}
                  />
                  {renderIcon("email")}
                </div>
                {touched.email && (errors.email || !form.email.trim()) && (
                  <p className="text-xs text-red-500">{errors.email || "Email address is required."}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1">
                <RequiredLabel htmlFor="password">Password</RequiredLabel>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange("password")}
                    onBlur={handleBlur("password")}
                    onMouseDown={handleMouseDown("password")}
                    className={`pr-16 ${fieldClass("password")}`}
                  />
                  {renderIcon("password", "right-10")}

                  <button
                    type="button"
                    tabIndex={-1}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground pointer-events-auto"
                  >
                    <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
                  </button>
                </div>

                {/* Strength Bar */}
                {form.password && (
                  <div className="space-y-1 pt-1">
                    <div className="flex gap-1 h-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`flex-1 rounded-full transition-all duration-300 ${strength >= i
                            ? strengthColors[strength]
                            : "bg-muted"
                            }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Strength:{" "}
                      <span className="font-medium">
                        {strengthLabels[strength]}
                      </span>
                    </p>
                  </div>
                )}

                {touched.password && (errors.password || !form.password.trim()) && (
                  <p className="text-xs text-red-500">{errors.password || "Password is required."}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <RequiredLabel htmlFor="confirmPassword">
                  Confirm Password
                </RequiredLabel>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    value={form.confirmPassword}
                    onChange={handleChange("confirmPassword")}
                    onBlur={handleBlur("confirmPassword")}
                    onMouseDown={handleMouseDown("confirmPassword")}
                    className={`pr-16 ${fieldClass("confirmPassword")}`}
                  />
                  {renderIcon("confirmPassword", "right-10")}

                  <button
                    type="button"
                    tabIndex={-1}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() =>
                      setShowConfirmPassword((p) => !p)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground pointer-events-auto"
                  >
                    <FontAwesomeIcon
                      icon={showConfirmPassword ? faEye : faEyeSlash}
                    />
                  </button>
                </div>

                {touched.confirmPassword && (errors.confirmPassword || !form.confirmPassword.trim()) && (
                  <p className="text-xs text-red-500">{errors.confirmPassword || "Please confirm your password."}</p>
                )}
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full uppercase tracking-widest font-semibold mt-2"
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </Button>

              <p className="text-center text-sm text-muted-foreground pt-1">
                Already have an account?{" "}
                <Link
                  href="/dashboard/authentication/login"
                  className="text-primary font-semibold hover:underline underline-offset-4"
                >
                  Login
                </Link>
              </p>

            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}