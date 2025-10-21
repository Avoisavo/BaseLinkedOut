'use client';

import React from 'react';

interface PythNodeProps {
  id: string;
  position: { x: number; y: number };
  isDragging?: boolean;
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  onDelete: () => void;
  onAddConnection?: () => void;
  hasChildren?: boolean;
  data?: {
    icon?: string;
    color?: string;
  };
}

export default function PythNode({ 
  id, 
  position, 
  isDragging, 
  onMouseDown, 
  onDelete,
  onAddConnection,
  hasChildren,
  data 
}: PythNodeProps) {
  return (
    <div
      className="absolute hover:shadow-2xl"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -50%)',
        transition: isDragging ? 'none' : 'all 0.2s',
        pointerEvents: isDragging ? 'none' : 'auto',
      }}
    >
      <div className="flex flex-col items-center">
        {/* Main Node Card - Rounded Square */}
        <div
          className="relative shadow-lg transition-all hover:shadow-xl group"
          style={{
            background: 'white',
            border: '3px solid #9ca3af',
            width: '160px',
            height: '160px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '32px',
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
          onMouseDown={onMouseDown}
          title="Double-click to configure"
        >
          {/* Delete Button - Top Right */}
          <button
            className="absolute opacity-0 hover:opacity-100 transition-opacity rounded-full p-1 hover:bg-red-50"
            style={{
              top: '8px',
              right: '8px',
              zIndex: 10,
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="#ef4444" 
              viewBox="0 0 24 24"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Pyth Logo - Center */}
          <div
            className="flex items-center justify-center"
            style={{
              width: '120px',
              height: '120px',
              cursor: 'pointer',
            }}
          >
            <img 
              src="/pythlogo.png" 
              alt="Pyth Oracle"
              className="w-full h-full object-contain"
              style={{
                pointerEvents: 'none',
              }}
            />
          </div>

          {/* Connection Point - Left Side (Receiving) */}
          <div
            className="absolute"
            style={{
              left: '-10px',
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          >
            <div
              className="w-5 h-5 rounded-full"
              style={{
                background: '#6b7280',
                border: '3px solid white',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
              }}
            />
          </div>

          {/* Connection Point - Right Side */}
          {!hasChildren && (
            <div
              className="absolute flex items-center"
              style={{
                right: '-100px',
                top: '50%',
                transform: 'translateY(-50%)',
              }}
            >
              {/* Gray Circle */}
              <div
                className="w-5 h-5 rounded-full"
                style={{
                  background: '#6b7280',
                  border: '3px solid white',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
                }}
              />

              {/* Connecting Line */}
              <div
                style={{
                  width: '60px',
                  height: '3px',
                  background: '#9ca3af',
                }}
              />

              {/* Plus Button */}
              <button
                className="flex items-center justify-center rounded-lg transition-all hover:bg-gray-200"
                style={{
                  width: '32px',
                  height: '32px',
                  background: 'white',
                  border: '2px solid #9ca3af',
                }}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  onAddConnection?.();
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="#6b7280" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Text Below Card */}
        <div className="mt-4 text-center">
          <h3
            className="font-semibold mb-1"
            style={{
              color: '#4b5563',
              fontFamily: "'Inter', sans-serif",
              fontSize: '16px',
            }}
          >
            Pyth Oracle
          </h3>
          <p
            className="text-sm"
            style={{
              color: '#9ca3af',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Price feed data
          </p>
        </div>
      </div>
    </div>
  );
}

