"use client";

import React, { useState, useEffect } from "react";

interface Project {
  _id: string;
  title: string;
  description: string;
  category: string;
  images: string[];
}

interface ProjectLightboxProps {
  project: Project | null;
  onClose: () => void;
}

export default function ProjectLightbox({ project, onClose }: ProjectLightboxProps) {
  const [currentIdx, setCurrentIdx] = useState(0);

  // Reset index when active project changes
  useEffect(() => {
    setCurrentIdx(0);
  }, [project]);

  // Key navigation
  useEffect(() => {
    if (!project) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prevImg();
      if (e.key === "ArrowRight") nextImg();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [project, currentIdx]);

  if (!project) return null;

  const images = project.images || [];
  const total = images.length;
  const currentImg = images[currentIdx] || "";

  const prevImg = () => {
    setCurrentIdx((prev) => (prev - 1 + total) % total);
  };

  const nextImg = () => {
    setCurrentIdx((prev) => (prev + 1) % total);
  };

  return (
    <div className="lightbox" id="lightbox" role="dialog" aria-modal="true" aria-label="Project details">
      <div className="lightbox-overlay" id="lightboxOverlay" onClick={onClose}></div>
      <div className="lightbox-content">
        <button className="lightbox-close" id="lightboxClose" aria-label="Close project" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>

        <div className="lightbox-image-wrap">
          {currentImg && <img src={currentImg} alt={project.title} className="lightbox-img" id="lightboxImg" />}
          {total > 1 && (
            <>
              <button className="lightbox-nav prev" id="lightboxPrev" aria-label="Previous image" onClick={prevImg}>
                <i className="fas fa-chevron-left"></i>
              </button>
              <button className="lightbox-nav next" id="lightboxNext" aria-label="Next image" onClick={nextImg}>
                <i className="fas fa-chevron-right"></i>
              </button>
            </>
          )}
          <div className="lightbox-counter" id="lightboxCounter">
            {currentIdx + 1} / {total}
          </div>
        </div>

        <div className="lightbox-info">
          <h2 id="lightboxTitle">{project.title}</h2>
          <p id="lightboxDesc">{project.description}</p>
          <span className="lightbox-category" id="lightboxCategory">
            {project.category}
          </span>

          {total > 1 && (
            <div className="lightbox-thumbs" id="lightboxThumbs">
              {images.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={`Thumbnail ${i + 1}`}
                  className={`lightbox-thumb ${i === currentIdx ? "active" : ""}`}
                  loading="lazy"
                  onClick={() => setCurrentIdx(i)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
