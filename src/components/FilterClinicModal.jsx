import { useState } from "react";
import { api } from "../services/api";

const FilterClinicModal = ({ isOpen, onClose, onResults, onFilterStart }) => {
  const [filters, setFilters] = useState({
    name: "",
    phone: "",
    services: "",
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    if (onFilterStart) onFilterStart();

    try {
      const apiFilters = {};
      if (filters.name.trim()) apiFilters.name = filters.name.trim();
      if (filters.phone.trim()) apiFilters.phone = filters.phone.trim();
      if (filters.services.trim()) {
        apiFilters.services = filters.services
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }

      const results = await api.fetchClinics(apiFilters);
      onResults(results);
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || "Filtering failed");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <h2>Filter Clinics</h2>
          <button className="icon-button" onClick={onClose}>
            ×
          </button>
        </header>

        <form className="modal-body" onSubmit={handleSubmit}>
          <label className="label">
            Clinic Name
            <input
              className="input"
              name="name"
              value={filters.name}
              onChange={handleChange}
              placeholder="e.g. Health Plus"
            />
          </label>

          <label className="label">
            Phone
            <input
              className="input"
              name="phone"
              value={filters.phone}
              onChange={handleChange}
              placeholder="e.g. 555-0123"
            />
          </label>

          <label className="label">
            Services
            <input
              className="input"
              name="services"
              value={filters.services}
              onChange={handleChange}
              placeholder="Comma separated e.g. Dental, Cardio"
            />
          </label>

          {error && <div className="error">{error}</div>}

          <button type="submit" className="button primary full" disabled={loading}>
            {loading ? "Filtering..." : "Apply Filters"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FilterClinicModal;


