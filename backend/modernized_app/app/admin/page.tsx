"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "@/app/admin.css";

interface Project {
  _id: string;
  title: string;
  description: string;
  category: string;
  images: string[];
  createdAt?: string;
}

interface TeamMember {
  _id: string;
  name: string;
  position: string;
  spec: string;
  photo: string;
}

interface Lead {
  _id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  createdAt?: string;
}

interface Career {
  _id: string;
  title: string;
  description: string;
  skills?: string;
  location?: string;
  type: string;
  createdAt?: string;
}

interface Review {
  _id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt?: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [adminUser, setAdminUser] = useState("Admin");
  const [activeTab, setActiveTab] = useState<"projects" | "team" | "contacts" | "careers" | "reviews">("projects");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Toast notifications
  const [toast, setToast] = useState<{ msg: string; type: "success" | "danger" | "warning" } | null>(null);

  // Projects State
  const [projects, setProjects] = useState<Project[]>([]);
  const [projLoading, setProjLoading] = useState(false);
  const [addProjOpen, setAddProjOpen] = useState(false);
  const [projForm, setProjForm] = useState({ title: "", description: "", category: "Residential" });
  const [projImages, setProjImages] = useState<File[]>([]);
  const [projPreviews, setProjPreviews] = useState<string[]>([]);
  const [projFeedback, setProjFeedback] = useState("");
  const [projSubmitting, setProjSubmitting] = useState(false);

  // Edit Project Modal
  const [editProjModal, setEditProjModal] = useState<Project | null>(null);
  const [editProjForm, setEditProjForm] = useState({ title: "", description: "", category: "Residential" });
  const [editKeptImages, setEditKeptImages] = useState<string[]>([]);
  const [editNewImages, setEditNewImages] = useState<File[]>([]);
  const [editPreviews, setEditPreviews] = useState<string[]>([]);
  const [editFeedback, setEditFeedback] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Delete Project Confirm
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Team State
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [teamLoading, setTeamLoading] = useState(false);
  const [addEmpOpen, setAddEmpOpen] = useState(false);
  const [empForm, setEmpForm] = useState({ name: "", position: "", spec: "" });
  const [empPhoto, setEmpPhoto] = useState<File | null>(null);
  const [empPreview, setEmpPreview] = useState("");
  const [empFeedback, setEmpFeedback] = useState("");
  const [empSubmitting, setEmpSubmitting] = useState(false);

  // Leads State
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(false);

  // Careers State
  const [careers, setCareers] = useState<Career[]>([]);
  const [careersLoading, setCareersLoading] = useState(false);
  const [addCareerOpen, setAddCareerOpen] = useState(false);
  const [careerForm, setCareerForm] = useState({ title: "", description: "", skills: "", location: "", type: "full-time" });
  const [careerFeedback, setCareerFeedback] = useState("");
  const [careerSubmitting, setCareerSubmitting] = useState(false);

  // Reviews State
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Edit Team Member Modal
  const [editEmpModal, setEditEmpModal] = useState<TeamMember | null>(null);
  const [editEmpForm, setEditEmpForm] = useState({ name: "", position: "", spec: "" });
  const [editEmpNewPhoto, setEditEmpNewPhoto] = useState<File | null>(null);
  const [editEmpPreview, setEditEmpPreview] = useState("");
  const [editEmpFeedback, setEditEmpFeedback] = useState("");
  const [editEmpSubmitting, setEditEmpSubmitting] = useState(false);

  // Edit Career Modal
  const [editCareerModal, setEditCareerModal] = useState<Career | null>(null);
  const [editCareerForm, setEditCareerForm] = useState({ title: "", description: "", skills: "", location: "", type: "full-time" });
  const [editCareerFeedback, setEditCareerFeedback] = useState("");
  const [editCareerSubmitting, setEditCareerSubmitting] = useState(false);

  // Custom delete confirm modal
  const [pendingDelete, setPendingDelete] = useState<{
    title: string;
    message: string;
    action: () => Promise<void>;
  } | null>(null);

  const showDeleteConfirm = (title: string, message: string, action: () => Promise<void>) => {
    setPendingDelete({ title, message, action });
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const empPhotoRef = useRef<HTMLInputElement>(null);
  const editEmpPhotoRef = useRef<HTMLInputElement>(null);

  // Toast trigger helper
  const showToast = (msg: string, type: "success" | "danger" | "warning" = "success") => {
    setToast({ msg, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Auth check
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/admin/verify");
        if (res.ok) {
          const data = await res.json();
          setAdminUser(data.username || "Admin");
          setAuthorized(true);
          // Load default tab
          loadProjects();
          loadTeam();
          loadLeads();
          loadCareers();
          loadReviews();
        } else {
          router.push("/admin/login");
        }
      } catch (err) {
        router.push("/admin/login");
      }
    }
    checkAuth();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  // ── PROJECTS CRUD ──────────────────────────────────────────
  const loadProjects = async () => {
    setProjLoading(true);
    try {
      const res = await fetch("/api/admin/projects");
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (err) {
      showToast("Error loading projects", "danger");
    } finally {
      setProjLoading(false);
    }
  };

  const handleProjImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file) => file.type.startsWith("image/"));
    
    setProjImages((prev) => [...prev, ...validFiles]);

    // Create previews
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setProjPreviews((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeProjImagePreview = (index: number) => {
    setProjImages((prev) => prev.filter((_, i) => i !== index));
    setProjPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setProjFeedback("");

    if (!projForm.title.trim() || !projForm.description.trim()) {
      setProjFeedback("Title and description are required.");
      return;
    }

    if (projImages.length === 0) {
      setProjFeedback("At least one project image is required.");
      return;
    }

    setProjSubmitting(true);
    const formData = new FormData();
    formData.append("title", projForm.title);
    formData.append("description", projForm.description);
    formData.append("category", projForm.category);
    projImages.forEach((img) => formData.append("images", img));

    try {
      const res = await fetch("/api/admin/projects", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        showToast("Project added successfully", "success");
        setProjForm({ title: "", description: "", category: "Residential" });
        setProjImages([]);
        setProjPreviews([]);
        setAddProjOpen(false);
        loadProjects();
      } else {
        const data = await res.json();
        setProjFeedback(data.message || "Failed to add project.");
      }
    } catch {
      setProjFeedback("Network error. Please try again.");
    } finally {
      setProjSubmitting(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!deleteTargetId) return;

    try {
      const res = await fetch(`/api/admin/projects/${deleteTargetId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        showToast("Project deleted successfully", "danger");
        setDeleteTargetId(null);
        loadProjects();
      } else {
        showToast("Failed to delete project", "danger");
      }
    } catch {
      showToast("Network error. Failed to delete project.", "danger");
    }
  };

  // ── EDIT PROJECT MODAL ─────────────────────────────────────
  const openEditModal = (proj: Project) => {
    setEditProjModal(proj);
    setEditProjForm({
      title: proj.title,
      description: proj.description,
      category: proj.category || "General",
    });
    setEditKeptImages([...(proj.images || [])]);
    setEditNewImages([]);
    setEditPreviews([]);
    setEditFeedback("");
  };

  const handleEditImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file) => file.type.startsWith("image/"));

    setEditNewImages((prev) => [...prev, ...validFiles]);

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setEditPreviews((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeEditKeptImage = (index: number) => {
    setEditKeptImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeEditNewImage = (index: number) => {
    setEditNewImages((prev) => prev.filter((_, i) => i !== index));
    setEditPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEditProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditFeedback("");

    if (!editProjForm.title.trim() || !editProjForm.description.trim()) {
      setEditFeedback("Title and description are required.");
      return;
    }

    if (editKeptImages.length + editNewImages.length === 0) {
      setEditFeedback("At least one project image is required.");
      return;
    }

    setEditSubmitting(true);
    const formData = new FormData();
    formData.append("title", editProjForm.title);
    formData.append("description", editProjForm.description);
    formData.append("category", editProjForm.category);
    formData.append("keep_images", JSON.stringify(editKeptImages));
    editNewImages.forEach((img) => formData.append("images", img));

    try {
      const res = await fetch(`/api/admin/projects/${editProjModal?._id}`, {
        method: "PUT",
        body: formData,
      });

      if (res.ok) {
        showToast("Project updated successfully", "success");
        setEditProjModal(null);
        loadProjects();
      } else {
        const data = await res.json();
        setEditFeedback(data.message || "Failed to update project.");
      }
    } catch {
      setEditFeedback("Network error. Please try again.");
    } finally {
      setEditSubmitting(false);
    }
  };

  // ── TEAM CRUD ──────────────────────────────────────────────
  const loadTeam = async () => {
    setTeamLoading(true);
    try {
      const res = await fetch("/api/admin/employees");
      if (res.ok) {
        const data = await res.json();
        setTeam(data);
      }
    } catch {
      showToast("Error loading team members", "danger");
    } finally {
      setTeamLoading(false);
    }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setEmpPhoto(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setEmpPreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhotoPreview = () => {
    setEmpPhoto(null);
    setEmpPreview("");
    if (empPhotoRef.current) empPhotoRef.current.value = "";
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmpFeedback("");

    if (!empForm.name.trim() || !empForm.position.trim()) {
      setEmpFeedback("Name and position are required.");
      return;
    }

    setEmpSubmitting(true);
    const formData = new FormData();
    formData.append("name", empForm.name);
    formData.append("position", empForm.position);
    formData.append("spec", empForm.spec);
    if (empPhoto) {
      formData.append("photo", empPhoto);
    }

    try {
      const res = await fetch("/api/admin/employees", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        showToast("Team member added successfully", "success");
        setEmpForm({ name: "", position: "", spec: "" });
        setEmpPhoto(null);
        setEmpPreview("");
        setAddEmpOpen(false);
        loadTeam();
      } else {
        const data = await res.json();
        setEmpFeedback(data.message || "Failed to add team member.");
      }
    } catch {
      setEmpFeedback("Network error. Please try again.");
    } finally {
      setEmpSubmitting(false);
    }
  };

  const handleDeleteEmployee = (id: string, name: string) => {
    showDeleteConfirm(
      "Delete Team Member",
      `Are you sure you want to permanently delete "${name}" from the team?`,
      async () => {
        const res = await fetch(`/api/admin/employees/${id}`, { method: "DELETE" });
        if (res.ok) {
          showToast("Team member deleted successfully", "danger");
          loadTeam();
        } else {
          showToast("Failed to delete team member", "danger");
        }
      }
    );
  };

  const openEditEmpModal = (member: TeamMember) => {
    setEditEmpModal(member);
    setEditEmpForm({ name: member.name, position: member.position, spec: member.spec || "" });
    setEditEmpNewPhoto(null);
    setEditEmpPreview("");
    setEditEmpFeedback("");
  };

  const handleEditEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditEmpFeedback("");
    if (!editEmpModal) return;

    setEditEmpSubmitting(true);
    const formData = new FormData();
    formData.append("name", editEmpForm.name);
    formData.append("position", editEmpForm.position);
    formData.append("spec", editEmpForm.spec);
    if (editEmpNewPhoto) formData.append("photo", editEmpNewPhoto);

    try {
      const res = await fetch(`/api/admin/employees/${editEmpModal._id}`, {
        method: "PUT",
        body: formData,
      });
      if (res.ok) {
        showToast("Team member updated successfully", "success");
        setEditEmpModal(null);
        loadTeam();
      } else {
        const data = await res.json();
        setEditEmpFeedback(data.message || "Failed to update team member.");
      }
    } catch {
      setEditEmpFeedback("Network error. Please try again.");
    } finally {
      setEditEmpSubmitting(false);
    }
  };

  // ── LEADS ──────────────────────────────────────────────────
  const loadLeads = async () => {
    setLeadsLoading(true);
    try {
      const res = await fetch("/api/admin/contacts");
      if (res.ok) {
        const data = await res.json();
        setLeads(data);
      }
    } catch {
      showToast("Error loading leads", "danger");
    } finally {
      setLeadsLoading(false);
    }
  };

  const handleDeleteLead = (id: string, name?: string) => {
    showDeleteConfirm(
      "Delete Project Lead",
      `Remove the lead from "${name || "this contact"}"? All associated contact details will be permanently erased.`,
      async () => {
        const res = await fetch(`/api/admin/contacts/${id}`, { method: "DELETE" });
        if (res.ok) {
          showToast("Lead deleted successfully", "danger");
          loadLeads();
        } else {
          showToast("Failed to delete lead", "danger");
        }
      }
    );
  };

  // ── CAREERS CRUD ──────────────────────────────────────────
  const loadCareers = async () => {
    setCareersLoading(true);
    try {
      const res = await fetch("/api/admin/careers");
      if (res.ok) {
        const data = await res.json();
        setCareers(data);
      }
    } catch (err) {
      showToast("Error loading careers", "danger");
    } finally {
      setCareersLoading(false);
    }
  };

  const handleAddCareer = async (e: React.FormEvent) => {
    e.preventDefault();
    setCareerFeedback("");

    if (!careerForm.title.trim() || !careerForm.description.trim()) {
      setCareerFeedback("Title and description are required.");
      return;
    }

    setCareerSubmitting(true);
    try {
      const res = await fetch("/api/admin/careers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: careerForm.title,
          description: careerForm.description,
          skills: careerForm.skills,
          location: careerForm.location,
          type: careerForm.type,
        }),
      });

      if (res.ok) {
        showToast("Career listing added successfully", "success");
        setCareerForm({ title: "", description: "", skills: "", location: "", type: "full-time" });
        setAddCareerOpen(false);
        loadCareers();
      } else {
        const data = await res.json();
        setCareerFeedback(data.message || "Failed to add career.");
      }
    } catch {
      setCareerFeedback("Network error. Please try again.");
    } finally {
      setCareerSubmitting(false);
    }
  };

  const handleDeleteCareer = (id: string, title: string) => {
    showDeleteConfirm(
      "Delete Career Listing",
      `Permanently remove the "${title}" position? All applicant-facing data will be deleted.`,
      async () => {
        const res = await fetch(`/api/admin/careers/${id}`, { method: "DELETE" });
        if (res.ok) {
          showToast("Career listing deleted", "danger");
          loadCareers();
        } else {
          showToast("Failed to delete career", "danger");
        }
      }
    );
  };

  const openEditCareerModal = (job: Career) => {
    setEditCareerModal(job);
    const skillsArr = Array.isArray(job.skills)
      ? (job.skills as unknown as string[]).join(", ")
      : (job.skills || "");
    setEditCareerForm({
      title: job.title,
      description: job.description,
      skills: skillsArr,
      location: job.location || "",
      type: job.type || "full-time",
    });
    setEditCareerFeedback("");
  };

  const handleEditCareer = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditCareerFeedback("");
    if (!editCareerModal) return;

    setEditCareerSubmitting(true);
    try {
      const res = await fetch(`/api/admin/careers/${editCareerModal._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editCareerForm.title,
          description: editCareerForm.description,
          skills: editCareerForm.skills,
          location: editCareerForm.location,
          type: editCareerForm.type,
        }),
      });
      if (res.ok) {
        showToast("Career updated successfully", "success");
        setEditCareerModal(null);
        loadCareers();
      } else {
        const data = await res.json();
        setEditCareerFeedback(data.message || "Failed to update career.");
      }
    } catch {
      setEditCareerFeedback("Network error. Please try again.");
    } finally {
      setEditCareerSubmitting(false);
    }
  };

  // ── REVIEWS MODERATION ────────────────────────────────────
  const loadReviews = async () => {
    setReviewsLoading(true);
    try {
      const res = await fetch("/api/admin/reviews");
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (err) {
      showToast("Error loading reviews", "danger");
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleDeleteReview = (id: string, name?: string) => {
    showDeleteConfirm(
      "Delete Review",
      `Permanently remove the review by "${name || "this user"}"? This cannot be recovered.`,
      async () => {
        const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
        if (res.ok) {
          showToast("Review deleted successfully", "danger");
          loadReviews();
        } else {
          showToast("Failed to delete review", "danger");
        }
      }
    );
  };

  // Check auth load screen
  if (!authorized) {
    return (
      <div className="admin-body">
        <div className="auth-loading" id="authLoading" style={{ display: "flex", height: "100vh" }}>
          <div className="spinner"></div>
          <p>Verifying access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-body">
      {/* SIDEBAR */}
      <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`} id="adminSidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <i className="fas fa-shield-alt"></i>
            <span>Elysa Admin</span>
          </div>
          <button className="sidebar-close" id="sidebarClose" aria-label="Close menu" onClick={() => setSidebarOpen(false)}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`sidebar-link ${activeTab === "projects" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("projects");
              setSidebarOpen(false);
            }}
          >
            <i className="fas fa-folder-open"></i> Projects
          </button>
          <button
            className={`sidebar-link ${activeTab === "team" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("team");
              setSidebarOpen(false);
            }}
          >
            <i className="fas fa-users-cog"></i> Manage Team
          </button>
          <button
            className={`sidebar-link ${activeTab === "contacts" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("contacts");
              setSidebarOpen(false);
            }}
          >
            <i className="fas fa-envelope"></i> Leads
            {leads.length > 0 && <span className="badge visible">{leads.length}</span>}
          </button>
          <button
            className={`sidebar-link ${activeTab === "careers" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("careers");
              setSidebarOpen(false);
            }}
          >
            <i className="fas fa-briefcase"></i> Careers
            {careers.length > 0 && <span className="badge visible">{careers.length}</span>}
          </button>
          <button
            className={`sidebar-link ${activeTab === "reviews" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("reviews");
              setSidebarOpen(false);
            }}
          >
            <i className="fas fa-comments"></i> Reviews
            {reviews.length > 0 && <span className="badge visible">{reviews.length}</span>}
          </button>
        </nav>

        <div className="sidebar-footer">
          <Link href="/" target="_blank" className="sidebar-link">
            <i className="fas fa-external-link-alt"></i> View Site
          </Link>
          <button className="sidebar-link logout-btn" id="logoutBtn" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="admin-main" id="adminMain">
        {/* TOPBAR */}
        <header className="admin-topbar">
          <button className="menu-toggle" id="menuToggle" aria-label="Toggle sidebar" onClick={() => setSidebarOpen(true)}>
            <i className="fas fa-bars"></i>
          </button>
          <div className="topbar-title" id="topbarTitle">
            {activeTab === "projects"
              ? "Projects"
              : activeTab === "team"
              ? "Manage Team"
              : activeTab === "contacts"
              ? "Leads"
              : activeTab === "careers"
              ? "Careers"
              : "Reviews"}
          </div>
          <div className="topbar-user">
            <i className="fas fa-user-shield"></i>
            <span>{adminUser}</span>
          </div>
        </header>

        {/* DASHBOARD CONTENT */}
        <div className="dashboard-content" id="dashboardContent" style={{ display: "block" }}>
          
          {/* ── PROJECTS PANEL ────────────────────────────── */}
          {activeTab === "projects" && (
            <div className="tab-panel active" id="tab-projects">
              <div className="panel-header">
                <h2>
                  <i className="fas fa-folder-open"></i> Manage Projects
                </h2>
                <button className="btn-add" id="openAddProjectBtn" onClick={() => setAddProjOpen(!addProjOpen)}>
                  {addProjOpen ? <><i className="fas fa-times"></i> Cancel</> : <><i className="fas fa-plus"></i> Add Project</>}
                </button>
              </div>

              {/* Add form */}
              {addProjOpen && (
                <div className="add-project-form" id="addProjectForm" style={{ display: "block" }}>
                  <h3>
                    <i className="fas fa-plus-circle"></i> Add New Project
                  </h3>
                  <form id="projectForm" onSubmit={handleAddProject} noValidate>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="proj-title">
                          Project Title <span className="required">*</span>
                        </label>
                        <input
                          type="text"
                          id="proj-title"
                          value={projForm.title}
                          onChange={(e) => setProjForm((prev) => ({ ...prev, title: e.target.value }))}
                          placeholder="e.g. Residential House In Kashmir"
                          required
                          maxLength={200}
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="proj-category">Category</label>
                        <select
                          id="proj-category"
                          value={projForm.category}
                          onChange={(e) => setProjForm((prev) => ({ ...prev, category: e.target.value }))}
                        >
                          <option value="Residential">Residential</option>
                          <option value="Commercial">Commercial</option>
                          <option value="Industrial">Industrial</option>
                          <option value="Infrastructure">Infrastructure</option>
                          <option value="General">General</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="proj-desc">
                        Description <span className="required">*</span>
                      </label>
                      <textarea
                        id="proj-desc"
                        value={projForm.description}
                        onChange={(e) => setProjForm((prev) => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe the project..."
                        rows={3}
                        required
                        maxLength={1000}
                      ></textarea>
                    </div>

                    <div className="form-group">
                      <label htmlFor="proj-images">
                        Project Images <span className="required">*</span>
                      </label>
                      <div
                        className="file-upload-area"
                        id="fileUploadArea"
                        onClick={() => fileInputRef.current?.click()}
                        style={{ cursor: "pointer" }}
                      >
                        <input
                          type="file"
                          id="proj-images"
                          ref={fileInputRef}
                          onChange={handleProjImageSelect}
                          accept=".jpg,.jpeg,.png,.webp"
                          multiple
                          required
                          style={{ display: "none" }}
                        />
                        <div className="upload-placeholder">
                          <i className="fas fa-cloud-upload-alt"></i>
                          <p>Click to select images</p>
                          <span>JPG, PNG, WebP — Max 5MB each</span>
                        </div>
                      </div>

                      {projPreviews.length > 0 && (
                        <div className="image-previews" id="imagePreviews">
                          {projPreviews.map((src, idx) => (
                            <div key={idx} className="preview-item">
                              <img src={src} alt={`Preview ${idx + 1}`} />
                              <button
                                type="button"
                                className="preview-remove"
                                aria-label="Remove image"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeProjImagePreview(idx);
                                }}
                              >
                                <i className="fas fa-times"></i>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="form-actions">
                      <button type="submit" className="btn-primary-admin" id="submitProjectBtn" disabled={projSubmitting}>
                        {projSubmitting ? <><i className="fas fa-spinner fa-spin"></i> Saving...</> : <><i className="fas fa-save"></i> Save Project</>}
                      </button>
                      <button
                        type="button"
                        className="btn-cancel"
                        onClick={() => {
                          setAddProjOpen(false);
                          setProjForm({ title: "", description: "", category: "Residential" });
                          setProjImages([]);
                          setProjPreviews([]);
                        }}
                      >
                        Cancel
                      </button>
                    </div>

                    {projFeedback && (
                      <div className="form-feedback error" style={{ display: "block" }}>
                        {projFeedback}
                      </div>
                    )}
                  </form>
                </div>
              )}

              {/* Projects list */}
              {projLoading ? (
                <div className="projects-loading">
                  <div className="spinner"></div>
                  <p>Loading projects...</p>
                </div>
              ) : projects.length === 0 ? (
                <div className="empty-state" style={{ display: "block" }}>
                  <i className="fas fa-folder-open"></i>
                  <p>No projects yet. Add your first one above.</p>
                </div>
              ) : (
                <div className="projects-list" style={{ display: "grid" }}>
                  {projects.map((proj) => (
                    <div key={proj._id} className="project-item">
                      <div className="project-item-img">
                        {proj.images && proj.images[0] && <img src={proj.images[0]} alt={proj.title} />}
                      </div>
                      <div className="project-item-body">
                        <div className="project-item-category">{proj.category || "Project"}</div>
                        <div className="project-item-title">{proj.title}</div>
                        <div className="project-item-desc">{proj.description}</div>
                        <div className="project-item-count">
                          <i className="fas fa-images"></i> {proj.images ? proj.images.length : 0} image(s)
                        </div>
                        <div className="project-item-actions" style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                          <button
                            className="btn-edit-proj btn-primary-admin"
                            style={{
                              padding: "6px 12px",
                              fontSize: "0.82rem",
                              background: "#c9a84c",
                              color: "#0a0a0f",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              fontWeight: 600,
                              marginTop: 0,
                            }}
                            onClick={() => openEditModal(proj)}
                          >
                            <i className="fas fa-edit"></i> Edit
                          </button>
                          <button
                            className="btn-delete"
                            style={{ padding: "6px 12px", fontSize: "0.82rem", marginTop: 0 }}
                            onClick={() => setDeleteTargetId(proj._id)}
                          >
                            <i className="fas fa-trash"></i> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── TEAM PANEL ───────────────────────────────── */}
          {activeTab === "team" && (
            <div className="tab-panel active" id="tab-team">
              <div className="panel-header">
                <h2>
                  <i className="fas fa-users-cog"></i> Manage Team
                </h2>
                <button className="btn-add" id="openAddEmployeeBtn" onClick={() => setAddEmpOpen(!addEmpOpen)}>
                  {addEmpOpen ? <><i className="fas fa-times"></i> Cancel</> : <><i className="fas fa-plus"></i> Add Team Member</>}
                </button>
              </div>

              {/* Add form */}
              {addEmpOpen && (
                <div className="add-project-form" id="addEmployeeForm" style={{ display: "block", marginBottom: "25px" }}>
                  <h3>
                    <i className="fas fa-plus-circle"></i> Add New Team Member
                  </h3>
                  <form id="employeeForm" onSubmit={handleAddEmployee} noValidate style={{ marginTop: "15px" }}>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="emp-name">
                          Full Name <span className="required">*</span>
                        </label>
                        <input
                          type="text"
                          id="emp-name"
                          value={empForm.name}
                          onChange={(e) => setEmpForm((prev) => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g. Er. Azmat Hussain"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="emp-position">
                          Position / Role <span className="required">*</span>
                        </label>
                        <input
                          type="text"
                          id="emp-position"
                          value={empForm.position}
                          onChange={(e) => setEmpForm((prev) => ({ ...prev, position: e.target.value }))}
                          placeholder="e.g. Senior Structural Engineer"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="emp-spec">Specialty / Subtitle</label>
                      <input
                        type="text"
                        id="emp-spec"
                        value={empForm.spec}
                        onChange={(e) => setEmpForm((prev) => ({ ...prev, spec: e.target.value }))}
                        placeholder="e.g. Structural Design Specialist"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="emp-photo">Photo</label>
                      <input
                        type="file"
                        id="emp-photo"
                        ref={empPhotoRef}
                        onChange={handlePhotoSelect}
                        accept=".jpg,.jpeg,.png,.webp"
                        style={{ display: "none" }}
                      />
                      <button
                        type="button"
                        className="btn-add"
                        onClick={() => empPhotoRef.current?.click()}
                        style={{ display: "inline-block", background: "#14141f", color: "#aaa", padding: "8px 16px" }}
                      >
                        Choose Photo
                      </button>

                      {empPreview && (
                        <div className="image-previews" id="employeePhotoPreview">
                          <div className="preview-item">
                            <img src={empPreview} alt="Photo Preview" />
                            <button
                              type="button"
                              className="preview-remove"
                              aria-label="Remove photo"
                              onClick={removePhotoPreview}
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="form-actions">
                      <button type="submit" className="btn-primary-admin" id="submitEmployeeBtn" disabled={empSubmitting}>
                        {empSubmitting ? <><i className="fas fa-spinner fa-spin"></i> Saving...</> : <><i className="fas fa-save"></i> Save Member</>}
                      </button>
                      <button
                        type="button"
                        className="btn-cancel"
                        onClick={() => {
                          setAddEmpOpen(false);
                          setEmpForm({ name: "", position: "", spec: "" });
                          setEmpPhoto(null);
                          setEmpPreview("");
                        }}
                      >
                        Cancel
                      </button>
                    </div>

                    {empFeedback && (
                      <div className="form-feedback error" style={{ display: "block" }}>
                        {empFeedback}
                      </div>
                    )}
                  </form>
                </div>
              )}

              {/* Team list */}
              {teamLoading ? (
                <div className="projects-loading">
                  <div className="spinner"></div>
                  <p>Loading team members...</p>
                </div>
              ) : team.length === 0 ? (
                <div className="empty-state" style={{ display: "block" }}>
                  <i className="fas fa-users"></i>
                  <p>No team members yet. Add your first one above.</p>
                </div>
              ) : (
                <div className="projects-list" style={{ display: "grid" }}>
                  {team.map((member) => (
                    <div key={member._id} className="project-item">
                      <div className="project-item-img">
                        {member.photo ? (
                          <img src={member.photo} alt={member.name} />
                        ) : (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              height: "100%",
                              background: "#14141f",
                              color: "#444",
                            }}
                          >
                            <i className="fas fa-user fa-3x"></i>
                          </div>
                        )}
                      </div>
                      <div className="project-item-body">
                        <div className="project-item-category">{member.spec || "Staff"}</div>
                        <div className="project-item-title">{member.name}</div>
                        <div className="project-item-desc">{member.position}</div>
                    <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                        <button
                          className="btn-edit btn-primary-admin"
                          style={{
                            padding: "6px 12px",
                            fontSize: "0.82rem",
                            background: "#c9a84c",
                            color: "#0a0a0f",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            fontWeight: 600,
                            marginTop: 0,
                          }}
                          onClick={() => openEditEmpModal(member)}
                        >
                          <i className="fas fa-edit"></i> Edit
                        </button>
                        <button
                          className="btn-delete"
                          style={{ marginTop: 0, padding: "6px 12px", fontSize: "0.82rem" }}
                          onClick={() => handleDeleteEmployee(member._id, member.name)}
                        >
                          <i className="fas fa-trash"></i> Delete
                        </button>
                      </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── LEADS PANEL ──────────────────────────────── */}
          {activeTab === "contacts" && (
            <div className="tab-panel active" id="tab-contacts">
              <div className="panel-header">
                <h2>
                  <i className="fas fa-users"></i> Project Leads
                </h2>
                <button className="btn-refresh" id="refreshContactsBtn" onClick={loadLeads}>
                  <i className="fas fa-sync-alt"></i> Refresh
                </button>
              </div>

              {leadsLoading ? (
                <div className="contacts-loading" style={{ display: "flex" }}>
                  <div className="spinner"></div>
                  <p>Loading leads...</p>
                </div>
              ) : leads.length === 0 ? (
                <div className="empty-state" style={{ display: "block" }}>
                  <i className="fas fa-inbox"></i>
                  <p>No leads yet.</p>
                </div>
              ) : (
                <div className="messages-list" style={{ display: "flex" }}>
                  {leads.map((lead) => {
                    const leadDate = lead.createdAt
                      ? new Date(lead.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "";

                    return (
                      <div key={lead._id} className="message-card">
                        <div className="message-card-header">
                          <div>
                            <div className="message-sender">{lead.name}</div>
                            <div className="message-email">
                              <a href={`mailto:${lead.email}`}>{lead.email}</a>
                            </div>
                          </div>
                          <div className="message-date">{leadDate}</div>
                        </div>
                        <div className="message-body">{lead.message}</div>
                        {lead.phone && (
                          <div className="message-phone">
                            <i className="fas fa-phone"></i> {lead.phone}
                          </div>
                        )}
                        <div className="message-card-actions" style={{ marginTop: "12px", display: "flex", justifyContent: "flex-end" }}>
                          <button
                            className="btn-delete btn-delete-msg"
                            style={{
                              padding: "6px 12px",
                              fontSize: "0.8rem",
                              background: "#e74c3c",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                            onClick={() => handleDeleteLead(lead._id, lead.name)}
                          >
                            <i className="fas fa-trash"></i> Delete Lead
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── CAREERS PANEL ──────────────────────────────── */}
          {activeTab === "careers" && (
            <div className="tab-panel active" id="tab-careers">
              <div className="panel-header">
                <h2>
                  <i className="fas fa-briefcase"></i> Manage Careers
                </h2>
                <button className="btn-add" id="openAddCareerBtn" onClick={() => setAddCareerOpen(!addCareerOpen)}>
                  {addCareerOpen ? <><i className="fas fa-times"></i> Cancel</> : <><i className="fas fa-plus"></i> Add Career</>}
                </button>
              </div>

              {/* Add Career Form */}
              {addCareerOpen && (
                <div className="add-project-form" id="addCareerForm" style={{ display: "block", marginBottom: "25px" }}>
                  <h3>
                    <i className="fas fa-plus-circle"></i> Add New Career Listing
                  </h3>
                  <form id="careerForm" onSubmit={handleAddCareer} noValidate style={{ marginTop: "15px" }}>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="career-title">
                          Job Title <span className="required">*</span>
                        </label>
                        <input
                          type="text"
                          id="career-title"
                          value={careerForm.title}
                          onChange={(e) => setCareerForm((prev) => ({ ...prev, title: e.target.value }))}
                          placeholder="e.g. Structural Engineer"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="career-type">Job Type</label>
                        <select
                          id="career-type"
                          value={careerForm.type}
                          onChange={(e) => setCareerForm((prev) => ({ ...prev, type: e.target.value }))}
                        >
                          <option value="full-time">Full-Time</option>
                          <option value="part-time">Part-Time</option>
                          <option value="contract">Contract</option>
                          <option value="internship">Internship</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="career-location">Location</label>
                        <input
                          type="text"
                          id="career-location"
                          value={careerForm.location}
                          onChange={(e) => setCareerForm((prev) => ({ ...prev, location: e.target.value }))}
                          placeholder="e.g. Srinagar, Kashmir"
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="career-skills">Required Skills (comma separated)</label>
                        <input
                          type="text"
                          id="career-skills"
                          value={careerForm.skills}
                          onChange={(e) => setCareerForm((prev) => ({ ...prev, skills: e.target.value }))}
                          placeholder="e.g. AutoCAD, Revit, ETABS"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="career-desc">
                        Job Description <span className="required">*</span>
                      </label>
                      <textarea
                        id="career-desc"
                        value={careerForm.description}
                        onChange={(e) => setCareerForm((prev) => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe the responsibilities, requirements, etc..."
                        rows={4}
                        required
                      ></textarea>
                    </div>

                    <div className="form-actions">
                      <button type="submit" className="btn-primary-admin" id="submitCareerBtn" disabled={careerSubmitting}>
                        {careerSubmitting ? <><i className="fas fa-spinner fa-spin"></i> Saving...</> : <><i className="fas fa-save"></i> Save Career</>}
                      </button>
                      <button
                        type="button"
                        className="btn-cancel"
                        onClick={() => {
                          setAddCareerOpen(false);
                          setCareerForm({ title: "", description: "", skills: "", location: "", type: "full-time" });
                          setCareerFeedback("");
                        }}
                      >
                        Cancel
                      </button>
                    </div>

                    {careerFeedback && (
                      <div className="form-feedback error" style={{ display: "block" }}>
                        {careerFeedback}
                      </div>
                    )}
                  </form>
                </div>
              )}

              {/* Careers List */}
              {careersLoading ? (
                <div className="projects-loading">
                  <div className="spinner"></div>
                  <p>Loading careers...</p>
                </div>
              ) : careers.length === 0 ? (
                <div className="empty-state" style={{ display: "block" }}>
                  <i className="fas fa-briefcase"></i>
                  <p>No career listings yet. Add your first one above.</p>
                </div>
              ) : (
                <div className="projects-list" style={{ display: "grid" }}>
                  {careers.map((job) => {
                    const typeLabel = { "full-time": "Full-Time", "part-time": "Part-Time", "contract": "Contract", "internship": "Internship" }[job.type] || job.type;
                    const postedDate = job.createdAt ? new Date(job.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric"
                    }) : "";

                    return (
                      <div key={job._id} className="project-item">
                        <div className="project-item-body" style={{ padding: "20px" }}>
                          <div className="project-item-category">
                            {typeLabel} {job.location ? `· ${job.location}` : ""}
                          </div>
                          <div className="project-item-title">{job.title}</div>
                          <div className="project-item-desc" style={{ marginTop: "8px" }}>{job.description}</div>
                          {job.skills && (
                            <div style={{ marginTop: "10px", fontSize: "0.82rem", color: "#888" }}>
                              <i className="fas fa-tools" style={{ color: "#c9a84c", marginRight: "6px" }}></i>
                              {job.skills}
                            </div>
                          )}
                          {postedDate && (
                            <div style={{ marginTop: "6px", fontSize: "0.78rem", color: "#666" }}>
                              <i className="fas fa-calendar-alt" style={{ marginRight: "6px" }}></i>
                              Posted {postedDate}
                            </div>
                          )}
                          <div style={{ marginTop: "14px", display: "flex", gap: "8px" }}>
                            <button
                              className="btn-edit btn-primary-admin"
                              style={{
                                padding: "6px 14px",
                                fontSize: "0.82rem",
                                background: "#c9a84c",
                                color: "#0a0a0f",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                fontWeight: 600,
                                marginTop: 0,
                              }}
                              onClick={() => openEditCareerModal(job)}
                            >
                              <i className="fas fa-edit"></i> Edit
                            </button>
                            <button
                              className="btn-delete"
                              style={{ padding: "6px 14px", fontSize: "0.82rem", marginTop: 0 }}
                              onClick={() => handleDeleteCareer(job._id, job.title)}
                            >
                              <i className="fas fa-trash"></i> Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── REVIEWS PANEL ──────────────────────────────── */}
          {activeTab === "reviews" && (
            <div className="tab-panel active" id="tab-reviews">
              <div className="panel-header">
                <h2>
                  <i className="fas fa-comments"></i> Reviews Moderation
                </h2>
                <button className="btn-refresh" id="refreshReviewsBtn" onClick={loadReviews}>
                  <i className="fas fa-sync-alt"></i> Refresh
                </button>
              </div>

              {reviewsLoading ? (
                <div className="contacts-loading" style={{ display: "flex" }}>
                  <div className="spinner"></div>
                  <p>Loading reviews...</p>
                </div>
              ) : reviews.length === 0 ? (
                <div className="empty-state" style={{ display: "block" }}>
                  <i className="far fa-comments"></i>
                  <p>No reviews yet.</p>
                </div>
              ) : (
                <div className="messages-list" style={{ display: "flex" }}>
                  {reviews.map((item) => {
                    const reviewDate = item.createdAt
                      ? new Date(item.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "";

                    return (
                      <div key={item._id} className="message-card">
                        <div className="message-card-header">
                          <div>
                            <div className="message-sender" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <span>{item.name}</span>
                              <div style={{ display: "flex", gap: "2px" }}>
                                {Array.from({ length: 5 }, (_, i) => (
                                  <i
                                    key={i}
                                    className={`${i < item.rating ? "fas" : "far"} fa-star`}
                                    style={{ color: "#f39c12", fontSize: "0.9rem" }}
                                  ></i>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="message-date">{reviewDate}</div>
                        </div>
                        <div className="message-body">"{item.comment}"</div>
                        <div className="message-card-actions" style={{ marginTop: "12px", display: "flex", justifyContent: "flex-end" }}>
                          <button
                            className="btn-delete"
                            style={{
                              padding: "6px 12px",
                              fontSize: "0.8rem",
                              background: "#e74c3c",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                            onClick={() => handleDeleteReview(item._id, item.name)}
                          >
                            <i className="fas fa-trash"></i> Delete Review
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* DELETE CONFIRM MODAL */}
        {deleteTargetId && (
          <div className="modal-overlay" id="deleteModal" style={{ display: "flex" }}>
            <div className="modal-box">
              <div className="modal-icon">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <h3>Delete Project?</h3>
              <p>This action cannot be undone. The project and all its images will be permanently removed.</p>
              <div className="modal-actions">
                <button className="btn-danger" id="confirmDeleteBtn" onClick={handleDeleteProject}>
                  <i className="fas fa-trash"></i> Yes, Delete
                </button>
                <button className="btn-cancel" id="cancelDeleteBtn" onClick={() => setDeleteTargetId(null)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* EDIT PROJECT MODAL */}
        {editProjModal && (
          <div className="modal-overlay" id="editModal" style={{ display: "flex" }}>
            <div className="modal-box" style={{ maxWidth: "600px", textAlign: "left" }}>
              <h3>
                <i className="fas fa-edit"></i> Edit Project
              </h3>
              <form id="editProjectForm" onSubmit={handleEditProject} noValidate style={{ marginTop: "15px" }}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="edit-proj-title">
                      Project Title <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="edit-proj-title"
                      value={editProjForm.title}
                      onChange={(e) => setEditProjForm((prev) => ({ ...prev, title: e.target.value }))}
                      required
                      maxLength={200}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="edit-proj-category">Category</label>
                    <select
                      id="edit-proj-category"
                      value={editProjForm.category}
                      onChange={(e) => setEditProjForm((prev) => ({ ...prev, category: e.target.value }))}
                    >
                      <option value="Residential">Residential</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Industrial">Industrial</option>
                      <option value="Infrastructure">Infrastructure</option>
                      <option value="General">General</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="edit-proj-desc">
                    Description <span className="required">*</span>
                  </label>
                  <textarea
                    id="edit-proj-desc"
                    value={editProjForm.description}
                    onChange={(e) => setEditProjForm((prev) => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    required
                    maxLength={1000}
                  ></textarea>
                </div>

                <div className="form-group">
                  <label style={{ display: "block", marginBottom: "6px", fontWeight: 500, fontSize: "0.9rem" }}>
                    Current Images (click trash icon to remove)
                  </label>
                  <div id="editImageContainer" style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "12px" }}>
                    {editKeptImages.map((imgUrl, i) => (
                      <div
                        key={i}
                        className="preview-item"
                        style={{
                          position: "relative",
                          width: "80px",
                          height: "80px",
                          borderRadius: "6px",
                          overflow: "hidden",
                          border: "1px solid #333",
                        }}
                      >
                        <img src={imgUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        <button
                          type="button"
                          className="preview-remove"
                          style={{
                            position: "absolute",
                            top: "4px",
                            right: "4px",
                            background: "rgba(231,76,60,0.9)",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            width: "22px",
                            height: "22px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.75rem",
                          }}
                          aria-label="Remove image"
                          onClick={() => removeEditKeptImage(i)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="edit-proj-images">Add New Images</label>
                  <div
                    className="file-upload-area"
                    id="editFileUploadArea"
                    onClick={() => editFileInputRef.current?.click()}
                    style={{ cursor: "pointer" }}
                  >
                    <input
                      type="file"
                      id="edit-proj-images"
                      ref={editFileInputRef}
                      onChange={handleEditImageSelect}
                      accept=".jpg,.jpeg,.png,.webp"
                      multiple
                      style={{ display: "none" }}
                    />
                    <div className="upload-placeholder">
                      <i className="fas fa-cloud-upload-alt"></i>
                      <p>Click to select more images</p>
                    </div>
                  </div>

                  {editPreviews.length > 0 && (
                    <div className="image-previews" id="editImagePreviews">
                      {editPreviews.map((src, idx) => (
                        <div key={idx} className="preview-item">
                          <img src={src} alt="New Preview" />
                          <button
                            type="button"
                            className="preview-remove"
                            aria-label="Remove image"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeEditNewImage(idx);
                            }}
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="form-actions" style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                  <button type="submit" className="btn-primary-admin" id="saveEditProjectBtn" style={{ padding: "10px 20px" }} disabled={editSubmitting}>
                    {editSubmitting ? <><i className="fas fa-spinner fa-spin"></i> Saving...</> : <><i className="fas fa-save"></i> Save Changes</>}
                  </button>
                  <button
                    type="button"
                    className="btn-cancel"
                    style={{ padding: "10px 20px" }}
                    onClick={() => setEditProjModal(null)}
                  >
                    Cancel
                  </button>
                </div>

                {editFeedback && (
                  <div className="form-feedback error" style={{ display: "block" }}>
                    {editFeedback}
                  </div>
                )}
              </form>
            </div>
          </div>
        )}

        {/* EDIT TEAM MEMBER MODAL */}
        {editEmpModal && (
          <div className="modal-overlay" id="editEmployeeModal" style={{ display: "flex" }}>
            <div className="modal-box" style={{ maxWidth: "500px", textAlign: "left" }}>
              <h3><i className="fas fa-user-edit"></i> Edit Team Member</h3>
              <form onSubmit={handleEditEmployee} noValidate style={{ marginTop: "15px" }}>
                <div className="form-group">
                  <label htmlFor="edit-emp-name">Full Name <span className="required">*</span></label>
                  <input
                    type="text"
                    id="edit-emp-name"
                    value={editEmpForm.name}
                    onChange={(e) => setEditEmpForm((p) => ({ ...p, name: e.target.value }))}
                    required
                    maxLength={100}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-emp-position">Position <span className="required">*</span></label>
                  <input
                    type="text"
                    id="edit-emp-position"
                    value={editEmpForm.position}
                    onChange={(e) => setEditEmpForm((p) => ({ ...p, position: e.target.value }))}
                    required
                    maxLength={100}
                    placeholder="e.g. Senior Civil Engineer"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-emp-spec">Specialty / Subtitle</label>
                  <input
                    type="text"
                    id="edit-emp-spec"
                    value={editEmpForm.spec}
                    onChange={(e) => setEditEmpForm((p) => ({ ...p, spec: e.target.value }))}
                    maxLength={100}
                    placeholder="e.g. Structural Design Specialist"
                  />
                </div>
                {/* Current photo preview */}
                {editEmpModal.photo && !editEmpPreview && (
                  <div className="form-group">
                    <label>Current Photo</label>
                    <div style={{ maxWidth: 100, borderRadius: 6, overflow: "hidden", border: "1px solid #333" }}>
                      <img src={editEmpModal.photo} alt="Current" style={{ width: "100%", display: "block" }} />
                    </div>
                  </div>
                )}
                <div className="form-group">
                  <label>Upload New Photo</label>
                  <input
                    type="file"
                    ref={editEmpPhotoRef}
                    accept=".jpg,.jpeg,.png,.webp"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setEditEmpNewPhoto(file);
                        const reader = new FileReader();
                        reader.onload = (ev) => setEditEmpPreview(ev.target?.result as string);
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="btn-add"
                    onClick={() => editEmpPhotoRef.current?.click()}
                    style={{ display: "inline-block", background: "#14141f", color: "#aaa", padding: "8px 16px" }}
                  >
                    Choose New Photo
                  </button>
                  {editEmpPreview && (
                    <div className="image-previews" style={{ marginTop: 8 }}>
                      <div className="preview-item">
                        <img src={editEmpPreview} alt="New Preview" />
                        <button
                          type="button"
                          className="preview-remove"
                          onClick={() => { setEditEmpNewPhoto(null); setEditEmpPreview(""); }}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="form-actions" style={{ marginTop: 24, display: "flex", justifyContent: "flex-end", gap: 10 }}>
                  <button type="submit" className="btn-primary-admin" id="saveEditEmpBtn" style={{ padding: "10px 20px" }} disabled={editEmpSubmitting}>
                    {editEmpSubmitting ? <><i className="fas fa-spinner fa-spin"></i> Saving...</> : <><i className="fas fa-save"></i> Save Changes</>}
                  </button>
                  <button type="button" className="btn-cancel" style={{ padding: "10px 20px" }} onClick={() => setEditEmpModal(null)}>Cancel</button>
                </div>
                {editEmpFeedback && <div className="form-feedback error" style={{ display: "block" }}>{editEmpFeedback}</div>}
              </form>
            </div>
          </div>
        )}

        {/* EDIT CAREER MODAL */}
        {editCareerModal && (
          <div className="modal-overlay" id="editCareerModal" style={{ display: "flex" }}>
            <div className="modal-box" style={{ maxWidth: "560px", textAlign: "left" }}>
              <h3><i className="fas fa-briefcase"></i> Edit Career Listing</h3>
              <form onSubmit={handleEditCareer} noValidate style={{ marginTop: "15px" }}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="edit-career-title">Job Title <span className="required">*</span></label>
                    <input
                      type="text"
                      id="edit-career-title"
                      value={editCareerForm.title}
                      onChange={(e) => setEditCareerForm((p) => ({ ...p, title: e.target.value }))}
                      required
                      maxLength={200}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="edit-career-type">Job Type</label>
                    <select
                      id="edit-career-type"
                      value={editCareerForm.type}
                      onChange={(e) => setEditCareerForm((p) => ({ ...p, type: e.target.value }))}
                    >
                      <option value="full-time">Full-Time</option>
                      <option value="part-time">Part-Time</option>
                      <option value="contract">Contract</option>
                      <option value="internship">Internship</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="edit-career-location">Location</label>
                  <input
                    type="text"
                    id="edit-career-location"
                    value={editCareerForm.location}
                    onChange={(e) => setEditCareerForm((p) => ({ ...p, location: e.target.value }))}
                    maxLength={100}
                    placeholder="e.g. Kashmir, India"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-career-desc">Job Description <span className="required">*</span></label>
                  <textarea
                    id="edit-career-desc"
                    value={editCareerForm.description}
                    onChange={(e) => setEditCareerForm((p) => ({ ...p, description: e.target.value }))}
                    rows={4}
                    required
                    maxLength={2000}
                  ></textarea>
                </div>
                <div className="form-group">
                  <label htmlFor="edit-career-skills">Required Skills (comma separated)</label>
                  <input
                    type="text"
                    id="edit-career-skills"
                    value={editCareerForm.skills}
                    onChange={(e) => setEditCareerForm((p) => ({ ...p, skills: e.target.value }))}
                    placeholder="e.g. AutoCAD, Revit, ETABS"
                  />
                </div>
                <div className="form-actions" style={{ marginTop: 24, display: "flex", justifyContent: "flex-end", gap: 10 }}>
                  <button type="submit" className="btn-primary-admin" id="saveEditCareerBtn" style={{ padding: "10px 20px" }} disabled={editCareerSubmitting}>
                    {editCareerSubmitting ? <><i className="fas fa-spinner fa-spin"></i> Saving...</> : <><i className="fas fa-save"></i> Save Changes</>}
                  </button>
                  <button type="button" className="btn-cancel" style={{ padding: "10px 20px" }} onClick={() => setEditCareerModal(null)}>Cancel</button>
                </div>
                {editCareerFeedback && <div className="form-feedback error" style={{ display: "block" }}>{editCareerFeedback}</div>}
              </form>
            </div>
          </div>
        )}
      </div>

      {/* CUSTOM DELETE CONFIRM MODAL */}
      {pendingDelete && (
        <div
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(6px)",
            zIndex: 9000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setPendingDelete(null); }}
        >
          <div
            style={{
              background: "#141420",
              border: "1px solid rgba(231,76,60,0.2)",
              borderRadius: "16px",
              maxWidth: "420px",
              width: "100%",
              overflow: "hidden",
              boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(231,76,60,0.08)",
              animation: "scaleIn 0.22s cubic-bezier(0.34,1.56,0.64,1)",
            }}
          >
            {/* Header */}
            <div
              style={{
                background: "linear-gradient(135deg,rgba(231,76,60,0.12) 0%,rgba(192,57,43,0.06) 100%)",
                borderBottom: "1px solid rgba(231,76,60,0.12)",
                padding: "32px 32px 24px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "14px",
              }}
            >
              <div
                style={{
                  width: 64, height: 64,
                  borderRadius: "50%",
                  background: "rgba(231,76,60,0.12)",
                  border: "1px solid rgba(231,76,60,0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.6rem",
                  color: "#e74c3c",
                  boxShadow: "0 0 0 6px rgba(231,76,60,0.07)",
                }}
              >
                <i className="fas fa-trash-alt"></i>
              </div>
              <div style={{ fontSize: "1.15rem", fontWeight: 700, color: "#f0ede8", letterSpacing: "-0.01em" }}>
                {pendingDelete.title}
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: "20px 32px 12px", textAlign: "center" }}>
              <p style={{ color: "#6b6b80", fontSize: "0.9rem", lineHeight: 1.6 }}>
                {pendingDelete.message}
              </p>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  marginTop: 14,
                  fontSize: "0.78rem",
                  color: "rgba(231,76,60,0.7)",
                  background: "rgba(231,76,60,0.06)",
                  border: "1px solid rgba(231,76,60,0.12)",
                  borderRadius: 6,
                  padding: "5px 10px",
                }}
              >
                <i className="fas fa-exclamation-circle"></i>
                This action cannot be undone
              </div>
            </div>

            {/* Actions */}
            <div style={{ padding: "20px 32px 28px", display: "flex", gap: 12 }}>
              <button
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "12px 20px",
                  background: "#e74c3c",
                  color: "white",
                  border: "none",
                  borderRadius: 10,
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  fontFamily: "inherit",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "#c0392b";
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 20px rgba(231,76,60,0.4)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "#e74c3c";
                  (e.currentTarget as HTMLButtonElement).style.transform = "none";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
                }}
                onClick={async () => {
                  const action = pendingDelete.action;
                  setPendingDelete(null);
                  try { await action(); } catch { showToast("Operation failed", "danger"); }
                }}
              >
                <i className="fas fa-trash-alt"></i> Yes, Delete
              </button>
              <button
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "12px 20px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 10,
                  color: "#6b6b80",
                  fontSize: "0.9rem",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  fontFamily: "inherit",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = "#f0ede8";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.2)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = "#6b6b80";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.08)";
                }}
                onClick={() => setPendingDelete(null)}
              >
                <i className="fas fa-times"></i> Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification Container */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "28px",
            right: "28px",
            background: toast.type === "success" ? "#2ecc71" : toast.type === "danger" ? "#e74c3c" : "#c9a84c",
            color: "#fff",
            padding: "12px 22px",
            borderRadius: "10px",
            fontSize: "0.88rem",
            fontWeight: 600,
            boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
            zIndex: 9999,
          }}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}
