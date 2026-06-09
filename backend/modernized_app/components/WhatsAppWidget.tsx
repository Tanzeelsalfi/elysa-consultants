"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function WhatsAppWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Constants
  const phoneNumber = "917006375455";
  const businessMessage = "Hi Elysa Consultants, I'd like to inquire about your engineering/architectural consulting services.";

  // Determine if it is business hours in Kashmir/IST (UTC+5:30)
  // Monday - Saturday, 9:00 AM - 6:00 PM IST
  const checkBusinessStatus = () => {
    const now = new Date();
    // Convert client time to UTC, then add 5.5 hours for IST
    const utcEpoch = now.getTime() + now.getTimezoneOffset() * 60000;
    const istDate = new Date(utcEpoch + 3600000 * 5.5);

    const day = istDate.getUTCDay(); // 0 = Sunday, 1-6 = Mon-Sat
    const hours = istDate.getUTCHours(); // 0-23
    const minutes = istDate.getUTCMinutes(); // 0-59

    const isWorkDay = day >= 1 && day <= 6;
    const isWorkHour = hours >= 9 && hours < 18;

    return isWorkDay && isWorkHour;
  };

  useEffect(() => {
    setMounted(true);
    // Initial check
    setIsOnline(checkBusinessStatus());

    // Update status every minute
    const interval = setInterval(() => {
      setIsOnline(checkBusinessStatus());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Don't render on admin pages
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  // Prevent SSR rendering mismatches by waiting until mounted
  if (!mounted) {
    return null;
  }

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(businessMessage)}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans flex flex-col items-end">
      {/* CHAT CARD */}
      <div
        className={`mb-4 w-80 rounded-2xl shadow-2xl transition-all duration-300 transform origin-bottom-right ${
          isOpen
            ? "scale-100 opacity-100 translate-y-0"
            : "scale-75 opacity-0 translate-y-4 pointer-events-none"
        }`}
        style={{
          background: "rgba(18, 18, 24, 0.75)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)",
        }}
      >
        {/* Header */}
        <div
          className="p-4 rounded-t-2xl flex items-center justify-between"
          style={{
            borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
            background: "linear-gradient(135deg, rgba(201, 168, 76, 0.15) 0%, rgba(18, 18, 24, 0.3) 100%)",
          }}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                style={{
                  background: "linear-gradient(135deg, #c9a84c 0%, #a07d2c 100%)",
                  boxShadow: "0 4px 12px rgba(201, 168, 76, 0.3)",
                }}
              >
                EC
              </div>
              <span
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#121218] ${
                  isOnline ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                }`}
              ></span>
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm tracking-wide">Elysa Consultants</h4>
              <p className="text-xs text-gray-300 flex items-center gap-1.5 mt-0.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isOnline ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                ></span>
                {isOnline ? "Online — Chat with an Engineer" : "Away — Leave a message"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-white transition-colors duration-200 p-1"
            aria-label="Close chat window"
          >
            <i className="fas fa-times text-lg"></i>
          </button>
        </div>

        {/* Message Area */}
        <div className="p-5">
          <div
            className="rounded-xl p-3.5 mb-4 text-xs leading-relaxed"
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.05)",
              color: "#e2e8f0",
            }}
          >
            <p className="font-medium text-gray-400 mb-1">Support Assistant</p>
            {isOnline ? (
              <p>Hello! Welcome to Elysa Consultants. Ask us any questions about your project design, structural safety, or engineering requirements. We are online and ready to assist you!</p>
            ) : (
              <p>Hi there! We are currently offline (Office hours: Mon–Sat, 9 AM – 6 PM IST). Please leave a message, and our engineers will get back to you as soon as we reopen.</p>
            )}
          </div>

          {/* Action Button */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-sm font-semibold tracking-wider transition-all duration-300"
            style={{
              background: isOnline
                ? "linear-gradient(135deg, #25D366 0%, #128C7E 100%)"
                : "linear-gradient(135deg, #c9a84c 0%, #a07d2c 100%)",
              color: "#ffffff",
              boxShadow: isOnline
                ? "0 4px 15px rgba(37, 211, 102, 0.25)"
                : "0 4px 15px rgba(201, 168, 76, 0.25)",
            }}
          >
            <i className="fab fa-whatsapp text-lg"></i>
            {isOnline ? "Start Live Chat" : "Leave WhatsApp Message"}
          </a>
        </div>
      </div>

      {/* FLOATING ACTION TRIGGER */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full flex items-center justify-center shadow-2xl relative transition-all duration-300 transform hover:scale-105 active:scale-95 group focus:outline-none"
        aria-label="Contact us on WhatsApp"
        style={{
          background: "rgba(18, 18, 24, 0.75)",
          backdropFilter: "blur(15px)",
          WebkitBackdropFilter: "blur(15px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
        }}
      >
        {/* Pulsing indicator ring */}
        <span
          className={`absolute -inset-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-ping -z-10 ${
            isOnline ? "bg-emerald-500/20" : "bg-[#c9a84c]/20"
          }`}
          style={{ animationDuration: "2s" }}
        ></span>

        {/* Dynamic status colored ring */}
        <span
          className={`absolute -inset-0.5 rounded-full border-2 -z-10 ${
            isOnline ? "border-emerald-500/30" : "border-[#c9a84c]/30"
          }`}
        ></span>

        {/* WhatsApp Icon */}
        <i
          className="fab fa-whatsapp text-2xl transition-all duration-300"
          style={{
            color: isOnline ? "#25D366" : "#c9a84c",
          }}
        ></i>

        {/* Pulsing Dot indicator */}
        <span
          className={`absolute top-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#121218] ${
            isOnline ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
          }`}
        ></span>
      </button>
    </div>
  );
}
