"use client";

import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFacebook } from "@fortawesome/free-brands-svg-icons"
import { toast } from "sonner";

interface SocialAuthButtonsProps {
  variant?: "login" | "register";
}

export default function SocialAuthButtons({ variant = "login" }: SocialAuthButtonsProps) {
  const handleGoogleClick = () => {
    if (variant === "login") {
      toast.info("Google login coming soon");
    } else {
      toast.info("Google registration coming soon");
    }
  };

  const handleFacebookClick = () => {
    if (variant === "login") {
      toast.info("Facebook login coming soon");
    } else {
      toast.info("Facebook registration coming soon");
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Google Button */}
      <Button
        type="button"
        variant="outline"
        className="h-10 w-full flex items-center justify-center rounded-lg border-2 hover:border-gray-400 transition-all"
        onClick={handleGoogleClick}
      >
        <img
          src="/icons/google.svg"
          alt="Google"
          className="w-6 h-6"
          loading="lazy"
        />
      </Button>

      {/* Facebook Button */}
      <Button
        type="button"
        variant="outline"
        className="h-10 w-full flex items-center justify-center rounded-lg border-2 hover:border-blue-400 transition-all"
        onClick={handleFacebookClick}
      >
        <FontAwesomeIcon
          icon={faFacebook}
          className="text-2xl text-[#1877F2]"
        />
      </Button>
    </div>
  );
}
