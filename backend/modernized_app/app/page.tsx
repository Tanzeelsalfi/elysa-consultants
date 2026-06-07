"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import TeamSlider from "@/components/TeamSlider";

export default function Home() {
  // Intersection Observer for scroll animations (Faithfully recreating main.js logic)
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

    // Count animations
    const animateCount = (el: HTMLElement, target: number, duration: number) => {
      let start = 0;
      const step = target / (duration / 16);
      const suffix = el.dataset.suffix || "";
      const timer = setInterval(() => {
        start = Math.min(start + step, target);
        el.textContent = suffix === "%" ? Math.round(start) + "%" : Math.round(start) + suffix;
        if (start >= target) clearInterval(timer);
      }, 16);
    };

    const statsObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const raw = el.textContent || "";
            const num = parseInt(raw.replace(/\D/g, ""), 10);
            if (!isNaN(num) && num > 0) {
              el.dataset.suffix = raw.replace(/\d/g, "");
              animateCount(el, num, 1200);
            }
            statsObserver.unobserve(el);
          }
        });
      },
      { threshold: 0.5 }
    );

    document.querySelectorAll(".stat-number").forEach((el) => {
      statsObserver.observe(el);
    });

    return () => {
      observer.disconnect();
      statsObserver.disconnect();
    };
  }, []);

  return (
    <>
      {/* HERO SECTION */}
      <section className="hero-section" id="home" aria-label="Hero">
        <div className="hero-overlay"></div>
        <div
          className="hero-bg-image"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=1600&q=80')",
          }}
        ></div>

        <div className="hero-content" data-animate="fadeUp">
          <div className="hero-badge">Est. 2017 · Kashmir, India</div>
          <h1>
            Designing Modern
            <br />
            <span className="hero-highlight">Architecture Spaces</span>
          </h1>
          <p className="hero-subtitle">
            Professional consulting in Civil Engineering, Structural Engineering,
            <br />
            Geotechnical Engineering, DPR Preparation, and Surveying Services.
          </p>

          <div className="hero-buttons">
            <Link href="/projects" className="btn btn-primary" id="hero-projects-btn">
              <i className="fas fa-folder-open"></i> View Projects
            </Link>
            <a href="#team-section" className="btn btn-ghost scroll-link" id="hero-team-btn">
              <i className="fas fa-users"></i> Meet Our Team
            </a>
          </div>

          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">50+</span>
              <span className="stat-label">Projects Completed</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">9+</span>
              <span className="stat-label">Years Experience</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">100%</span>
              <span className="stat-label">Client Satisfaction</span>
            </div>
          </div>
        </div>

        {/* FEATURED PROJECT BOX */}
        <div className="hero-project-box" data-animate="slideLeft">
          <span className="project-tag">
            <i className="fas fa-award"></i> Our Portfolio
          </span>
          <h3>Explore Our Signature Projects</h3>
          <p>
            Discover premium residential, commercial, and infrastructure projects designed with innovation and
            engineering excellence.
          </p>
          <Link href="/projects" className="btn btn-gold" id="hero-explore-btn">
            View Projects &rarr;
          </Link>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section className="about-section" id="about-section">
        <div className="section-container">
          <div className="about-image-wrap" data-animate="fadeLeft">
            <img
              src="https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=800&q=80"
              alt="Elysa Consultants Architecture"
              loading="lazy"
            />
            <div className="about-image-accent"></div>
          </div>

          <div className="about-text" data-animate="fadeRight">
            <span className="section-label">Who We Are</span>
            <h2>
              About <span className="highlight">Our Company</span>
            </h2>
            <p>
              We are a Kashmir-based consultancy established in 2017, providing professional services in civil,
              structural, and architectural engineering.
            </p>
            <p>
              Our multidisciplinary team has delivered landmark projects across Kashmir and the wider Indian subcontinent
              — from residential homes to large-scale commercial developments.
            </p>

            <div className="about-features">
              <div className="feature-item">
                <i className="fas fa-check-circle"></i>
                <span>Licensed Structural Engineers</span>
              </div>
              <div className="feature-item">
                <i className="fas fa-check-circle"></i>
                <span>End-to-End Project Delivery</span>
              </div>
              <div className="feature-item">
                <i className="fas fa-check-circle"></i>
                <span>Modern CAD & 3D Visualization</span>
              </div>
            </div>

            <Link href="/about" className="btn btn-outline" id="about-more-btn">
              Learn More &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* SERVICES SECTION */}
      <section className="services-section" id="services-section">
        <div className="section-header" data-animate="fadeUp">
          <span className="section-label">What We Do</span>
          <h2>
            Our <span className="highlight">Services</span>
          </h2>
          <p>Comprehensive engineering solutions from concept to completion.</p>
        </div>

        <div className="services-grid" data-animate="fadeUp">
          <div className="service-card" id="service-arch">
            <div className="service-icon">
              <i className="fas fa-drafting-compass"></i>
            </div>
            <h3>Architecture Design</h3>
            <p>Residential and commercial architecture planning with modern and sustainable design concepts.</p>
          </div>

          <div className="service-card" id="service-struct">
            <div className="service-icon">
              <i className="fas fa-building"></i>
            </div>
            <h3>Structural Engineering</h3>
            <p>RCC, steel structures, load analysis, and advanced structural consultancy solutions.</p>
          </div>

          <div className="service-card" id="service-geo">
            <div className="service-icon">
              <i className="fas fa-mountain"></i>
            </div>
            <h3>Geotechnical Engineering</h3>
            <p>Soil investigation, foundation design, and geotechnical consultancy for safe construction.</p>
          </div>

          <div className="service-card" id="service-survey">
            <div className="service-icon">
              <i className="fas fa-map-marked-alt"></i>
            </div>
            <h3>Surveying Services</h3>
            <p>Professional land surveying, site investigation, contour mapping, and DPR preparation.</p>
          </div>

          <div className="service-card" id="service-dpr">
            <div className="service-icon">
              <i className="fas fa-file-alt"></i>
            </div>
            <h3>DPR Preparation</h3>
            <p>Detailed Project Reports for government and private infrastructure projects.</p>
          </div>

          <div className="service-card" id="service-infra">
            <div className="service-icon">
              <i className="fas fa-road"></i>
            </div>
            <h3>Infrastructure Planning</h3>
            <p>Roads, bridges, water infrastructure, and urban development planning.</p>
          </div>
        </div>
      </section>

      {/* TEAM SECTION */}
      <section className="team-section" id="team-section">
        <div className="section-header" data-animate="fadeUp">
          <span className="section-label">The People Behind It</span>
          <h2>
            Our <span className="highlight">Expert Team</span>
          </h2>
        </div>

        <TeamSlider />
      </section>

      {/* CTA SECTION */}
      <section className="cta-section" data-animate="fadeUp">
        <div className="cta-content">
          <h2>Ready to Start Your Project?</h2>
          <p>Contact us today and let our expert team bring your vision to life.</p>
          <Link href="/contact" className="btn btn-gold" id="cta-contact-btn">
            Get In Touch &rarr;
          </Link>
        </div>
      </section>
    </>
  );
}
