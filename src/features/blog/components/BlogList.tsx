"use client";

import React from "react";
import Image from "next/image";
import { FaCalendar, FaTag, FaEye, FaEdit, FaTrash } from "react-icons/fa";

interface Media {
  type: string;
  url: string;
  caption?: string;
}

interface BlogPost {
  id: string;
  title: string;
  description: string;
  date: string;
  timestamp?: string;
  author: string;
  tags?: string;
  media?: Media[];
}

interface BlogListProps {
  posts: BlogPost[];
  onPreview: (post: BlogPost) => void;
  onEdit: (post: BlogPost) => void;
  onDelete: (id: string) => void;
  userEmail: string;
}

const BlogList: React.FC<BlogListProps> = ({
  posts,
  onPreview,
  onEdit,
  onDelete,
  userEmail,
}) => {
  const truncateDescription = (description: string, maxLength = 120) => {
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + "...";
  };

  return (
    <div className="blog-posts-grid-container">
      <div className="blog-posts-grid">
        {posts.map((post) => (
          <div key={post.id} className="blog-post-card">
            {post.media && post.media.length > 0 && (
              <div className="post-media-preview" style={{ position: "relative", width: "100%", height: "200px" }}>
                <Image
                  src={post.media[0].url}
                  alt={post.media[0].caption || post.title}
                  onClick={() => onPreview(post)}
                  fill
                  style={{ objectFit: 'cover' }}
                  unoptimized={true}
                />
                <div className="media-count">
                  {post.media.length} media
                </div>
              </div>
            )}

            <div className="post-content">
              <h3 className="post-title">{post.title}</h3>
              <p className="post-description">
                {truncateDescription(post.description)}
              </p>

              <div className="post-meta">
                <span className="post-date">
                  <FaCalendar />{" "}
                  {new Date(post.date).toLocaleDateString()}
                </span>
                {post.tags && (
                  <span className="post-tags">
                    <FaTag /> {post.tags}
                  </span>
                )}
              </div>

              <div className="post-footer">
                <span className="post-author">
                  by {post.author || userEmail}
                </span>
                <span className="post-id">
                  ID: {post.id.substring(0, 8)}...
                </span>
              </div>
            </div>

            <div className="post-actions">
              <button
                onClick={() => onPreview(post)}
                className="btn-view"
                title="Preview Post"
              >
                <FaEye />
              </button>
              <button
                onClick={() => onEdit(post)}
                className="btn-edit"
                title="Edit Post"
              >
                <FaEdit />
              </button>
              <button
                onClick={() => onDelete(post.id)}
                className="btn-delete"
                title="Delete Post"
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(BlogList);
