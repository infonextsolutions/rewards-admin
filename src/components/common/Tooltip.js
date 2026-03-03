'use client';

import React, { useState } from 'react';

const Tooltip = ({ children, content, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: '-top-2 left-1/2 transform -translate-x-1/2 -translate-y-full',
    bottom: '-bottom-2 left-1/2 transform -translate-x-1/2 translate-y-full',
    left: 'top-1/2 -left-2 transform -translate-x-full -translate-y-1/2',
    right: 'top-1/2 -right-2 transform translate-x-full -translate-y-1/2',
  };

  const arrowClasses = {
    top: 'absolute w-2 h-2 bg-gray-900 transform rotate-45 -bottom-1 left-1/2 -translate-x-1/2',
    bottom: 'absolute w-2 h-2 bg-gray-900 transform rotate-45 -top-1 left-1/2 -translate-x-1/2',
    left: 'absolute w-2 h-2 bg-gray-900 transform rotate-45 -right-1 top-1/2 -translate-y-1/2',
    right: 'absolute w-2 h-2 bg-gray-900 transform rotate-45 -left-1 top-1/2 -translate-y-1/2',
  };

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help"
      >
        {children}
      </div>
      {isVisible && (
        <div
          className={`absolute z-50 w-72 p-3 text-sm text-white bg-gray-900 rounded-lg shadow-xl ${positionClasses[position]}`}
          style={{ pointerEvents: 'none' }}
        >
          {content}
          <div className={arrowClasses[position]}></div>
        </div>
      )}
    </div>
  );
};

export default Tooltip;
