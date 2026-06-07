"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState("dark");
  const pathname = usePathname();

  // Handle navbar styling on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    // Determine active theme on mount
    const activeTheme = document.documentElement.getAttribute("data-theme") || localStorage.getItem("theme") || "dark";
    setTheme(activeTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("theme", nextTheme);
  };

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  // If path starts with /admin, we might hide the main site navbar or display it differently.
  // We'll return null or a simple dashboard layout for admin. Let's return null if we are in admin pages.
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`} id="navbar">
      <div className="nav-container">
        <Link href="/" className="nav-logo" aria-label="Elysa Consultants Home" onClick={closeMenu}>
          <span className="logo-text">Elysa</span>
          <span className="logo-sub">Consultants</span>
        </Link>

        <button
          className={`hamburger ${isOpen ? "open" : ""}`}
          id="hamburger"
          aria-label="Toggle menu"
          aria-expanded={isOpen}
          onClick={toggleMenu}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <ul className={`nav-links ${isOpen ? "open" : ""}`} id="navLinks" role="navigation" aria-label="Main navigation">
          <li>
            <Link
              href="/"
              className={`nav-link ${pathname === "/" ? "active" : ""}`}
              onClick={closeMenu}
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              href="/about"
              className={`nav-link ${pathname === "/about" ? "active" : ""}`}
              onClick={closeMenu}
            >
              About
            </Link>
          </li>
          <li>
            <Link
              href="/projects"
              className={`nav-link ${pathname === "/projects" ? "active" : ""}`}
              onClick={closeMenu}
            >
              Projects
            </Link>
          </li>
          <li>
            <Link
              href="/services"
              className={`nav-link ${pathname === "/services" ? "active" : ""}`}
              onClick={closeMenu}
            >
              Services
            </Link>
          </li>
          <li>
            <Link
              href="/career"
              className={`nav-link ${pathname === "/career" ? "active" : ""}`}
              onClick={closeMenu}
            >
              Career
            </Link>
          </li>
          <li>
            <Link
              href="/contact"
              className={`nav-link nav-contact ${pathname === "/contact" ? "active" : ""}`}
              onClick={closeMenu}
            >
              Contact
            </Link>
          </li>
          <li className="theme-toggle-item">
            <button
              id="themeToggleBtn"
              className="theme-toggle-btn"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              <i className={`fas ${theme === "dark" ? "fa-sun" : "fa-moon"}`}></i>
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}
