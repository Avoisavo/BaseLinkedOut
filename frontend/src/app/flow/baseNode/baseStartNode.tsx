'use client';

import React, { useState, useCallback, useRef } from 'react';

interface BaseStartNodeProps {
  id: string;
  position: { x: number; y: number };
  isDragging?: boolean;
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  onDelete: () => void;
  onAddConnection?: () => void;
  hasChildren?: boolean;
  data?: any;
}

export default function BaseStartNode({ 
  id, 
  position, 
  isDragging, 
  onMouseDown, 
  onDelete,
  onAddConnection,
  hasChildren,
  data 
}: BaseStartNodeProps) {
  const [showProtocolModal, setShowProtocolModal] = useState(false);
  const [selectedProtocol, setSelectedProtocol] = useState<string | null>(null);
  const [circlePosition, setCirclePosition] = useState({ x: 100, y: 250 });
  const [isDraggingCircle, setIsDraggingCircle] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const protocolDiamondRef = useRef<HTMLDivElement>(null);

  const protocols = ['Wormhole', 'LayerZero', 'Axelar'];

  const handleProtocolSelect = (protocol: string) => {
    setSelectedProtocol(protocol);
    setShowProtocolModal(false);
  };

  // Calculate line coordinates
  const getLineCoordinates = () => {
    // Adjust x1 to move the line start point to match Protocol diamond (now in middle position)
    const diamondCenterX = 205; // Protocol is now in the middle + 20px marginLeft = 185 + 20
    const diamondBottomY = 155; // Position below the diamond
    
    return {
      x1: diamondCenterX,
      y1: diamondBottomY,
      x2: circlePosition.x + 40, // Center of circle (40 is half the circle width)
      y2: circlePosition.y + 40, // Center of circle
    };
  };

  // Calculate curved path for smooth line
  const getCurvedPath = () => {
    const coords = getLineCoordinates();
    const x1 = coords.x1;
    const y1 = coords.y1;
    const x2 = coords.x2;
    const y2 = coords.y2;
    
    // Control points for bezier curve
    const controlPointOffset = Math.abs(y2 - y1) * 0.5;
    const cx1 = x1;
    const cy1 = y1 + controlPointOffset;
    const cx2 = x2;
    const cy2 = y2 - controlPointOffset;
    
    return `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
  };

  const handleCircleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsDraggingCircle(true);
    setDragOffset({
      x: e.clientX - circlePosition.x,
      y: e.clientY - circlePosition.y,
    });
  };

  const handleCircleMouseMove = (e: MouseEvent) => {
    if (isDraggingCircle) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      setCirclePosition({
        x: newX,
        y: newY,
      });
    }
  };

  const handleCircleMouseUp = () => {
    setIsDraggingCircle(false);
  };

  React.useEffect(() => {
    if (isDraggingCircle) {
      window.addEventListener('mousemove', handleCircleMouseMove);
      window.addEventListener('mouseup', handleCircleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleCircleMouseMove);
      window.removeEventListener('mouseup', handleCircleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleCircleMouseMove);
      window.removeEventListener('mouseup', handleCircleMouseUp);
    };
  }, [isDraggingCircle, dragOffset]);

  return (
    <div
      className="absolute"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -50%)',
        transition: isDragging ? 'none' : 'all 0.3s ease',
      }}
    >
      <div className="flex flex-col items-center">
        {/* Main Rectangle */}
        <div
          className="relative flex items-center justify-center group"
          style={{
            width: '420px',
            height: '140px',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '24px',
            cursor: isDragging ? 'grabbing' : 'grab',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 0 20px rgba(255, 255, 255, 0.1), inset 0 0 20px rgba(255, 255, 255, 0.05), 0 10px 40px rgba(0, 0, 0, 0.3)',
            transition: 'all 0.3s ease',
          }}
          onMouseDown={onMouseDown}
        >
          {/* Delete Button - Top Right */}
          <button
            className="absolute opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-lg p-2"
            style={{
              top: '12px',
              right: '12px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              backdropFilter: 'blur(10px)',
            }}
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
            }}
          >
            <svg 
              className="w-4 h-4" 
              fill="none" 
              stroke="#ef4444" 
              viewBox="0 0 24 24" 
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Left Side - Gray Circle */}
          <div
            className="absolute"
            style={{
              left: '-10px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '22px',
              height: '22px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(156, 163, 175, 0.8), rgba(107, 114, 128, 0.6))',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
            }}
          />

          {/* Logo and Title */}
          <div className="flex items-center gap-4">
            <img 
              src="/baselogo.png" 
              alt="Base Logo"
              style={{
                width: '64px',
                height: '64px',
              }}
            />
            <h3
              style={{
                fontSize: '32px',
                fontWeight: 'bold',
                fontFamily: "'Orbitron', sans-serif",
                background: 'linear-gradient(to bottom, #ffffff 0%, #e0e8f0 50%, #9fb5cc 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 0 20px rgba(255, 255, 255, 0.3)',
                letterSpacing: '0.05em',
              }}
            >
              Base
            </h3>
          </div>

          {/* Right Side - Gray Connecting Line */}
          <div
            className="absolute"
            style={{
              right: '-80px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '80px',
              height: '2px',
              background: 'linear-gradient(90deg, rgba(156, 163, 175, 0.6), rgba(107, 114, 128, 0.3))',
              boxShadow: '0 0 10px rgba(156, 163, 175, 0.4)',
            }}
          />
        </div>

        {/* Three Diamonds Below Rectangle */}
        <div 
          className="flex items-start gap-12"
          style={{
            marginTop: '-12px',
          }}
        >
          {/* First Diamond - Middle ware */}
          <div className="flex flex-col items-center">
            <div
              style={{
                width: '24px',
                height: '24px',
                background: 'linear-gradient(135deg, rgba(75, 85, 99, 0.9), rgba(55, 65, 81, 0.8))',
                transform: 'rotate(45deg)',
                border: '1px solid rgba(156, 163, 175, 0.4)',
                boxShadow: '0 0 20px rgba(75, 85, 99, 0.5), 0 4px 12px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
              }}
            />
            <span
              style={{
                marginTop: '12px',
                fontSize: '14px',
                fontFamily: "'Inter', sans-serif",
                color: '#c0d0e0',
                fontWeight: '500',
                letterSpacing: '0.02em',
                textShadow: '0 0 10px rgba(255, 255, 255, 0.2)',
              }}
            >
              Middle ware
            </span>
          </div>

          {/* Second Diamond - Protocol */}
          <div 
            className="flex flex-col items-center" 
            ref={protocolDiamondRef}
            style={{
              marginLeft: '20px', // Adjust this value to move the diamond right (increase) or left (decrease)
            }}
          >
            <div 
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setShowProtocolModal(true);
              }}
            >
            <div
              style={{
                width: '24px',
                height: '24px',
                background: 'linear-gradient(135deg, rgba(75, 85, 99, 0.9), rgba(55, 65, 81, 0.8))',
                transform: 'rotate(45deg)',
                border: '1px solid rgba(156, 163, 175, 0.4)',
                boxShadow: '0 0 20px rgba(75, 85, 99, 0.5), 0 4px 12px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                transition: 'all 0.3s ease',
              }}
              className="hover:scale-110"
            />
            <span
              style={{
                marginTop: '12px',
                fontSize: '14px',
                fontFamily: "'Inter', sans-serif",
                color: '#c0d0e0',
                fontWeight: '500',
                letterSpacing: '0.02em',
                textShadow: '0 0 10px rgba(255, 255, 255, 0.2)',
                  display: 'block',
                  textAlign: 'center',
                }}
              >
                {selectedProtocol || 'Protocol'}
              </span>
            </div>

          </div>

          {/* Third Diamond - Smart contract */}
          <div className="flex flex-col items-center">
            <div
              style={{
                width: '24px',
                height: '24px',
                background: 'linear-gradient(135deg, rgba(75, 85, 99, 0.9), rgba(55, 65, 81, 0.8))',
                transform: 'rotate(45deg)',
                border: '1px solid rgba(156, 163, 175, 0.4)',
                boxShadow: '0 0 20px rgba(75, 85, 99, 0.5), 0 4px 12px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
              }}
            />
            <span
              style={{
                marginTop: '12px',
                fontSize: '14px',
                fontFamily: "'Inter', sans-serif",
                color: '#c0d0e0',
                fontWeight: '500',
                letterSpacing: '0.02em',
                textShadow: '0 0 10px rgba(255, 255, 255, 0.2)',
                whiteSpace: 'nowrap',
              }}
            >
              Smart contract
            </span>
          </div>
        </div>
      </div>

      {/* Dynamic Curved Connection Line - shown after protocol selection */}
      {selectedProtocol && (() => {
        const pathData = getCurvedPath();
        return (
          <svg
            className="absolute"
            style={{
              left: 0,
              top: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 5,
              overflow: 'visible',
            }}
          >
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: 'rgba(156, 163, 175, 0.6)', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: 'rgba(107, 114, 128, 0.3)', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
            <path
              d={pathData}
              stroke="url(#lineGradient)"
              strokeWidth="2"
              fill="none"
              style={{
                filter: 'drop-shadow(0 0 10px rgba(156, 163, 175, 0.4))',
              }}
            />
          </svg>
        );
      })()}

      {/* Draggable Circle with LayerZero Logo - shown after protocol selection */}
      {selectedProtocol && (
        <div
          className="absolute flex flex-col items-center"
          style={{
            left: `${circlePosition.x}px`,
            top: `${circlePosition.y}px`,
            cursor: isDraggingCircle ? 'grabbing' : 'grab',
            transition: isDraggingCircle ? 'none' : 'all 0.3s ease',
            zIndex: 10,
          }}
          onMouseDown={handleCircleMouseDown}
        >
          <div
            className="relative group"
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 0 20px rgba(255, 255, 255, 0.1), inset 0 0 20px rgba(255, 255, 255, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '12px',
            }}
          >
            {/* Delete Button - Top Right */}
            <button
              className="absolute opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-full p-1.5"
              style={{
                top: '-8px',
                right: '-8px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                backdropFilter: 'blur(10px)',
                zIndex: 20,
              }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedProtocol(null);
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
              }}
            >
              <svg 
                className="w-3 h-3" 
                fill="none" 
                stroke="#ef4444" 
                viewBox="0 0 24 24" 
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <img 
              src="/layerzerologo.png" 
              alt="LayerZero Logo"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                pointerEvents: 'none',
              }}
            />
          </div>
          
          {/* Title and Subtitle */}
          <div className="flex flex-col items-center" style={{ marginTop: '16px', pointerEvents: 'none' }}>
            <span
              style={{
                fontSize: '16px',
                fontFamily: "'Inter', sans-serif",
                color: '#ffffff',
                fontWeight: '600',
                letterSpacing: '0.02em',
                textShadow: '0 0 10px rgba(255, 255, 255, 0.3)',
              }}
            >
              Layer zero
            </span>
            <span
              style={{
                fontSize: '12px',
                fontFamily: "'Inter', sans-serif",
                color: '#9ca3af',
                fontWeight: '400',
                letterSpacing: '0.02em',
                marginTop: '4px',
              }}
            >
              Bridging
            </span>
          </div>
        </div>
      )}

      {/* Add font imports */}
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600&display=swap');
      `}</style>

      {/* Protocol Selection Modal */}
      {showProtocolModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(5px)',
          }}
          onClick={() => setShowProtocolModal(false)}
        >
          <div
            className="relative"
            style={{
              width: '400px',
              background: 'linear-gradient(135deg, rgba(30, 30, 40, 0.95), rgba(20, 20, 30, 0.95))',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '16px',
              padding: '32px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              style={{
                fontSize: '24px',
                fontWeight: 'bold',
                fontFamily: "'Inter', sans-serif",
                color: '#ffffff',
                marginBottom: '24px',
                textAlign: 'center',
              }}
            >
              Select Protocol
            </h2>

            <div className="flex flex-col gap-3">
              {protocols.map((protocol) => (
                <button
                  key={protocol}
                  className="w-full transition-all duration-200"
                  style={{
                    padding: '16px 24px',
                    background: selectedProtocol === protocol 
                      ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(37, 99, 235, 0.3))'
                      : 'linear-gradient(135deg, rgba(75, 85, 99, 0.2), rgba(55, 65, 81, 0.2))',
                    border: selectedProtocol === protocol
                      ? '1px solid rgba(59, 130, 246, 0.5)'
                      : '1px solid rgba(156, 163, 175, 0.3)',
                    borderRadius: '12px',
                    color: '#ffffff',
                    fontSize: '16px',
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: '500',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleProtocolSelect(protocol)}
                  onMouseEnter={(e) => {
                    if (selectedProtocol !== protocol) {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(75, 85, 99, 0.4), rgba(55, 65, 81, 0.4))';
                      e.currentTarget.style.borderColor = 'rgba(156, 163, 175, 0.5)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedProtocol !== protocol) {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(75, 85, 99, 0.2), rgba(55, 65, 81, 0.2))';
                      e.currentTarget.style.borderColor = 'rgba(156, 163, 175, 0.3)';
                    }
                  }}
                >
                  {protocol}
                </button>
              ))}
            </div>

            <button
              className="w-full mt-6 transition-all duration-200"
              style={{
                padding: '12px',
                background: 'rgba(156, 163, 175, 0.1)',
                border: '1px solid rgba(156, 163, 175, 0.3)',
                borderRadius: '8px',
                color: '#9ca3af',
                fontSize: '14px',
                fontFamily: "'Inter', sans-serif",
                cursor: 'pointer',
              }}
              onClick={() => setShowProtocolModal(false)}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(156, 163, 175, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(156, 163, 175, 0.1)';
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
