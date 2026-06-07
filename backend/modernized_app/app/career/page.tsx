"use client";

import React, { useState, useEffect } from "react";

interface Job {
  _id: string;
  title: string;
  description: string;
  type: string;
  location?: string;
  skills?: string[];
  createdAt?: string;
}

export default function CareerPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Apply Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [activeJob, setActiveJob] = useState<{ id: string; title: string } | null>(null);
  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    phone: "",
    resume: "",
    message: "",
  });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const fetchJobs = async () => {
    try {
      const res = await fetch("/api/careers");
      if (res.ok) {
        const data = await res.json();
        setJobs(data || []);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const showToast = (message: string, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 4000);
  };

  const openApplyModal = (id: string, title: string) => {
    setActiveJob({ id, title });
    setFormValues({ name: "", email: "", phone: "", resume: "", message: "" });
    setFormError("");
    setModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeApplyModal = () => {
    setModalOpen(false);
    setActiveJob(null);
    document.body.style.overflow = "";
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    setFormError("");
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formValues.name.trim() || !formValues.email.trim() || !formValues.phone.trim()) {
      setFormError("Full Name, Email, and Phone Number are required.");
      return;
    }

    setSubmitting(true);

    const payload = {
      jobId: activeJob?.id,
      jobTitle: activeJob?.title,
      name: formValues.name.trim(),
      email: formValues.email.trim(),
      phone: formValues.phone.trim(),
      resume: formValues.resume.trim(),
      message: formValues.message.trim(),
    };

    try {
      const res = await fetch("/api/careers/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        closeApplyModal();
        showToast(data.message || "Application submitted successfully!", "success");
      } else {
        setFormError(data.message || "Failed to submit application.");
        showToast(data.message || "Failed to submit application.", "error");
      }
    } catch (err) {
      setFormError("Network error. Please try again.");
      showToast("Network error. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const typeLabel = (type: string) => {
    const map: Record<string, string> = {
      "full-time": "Full-Time",
      "part-time": "Part-Time",
      "contract": "Contract",
      "internship": "Internship",
    };
    return map[type] || type || "Full-Time";
  };

  return (
    <>
      {/* CAREER HERO */}
      <section className="career-hero" aria-label="Career hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="hero-badge">Join Our Team</div>
          <h1>
            Build Your Career
            <br />
            With <span className="highlight">Elysa Consultants</span>
          </h1>
          <p>Be part of a passionate team shaping landmark infrastructure across Kashmir and beyond.</p>
        </div>
      </section>

      {/* CAREER LISTINGS */}
      <section className="career-section">
        <div className="section-header">
          <span className="section-label">
            <i className="fas fa-briefcase"></i> &nbsp;Opportunities
          </span>
          <h2>
            Open <span className="highlight">Positions</span>
          </h2>
        </div>

        {loading ? (
          <div className="career-loading" id="careerLoading">
            <div className="career-spinner"></div>
            <p>Loading opportunities...</p>
          </div>
        ) : error || jobs.length === 0 ? (
          <div className="career-empty" id="careerEmpty">
            <i className="fas fa-briefcase"></i>
            <h3>No Career Options Available</h3>
            <p>We're not actively hiring right now, but we're always looking for talented engineers. Check back soon!</p>
          </div>
        ) : (
          <div className="career-grid" id="careerGrid">
            {jobs.map((job) => {
              const postedDate = job.createdAt
                ? new Date(job.createdAt).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : "";

              return (
                <article className="career-card" key={job._id}>
                  <div className="career-badge">
                    <i className="fas fa-circle" style={{ fontSize: "7px" }}></i>
                    {typeLabel(job.type)}
                  </div>
                  <h3>{job.title || "Untitled Position"}</h3>
                  <p className="career-desc">{job.description || ""}</p>
                  {job.skills && job.skills.length > 0 && (
                    <div className="career-skills">
                      {job.skills.map((skill, index) => (
                        <span className="skill-tag" key={index}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="career-meta">
                    {job.location && (
                      <span>
                        <i className="fas fa-map-marker-alt"></i> {job.location}
                      </span>
                    )}
                    {postedDate && (
                      <span>
                        <i className="fas fa-calendar-alt"></i> Posted {postedDate}
                      </span>
                    )}
                  </div>
                  <button
                    className="btn-apply"
                    onClick={() => openApplyModal(job._id, job.title)}
                  >
                    Apply Now &rarr;
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* APPLICATION MODAL */}
      {modalOpen && activeJob && (
        <div
          className="apply-modal-overlay active"
          id="applyModalOverlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeApplyModal();
          }}
        >
          <div className="apply-modal-content">
            <button
              className="apply-modal-close"
              onClick={closeApplyModal}
              aria-label="Close modal"
            >
              &times;
            </button>
            <h3 id="modalTitle">Apply for Position</h3>
            <p>
              Applying for: <span className="highlight-job">{activeJob.title}</span>
            </p>

            <form className="apply-form" id="applyForm" onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label htmlFor="applyName">Full Name *</label>
                <input
                  type="text"
                  id="applyName"
                  name="name"
                  required
                  placeholder="John Doe"
                  value={formValues.name}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="applyEmail">Email Address *</label>
                <input
                  type="email"
                  id="applyEmail"
                  name="email"
                  required
                  placeholder="johndoe@example.com"
                  value={formValues.email}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="applyPhone">Phone Number *</label>
                <input
                  type="tel"
                  id="applyPhone"
                  name="phone"
                  required
                  placeholder="+91 98765 43210"
                  value={formValues.phone}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="applyResume">Resume / Portfolio Link</label>
                <input
                  type="url"
                  id="applyResume"
                  name="resume"
                  placeholder="Link to Google Drive, Dropbox, or LinkedIn"
                  value={formValues.resume}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="applyMessage">Cover Letter / Notes</label>
                <textarea
                  id="applyMessage"
                  name="message"
                  placeholder="Tell us why you are a good fit for this role..."
                  value={formValues.message}
                  onChange={handleInputChange}
                ></textarea>
              </div>

              {formError && (
                <div style={{ color: "#ff6b6b", fontSize: "13px", padding: "5px 0" }}>
                  {formError}
                </div>
              )}

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={closeApplyModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit" id="btnSubmitApply" disabled={submitting}>
                  <span>{submitting ? "Submitting..." : "Submit Application"}</span>
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
