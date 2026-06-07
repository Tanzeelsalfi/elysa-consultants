"use client";

import React, { useState, useEffect, useRef } from "react";

interface TeamMember {
  _id?: string;
  name: string;
  position: string;
  spec: string;
  photo: string;
}

const FALLBACK_TEAM: TeamMember[] = [
  {
    name: "Er. Azmat Hussain",
    position: "Senior Structural Engineer & Founder",
    spec: "Structural Design Specialist",
    photo: "/static/images/Azmat.jpg",
  },
  {
    name: "Er. Rameez Rashid",
    position: "Senior Planning Engineer & Co-Founder",
    spec: "Planning & Execution",
    photo: "",
  },
  {
    name: "Er. Gazanfer",
    position: "Senior Civil Engineer",
    spec: "Civil Construction Specialist",
    photo: "",
  },
];

export default function TeamSlider() {
  const [team, setTeam] = useState<TeamMember[]>(FALLBACK_TEAM);
  const [current, setCurrent] = useState(0);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function fetchTeam() {
      try {
        const res = await fetch("/api/employees");
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setTeam(data);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch employees, using static fallback", err);
      }
    }
    fetchTeam();
  }, []);

  const startAutoPlay = () => {
    stopAutoPlay();
    autoPlayRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % team.length);
    }, 5000);
  };

  const stopAutoPlay = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
  };

  useEffect(() => {
    if (team.length > 0) {
      startAutoPlay();
    }
    return () => stopAutoPlay();
  }, [team, current]);

  const goTo = (index: number) => {
    setCurrent(index);
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + team.length) % team.length);
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % team.length);
  };

  if (team.length === 0) return null;

  return (
    <div className="team-slider-wrap">
      <div className="team-slider">
        {team.map((member, idx) => (
          <div
            key={member._id || idx}
            className="team-card"
            style={{
              transform: `translateX(-${current * 100}%)`,
              transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <div className="team-avatar">
              {member.photo ? (
                <img
                  src={member.photo}
                  alt={member.name}
                  loading="lazy"
                  onError={(e) => {
                    // Fallback to avatar icon on image load failure
                    (e.target as HTMLElement).style.display = "none";
                    const sibling = (e.target as HTMLElement).nextElementSibling as HTMLElement;
                    if (sibling) sibling.style.display = "flex";
                  }}
                />
              ) : null}
              <div className="avatar-fallback" style={{ display: member.photo ? "none" : "flex" }}>
                <i className="fas fa-user"></i>
              </div>
            </div>
            <div className="team-info">
              <h3>{member.name}</h3>
              <p className="team-position">{member.position}</p>
              <span className="team-spec">{member.spec}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="team-controls">
        <button className="team-btn" id="teamPrev" aria-label="Previous team member" onClick={prevSlide}>
          <i className="fas fa-chevron-left"></i>
        </button>
        <div className="team-dots" id="teamDots">
          {team.map((_, idx) => (
            <span
              key={idx}
              className={`dot ${idx === current ? "active" : ""}`}
              onClick={() => goTo(idx)}
              style={{ cursor: "pointer" }}
            ></span>
          ))}
        </div>
        <button className="team-btn" id="teamNext" aria-label="Next team member" onClick={nextSlide}>
          <i className="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>
  );
}
