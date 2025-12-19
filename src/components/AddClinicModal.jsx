import React, { useEffect, useState } from "react";

// Initial form state
const initialForm = { 
  clinicId: "", 
  name: "", 
  doctorName: "", 
  address: "", 
  phone: "", 
  services: "" 
};

const AddClinicModal = ({ isOpen, onClose, onSubmit }) => {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  // Reset form each time the modal opens
  useEffect(() => {
    if (isOpen) {
      setForm(initialForm);
      setErrors({});
    }
  }, [isOpen]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Submit handler
  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmed = {
      clinicId: form.clinicId.trim(),
      name: form.name.trim(),
      doctorName: form.doctorName.trim(),
      address: form.address.trim(),
      phone: form.phone.trim(),
      services: form.services
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };

    // Simple validation
    const nextErrors = {};
    if (!trimmed.clinicId) nextErrors.clinicId = "Clinic ID is required";
    if (!trimmed.name) nextErrors.name = "Clinic name is required";
    if (!trimmed.doctorName) nextErrors.doctorName = "Doctor name is required";
    if (!trimmed.address) nextErrors.address = "Clinic address is required";
    if (!trimmed.phone) nextErrors.phone = "Phone number is required";
    if (trimmed.services.length === 0)
      nextErrors.services = "At least one service is required";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    // Pass data to parent
    onSubmit(trimmed);
    onClose();
  };

  // Do not render if closed
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <h2>Add Clinic</h2>
          <button className="icon-button" aria-label="Close" onClick={onClose}>
            ×
          </button>
        </header>

        <form className="modal-body" onSubmit={handleSubmit}>
          {/* Clinic ID */}
          <label className="label">
            Clinic ID
            <input
              type="text"
              name="clinicId"
              className={`input ${errors.clinicId ? "input-error" : ""}`}
              placeholder="e.g., CLIN-001"
              value={form.clinicId}
              onChange={handleChange}
            />
            {errors.clinicId && <span className="error">{errors.clinicId}</span>}
          </label>

          {/* Clinic Name */}
          <label className="label">
            Clinic Name
            <input
              type="text"
              name="name"
              className={`input ${errors.name ? "input-error" : ""}`}
              placeholder="e.g., Downtown Health Clinic"
              value={form.name}
              onChange={handleChange}
            />
            {errors.name && <span className="error">{errors.name}</span>}
          </label>

          {/* Doctor Name */}
          <label className="label">
            Doctor Name
            <input
              type="text"
              name="doctorName"
              className={`input ${errors.doctorName ? "input-error" : ""}`}
              placeholder="e.g., Dr. John Smith"
              value={form.doctorName}
              onChange={handleChange}
            />
            {errors.doctorName && <span className="error">{errors.doctorName}</span>}
          </label>

          {/* Clinic Address */}
          <label className="label">
            Clinic Address
            <input
              type="text"
              name="address"
              className={`input ${errors.address ? "input-error" : ""}`}
              placeholder="e.g., 123 Main St, City, State 12345"
              value={form.address}
              onChange={handleChange}
            />
            {errors.address && <span className="error">{errors.address}</span>}
          </label>

          {/* Phone Number */}
          <label className="label">
            Phone Number
            <input
              type="text"
              name="phone"
              className={`input ${errors.phone ? "input-error" : ""}`}
              placeholder="e.g., (555) 123-4567"
              value={form.phone}
              onChange={handleChange}
            />
            {errors.phone && <span className="error">{errors.phone}</span>}
          </label>

          {/* Services */}
          <label className="label">
            Services (comma-separated)
            <input
              type="text"
              name="services"
              className={`input ${errors.services ? "input-error" : ""}`}
              placeholder="e.g., Pediatrics, General Checkup, Lab Tests"
              value={form.services}
              onChange={handleChange}
            />
            {errors.services && (
              <span className="error">{errors.services}</span>
            )}
          </label>

          <button type="submit" className="button primary full">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddClinicModal;

