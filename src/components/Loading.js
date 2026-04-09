// components/Loading.js
"use client";

import React from 'react';
import './Loading.css';

const Loading = () => {
  return (
    <div className="loading-container">
      <div className="loading-content">
        <div className="loading-spinner">
          <div className="spinner-outer"></div>
          <div className="spinner-inner"></div>
          <div className="camera-lens">
            <div className="lens-outline"></div>
            <div className="lens-shutter"></div>
          </div>
        </div>
        <div className="loading-text">
          <span className="loading-letter">L</span>
          <span className="loading-letter">O</span>
          <span className="loading-letter">A</span>
          <span className="loading-letter">D</span>
          <span className="loading-letter">I</span>
          <span className="loading-letter">N</span>
          <span className="loading-letter">G</span>
        </div>
        <div className="loading-bar-container">
          <div className="loading-bar"></div>
        </div>
      </div>
    </div>
  );
};

export default Loading;
