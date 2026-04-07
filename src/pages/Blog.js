// pages/Blog.js
import React, { useState, useEffect } from 'react';
import './Blog.css';
import Loading from '../components/Loading'; // Import your custom loader

// --- MediaCarousel Component ---
const MediaCarousel = ({ media }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!media || media.length === 0) {
    return null;
  }

  const goToPrevious = (e) => {
    e.stopPropagation();
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? media.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = (e) => {
    e.stopPropagation();
    const isLastSlide = currentIndex === media.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  const goToSlide = (slideIndex) => {
    setCurrentIndex(slideIndex);
  };

  const currentMedia = media[currentIndex];

  return (
    <div className="blog-carousel-container">
      {media.length > 1 && (
        <>
          <div className="blog-carousel-arrow blog-left-arrow" onClick={goToPrevious}>
            &#10094;
          </div>
          <div className="blog-carousel-arrow blog-right-arrow" onClick={goToNext}>
            &#10095;
          </div>
        </>
      )}
      
      <div className="blog-slide-container" style={{lineHeight: 0 }}>
        {currentMedia.type === 'image' ? (
          <img 
            src={currentMedia.url} 
            alt={currentMedia.caption}
            className="blog-slide-content"
            loading="lazy"
            style={{ display: 'block', width: '100%' }}
          />
        ) : (
          <video 
            controls
            className="blog-slide-content"
            poster={currentMedia.thumbnail}
            style={{ display: 'block', width: '100%' }}
          >
            <source src={currentMedia.url} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        )}
      </div>

      {media.length > 1 && (
        <div className="blog-dots-container">
          {media.map((_, slideIndex) => (
            <div
              key={slideIndex}
              className={`blog-dot ${currentIndex === slideIndex ? 'active' : ''}`}
              onClick={() => goToSlide(slideIndex)}
            ></div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- PostCard Component ---
const PostCard = ({ post }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleDescription = () => {
    setIsExpanded(!isExpanded);
  };

  // Generate unique URL for this post
  const getPostUrl = () => {
    const baseUrl = window.location.origin + window.location.pathname;
    const postSlug = post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    return `${baseUrl}?post=${post.id}&slug=${postSlug}`;
  };

  const handleShare = () => {
    const postUrl = getPostUrl();
    
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.description.substring(0, 100) + '...',
        url: postUrl,
      })
      .catch((error) => {});
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(postUrl)
        .then(() => {
          alert('Post link copied to clipboard!');
        })
        .catch((error) => {
          alert('Share this post: ' + postUrl);
        });
    }
  };

  const descriptionClass = isExpanded ? 'blog-post-description expanded' : 'blog-post-description';
  const buttonText = isExpanded ? 'Show Less' : 'Show More';

  return (
    <div className="blog-post-card">
      <h2 className="blog-post-title">{post.title}</h2>
      
      <div className={descriptionClass}>
        {post.description}
      </div>
      
      {post.description.length > 120 && (
        <button className="blog-show-more-btn" onClick={toggleDescription}>
          {buttonText}
        </button>
      )}
      
      <MediaCarousel media={post.media} />
      
      <div className="blog-post-meta">
        <span className="blog-post-date">{post.date}</span>
        <button className="blog-share-btn" onClick={handleShare}>
          📤 Share
        </button>
      </div>
    </div>
  );
};

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Your Google Apps Script URL for blog
  const BLOG_SCRIPT_URL = process.env.REACT_APP_GAS_BLOG;

  const fetchBlogPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${BLOG_SCRIPT_URL}?action=getBlogPosts`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();


      if (result.status === 'success') {
        // Sort posts by date (newest first)
        const sortedPosts = (result.data || []).sort((a, b) => 
          new Date(b.date || b.timestamp) - new Date(a.date || a.timestamp)
        );
        setPosts(sortedPosts);
      } else {
        throw new Error(result.message || 'Failed to fetch blog posts');
      }
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      setError(error.message);
      // Fallback to empty array
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  if (loading) {
    return (
      <div className="blog-page">
        <div className="blog-page-header">
          <h1>News & Updates</h1>
          <p>Stories, tutorials, and updates from our photography community</p>
        </div>
        <div className="blog-container">
          <Loading /> {/* Use your custom loader here */}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="blog-page">
        <div className="blog-page-header">
          <h1>News & Updates</h1>
          <p>Stories, tutorials, and updates from our photography community</p>
        </div>
        <div className="blog-container">
          <div className="error-message">
            <p>Error loading posts: {error}</p>
            <button onClick={fetchBlogPosts} className="btn-secondary">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-page">
      <div className="blog-page-header">
        <h1>News & Updates</h1>
        <p>Stories, tutorials, and updates from our photography community</p>
      </div>
      
      <div className="blog-container">
        <div className="blog-content">
          {posts.length === 0 ? (
            <div className="no-posts">
              <h3>No posts yet</h3>
              <p>Check back later for updates!</p>
            </div>
          ) : (
            <div className="blog-posts-grid">
              {posts.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Blog;