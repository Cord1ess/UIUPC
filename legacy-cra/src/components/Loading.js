// Loading.js
import React from 'react';
import './Loading.css';

const Loading = () => {
  return (
    <div className="loading-container">
      <div className="camera-loader">
        {/* Camera Body */}
        <div className="camera-body">
          <div className="camera-lens">
            <div className="lens-inner">
              <div className="lens-reflection"></div>
            </div>
          </div>
          <div className="flash"></div>
          <div className="shutter-button"></div>
          <div className="flash-effect"></div>
        </div>
        
        {/* Shutter Sound Indicator */}
        <div className="shutter-sound">📸 *click*</div>
        
        {/* Film Strip */}
        <div className="film-strip">
          <div className="film-frame">
            <div className="film-perforation">
              <div className="perf"></div>
              <div className="perf"></div>
              <div className="perf"></div>
              <div className="perf"></div>
            </div>
          </div>
          <div className="film-frame">
            <div className="film-perforation">
              <div className="perf"></div>
              <div className="perf"></div>
              <div className="perf"></div>
              <div className="perf"></div>
            </div>
          </div>
          <div className="film-frame">
            <div className="film-perforation">
              <div className="perf"></div>
              <div className="perf"></div>
              <div className="perf"></div>
              <div className="perf"></div>
            </div>
          </div>
          <div className="film-frame">
            <div className="film-perforation">
              <div className="perf"></div>
              <div className="perf"></div>
              <div className="perf"></div>
              <div className="perf"></div>
            </div>
          </div>
        </div>
        
        {/* Loading Text */}
        <div className="loading-text">UIU Photography Club</div>
        <div className="capturing-text">Capturing moments...</div>
      </div>
    </div>
  );
};

export default Loading;