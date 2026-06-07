"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import ProjectLightbox from "@/components/ProjectLightbox";

interface Project {
  _id: string;
  title: string;
  description: string;
  category: string;
  images: string[];
  createdAt?: string;
  updatedAt?: string;
}

const FALLBACK_PROJECTS: Project[] = [
  {
    _id: "static-1",
    title: "Residential House In Kashmir",
    description: "Modern residential architecture with elegant elevation and luxury living spaces.",
    category: "Residential",
    images: [
      "/static/images/house1.jpg",
      "/static/images/house2.jpg",
      "/static/images/house3.jpg",
      "/static/images/house4.jpg",
      "/static/images/house5.jpg",
      "/static/images/house6.jpg",
      "/static/images/house7.jpg",
      "/static/images/house8.jpg",
    ],
  },
  {
    _id: "static-2",
    title: "Showroom Building",
    description: "Elegant showroom architecture designed for premium retail and customer experience.",
    category: "Commercial",
    images: ["/static/images/showroom1.jpg", "/static/images/showroom2.jpg"],
  },
  {
    _id: "static-3",
    title: "Commercial Building At Kashmir",
    description: "Modern commercial infrastructure with advanced planning and professional construction design.",
    category: "Commercial",
    images: [
      "/static/images/commercial1.jpg",
      "/static/images/commercial2.jpg",
      "/static/images/commercial3.jpg",
      "/static/images/commercial4.jpg",
      "/static/images/commercial5.jpg",
      "/static/images/commercial6.jpg",
      "/static/images/commercial7.jpg",
      "/static/images/mall1.jpg",
    ],
  },
  {
    _id: "static-4",
    title: "Residential Flats and Malls At Bangalore",
    description:
      "Premium residential apartment project designed with modern architecture, luxury interiors, and high-end urban living.",
    category: "Residential",
    images: [
      "/static/images/resbang.jpg",
      "/static/images/resbang2.jpg",
      "/static/images/resbang3.jpg",
      "/static/images/resbang4.jpg",
      "/static/images/resbang5.jpg",
      "/static/images/resbang6.jpg",
    ],
  },
];

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  // Fetch projects from API
  const loadProjects = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch("/api/projects");
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          setProjects(data);
        } else {
          setProjects(FALLBACK_PROJECTS);
        }
      } else {
        setProjects(FALLBACK_PROJECTS);
      }
    } catch (err) {
      console.warn("Error fetching projects, using static fallback", err);
      setProjects(FALLBACK_PROJECTS);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();

    // Setup EventSource for SSE live updates (Faithfully recreating projects.js stream setup)
    let sseSource: EventSource | null = null;
    let pollInterval: NodeJS.Timeout | null = null;

    const connectSSE = () => {
      try {
        sseSource = new EventSource("/api/admin/projects/stream");
        sseSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.changed === true) {
              setSelectedProject(null); // Close lightbox if open
              triggerLiveToast();
              loadProjects(true);
            }
          } catch {}
        };
        sseSource.onerror = () => {
          if (sseSource) sseSource.close();
          // Fallback to polling if SSE drops
          startPollingFallback();
        };
      } catch {
        startPollingFallback();
      }
    };

    const startPollingFallback = () => {
      if (pollInterval) return;
      pollInterval = setInterval(async () => {
        try {
          const res = await fetch("/api/projects");
          if (res.ok) {
            const data = await res.json();
            // Compare length with local count
            const count = data.length || 0;
            const currentRealCount = projects.filter((p) => !p._id.startsWith("static-")).length;
            if (count > 0 && count !== currentRealCount) {
              triggerLiveToast();
              loadProjects(true);
            }
          }
        } catch {}
      }, 15000);
    };

    connectSSE();

    // Cleanup
    return () => {
      if (sseSource) sseSource.close();
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [projects.length]);

  const triggerLiveToast = () => {
    setToastMessage("Projects updated! Synchronizing portfolio...");
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
    }, 4000);
  };

  // Intersection animations
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
  }, [loading, filter, sortBy]);

  // Apply filters and sorting
  const getFilteredAndSorted = () => {
    let result = [...projects];

    // Filter
    if (filter !== "all") {
      result = result.filter((p) => p.category === filter);
    }

    // Sort
    if (sortBy === "newest") {
      result.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
    } else if (sortBy === "oldest") {
      result.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateA - dateB;
      });
    } else if (sortBy === "name-asc") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "name-desc") {
      result.sort((a, b) => b.title.localeCompare(a.title));
    }

    return result;
  };

  const processedProjects = getFilteredAndSorted();

  return (
    <>
      {/* HERO */}
      <section className="page-hero" id="projects-hero" aria-label="Projects hero">
        <div className="page-hero-overlay"></div>
        <div
          className="page-hero-bg"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=1600&q=80')",
          }}
        ></div>
        <div className="page-hero-content" data-animate="fadeUp">
          <span className="page-hero-label">Our Portfolio</span>
          <h1>
            Our <span className="highlight">Projects</span>
          </h1>
          <p>Explore our architectural, commercial, and infrastructure work across Kashmir and India.</p>
        </div>
      </section>

      {/* PROJECTS SECTION */}
      <section className="projects-section" id="projects-section">
        <div className="section-header" data-animate="fadeUp">
          <span className="section-label">What We've Built</span>
          <h2>
            Our <span className="highlight">Work</span>
          </h2>
        </div>

        {/* CONTROLS (FILTER & SORT) */}
        <div className="projects-controls" data-animate="fadeUp">
          {/* Category Filters */}
          <div className="filter-group">
            {["all", "Residential", "Commercial", "Industrial", "Infrastructure"].map((cat) => (
              <button
                key={cat}
                className={`filter-btn ${filter === cat ? "active" : ""}`}
                onClick={() => setFilter(cat)}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>

          {/* Sorting Dropdown */}
          <div className="sort-group">
            <label htmlFor="projectsSort">Sort By:</label>
            <select id="projectsSort" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="newest">Date: Newest First</option>
              <option value="oldest">Date: Oldest First</option>
              <option value="name-asc">Title: A to Z</option>
              <option value="name-desc">Title: Z to A</option>
            </select>
          </div>
        </div>

        {/* LOADING STATE */}
        {loading ? (
          <div className="projects-loading" id="projectsLoading">
            <div className="spinner"></div>
            <p>Loading projects...</p>
          </div>
        ) : processedProjects.length === 0 ? (
          /* EMPTY STATE */
          <div className="projects-empty" id="projectsEmpty">
            <i className="fas fa-folder-open"></i>
            <p>No projects found. Check back soon!</p>
          </div>
        ) : (
          /* PROJECTS GRID */
          <div className="projects-grid" id="projectsGrid">
            {processedProjects.map((project, idx) => (
              <div
                key={project._id}
                className="project-card"
                role="button"
                tabIndex={0}
                aria-label={`View project: ${project.title}`}
                onClick={() => setSelectedProject(project)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedProject(project);
                  }
                }}
                style={{
                  opacity: 1,
                  transform: "translateY(0)",
                  transition: `opacity 0.4s ease ${idx * 0.05}s, transform 0.4s ease ${idx * 0.05}s`,
                }}
              >
                <div className="project-card-img">
                  {project.images && project.images[0] && (
                    <img src={project.images[0]} alt={project.title} loading="lazy" />
                  )}
                  <div className="project-card-overlay">
                    <div className="view-btn">
                      <i className="fas fa-expand"></i>
                    </div>
                  </div>
                </div>
                <div className="project-card-body">
                  <span className="project-card-category">{project.category || "Project"}</span>
                  <h3 className="project-card-title">{project.title}</h3>
                  <p className="project-card-desc">{project.description}</p>
                  <div className="project-card-count">
                    <i className="fas fa-images"></i> {project.images ? project.images.length : 0} image
                    {project.images && project.images.length !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* LIGHTBOX OVERLAY */}
      <ProjectLightbox project={selectedProject} onClose={() => setSelectedProject(null)} />

      {/* CTA */}
      <section className="cta-section" data-animate="fadeUp">
        <div className="cta-content">
          <h2>Have a Project in Mind?</h2>
          <p>Tell us about your requirements and our engineers will get back to you.</p>
          <Link href="/contact" className="btn btn-gold" id="projects-cta-btn">
            Get a Consultation &rarr;
          </Link>
        </div>
      </section>

      {/* LIVE TOAST BANNER */}
      {toastVisible && (
        <div
          style={{
            position: "fixed",
            bottom: "28px",
            right: "28px",
            background: "#c9a84c",
            color: "#0a0a0f",
            padding: "12px 22px",
            borderRadius: "10px",
            fontSize: "0.88rem",
            fontWeight: 600,
            boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
            zIndex: 9999,
          }}
        >
          <i className="fas fa-sync-alt fa-spin" style={{ marginRight: "8px" }}></i>
          {toastMessage}
        </div>
      )}
    </>
  );
}
