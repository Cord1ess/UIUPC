"use client";

import React from "react";
import { FaCalendar, FaTag, FaEdit } from "react-icons/fa";

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
  tags?: string;
  media?: Media[];
}

interface BlogPreviewModalProps {
  post: BlogPost;
  onClose: () => void;
  onEdit: (post: BlogPost) => void;
}

const BlogPreviewModal: React.FC<BlogPreviewModalProps> = ({
  post,
  onClose,
  onEdit,
}) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content blog-preview-modal">
        <div className="modal-header">
          <h3>Preview: {post.title}</h3>
          <button onClick={onClose} className="modal-close">
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="preview-content">
            {post.media && post.media.length > 0 && (
              <div className="preview-media">
                <img
                  src={post.media[0].url}
                  alt={post.media[0].caption || post.title}
                />
              </div>
            )}

            <div className="preview-details">
              <h2>{post.title}</h2>
              <div className="preview-meta">
                <span className="preview-date">
                  <FaCalendar /> {new Date(post.date).toLocaleDateString()}
                </span>
                {post.tags && (
                  <span className="preview-tags">
                    <FaTag /> {post.tags}
                  </span>
                )}
              </div>
              <p className="preview-description">{post.description}</p>

              {post.media && post.media.length > 1 && (
                <div className="preview-media-gallery">
                  <h4>Additional Media ({post.media.length - 1})</h4>
                  <div className="media-thumbnails">
                    {post.media.slice(1).map((media, index) => (
                      <div key={index} className="media-thumbnail">
                        <img src={media.url} alt={media.caption} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn-secondary">
            Close Preview
          </button>
          <button
            onClick={() => {
              onClose();
              onEdit(post);
            }}
            className="btn-primary"
          >
            <FaEdit /> Edit Post
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlogPreviewModal;
