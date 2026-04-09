// components/MemberCard.js
import React from 'react';
import './MemberCard.css';

const MemberCard = ({ member, index }) => {
  const getSocialIcon = (platform, url) => {
    const icons = {
      instagram: '📷',
      behance: '🎨',
      portfolio: '🌐',
      linkedin: '💼',
      github: '⚡'
    };
    
    return icons[platform] || '🔗';
  };

  const socialLinks = [
    { platform: 'instagram', url: member.instagram },
    { platform: 'behance', url: member.behance },
    { platform: 'portfolio', url: member.portfolio },
    { platform: 'linkedin', url: member.linkedin },
    { platform: 'github', url: member.github }
  ].filter(link => link.url);

  return (
    <div 
      className="member-card"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="member-image">
        <img 
          src={member.profileImage || '/default-avatar.png'} 
          alt={member.name}
          loading="lazy"
        />
        {member.role === 'President' && (
          <span className="role-badge president">President</span>
        )}
        {member.role === 'General Secretary' && (
          <span className="role-badge secretary">Secretary</span>
        )}
      </div>
      
      <div className="member-info">
        <h3>{member.name}</h3>
        <p className="member-role">{member.role}</p>
        <p className="member-department">{member.department}</p>
        
        {member.bio && (
          <p className="member-bio">
            {member.bio.length > 120 
              ? `${member.bio.substring(0, 120)}...` 
              : member.bio
            }
          </p>
        )}
        
        {socialLinks.length > 0 && (
          <div className="member-social">
            {socialLinks.map((link, idx) => (
              <a 
                key={idx}
                href={link.url} 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label={`${member.name}'s ${link.platform}`}
              >
                {getSocialIcon(link.platform)}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberCard;