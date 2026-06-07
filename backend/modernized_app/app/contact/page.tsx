"use client";

import React, { useState, useEffect, useRef } from "react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [countryCode, setCountryCode] = useState("+91");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorBanner, setErrorBanner] = useState("");

  const messageRef = useRef<HTMLTextAreaElement>(null);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const digits = value.replace(/\D/g, "").slice(0, 10);
      setFormData((prev) => ({ ...prev, [name]: digits }));
      setErrors((prev) => ({ ...prev, [name]: "" }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setErrorBanner("");
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { name: "", email: "", phone: "", message: "" };

    if (!formData.name.trim()) {
      newErrors.name = "Please enter your name.";
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = "Please enter your email address.";
      isValid = false;
    } else {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      if (!emailPattern.test(formData.email)) {
        newErrors.email = "Please enter a valid email address.";
        isValid = false;
      }
    }

    if (!formData.message.trim()) {
      newErrors.message = "Please enter your message.";
      isValid = false;
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message is too short (minimum 10 characters).";
      isValid = false;
    }

    if (formData.phone.trim()) {
      if (formData.phone.replace(/\D/g, "").length !== 10) {
        newErrors.phone = "Phone number must be exactly 10 digits.";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorBanner("");

    if (!validateForm()) return;

    setSubmitting(true);

    const formattedPhone = formData.phone ? `${countryCode} ${formData.phone}` : "";
    const payload = {
      ...formData,
      phone: formattedPhone,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setFormData({ name: "", email: "", phone: "", message: "" });
        setCountryCode("+91");
      } else {
        setErrorBanner(data.message || "Something went wrong. Please try again.");
      }
    } catch (err) {
      setErrorBanner("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendAnother = () => {
    setSuccess(false);
    setErrorBanner("");
  };

  return (
    <>
      {/* HERO */}
      <section className="page-hero contact-hero" id="contact-hero" aria-label="Contact page hero">
        <div className="page-hero-overlay"></div>
        <div
          className="page-hero-bg"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80')",
          }}
        ></div>
        <div className="page-hero-content" data-animate="fadeUp">
          <span className="page-hero-label">Get In Touch</span>
          <h1>
            Contact <span className="highlight">Us</span>
          </h1>
          <p>Have a project or question? We'd love to hear from you. We typically respond within 24 hours.</p>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section className="contact-section" id="contact-section">
        <div className="contact-wrapper">
          {/* CONTACT INFO */}
          <div className="contact-info" data-animate="fadeLeft">
            <span className="section-label">Reach Us</span>
            <h2>
              Let's Start a <span className="highlight">Conversation</span>
            </h2>
            <p>
              Whether you have a question about our services, want to discuss a project, or just want to say hello — we're
              here for you.
            </p>

            <div className="info-cards">
              <div className="info-card" id="info-address">
                <div className="info-icon">
                  <i className="fas fa-map-marker-alt"></i>
                </div>
                <div className="info-text">
                  <h4>Office Location</h4>
                  <a
                    href="https://maps.app.goo.gl/A4fAmaMtQta7BzcG6?g_st=ic"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View on Google Maps
                  </a>
                </div>
              </div>

              <div className="info-card" id="info-phone">
                <div className="info-icon">
                  <i className="fas fa-phone-alt"></i>
                </div>
                <div className="info-text">
                  <h4>Phone</h4>
                  <a href="tel:+917006375455">+91 7006 375 455</a>
                </div>
              </div>

              <div className="info-card" id="info-email">
                <div className="info-icon">
                  <i className="fas fa-envelope"></i>
                </div>
                <div className="info-text">
                  <h4>Email</h4>
                  <a href="mailto:aakhoonrashiq@gmail.com">aakhoonrashiq@gmail.com</a>
                </div>
              </div>

              <div className="info-card" id="info-hours">
                <div className="info-icon">
                  <i className="fas fa-clock"></i>
                </div>
                <div className="info-text">
                  <h4>Working Hours</h4>
                  <span>Monday – Saturday: 9 AM – 6 PM IST</span>
                </div>
              </div>

              <div className="info-card" id="info-instagram">
                <div className="info-icon">
                  <i className="fab fa-instagram"></i>
                </div>
                <div className="info-text">
                  <h4>Instagram</h4>
                  <a
                    href="https://www.instagram.com/elysa_architects?igsh=MWZ2eWM3Zm5kdDA2ag=="
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    @elysa_architects
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* CONTACT FORM */}
          <div className="contact-form-wrap" data-animate="fadeRight">
            <div className="form-card">
              {!success ? (
                <>
                  <h3>Send Us a Message</h3>
                  <p className="form-subtitle">Fill out the form below and we'll get back to you within 24 hours.</p>

                  <form id="contactForm" onSubmit={handleSubmit} noValidate>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="contact-name">
                          Full Name <span className="required">*</span>
                        </label>
                        <input
                          type="text"
                          id="contact-name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="e.g. Azmat Hussain"
                          autoComplete="name"
                          required
                          maxLength={100}
                          className={errors.name ? "error" : ""}
                        />
                        {errors.name && <span className="field-error">{errors.name}</span>}
                      </div>

                      <div className="form-group">
                        <label htmlFor="contact-email">
                          Email Address <span className="required">*</span>
                        </label>
                        <input
                          type="email"
                          id="contact-email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="e.g. you@example.com"
                          autoComplete="email"
                          required
                          maxLength={200}
                          className={errors.email ? "error" : ""}
                        />
                        {errors.email && <span className="field-error">{errors.email}</span>}
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="contact-phone">
                        Phone Number <span className="optional">(optional)</span>
                      </label>
                      <div className="phone-input-container">
                        <select
                          id="contact-country-code"
                          name="country-code"
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          className="phone-country-code"
                        >
                          <option value="+91">🇮🇳 +91</option>
                          <option value="+1">🇺🇸 +1</option>
                          <option value="+44">🇬🇧 +44</option>
                        </select>
                        <input
                          type="tel"
                          id="contact-phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="e.g. 70063 75455"
                          autoComplete="tel"
                          className={errors.phone ? "error" : ""}
                        />
                      </div>
                      {errors.phone && <span className="field-error">{errors.phone}</span>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="contact-message">
                        Your Message <span className="required">*</span>
                      </label>
                      <textarea
                        id="contact-message"
                        name="message"
                        ref={messageRef}
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Tell us about your project or question..."
                        rows={6}
                        required
                        maxLength={2000}
                        className={errors.message ? "error" : ""}
                      ></textarea>
                      <span
                        className="char-count"
                        id="charCount"
                        style={{
                          color: formData.message.length > 1800 ? "#e74c3c" : "",
                        }}
                      >
                        {formData.message.length} / 2000
                      </span>
                      {errors.message && <span className="field-error">{errors.message}</span>}
                    </div>

                    <button type="submit" className="btn btn-primary btn-full" id="contactSubmitBtn" disabled={submitting}>
                      {!submitting ? (
                        <span className="btn-text">
                          <i className="fas fa-paper-plane"></i> Send Message
                        </span>
                      ) : (
                        <span className="btn-loading">
                          <i className="fas fa-spinner fa-spin"></i> Sending...
                        </span>
                      )}
                    </button>
                  </form>
                </>
              ) : (
                /* SUCCESS MESSAGE */
                <div className="form-success" id="formSuccess">
                  <div className="success-icon">
                    <i className="fas fa-check-circle"></i>
                  </div>
                  <h3>Message Sent Successfully!</h3>
                  <p>
                    Thank you for reaching out to Elysa Consultants. Our team will review your message and get back to
                    you within 24 hours.
                  </p>
                  <button className="btn btn-outline" id="sendAnotherBtn" onClick={handleSendAnother}>
                    Send Another Message
                  </button>
                </div>
              )}

              {/* ERROR MESSAGE */}
              {errorBanner && (
                <div className="form-error-banner" id="formErrorBanner">
                  <i className="fas fa-exclamation-triangle"></i>
                  <span id="formErrorText">{errorBanner}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
