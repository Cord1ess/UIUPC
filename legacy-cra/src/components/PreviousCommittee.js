// components/PreviousCommittee.js
import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp, FaHistory, FaUsers, FaAward } from 'react-icons/fa';
import './PreviousCommittee.css';

const PreviousCommittee = ({ committees = [] }) => {
  const [expandedYear, setExpandedYear] = useState(null);

  const toggleYear = (year) => {
    setExpandedYear(expandedYear === year ? null : year);
  };

  if (committees.length === 0) {
    return (
      <div className="previous-committees">
        <div className="empty-committees">
          <div className="empty-icon">
            <FaHistory />
          </div>
          <h3>No Previous Committees</h3>
          <p>Committee history will be displayed here as the club grows and new generations take the lead.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="previous-committees">
      <div className="committees-timeline">
        {committees.map((committee, index) => (
          <div 
            key={committee.year} 
            className={`timeline-item ${expandedYear === committee.year ? 'expanded' : ''}`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="timeline-header" onClick={() => toggleYear(committee.year)}>
              <div className="timeline-year">
                <span className="year-badge">
                  <FaAward style={{ marginRight: '8px', fontSize: '0.9em' }} />
                  {committee.year}
                </span>
                <h3 className="year-title">
                  <FaUsers style={{ marginRight: '12px', opacity: 0.8 }} />
                  Executive Committee {committee.year}
                </h3>
              </div>
              <div className="timeline-toggle">
                {expandedYear === committee.year ? <FaChevronUp /> : <FaChevronDown />}
              </div>
            </div>
            
            <div className="timeline-content">
              <div className="committee-members">
                {committee.members.map((member, memberIndex) => (
                  <div 
                    key={memberIndex} 
                    className="committee-member"
                    style={{ animationDelay: `${memberIndex * 0.05}s` }}
                  >
                    <div className="member-avatar">
                      <img 
                        src={member.profileImage} 
                        alt={member.name}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="avatar-fallback">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                    </div>
                    <div className="member-details">
                      <h4 className="member-name">{member.name}</h4>
                      <p className="member-role">{member.role}</p>
                      <p className="member-department">{member.department}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PreviousCommittee;