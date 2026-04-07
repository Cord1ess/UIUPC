import React from 'react';
import { FaSync } from 'react-icons/fa';
import { getProperty } from '../../utils/adminHelpers';

const AdminEmailModal = ({ 
  selectedEmailItem, 
  connectionTest, 
  emailSending, 
  onSendEmail, 
  onTestConnection, 
  onClose 
}) => {
  if (!selectedEmailItem) return null;

  const recipientName = getProperty(selectedEmailItem, "Name");
  const recipientEmail = getProperty(selectedEmailItem, "Email");

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Send Email to Participant</h3>
          <button onClick={onClose} className="modal-close">
            ×
          </button>
        </div>
        <div className="modal-body">
          <div className="email-recipient-info">
            <p>
              <strong>To:</strong> {recipientName} ({recipientEmail})
            </p>
          </div>

          {connectionTest?.status === "error" && (
            <div className="error-message" style={{ marginBottom: "1rem" }}>
              <p>
                <strong>Email Service Issue:</strong> {connectionTest.message}
              </p>
              <button
                onClick={onTestConnection}
                className="btn-secondary"
                style={{ marginTop: "0.5rem" }}
              >
                Retest Connection
              </button>
            </div>
          )}

          <div className="email-templates">
            <h4>Select Email Template:</h4>

            <div className="email-template-option">
              <button
                onClick={() => onSendEmail("confirmation")}
                className="btn-primary email-template-btn"
                disabled={emailSending || connectionTest?.status === "error"}
              >
                Send Confirmation Email
              </button>
              <p className="template-description">
                Confirms receipt of photo submission and provides basic details.
              </p>
            </div>

            <div className="email-template-option">
              <button
                onClick={() => onSendEmail("renameRequest")}
                className="btn-primary email-template-btn"
                disabled={emailSending || connectionTest?.status === "error"}
              >
                Send Rename Request
              </button>
              <p className="template-description">
                Requests participant to rename photos according to guidelines.
              </p>
            </div>

            <div className="email-template-option">
              <div className="custom-email-section">
                <h5>Custom Email</h5>
                <textarea
                  placeholder="Enter your custom message here..."
                  className="custom-message-input"
                  rows="4"
                  id="customMessageInput"
                />
                <button
                  onClick={() => {
                    const customMessage =
                      document.getElementById("customMessageInput")?.value ||
                      "";
                    onSendEmail("general", customMessage);
                  }}
                  className="btn-secondary email-template-btn"
                  disabled={emailSending || connectionTest?.status === "error"}
                >
                  Send Custom Email
                </button>
              </div>
            </div>
          </div>

          {emailSending && (
            <div className="email-sending-indicator">
              <FaSync className="spinner" />
              <span>Sending email...</span>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button
            onClick={onClose}
            className="btn-secondary"
            disabled={emailSending}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminEmailModal;
