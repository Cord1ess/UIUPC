// components/MemberOfTheMonth.js
import React from 'react';
import './MemberOfTheMonth.css';

const MemberOfTheMonth = ({ member }) => {
  if (!member) return null;

  return (
    <section className="member-of-month">
      <div className="container">
        <div className="section-header">
          <h2>🌟 Member of the Month</h2>
          <p>Recognizing outstanding contributions to our photography community</p>
        </div>
        
        <div className="motm-card">
          <div className="motm-image">
            <img 
              src={member.profileImage || '/default-avatar.png'} 
              alt={member.name}
            />
            <div className="motm-badge">🌟</div>
          </div>
          
          <div className="motm-content">
            <h3>{member.name}</h3>
            <p className="motm-role">{member.role} • {member.department}</p>
            
            {member.achievement && (
              <div className="motm-achievement">
                <h4>Recent Achievement:</h4>
                <p>{member.achievement}</p>
              </div>
            )}
            
            {member.bio && (
              <p className="motm-bio">{member.bio}</p>
            )}
            
            <div className="motm-social">
              {member.instagram && (
                <a href={member.instagram} target="_blank" rel="noopener noreferrer">
                  📷 Instagram
                </a>
              )}
              {member.behance && (
                <a href={member.behance} target="_blank" rel="noopener noreferrer">
                  🎨 Behance
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MemberOfTheMonth;