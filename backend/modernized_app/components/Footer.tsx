"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();

  // If path starts with /admin, hide the footer
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <h2 className="footer-logo">Elysa Consultants</h2>
          <p>
            Professional consulting services in architecture, structural engineering, surveying, DPR preparation, and
            infrastructure planning.
          </p>
          <div className="footer-social">
            <a
              href="https://www.instagram.com/elysa_architects?igsh=MWZ2eWM3Zm5kdDA2ag=="
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="social-icon"
            >
              <i className="fab fa-instagram"></i>
            </a>
            <a href="tel:+917006375455" aria-label="Call us" className="social-icon">
              <i className="fas fa-phone"></i>
            </a>
            <a href="mailto:aakhoonrashiq@gmail.com" aria-label="Email us" className="social-icon">
              <i className="fas fa-envelope"></i>
            </a>
          </div>
        </div>

        <div className="footer-links">
          <h3>Quick Links</h3>
          <ul>
            <li>
              <Link href="/">Home</Link>
            </li>
            <li>
              <Link href="/about">About</Link>
            </li>
            <li>
              <Link href="/projects">Projects</Link>
            </li>
            <li>
              <Link href="/services">Services</Link>
            </li>
            <li>
              <Link href="/contact">Contact</Link>
            </li>
          </ul>
        </div>

        <div className="footer-contact-info" id="contact-footer">
          <h3>Contact Us</h3>
          <div className="contact-item">
            <i className="fas fa-map-marker-alt"></i>
            <a href="https://maps.app.goo.gl/A4fAmaMtQta7BzcG6?g_st=ic" target="_blank" rel="noopener noreferrer">
              View Office Location
            </a>
          </div>
          <div className="contact-item">
            <i className="fas fa-phone"></i>
            <a href="tel:+917006375455">+91 7006 375 455</a>
          </div>
          <div className="contact-item">
            <i className="fas fa-envelope"></i>
            <a href="mailto:aakhoonrashiq@gmail.com">aakhoonrashiq@gmail.com</a>
          </div>
          <div className="contact-item">
            <i className="fas fa-clock"></i>
            <span>Mon–Sat, 9 AM – 6 PM IST</span>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Elysa Consultants. All Rights Reserved.</p>
        <p className="footer-tagline">Engineering Tomorrow's Landmarks</p>
      </div>
    </footer>
  );
}
