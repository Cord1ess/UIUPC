"use client";

import React from "react";

interface Result {
  id: string;
  name: string;
  institute: string;
  category: string;
  photos: number;
  status: string;
  selected: boolean;
}

interface ResultModalProps {
  selectedResult: Result | null;
  newResult: Partial<Result>;
  onClose: () => void;
  onSave: (result: any) => void;
  onInputChange: (field: string, value: any) => void;
}

const ResultModal: React.FC<ResultModalProps> = ({
  selectedResult,
  newResult,
  onClose,
  onSave,
  onInputChange
}) => {
  const data = selectedResult || newResult;

  return (
    <div className="modal-overlay">
      <div className="modal-content large-modal">
        <div className="modal-header">
          <h3>{selectedResult ? "Edit Result" : "Add New Result"}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="form-grid">
            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                value={data.name || ""}
                onChange={(e) => onInputChange("name", e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Institute *</label>
              <input
                type="text"
                value={data.institute || ""}
                onChange={(e) => onInputChange("institute", e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Category *</label>
              <select
                value={data.category || "single"}
                onChange={(e) => onInputChange("category", e.target.value)}
              >
                <option value="single">Single Photo</option>
                <option value="story">Photo Story</option>
              </select>
            </div>
            <div className="form-group">
              <label>Number of Photos</label>
              <input
                type="number"
                min="1"
                value={data.photos || 1}
                onChange={(e) => onInputChange("photos", parseInt(e.target.value) || 1)}
              />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select
                value={data.status || "selected"}
                onChange={(e) => onInputChange("status", e.target.value)}
              >
                <option value="selected">Selected</option>
                <option value="not-selected">Not Selected</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div className="form-group">
              <label>Selected for Exhibition</label>
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  checked={data.selected || false}
                  onChange={(e) => onInputChange("selected", e.target.checked)}
                />
                <span>Mark as selected</span>
              </div>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={() => onSave(data)}>
            {selectedResult ? "Update Result" : "Add Result"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultModal;
