"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Loading from "@/components/Loading";
import committeeData from "@/data/committee2026.json";
import "./Committee2026.css";

const Committee2026 = () => {
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Initialize state with all sections
  const [revealedSections, setRevealedSections] = useState<Record<string, any>>({
    core: {
      president: false,
      generalSecretary: false,
      assistantGeneralSecretary: false,
      treasurer: false,
    },
    publicrelations: { head: false, assistantHead: true },
    organizers: { head: false, assistantHead: true },
    event: { head: false, assistantHead: true },
    humanresources: { head: false, assistantHead: true },
    designers: { head: false, assistantHead: true },
    executives: { head: true, assistantHead: true },
  });

  // Committee 2026 Data (loaded from external JSON)
  const committee2026 = committeeData;

  // Get unique tags
  const tags = ["all", ...new Set(committee2026.map((member: any) => member.tag))];

  // Fixed toggleReveal function
  const toggleReveal = (section: string, position: string, isCore: boolean = false) => {
    setRevealedSections((prev) => {
      if (isCore) {
        // For Core team: turn off all others, turn on this one
        const newCoreState: Record<string, boolean> = {
          president: false,
          vicepresident: false,
          generalSecretary: false,
          assistantGeneralSecretary: false,
          treasurer: false,
        };
        newCoreState[position] = !prev.core[position]; // Toggle the clicked position

        return {
          ...prev,
          core: newCoreState,
        };
      } else {
        // For other teams: toggle individual position
        const sectionKey = section.toLowerCase().replace(/\s+/g, "");
        return {
          ...prev,
          [sectionKey]: {
            ...prev[sectionKey],
            [position]: !prev[sectionKey][position],
          },
        };
      }
    });
    
    // Add a subtle scroll effect when revealing
    setTimeout(() => {
      const gridSection = document.querySelector('.committee-grid-section');
      if (gridSection) {
        gridSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 300);
  };

  const getFilteredMembers = () => {
    if (activeFilter === "all") {
      return committee2026;
    }

    const members = committee2026.filter(
      (member: any) => member.tag === activeFilter,
    );

    if (activeFilter === "Core") {
      // For Core team, only show if revealed
      return members.filter((member: any) => {
        return revealedSections.core[member.positionType];
      });
    } else if (activeFilter === "Executives") {
      // Executives always visible
      return members;
    } else {
      // For other teams
      const sectionKey = activeFilter.toLowerCase().replace(/\s+/g, "");
      const sectionState = revealedSections[sectionKey] || {
        head: false,
        assistantHead: true,
      };

      return members.filter((member: any) => {
        if (member.positionType === "head") {
          return sectionState.head;
        }
        if (member.positionType === "assistantHead") {
          return sectionState.assistantHead;
        }
        return false;
      });
    }
  };

  const getTeamStructure = () => {
    const members = getFilteredMembers();
    
    if (activeFilter === "Core" || activeFilter === "Executives" || activeFilter === "all") {
      return {
        hasHierarchy: false,
        head: null,
        assistants: members,
        hasHead: false
      };
    }
    
    const head = members.find((member: any) => member.positionType === "head");
    const assistants = members.filter((member: any) => member.positionType === "assistantHead");
    
    return {
      hasHierarchy: head || assistants.length > 0,
      head: head || null,
      assistants: assistants,
      hasHead: !!head
    };
  };

  useEffect(() => {
    const sectionKey = activeFilter.toLowerCase().replace(/\s+/g, "");

    setRevealedSections((prev) => {
      const newState = { ...prev };
      if (
        activeFilter !== "all" &&
        activeFilter !== "Core" &&
        activeFilter !== "Executives"
      ) {
        if (!newState[sectionKey]) {
          newState[sectionKey] = { head: false, assistantHead: true };
        }
      }
      return newState;
    });
  }, [activeFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleMemberClick = (member: any) => {
    setSelectedMember(member);
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMember(null);
    document.body.style.overflow = "unset";
  };

  const getSectionTitle = (tag: string) => {
    const titles: Record<string, string> = {
      Core: "Core Team",
      "Public Relations": "PR Team",
      "Human Resources": "HR Team",
      Organizers: "Organizers Team",
      Event: "Event Team",
      Designers: "Design Team",
      Executives: "Executive Team",
    };
    return titles[tag] || tag;
  };

  const handleImageError = (e: any) => {
    e.target.src = 'https://res.cloudinary.com/do0e8p5d2/image/upload/v1763054814/uiupc_HeroSlider1_d9kprm.jpg'; // Consistent fallback
  };

  const CommitteeCard = ({ member, onClick }: { member: any, onClick: any }) => (
    <motion.div
      className="committee-card"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="committee-card-image">
        <img 
          src={member.profileImage || 'https://res.cloudinary.com/do0e8p5d2/image/upload/v1763054814/uiupc_HeroSlider1_d9kprm.jpg'} 
          alt={member.name} 
          onError={handleImageError}
          loading="lazy"
        />
      </div>
      <div className="committee-card-content">
        <h3 className="committee-card-name">{member.name}</h3>
        <div className="committee-card-role">{member.role}</div>
        <div className="committee-card-department">{member.department}</div>
        <div className="committee-card-tag">{member.tag}</div>
      </div>
    </motion.div>
  );

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="committee-2026-page">
      <div className="floating-elements">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="floating-element"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              width: `${Math.random() * 40 + 10}px`,
              height: `${Math.random() * 40 + 10}px`,
              background: `rgba(255, 107, 0, ${Math.random() * 0.1 + 0.05})`,
            }}
          />
        ))}
      </div>

      <section className="hero-section">
        <div className="container">
          <motion.div
            className="hero-content"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <div className="badge">NEW</div>
            <h1 className="hero-title">
              <span className="gradient-text">Committee 2026</span>
              <br />
              The Next Generation
            </h1>
            <p className="hero-subtitle">
              Meet the passionate leaders who will shape the future of UIU
              Photography Club.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="filter-section">
        <div className="container">
          <div className="filter-container">
            <h3 className="filter-title">Filter by Department</h3>
            <div className="filter-tags">
              {tags.map((tag: any) => (
                <button
                  key={tag}
                  className={`filter-tag ${activeFilter === tag ? "active" : ""}`}
                  onClick={() => setActiveFilter(tag)}
                >
                  {tag === "all" ? "All Members" : getSectionTitle(tag)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="committee-grid-section">
        <div className="container">
          {activeFilter === "all" ? (
            <AnimatePresence mode="wait">
              <motion.div
                key="all"
                className={`committee-grid ${(committee2026 as any).length === 1 ? 'single-card' : ''}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                {(committee2026 as any).map((member: any) => (
                  <div key={member.id} className="committee-card-wrapper">
                    <CommitteeCard
                      member={member}
                      onClick={() => handleMemberClick(member)}
                    />
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="filtered-section-container">
              <div className="section-header">
                <h2 className="section-title-main">
                  {getSectionTitle(activeFilter)}
                  <span className="section-subtitle">
                    {activeFilter === "Core"
                      ? "Click buttons to reveal team members"
                      : "Team management and coordinators"}
                  </span>
                </h2>
              </div>

              {activeFilter === "Core" && (
                <div className="core-reveal-section">
                  <div className="reveal-buttons-grid">
                    {["assistantGeneralSecretary", "treasurer", "generalSecretary", "vicepresident", "president"].map((pos) => (
                      <button
                        key={pos}
                        className={`reveal-position-btn ${revealedSections.core[pos] ? "active" : ""}`}
                        onClick={() => toggleReveal("core", pos, true)}
                      >
                        {revealedSections.core[pos] ? `✓ ${pos}` : pos}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFilter + "-members"}
                  className={`committee-grid ${getFilteredMembers().length === 1 ? 'single-card' : ''}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {getFilteredMembers().map((member: any) => (
                    <div key={member.id} className="committee-card-wrapper">
                      <CommitteeCard
                        member={member}
                        onClick={() => handleMemberClick(member)}
                      />
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </div>
      </section>

      <AnimatePresence>
        {isModalOpen && selectedMember && (
          <motion.div
            className="member-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className="member-modal-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="modal-close" onClick={closeModal}>×</button>
              <div className="modal-member-header">
                <img src={selectedMember.profileImage} alt={selectedMember.name} className="modal-member-image" />
                <div className="modal-member-info">
                  <h3 className="modal-member-name">{selectedMember.name}</h3>
                  <div className="modal-member-role">{selectedMember.role}</div>
                  <div className="modal-member-department">{selectedMember.department}</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Committee2026;
