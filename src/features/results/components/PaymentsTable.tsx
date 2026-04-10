"use client";

import React from "react";
import { FaMoneyBillWave, FaEye, FaCheck, FaTimes, FaEnvelope, FaChevronLeft, FaChevronRight, FaDownload } from "react-icons/fa";

interface Payment {
  id: string;
  name: string;
  email: string;
  transactionId: string;
  amount: number;
  status: string;
  timestamp: string;
  [key: string]: any;
}

interface PaymentsTableProps {
  payments: Payment[];
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onViewDetails: (payment: Payment) => void;
  onVerify: (id: string) => void;
  onReject: (id: string) => void;
  onSendEmail: (id: string, data: Payment) => void;
  onExport: () => void;
}

const PaymentsTable: React.FC<PaymentsTableProps> = ({
  payments,
  currentPage,
  itemsPerPage,
  onPageChange,
  onViewDetails,
  onVerify,
  onReject,
  onSendEmail,
  onExport
}) => {
  const totalPages = Math.ceil(payments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPayments = payments.slice(startIndex, startIndex + itemsPerPage);

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    return (
      <div className="pagination">
        <button
          className="pagination-btn"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <FaChevronLeft />
        </button>
        <span className="pagination-info">Page {currentPage} of {totalPages}</span>
        <button
          className="pagination-btn"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <FaChevronRight />
        </button>
      </div>
    );
  };

  return (
    <div className="table-container">
      <div className="table-header">
        <h3><FaMoneyBillWave /> Payments Management ({payments.length})</h3>
        <div className="table-actions">
          <button className="btn-secondary" onClick={onExport} disabled={payments.length === 0}>
            <FaDownload /> Export CSV
          </button>
        </div>
      </div>

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Name</th>
              <th>TrxID</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedPayments.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center' }}>No payments found.</td></tr>
            ) : (
              paginatedPayments.map((payment, index) => (
                <tr key={payment.id || index}>
                  <td>{payment.timestamp ? new Date(payment.timestamp).toLocaleDateString() : 'N/A'}</td>
                  <td>{payment.name}</td>
                  <td className="trx-id">{payment.transactionId}</td>
                  <td>{payment.amount} BDT</td>
                  <td>
                    <span className={`status-badge ${(payment.status || 'pending').toLowerCase()}`}>
                      {payment.status || "Pending"}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button className="action-btn view-btn" onClick={() => onViewDetails(payment)} title="View Details"><FaEye /></button>
                    {payment.status !== "verified" && payment.status !== "confirmed" && (
                      <button className="action-btn verify-btn" onClick={() => onVerify(payment.id)} title="Verify Payment"><FaCheck /></button>
                    )}
                    {payment.status !== "rejected" && (
                      <button className="action-btn delete-btn" onClick={() => onReject(payment.id)} title="Reject"><FaTimes /></button>
                    )}
                    <button className="action-btn send-btn" onClick={() => onSendEmail(payment.id, payment)} title="Send Confirmation Email"><FaEnvelope /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {renderPagination()}
    </div>
  );
};

export default React.memo(PaymentsTable);
