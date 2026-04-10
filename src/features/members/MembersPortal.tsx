"use client";

import React, { useState, useEffect } from "react";
import MemberCard from "@/components/MemberCard";
import ExecutiveCommittee from "@/components/ExecutiveCommittee";
import PreviousCommittee from "@/components/PreviousCommittee";
import Loading from "@/components/Loading";
import Link from "next/link";
import "@/app/members/Members.css";

interface PortalMember {
  id?: number | string;
  name: string;
  role: string;
  department?: string;
  profileImage?: string;
}

interface Committee {
  year: string | number;
  members: PortalMember[];
}

const MembersPortal = () => {
  const [members, setMembers] = useState<PortalMember[]>([]);
  const [currentCommittee, setCurrentCommittee] = useState<PortalMember[]>([]);
  const [previousCommittees, setPreviousCommittees] = useState<Committee[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("current");
  const [currentPage, setCurrentPage] = useState(1);
  const [membersPerPage] = useState(9);

  useEffect(() => {
    fetchMembers();
    loadCommitteeData();
  }, []);

  const fetchMembers = async () => {
    try {
      // For demo purposes, using static data. Replace with Firebase in production
      const demoMembers = [
        {
          id: 1,
          name: "Ishrak Ahmed",
          department: "Computer Science & Engineering",
          profileImage:
            "https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983043/ishrak_yyw6tr.jpg",
          role: "Head of Design",
        },
        {
          id: 2,
          name: "Md Reza",
          department: "Computer Science & Engineering",
          profileImage:
            "https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983043/reza_raexvo.jpg",
          role: "Head of Org.",
        },
        {
          id: 3,
          name: "Abdul Mohsen Rubay",
          department: "Computer Science & Engineering",
          profileImage:
            "https://res.cloudinary.com/do0e8p5d2/image/upload/v1761984293/rubay_tdrwo8.jpg",
          role: "Head of PR",
        },
        {
          id: 4,
          name: "Md Zobaer Ahmed",
          department: "Computer Science & Engineering",
          profileImage:
            "https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983045/zobayer_rztaox.jpg",
          role: "Head of HR",
        },
        {
          id: 5,
          name: "Dipto Mahdud Sultan",
          department: "Department of MSJ",
          profileImage:
            "https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983041/dipto_yxckvv.jpg",
          role: "Head of Event",
        },
        {
          id: 6,
          name: "Tahsin Topu",
          department: "Computer Science & Engineering",
          profileImage:
            "https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983046/topu_g4zpf6.jpg",
          role: "Asst. Head of ORG",
        },
        {
          id: 7,
          name: "Tanvir Ahmed",
          department: "Computer Science & Engineering",
          profileImage:
            "https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983044/tanvir_cuzdid.jpg",
          role: "Asst. Head of ORG",
        },
        {
          id: 8,
          name: "Jonayed",
          department: "Computer Science & Engineering",
          profileImage:
            "https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983043/Jonayed_ozbke5.jpg",
          role: "Designer",
        },
        {
          id: 9,
          name: "Siddiquee Shuaib",
          department: "Electrical & Electronic Engineering",
          profileImage:
            "https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983044/shuaib_yripkq.jpg",
          role: "Asst. Head of PR",
        },
        {
          id: 10,
          name: "Ishrak Farhan",
          department: "Computer Science & Engineering",
          profileImage:
            "https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983043/farhan_z4d9el.jpg",
          role: "Asst. Head of HR",
        },
        {
          id: 11,
          name: "Rifat Hassan Rabib",
          department: "Computer Science & Engineering",
          profileImage:
            "https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983041/rabib_dzpawf.jpg",
          role: "Asst. Head of HR",
        },
        {
          id: 12,
          name: "Minhaz Hossain Shemul",
          department: "Electrical & Electronic Engineering",
          profileImage:
            "https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983044/shemul_o2n1am.jpg",
          role: "Executives",
        },
        {
          id: 13,
          name: "Mayesha Nur",
          department: "Computer Science & Engineering",
          profileImage:
            "https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983044/maisha_eawkws.jpg",
          role: "Executives",
        },
        {
          id: 14,
          name: "Jahid Hasan Sabbir",
          department: "Computer Science & Engineering",
          profileImage:
            "https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983043/sabbir_tdtnke.jpg",
          role: "Executives",
        },
        {
          id: 15,
          name: "Zannatul Amin",
          department: "Computer Science & Engineering",
          profileImage:
            "https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983042/anika_anssy2.jpg",
          role: "Executives",
        },
        {
          id: 16,
          name: "Arean Nobi",
          department: "Computer Science & Engineering",
          profileImage:
            "https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983041/arean_ubnwpt.jpg",
          role: "Executives",
        },
      ];

      setMembers(demoMembers);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching members:", error);
      setLoading(false);
    }
  };

  const loadCommitteeData = () => {
    const currentExecutives = [
      {
        id: 1,
        name: "Pulok Sikdar",
        role: "President",
        department: "Computer Science & Engineering",
        profileImage:
          "https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983041/pulok_fotumj.jpg",
      },
      {
        id: 2,
        name: "Nafis Nawal",
        role: "Vice President",
        department: "Computer Science & Engineering",
        profileImage:
          "https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983045/nafis_fslsiw.jpg",
      },
      {
        id: 3,
        name: "Md Mahmudul Hasan",
        role: "General Secretary",
        department: "Computer Science & Engineering",
        profileImage:
          "https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983042/hasan_p7zfgk.jpg",
      },
      {
        id: 4,
        name: "Ahmad Hasan",
        role: "Asst. General Secretary",
        department: "Computer Science & Engineering",
        profileImage:
          "https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983042/ahmad_enzaam.jpg",
      },
      {
        id: 5,
        name: "Muhit Khan",
        role: "Treasurer",
        department: "Computer Science & Engineering",
        profileImage:
          "https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983045/muhit_pvc0bx.jpg",
      },
      {
        id: 6,
        name: "Anika Anjum Mona",
        role: "Asst. Treasurer",
        department: "Environment and Development Studies",
        profileImage:
          "https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983044/mona_y54t2k.jpg",
      },
    ];

    const previousExecutives = [
      {
        year: "2022",
        members: [
          {
            name: "Arif Mahmud",
            role: "President",
            profileImage:
              "https://res.cloudinary.com/do0e8p5d2/image/upload/v1762807808/arifPC22_n4oa2o.jpg",
          },
          {
            name: "Mirza Muyammar Munnaf hussain Baig",
            role: "General Secretary",
            profileImage:
              "https://res.cloudinary.com/do0e8p5d2/image/upload/v1762807808/munnafPC22_ugukeg.jpg",
          },
          {
            name: "Rabius Sany Jabiullah",
            role: "Treasurer",
            profileImage:
              "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
          },
          {
            name: "Adib Mahmud",
            role: "Asst. Treasurer",
            profileImage:
              "https://res.cloudinary.com/do0e8p5d2/image/upload/v1762808128/adibPC22_qpwopz.jpg",
          },
        ],
      },
      {
        year: "2019",
        members: [
          {
            name: "Saikat Kumar Saha",
            role: "President",
            profileImage:
              "https://res.cloudinary.com/do0e8p5d2/image/upload/v1762808335/saikatPC19_hmpdkx.jpg",
          },
          {
            name: "M Shamim Reza",
            role: "General Secretary",
            profileImage:
              "https://res.cloudinary.com/do0e8p5d2/image/upload/v1762808402/shamimPC19_eoi3oq.jpg",
          },
          {
            name: "S. M. Abu Hena",
            role: "Asst. General Secretary",
            profileImage:
              "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face",
          },
          {
            name: "Mohiuzzaman",
            role: "Treasurer",
            profileImage:
              "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
          },
          {
            name: "Sadia Islam",
            role: "Asst. Treasurer",
            profileImage:
              "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
          },
        ],
      },
    ];

    setCurrentCommittee(currentExecutives);
    setPreviousCommittees(previousExecutives);
  };

  const indexOfLastMember = currentPage * membersPerPage;
  const indexOfFirstMember = indexOfLastMember - membersPerPage;
  const currentMembers = members.slice(indexOfFirstMember, indexOfLastMember);
  const totalPages = Math.ceil(members.length / membersPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="members-page">
      <div className="container">
        {/* Executive Committee Section */}
        <section className="executive-section">
          <div className="section-header">
            <h2>Meet Our Team</h2>
            <p className="carousel-subtitle">
              The passionate individuals driving our photography community
              forward
            </p>
            <div className="section-divider"></div>
          </div>

          <ExecutiveCommittee members={currentCommittee} />
        </section>

        {/* Tab Navigation */}
        <section className="members-tabs-section">
          <div className="tabs-container">
            <div className="tabs-header">
              <button
                className={`tab-button ${
                  activeTab === "current" ? "active" : ""
                }`}
                onClick={() => setActiveTab("current")}
              >
                Current Members
              </button>
              <button
                className={`tab-button ${
                  activeTab === "previous" ? "active" : ""
                }`}
                onClick={() => setActiveTab("previous")}
              >
                Previous Committees
              </button>
            </div>

            <div className="tab-content">
              {activeTab === "current" ? (
                <div className="current-members">
                  <div className="members-count">
                    Showing {indexOfFirstMember + 1}-
                    {Math.min(indexOfLastMember, members.length)} of{" "}
                    {members.length} members
                  </div>

                  <div className="members-grid">
                    {currentMembers.map((member, index) => (
                      <MemberCard key={member.id} member={member} index={index} />
                    ))}
                  </div>

                  {members.length > membersPerPage && (
                    <div className="pagination-controls">
                      <button
                        className={`pagination-btn ${
                          currentPage === 1 ? "disabled" : ""
                        }`}
                        onClick={prevPage}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </button>

                      <div className="pagination-numbers">
                        {Array.from(
                          { length: totalPages },
                          (_, i) => i + 1
                        ).map((number) => (
                          <button
                            key={number}
                            className={`pagination-number ${
                              currentPage === number ? "active" : ""
                            }`}
                            onClick={() => paginate(number)}
                          >
                            {number}
                          </button>
                        ))}
                      </div>

                      <button
                        className={`pagination-btn ${
                          currentPage === totalPages ? "disabled" : ""
                        }`}
                        onClick={nextPage}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </button>
                    </div>
                  )}

                  {members.length === 0 && (
                    <div className="no-members">
                      <div className="no-members-icon">📸</div>
                      <h3>No Members Yet</h3>
                      <p>Be the first to join our photography community!</p>
                    </div>
                  )}
                </div>
              ) : (
                <PreviousCommittee committees={previousCommittees} />
              )}
            </div>
          </div>
        </section>

        {/* Join CTA Section */}
        <section className="join-cta-section">
          <div className="cta-content">
            <h2>Want to Join Our Community?</h2>
            <p>
              Become part of UIU's vibrant photography family and showcase your
              talent
            </p>
            <Link href="/join" className="btn-primary cta-button">
              BECOME A MEMBER
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default MembersPortal;
