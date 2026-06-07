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

export default function AdminDashboard() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [adminUser, setAdminUser] = useState("Admin");
  const [activeTab, setActiveTab] = useState<"projects" | "team" | "contacts">("projects");
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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const empPhotoRef = useRef<HTMLInputElement>(null);

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

  const handleDeleteEmployee = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;

    try {
      const res = await fetch(`/api/admin/employees/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        showToast("Team member deleted successfully", "danger");
        loadTeam();
      } else {
        showToast("Failed to delete team member", "danger");
      }
    } catch {
      showToast("Network error. Failed to delete team member.", "danger");
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

  const handleDeleteLead = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lead?")) return;

    try {
      const res = await fetch(`/api/admin/contacts/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        showToast("Lead deleted successfully", "danger");
        loadLeads();
      } else {
        showToast("Failed to delete lead", "danger");
      }
    } catch {
      showToast("Network error. Failed to delete lead.", "danger");
    }
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
            <i className="fas fa-users"></i> Leads
            {leads.length > 0 && <span className="badge visible">{leads.length}</span>}
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
            {activeTab === "projects" ? "Projects" : activeTab === "team" ? "Manage Team" : "Leads"}
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
                        <button
                          className="btn-delete"
                          style={{ marginTop: "10px" }}
                          onClick={() => handleDeleteEmployee(member._id, member.name)}
                        >
                          <i className="fas fa-trash"></i> Delete
                        </button>
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
                            onClick={() => handleDeleteLead(lead._id)}
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
      </div>

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
