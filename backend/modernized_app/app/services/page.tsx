"use client";

import React, { useEffect } from "react";
import Link from "next/link";

export default function Services() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    document.querySelectorAll("[data-animate]").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* HERO */}
      <section className="page-hero" id="services-hero" aria-label="Services hero">
        <div className="page-hero-overlay"></div>
        <div
          className="page-hero-bg"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1493397212122-2b85dda8106b?auto=format&fit=crop&w=1600&q=80')",
          }}
        ></div>
        <div className="page-hero-content" data-animate="fadeUp">
          <span className="page-hero-label">What We Offer</span>
          <h1>
            Our <span className="highlight">Services</span>
          </h1>
          <p>Premium architecture, structural engineering, and innovative infrastructure solutions.</p>
        </div>
      </section>

      {/* SERVICES MAIN */}
      <section className="services-main-section">
        {/* Architecture */}
        <div className="service-feature" id="svc-architecture" data-animate="fadeLeft">
          <div className="service-feature-image">
            <img
              src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80"
              alt="Architecture Design"
              loading="lazy"
            />
          </div>
          <div className="service-feature-text">
            <div className="service-icon-lg">
              <i className="fas fa-drafting-compass"></i>
            </div>
            <h2>Architecture Design</h2>
            <p>
              Modern residential and commercial architecture planning with innovative and sustainable design concepts
              tailored to your vision and budget.
            </p>
            <ul className="service-list">
              <li>
                <i className="fas fa-check"></i> Residential Architecture
              </li>
              <li>
                <i className="fas fa-check"></i> Commercial Buildings
              </li>
              <li>
                <i className="fas fa-check"></i> Institutional Structures
              </li>
              <li>
                <i className="fas fa-check"></i> Urban Planning
              </li>
            </ul>
          </div>
        </div>

        {/* Structural */}
        <div className="service-feature reverse" id="svc-structural" data-animate="fadeRight">
          <div className="service-feature-image">
            <img
              src="https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=800&q=80"
              alt="Structural Engineering"
              loading="lazy"
            />
          </div>
          <div className="service-feature-text">
            <div className="service-icon-lg">
              <i className="fas fa-building"></i>
            </div>
            <h2>Structural Engineering</h2>
            <p>
              RCC, steel structure, load analysis, and advanced structural consultancy solutions ensuring safety and
              durability for every project.
            </p>
            <ul className="service-list">
              <li>
                <i className="fas fa-check"></i> RCC Frame Design
              </li>
              <li>
                <i className="fas fa-check"></i> Steel Structure Analysis
              </li>
              <li>
                <i className="fas fa-check"></i> Foundation Engineering
              </li>
              <li>
                <i className="fas fa-check"></i> Seismic Analysis
              </li>
            </ul>
          </div>
        </div>

        {/* Geotechnical */}
        <div className="service-feature" id="svc-geo" data-animate="fadeLeft">
          <div className="service-feature-image">
            <img
              src="https://images.unsplash.com/photo-1562654501-a0ccc0fc3fb1?auto=format&fit=crop&w=800&q=80"
              alt="Geotechnical Engineering"
              loading="lazy"
            />
          </div>
          <div className="service-feature-text">
            <div className="service-icon-lg">
              <i className="fas fa-mountain"></i>
            </div>
            <h2>Geotechnical Engineering</h2>
            <p>
              Soil investigation, foundation design, and geotechnical consultancy ensuring every structure sits on a
              solid, well-analyzed foundation.
            </p>
            <ul className="service-list">
              <li>
                <i className="fas fa-check"></i> Soil Testing & Investigation
              </li>
              <li>
                <i className="fas fa-check"></i> Foundation Design
              </li>
              <li>
                <i className="fas fa-check"></i> Slope Stability Analysis
              </li>
              <li>
                <i className="fas fa-check"></i> Retaining Structures
              </li>
            </ul>
          </div>
        </div>

        {/* Surveying */}
        <div className="service-feature reverse" id="svc-survey" data-animate="fadeRight">
          <div className="service-feature-image">
            <img
              src="https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80"
              alt="Surveying Services"
              loading="lazy"
            />
          </div>
          <div className="service-feature-text">
            <div className="service-icon-lg">
              <i className="fas fa-map-marked-alt"></i>
            </div>
            <h2>Surveying Services</h2>
            <p>
              Professional land surveying, site investigation, contour mapping, and Detailed Project Report (DPR)
              preparation for all types of infrastructure.
            </p>
            <ul className="service-list">
              <li>
                <i className="fas fa-check"></i> Topographic Surveys
              </li>
              <li>
                <i className="fas fa-check"></i> Cadastral Surveying
              </li>
              <li>
                <i className="fas fa-check"></i> DPR Preparation
              </li>
              <li>
                <i className="fas fa-check"></i> Site Investigation
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="why-section" data-animate="fadeUp">
        <div className="section-header">
          <span className="section-label">Why Elysa?</span>
          <h2>
            Why Choose <span className="highlight">Us</span>
          </h2>
        </div>

        <div className="why-grid">
          <div className="why-card" id="why-exp">
            <div className="why-number">9+</div>
            <h3>Years Experience</h3>
            <p>Nearly a decade of delivering engineering excellence across Kashmir and India.</p>
          </div>
          <div className="why-card" id="why-proj">
            <div className="why-number">500+</div>
            <h3>Projects Completed</h3>
            <p>From single-family homes to large commercial complexes, we've done it all.</p>
          </div>
          <div className="why-card" id="why-team">
            <div className="why-number">10+</div>
            <h3>Expert Engineers</h3>
            <p>A multidisciplinary team of certified professionals at your service.</p>
          </div>
          <div className="why-card" id="why-sat">
            <div className="why-number">100%</div>
            <h3>Client Satisfaction</h3>
            <p>Our commitment to quality has earned us a perfect track record of satisfied clients.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section" data-animate="fadeUp">
        <div className="cta-content">
          <h2>Ready for Your Next Project?</h2>
          <p>Reach out to our team for a free initial consultation.</p>
          <Link href="/contact" className="btn btn-gold" id="services-cta-btn">
            Contact Us &rarr;
          </Link>
        </div>
      </section>
    </>
  );
}
