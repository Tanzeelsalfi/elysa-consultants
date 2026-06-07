"use client";

import React, { useEffect } from "react";
import Link from "next/link";

export default function About() {
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
      <section className="page-hero" id="about-hero" aria-label="About page hero">
        <div className="page-hero-overlay"></div>
        <div
          className="page-hero-bg"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=1600&q=80')",
          }}
        ></div>
        <div className="page-hero-content" data-animate="fadeUp">
          <span className="page-hero-label">Our Story</span>
          <h1>
            About <span className="highlight">Elysa Consultants</span>
          </h1>
          <p>Engineering innovative, sustainable, and modern infrastructure solutions since 2017.</p>
        </div>
      </section>

      {/* ABOUT MAIN */}
      <section className="about-main-section">
        <div className="section-container">
          <div className="about-left" data-animate="fadeLeft">
            <img
              src="https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=800&q=80"
              alt="Architecture"
              loading="lazy"
            />
          </div>

          <div className="about-right" data-animate="fadeRight">
            <span className="section-label">Who We Are</span>
            <h2>
              Building <span className="highlight">Excellence</span>
            </h2>

            <p>
              Elysa Consultants is a Kashmir-based civil, structural, and architectural engineering consultancy firm
              established in 2017.
            </p>

            <p>
              We specialize in architectural planning, structural design, geotechnical engineering, surveying, DPR
              preparation, and construction consultancy services.
            </p>

            <p>
              With an experienced team of engineers and designers, we have successfully delivered projects including
              shopping malls, schools, hotels, residential buildings, water infrastructure, and institutional projects
              across Kashmir and other regions of India.
            </p>

            <p>
              Our mission is to provide safe, innovative, and high-quality engineering solutions while maintaining
              strong client relationships and timely project delivery.
            </p>

            <Link href="/contact" className="btn btn-primary" id="about-contact-btn">
              Work With Us
            </Link>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="values-section">
        <div className="section-header" data-animate="fadeUp">
          <span className="section-label">What We Stand For</span>
          <h2>
            Our Core <span className="highlight">Values</span>
          </h2>
        </div>

        <div className="values-grid" data-animate="fadeUp">
          <div className="value-card" id="value-innovation">
            <div className="value-icon">
              <i className="fas fa-lightbulb"></i>
            </div>
            <h3>Innovation</h3>
            <p>Delivering modern and sustainable engineering solutions that push the boundaries of design.</p>
          </div>

          <div className="value-card" id="value-quality">
            <div className="value-icon">
              <i className="fas fa-medal"></i>
            </div>
            <h3>Quality</h3>
            <p>Maintaining the highest standards in every project we design, plan, and deliver.</p>
          </div>

          <div className="value-card" id="value-commitment">
            <div className="value-icon">
              <i className="fas fa-handshake"></i>
            </div>
            <h3>Commitment</h3>
            <p>Building long-term client relationships through trust, transparency, and timely delivery.</p>
          </div>

          <div className="value-card" id="value-safety">
            <div className="value-icon">
              <i className="fas fa-shield-alt"></i>
            </div>
            <h3>Safety</h3>
            <p>Every structure we design is engineered with safety and durability as the top priority.</p>
          </div>
        </div>
      </section>

      {/* MILESTONES */}
      <section className="milestones-section" data-animate="fadeUp">
        <div className="section-header">
          <span className="section-label">Our Journey</span>
          <h2>
            Key <span className="highlight">Milestones</span>
          </h2>
        </div>

        <div className="timeline">
          <div className="timeline-item">
            <div className="timeline-year">2017</div>
            <div className="timeline-content">
              <h3>Founded</h3>
              <p>Elysa Consultants was established in Kashmir with a vision to deliver world-class engineering solutions.</p>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-year">2019</div>
            <div className="timeline-content">
              <h3>First Major Commercial Project</h3>
              <p>Successfully delivered a large-scale commercial building project in Srinagar.</p>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-year">2021</div>
            <div className="timeline-content">
              <h3>Bangalore Expansion</h3>
              <p>Expanded operations to Bangalore, delivering residential flats and mall infrastructure projects.</p>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-year">2024</div>
            <div className="timeline-content">
              <h3>500+ Projects Delivered</h3>
              <p>Crossed a landmark of 500+ completed projects across Kashmir and India.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section" data-animate="fadeUp">
        <div className="cta-content">
          <h2>Let's Build Something Great Together</h2>
          <p>Have a project in mind? Our team is ready to help.</p>
          <Link href="/contact" className="btn btn-gold" id="about-cta-btn">
            Get In Touch &rarr;
          </Link>
        </div>
      </section>
    </>
  );
}
