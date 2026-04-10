"use client";

import React from "react";
import { FaUser, FaEnvelope, FaPhone, FaUniversity, FaImage, FaTshirt, FaHome, FaCalendar, FaCheck, FaTimes } from "react-icons/fa";

interface Payment {
  id: string;
  name: string;
  email: string;
  phone: string;
  institute: string;
  category: string;
  photoCount: number;
  tshirtSize: string;
  address: string;
  paymentMethod: string;
  transactionId: string;
  totalAmount: number;
  timestamp: string;
  status: string;
}

interface PaymentModalProps {
  payment: Payment | null;
  onClose: () => void;
  onVerify: (id: string) => void;
  onReject: (id: string) => void;
  onSendEmail: (id: string, data: Payment) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  payment,
  onClose,
  onVerify,
  onReject,
  onSendEmail
}) => {
  if (!payment) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content large-modal">
        <div className="modal-header">
          <h3>Payment Details</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="payment-details">
            <div className="detail-row">
              <div className="detail-label"><FaUser /> Name:</div>
              <div className="detail-value">{payment.name}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label"><FaEnvelope /> Email:</div>
              <div className="detail-value">{payment.email}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label"><FaPhone /> Phone:</div>
              <div className="detail-value">{payment.phone}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label"><FaUniversity /> Institute:</div>
              <div className="detail-value">{payment.institute}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label"><FaImage /> Category:</div>
              <div className="detail-value">{payment.category === "single" ? "Single Photo" : "Photo Story"}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Quantity:</div>
              <div className="detail-value">{payment.photoCount}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label"><FaTshirt /> T-Shirt Size:</div>
              <div className="detail-value">{payment.tshirtSize}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label"><FaHome /> Address:</div>
              <div className="detail-value">{payment.address}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Transaction ID:</div>
              <div className="detail-value"><code>{payment.transactionId}</code></div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Total Amount:</div>
              <div className="detail-value">{payment.totalAmount?.toLocaleString()} BDT</div>
            </div>
            <div className="detail-row">
              <div className="detail-label"><FaCalendar /> Submitted:</div>
              <div className="detail-value">{new Date(payment.timestamp).toLocaleString()}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Status:</div>
              <div className="detail-value">
                <span className={`status-badge ${(payment.status || 'pending').toLowerCase()}`}>
                  {payment.status || "Pending"}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Close</button>
          
          {payment.status?.toLowerCase() === "pending" && (
            <>
              <button className="btn-primary email-btn" onClick={() => onSendEmail(payment.id, payment)}>
                <FaEnvelope /> Send Confirmation
              </button>
              <button className="btn-primary approve-btn" onClick={() => onVerify(payment.id)}>
                <FaCheck /> Verify
              </button>
              <button className="btn-primary reject-btn" onClick={() => onReject(payment.id)}>
                <FaTimes /> Reject
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
