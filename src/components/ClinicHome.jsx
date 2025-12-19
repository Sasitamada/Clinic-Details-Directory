import React, { useMemo, useState } from "react";
import AddClinicModal from "./AddClinicModal";

const ClinicHome = () => {
  // Search term for filtering clinics
  const [searchTerm, setSearchTerm] = useState("");
  // Modal open/close state
  const [isModalOpen, setIsModalOpen] = useState(false);
  // List of clinics
  const [clinics, setClinics] = useState([]);

  // Add new clinic from modal
  const handleAddClinic = (clinic) => {
    setClinics((prev) => [...prev, clinic]);
    setIsModalOpen(false);
  };

  // Filter clinics in real time by name or phone
  const filteredClinics = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return clinics;

    return clinics.filter(
      (clinic) =>
        clinic.name.toLowerCase().includes(term) ||
        clinic.phone.toLowerCase().includes(term) ||
        (clinic.clinicId && clinic.clinicId.toLowerCase().includes(term)) ||
        (clinic.doctorName && clinic.doctorName.toLowerCase().includes(term)) ||
        (clinic.address && clinic.address.toLowerCase().includes(term))
    );
  }, [clinics, searchTerm]);

  return (
    <div className="page">
      {/* Header with title, search bar, and button */}
      <header className="header">
        <div className="title">
          <h1>Clinic Directory</h1>
          <p className="subtitle">Manage clinics and services in one place</p>
        </div>

        <div className="controls">
          {/* Search bar */}
          <input
            type="text"
            className="input search"
            placeholder="Search by clinic name, ID, doctor, address, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* Add clinic button */}
          <button
            className="button primary"
            onClick={() => setIsModalOpen(true)}
          >
            + Add Clinic
          </button>
        </div>
      </header>

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
              {filteredClinics.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty">
                    No clinics yet. Add your first clinic to get started.
                  </td>
                </tr>
              ) : (
                filteredClinics.map((clinic, idx) => (
                  <tr key={`${clinic.name}-${idx}`}>
                    <td>{clinic.clinicId || "-"}</td>
                    <td>{clinic.name}</td>
                    <td>{clinic.doctorName || "-"}</td>
                    <td>{clinic.address || "-"}</td>
                    <td>{clinic.phone}</td>
                    <td className="services-cell">
                      {clinic.services.map((service, serviceIdx) => (
                        <span className="tag" key={`${service}-${serviceIdx}`}>
                          {service}
                        </span>
                      ))}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal */}
      <AddClinicModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddClinic}
      />
    </div>
  );
};

export default ClinicHome;

