import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import AddClinicModal from "./AddClinicModal";
import SearchClinicModal from "./SearchClinicModal";

const initialFilters = {
  clinicId: "",
  clinicName: "",
  doctorName: "",
  address: "",
  phone: "",
  services: "",
};

const ClinicHome = () => {
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // Data state
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Search + filters UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState(initialFilters);
  const [openFilterKey, setOpenFilterKey] = useState(null); // which filter pill dropdown is open

  // Initial fetch
  useEffect(() => {
    loadClinics();
  }, []);

  const loadClinics = async () => {
    setLoading(true);
    try {
      const data = await api.fetchClinics();
      setClinics(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load clinics. Please ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  // Add new clinic
  const handleAddClinic = async (clinicData) => {
    try {
      // Map frontend fields to backend fields
      const payload = {
        name: clinicData.name,
        phone: clinicData.phone,
        clinic_code: clinicData.clinicId,
        doctor_name: clinicData.doctorName,
        address: clinicData.address,
        services: clinicData.services
      };
      await api.addClinic(payload);
      loadClinics(); // Refresh list
      setIsAddModalOpen(false);
    } catch (err) {
      alert(`Error adding clinic: ${err.message}`);
    }
  };

  // Handle search results
  const handleSearchResults = (results) => {
    setClinics(results);
    setIsSearchModalOpen(false); // Close modal and show results in table
  };

  // Inline search submit (server-side search, keeps existing behavior)
  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const term = searchTerm.trim();
      if (!term) {
        await loadClinics();
      } else {
        const results = await api.searchClinics(term);
        setClinics(results);
      }
    } catch (err) {
      console.error(err);
      setError("Search failed. Please ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const buildSearchSummary = (f) => {
    const parts = [];
    if (f.clinicId) parts.push(`Clinic ID: ${f.clinicId}`);
    if (f.clinicName) parts.push(`Clinic Name: ${f.clinicName}`);
    if (f.doctorName) parts.push(`Doctor Name: ${f.doctorName}`);
    if (f.address) parts.push(`Clinic Address: ${f.address}`);
    if (f.phone) parts.push(`Phone: ${f.phone}`);
    if (f.services) parts.push(`Services: ${f.services}`);
    return parts.join("; ");
  };

  // Filter helpers (purely client‑side on current clinic list)
  const setFilterValue = (key, value) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: value };
      setSearchTerm(buildSearchSummary(next));
      return next;
    });
  };

  const clearFilter = (key) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: "" };
      setSearchTerm(buildSearchSummary(next));
      return next;
    });
  };

  const clearAllFilters = () => {
    setFilters(initialFilters);
    setSearchTerm("");
    setOpenFilterKey(null);
    loadClinics();
  };

  const visibleClinics = useMemo(() => {
    const f = filters;

    return clinics.filter((clinic) => {
      const clinicId =
        (clinic.clinic_code || clinic.clinicId || "").toString().toLowerCase();
      const name = (clinic.name || "").toLowerCase();
      const doctor = (clinic.doctor_name || clinic.doctorName || "").toLowerCase();
      const address = (clinic.address || "").toLowerCase();
      const phone = (clinic.phone || "").toLowerCase();
      const servicesArray = clinic.services || [];

      const serviceText = servicesArray
        .map((s) => (typeof s === "object" ? s.name : s))
        .join(" ")
        .toLowerCase();

      if (f.clinicId && !clinicId.includes(f.clinicId.toLowerCase())) return false;
      if (f.clinicName && !name.includes(f.clinicName.toLowerCase())) return false;
      if (f.doctorName && !doctor.includes(f.doctorName.toLowerCase())) return false;
      if (f.address && !address.includes(f.address.toLowerCase())) return false;
      if (f.phone && !phone.includes(f.phone.toLowerCase())) return false;
      if (f.services && !serviceText.includes(f.services.toLowerCase())) return false;

      return true;
    });
  }, [clinics, filters]);

  const highlightTerms = useMemo(() => {
    const active = Object.values(filters).filter(Boolean);
    // If no filters but user performed a manual search, use searchTerm
    if (active.length === 0 && searchTerm.trim()) {
      return [searchTerm.trim()];
    }
    return active;
  }, [filters, searchTerm]);

  const highlightText = (text) => {
    if (!text || highlightTerms.length === 0) return text;
    let result = text;
    highlightTerms.forEach((term) => {
      if (!term) return;
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`(${escaped})`, "gi");
      result = result.replace(regex, '<mark class="hl">$1</mark>');
    });
    return result;
  };

  return (
    <div className="page">
      {/* Header */}
      <header className="header">
        <div className="title" onClick={() => window.location.reload()} style={{ cursor: "pointer" }}>
          <h1>Clinic Directory</h1>
          <p className="subtitle">Find clinics details</p>
        </div>
      </header>

      {/* Search bar */}
      <form className="search-bar" onSubmit={handleSearchSubmit}>
        <div className="search-input">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search clinic name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="search-actions">
          <button type="submit" className="button secondary">
            Search
          </button>
          <div className="search-actions-column">
            <button
              type="button"
              className="button secondary button-ghost"
              onClick={clearAllFilters}
            >
              Clear Filters
            </button>
          </div>
          <button
            type="button"
            className="button primary"
            onClick={() => setIsAddModalOpen(true)}
          >
            + Add Clinic
          </button>
        </div>
      </form>

      {/* Horizontal filter toolbar */}
      <div className="filter-toolbar">
        <FilterPill
          label="+ Clinic ID"
          placeholder="Filter by clinic ID"
          type="text"
          value={filters.clinicId}
          isActive={!!filters.clinicId}
          isOpen={openFilterKey === "clinicId"}
          onOpen={() => setOpenFilterKey("clinicId")}
          onClose={() => setOpenFilterKey(null)}
          onApply={(val) => {
            setFilterValue("clinicId", val);
            setOpenFilterKey(null);
          }}
          onClear={() => {
            clearFilter("clinicId");
            setOpenFilterKey(null);
          }}
        />
        <FilterPill
          label="+ Doctor Name"
          placeholder="Filter by doctor name"
          type="text"
          value={filters.doctorName}
          isActive={!!filters.doctorName}
          isOpen={openFilterKey === "doctorName"}
          onOpen={() => setOpenFilterKey("doctorName")}
          onClose={() => setOpenFilterKey(null)}
          onApply={(val) => {
            setFilterValue("doctorName", val);
            setOpenFilterKey(null);
          }}
          onClear={() => {
            clearFilter("doctorName");
            setOpenFilterKey(null);
          }}
        />
        <FilterPill
          label="+ Clinic Address"
          placeholder="Filter by address"
          type="text"
          value={filters.address}
          isActive={!!filters.address}
          isOpen={openFilterKey === "address"}
          onOpen={() => setOpenFilterKey("address")}
          onClose={() => setOpenFilterKey(null)}
          onApply={(val) => {
            setFilterValue("address", val);
            setOpenFilterKey(null);
          }}
          onClear={() => {
            clearFilter("address");
            setOpenFilterKey(null);
          }}
        />
        <FilterPill
          label="+ Phone Number"
          placeholder="Filter by phone"
          type="text"
          value={filters.phone}
          isActive={!!filters.phone}
          isOpen={openFilterKey === "phone"}
          onOpen={() => setOpenFilterKey("phone")}
          onClose={() => setOpenFilterKey(null)}
          onApply={(val) => {
            setFilterValue("phone", val);
            setOpenFilterKey(null);
          }}
          onClear={() => {
            clearFilter("phone");
            setOpenFilterKey(null);
          }}
        />
        <FilterPill
          label="+ Services"
          placeholder="Filter by services"
          type="text"
          value={filters.services}
          isActive={!!filters.services}
          isOpen={openFilterKey === "services"}
          onOpen={() => setOpenFilterKey("services")}
          onClose={() => setOpenFilterKey(null)}
          onApply={(val) => {
            setFilterValue("services", val);
            setOpenFilterKey(null);
          }}
          onClear={() => {
            clearFilter("services");
            setOpenFilterKey(null);
          }}
        />
      </div>

      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      {/* Main table */}
      <section className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Clinic ID</th>
                <th>Clinic Name</th>
                <th>Doctor Name</th>
                <th>Clinic Address</th>
                <th>Phone Number</th>
                <th>Services</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="empty">Loading...</td>
                </tr>
              ) : clinics.length === 0 ? (
                /* If backend returned no rows at all */
                <tr>
                  <td colSpan="6" className="empty">
                    No clinics found.
                  </td>
                </tr>
              ) : (
                visibleClinics.map((clinic, idx) => (
                  <tr key={`${clinic.id || idx}`}>
                    {/* Backend returns snake_case mostly, but Pydantic Schema might be camelCase if configured? 
                        Let's check ClinicOut. 
                        Wait, ClinicOut is defined in backend. 
                        Usually FastAPI uses JSON which preserves field names unless aliased.
                        ClinicOut matches Pydantic model. 
                        Let's check backend or just handle snake_case.
                        The payload in `add_clinic` uses `clinic_service.add_clinic`.
                        The response model is `ClinicOut`.
                        Let's assume fields match database model or standard Pydantic.
                        I'll try snake_case first (clinic_code, doctor_name) and fallback.
                    */}
                    <td dangerouslySetInnerHTML={{ __html: highlightText(clinic.clinic_code || clinic.clinicId || "-") }} />
                    <td dangerouslySetInnerHTML={{ __html: highlightText(clinic.name || "-") }} />
                    <td dangerouslySetInnerHTML={{ __html: highlightText(clinic.doctor_name || clinic.doctorName || "-") }} />
                    <td dangerouslySetInnerHTML={{ __html: highlightText(clinic.address || "-") }} />
                    <td dangerouslySetInnerHTML={{ __html: highlightText(clinic.phone || "-") }} />
                    <td className="services-cell">
                      {clinic.services && clinic.services.map((service, serviceIdx) => {
                        const label = typeof service === 'object' ? service.name : service;
                        return (
                          <span
                            className="tag"
                            key={serviceIdx}
                            dangerouslySetInnerHTML={{ __html: highlightText(label) }}
                          />
                        );
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Add Modal */}
      <AddClinicModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddClinic}
      />

      {/* Search Modal */}
      <SearchClinicModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onResults={handleSearchResults}
      />

    </div>
  );
};

export default ClinicHome;

// Reusable filter dropdown pill
const FilterPill = ({
  label,
  placeholder,
  type = "text",
  value,
  isActive,
  isOpen,
  onOpen,
  onClose,
  onApply,
  onClear,
}) => {
  const [draft, setDraft] = useState(value || "");

  // keep local input in sync when external value changes
  useEffect(() => {
    setDraft(value || "");
  }, [value, isOpen]);

  const handleApply = () => {
    onApply(draft.trim());
  };

  const handleClear = () => {
    setDraft("");
    onClear();
  };

  return (
    <div className="filter-pill-wrapper">
      <button
        type="button"
        className={`filter-pill ${isActive ? "filter-pill--active" : ""}`}
        onClick={() => (isOpen ? onClose() : onOpen())}
      >
        {label}
      </button>
      {isOpen && (
        <div className="filter-dropdown-panel">
          <div className="filter-field">
            <span className="filter-field-label">{label.replace("+ ", "")}</span>
            <div className="filter-input-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type={type}
                className="filter-input"
                placeholder={placeholder}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              />
            </div>
          </div>
          <div className="filter-actions">
            <button
              type="button"
              className="button secondary button-sm"
              onClick={handleClear}
            >
              Clear
            </button>
            <button
              type="button"
              className="button primary button-sm"
              onClick={handleApply}
            >
              Search
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

