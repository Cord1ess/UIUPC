import React from 'react';
import { getProperty } from '../../utils/adminHelpers';

const AdminDetailsModal = ({ selectedItem, dataType, onClose }) => {
  if (!selectedItem) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>
            {dataType === "membership"
              ? "Application Details"
              : "Submission Details"}
          </h3>
          <button onClick={onClose} className="modal-close">
            ×
          </button>
        </div>
        <div className="modal-body">
          {dataType === "membership" ? (
            <div className="details-grid">
              <div className="detail-group">
                <label>Name:</label>
                <span>{getProperty(selectedItem, "Full Name")}</span>
              </div>
              <div className="detail-group">
                <label>Student ID:</label>
                <span>{getProperty(selectedItem, "Student ID")}</span>
              </div>
              <div className="detail-group">
                <label>Email:</label>
                <span>{getProperty(selectedItem, "Email")}</span>
              </div>
              <div className="detail-group">
                <label>Phone:</label>
                <span>{getProperty(selectedItem, "Phone") || "Not provided"}</span>
              </div>
              <div className="detail-group">
                <label>Department:</label>
                <span>{getProperty(selectedItem, "Department")}</span>
              </div>
              <div className="detail-group">
                <label>Facebook Profile:</label>
                <span>
                  {(() => {
                    const facebookLink =
                      selectedItem["Facebook Profile Link"] ||
                      selectedItem["Facebook Link"] ||
                      selectedItem["facebookLink"] ||
                      selectedItem["Facebook"] ||
                      selectedItem["facebook"] ||
                      selectedItem["Facebook Profile"] ||
                      selectedItem["facebookProfile"] ||
                      selectedItem["FB Link"] ||
                      selectedItem["fbLink"];

                    if (
                      !facebookLink ||
                      facebookLink === "N/A" ||
                      facebookLink === "" ||
                      facebookLink === "Not provided"
                    ) {
                      return "Not provided";
                    }

                    let formattedLink = facebookLink.trim();
                    formattedLink = formattedLink.replace(/['"]/g, "");

                    if (
                      !formattedLink.startsWith("http://") &&
                      !formattedLink.startsWith("https://")
                    ) {
                      formattedLink = "https://" + formattedLink;
                    }

                    return (
                      <a
                        href={formattedLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: "var(--uiu-orange)",
                          wordBreak: "break-all",
                        }}
                      >
                        {formattedLink}
                      </a>
                    );
                  })()}
                </span>
              </div>
              <div className="detail-group">
                <label>Experience Level:</label>
                <span>{getProperty(selectedItem, "Experience Level")}</span>
              </div>
              <div className="detail-group">
                <label>Interests:</label>
                <span>{getProperty(selectedItem, "Interests")}</span>
              </div>
              <div className="detail-group">
                <label>Payment Method:</label>
                <span>{getProperty(selectedItem, "Payment Method")}</span>
              </div>
              <div className="detail-group full-width">
                <label>Why they want to join:</label>
                <p>{getProperty(selectedItem, "Message")}</p>
              </div>
              <div className="detail-group">
                <label>Submitted:</label>
                <span>
                  {new Date(
                    selectedItem.Timestamp || selectedItem.timestamp
                  ).toLocaleString()}
                </span>
              </div>
              <div className="detail-group">
                <label>Current Status:</label>
                <span>{getProperty(selectedItem, "Status") || "Pending"}</span>
              </div>
            </div>
          ) : (
            <div className="details-grid">
              <div className="detail-group">
                <label>Timestamp:</label>
                <span>
                  {new Date(
                    selectedItem.Timestamp ||
                      selectedItem.timestamp ||
                      selectedItem["Timestamp"]
                  ).toLocaleString()}
                </span>
              </div>
              <div className="detail-group">
                <label>Name:</label>
                <span>{getProperty(selectedItem, "Name")}</span>
              </div>
              <div className="detail-group">
                <label>Email:</label>
                <span>{getProperty(selectedItem, "Email")}</span>
              </div>
              <div className="detail-group">
                <label>Phone:</label>
                <span>{getProperty(selectedItem, "Phone")}</span>
              </div>
              <div className="detail-group">
                <label>Institution:</label>
                <span>{getProperty(selectedItem, "Institution")}</span>
              </div>
              <div className="detail-group">
                <label>Category:</label>
                <span>{getProperty(selectedItem, "Category")}</span>
              </div>
              <div className="detail-group">
                <label>Photo Count:</label>
                <span>{getProperty(selectedItem, "Photo Count")}</span>
              </div>
              <div className="detail-group">
                <label>Story Photo Count:</label>
                <span>{getProperty(selectedItem, "Story Photo Count")}</span>
              </div>
              <div className="detail-group full-width">
                <label>Photo Names:</label>
                <p>{getProperty(selectedItem, "Photo Names")}</p>
              </div>
              <div className="detail-group full-width">
                <label>Story Photo Names:</label>
                <p>{getProperty(selectedItem, "Story Photo Names")}</p>
              </div>
              <div className="detail-group full-width">
                <label>Folder URL:</label>
                {getProperty(selectedItem, "Folder URL") &&
                getProperty(selectedItem, "Folder URL") !== "N/A" ? (
                  <a
                    href={getProperty(selectedItem, "Folder URL")}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "var(--uiu-orange)", wordBreak: "break-all" }}
                  >
                    {getProperty(selectedItem, "Folder URL")}
                  </a>
                ) : (
                  <span>N/A</span>
                )}
              </div>
              <div className="detail-group">
                <label>Status:</label>
                <span>{getProperty(selectedItem, "Status") || "IN_PROGRESS"}</span>
              </div>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDetailsModal;
