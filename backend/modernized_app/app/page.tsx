"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import TeamSlider from "@/components/TeamSlider";

interface Review {
  _id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt?: string;
}

export default function Home() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [ratingVal, setRatingVal] = useState(5);
  const [reviewForm, setReviewForm] = useState({ name: "", comment: "" });
  const [modalError, setModalError] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const fetchReviews = async () => {
    try {
      const res = await fetch("/api/reviews");
      if (res.ok) {
        const data = await res.json();
        setReviews(data || []);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setReviewsLoading(false);
    }
  };

  const showToast = (message: string, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  const handleOpenReviewModal = () => {
    setReviewForm({ name: "", comment: "" });
    setRatingVal(5);
    setModalError("");
    setReviewModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const handleCloseReviewModal = () => {
    setReviewModalOpen(false);
    document.body.style.overflow = "";
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError("");

    if (!reviewForm.name.trim() || !reviewForm.comment.trim()) {
      setModalError("All fields are required.");
      return;
    }

    setSubmittingReview(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: reviewForm.name.trim(),
          rating: ratingVal,
          comment: reviewForm.comment.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        handleCloseReviewModal();
        fetchReviews();
        showToast(data.message || "Review submitted successfully!", "success");
      } else {
        setModalError(data.message || "Failed to submit review.");
        showToast(data.message || "Failed to submit review.", "error");
      }
    } catch (err) {
      setModalError("Network error. Please try again.");
      showToast("Network error. Please try again.", "error");
    } finally {
      setSubmittingReview(false);
    }
  };

  // Intersection Observer for scroll animations (Faithfully recreating main.js logic)
  useEffect(() => {
    fetchReviews();

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
              <span className="stat-number">500+</span>
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

      {/* REVIEWS & TESTIMONIALS SECTION */}
      <section className="reviews-section" id="reviews-section">
        <div className="reviews-container">
          <div className="section-header" data-animate="fadeUp">
            <span className="section-label">Client Feedback</span>
            <h2>What Our <span className="highlight">Clients Say</span></h2>
            <p>Read about their experiences working with Elysa Consultants.</p>
          </div>

          <div className="reviews-header-actions" data-animate="fadeUp">
            <button className="btn btn-gold" onClick={handleOpenReviewModal} id="write-review-btn">
              <i className="fas fa-edit"></i> Write a Review
            </button>
          </div>

          {reviewsLoading ? (
            <div className="reviews-loading" id="reviewsLoading">
              <div className="reviews-spinner"></div>
              <p>Loading reviews...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="reviews-empty" id="reviewsEmpty">
              <i className="far fa-comments"></i>
              <h3>No Reviews Yet</h3>
              <p>Be the first to share your experience with Elysa Consultants!</p>
            </div>
          ) : (
            <div className="reviews-grid" id="reviewsGrid">
              {reviews.map((rev) => {
                const initials = (rev.name || "Anonymous")
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();
                const formattedDate = rev.createdAt
                  ? new Date(rev.createdAt).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : "";

                return (
                  <div className="review-card" key={rev._id}>
                    <div className="review-stars">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <i
                          className={`${idx < rev.rating ? "fas" : "far"} fa-star`}
                          key={idx}
                        ></i>
                      ))}
                    </div>
                    <p className="review-comment">"{rev.comment}"</p>
                    <div className="review-author">
                      <div className="review-avatar-fallback">{initials}</div>
                      <div className="review-author-info">
                        <h4>{rev.name}</h4>
                        <span>{formattedDate ? `Submitted ${formattedDate}` : "Verified Client"}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
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

      {/* WRITE A REVIEW MODAL */}
      {reviewModalOpen && (
        <div
          className="review-modal-overlay active"
          id="reviewModalOverlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseReviewModal();
          }}
        >
          <div className="review-modal-content">
            <button
              className="review-modal-close"
              onClick={handleCloseReviewModal}
              aria-label="Close modal"
            >
              &times;
            </button>
            <h3 id="reviewModalTitle">Share Your Feedback</h3>
            <p>We value your thoughts! Please rate your experience with us.</p>

            <form className="review-form" id="reviewForm" onSubmit={handleReviewSubmit}>
              <div className="review-form-group">
                <label>Your Rating *</label>
                <div className="rating-selector" id="starRatingSelector">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <i
                      className={`${val <= ratingVal ? "fas active" : "far"} fa-star`}
                      data-value={val}
                      key={val}
                      onClick={() => setRatingVal(val)}
                    ></i>
                  ))}
                </div>
              </div>

              <div className="review-form-group">
                <label htmlFor="reviewName">Your Name *</label>
                <input
                  type="text"
                  id="reviewName"
                  required
                  placeholder="John Doe"
                  value={reviewForm.name}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="review-form-group">
                <label htmlFor="reviewComment">Review Comment *</label>
                <textarea
                  id="reviewComment"
                  required
                  placeholder="Tell us about the services we provided, structural quality, architecture designs, etc..."
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                ></textarea>
              </div>

              {modalError && (
                <div style={{ color: "#ff6b6b", fontSize: "13px", padding: "5px 0" }}>
                  {modalError}
                </div>
              )}

              <div className="review-form-actions">
                <button
                  type="button"
                  className="review-btn-cancel"
                  onClick={handleCloseReviewModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="review-btn-submit"
                  id="btnSubmitReview"
                  disabled={submittingReview}
                >
                  <span>{submittingReview ? "Submitting..." : "Submit Review"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      <div className={`apply-toast ${toast.show ? "show" : ""} ${toast.type}`}>
        {toast.message}
      </div>
    </>
  );
}
