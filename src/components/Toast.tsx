"use client";

import { useEffect, useState } from "react";

export interface ToastProps {
  message: string;
  type?: "info" | "success" | "warning" | "error";
  duration?: number;
  onClose: () => void;
}

export function Toast({
  message,
  type = "info",
  duration = 3000,
  onClose,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = {
    info: "bg-blue-600",
    success: "bg-green-600",
    warning: "bg-yellow-600",
    error: "bg-red-600",
  }[type];

  return (
    <div
      className={`
        fixed top-4 left-1/2 -translate-x-1/2 z-50
        ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg
        transition-all duration-300
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}
      `}
      role="alert"
      aria-live="polite"
    >
      <p className="font-medium">{message}</p>
    </div>
  );
}
