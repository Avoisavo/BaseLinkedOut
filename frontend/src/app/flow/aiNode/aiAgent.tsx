'use client';

import React, { useState } from 'react';

interface AIAgentNodeProps {
  id: string;
  position: { x: number; y: number };
  isDragging?: boolean;
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  onDelete: () => void;
  onAddConnection?: () => void;
  hasChildren?: boolean;
  data?: {
    chatModel?: string;
    memory?: string;
    remark?: string;
  };
}

  const chatModels = [
  { id: 'groq', name: 'Groq Chat Model', icon: 'g', color: '#ef4444' },
  { id: 'chatgpt', name: 'ChatGPT', icon: '⚡', color: '#10a37f' },
  { id: 'llama3', name: 'Llama 3', icon: '🦙', color: '#6366f1' },
  { id: 'claude', name: 'Claude', icon: '🤖', color: '#8b5cf6' },
];

const memoryOptions = [
  { id: 'mongodb', name: 'MongoDB', icon: '🍃', color: '#10aa50' },
  { id: 'redis', name: 'Redis', icon: '⚡', color: '#dc2626' },
  { id: 'postgresql', name: 'PostgreSQL', icon: '🐘', color: '#3b82f6' },
  { id: 'none', name: 'No Memory', icon: '∅', color: '#9ca3af' },
];

export default function AIAgentNode({ 
  id, 
  position, 
  isDragging, 
  onMouseDown, 
  onDelete,
  onAddConnection,
  hasChildren,
  data 
}: AIAgentNodeProps) {
  const [selectedModel, setSelectedModel] = useState(data?.chatModel || 'groq');
  const [selectedMemory, setSelectedMemory] = useState(data?.memory || 'none');
  const [remark, setRemark] = useState(data?.remark || '');
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showMemoryDropdown, setShowMemoryDropdown] = useState(false);

  const currentModel = chatModels.find(m => m.id === selectedModel) || chatModels[0];
  const currentMemory = memoryOptions.find(m => m.id === selectedMemory) || memoryOptions[3];

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
        {/* Main Node Card - Rectangle Shape */}
        <div
          className="relative transition-all duration-300 group"
          style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
            border: '2px solid rgba(139, 92, 246, 0.4)',
            width: '300px',
            minHeight: '440px',
            borderRadius: '20px',
            cursor: isDragging ? 'grabbing' : 'grab',
            backdropFilter: 'blur(20px)',
            boxShadow: `
              0 10px 40px rgba(0, 0, 0, 0.4),
              0 0 0 1px rgba(255, 255, 255, 0.05),
              inset 0 1px 0 rgba(255, 255, 255, 0.1),
              0 0 60px rgba(139, 92, 246, 0.15)
            `,
          }}
          onMouseDown={onMouseDown}
        >
          {/* Header Section */}
          <div
            className="px-5 py-4 flex items-center justify-center relative"
            style={{
              borderBottom: '1px solid rgba(139, 92, 246, 0.2)',
              background: 'linear-gradient(180deg, rgba(139, 92, 246, 0.08) 0%, transparent 100%)',
            }}
          >
            {/* AI Icon */}
            <div className="flex items-center gap-3">
            <div
                className="w-10 h-10 rounded-xl flex items-center justify-center relative overflow-hidden"
              style={{
                  background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                  boxShadow: '0 4px 14px rgba(139, 92, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                }}
              >
                <svg 
                  className="w-6 h-6 relative z-10" 
                  fill="white" 
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                </svg>
                {/* Glow effect */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.3), transparent)',
                }} />
            </div>
              <h3
                className="font-bold text-xl tracking-wide"
              style={{
                  color: '#e0e8f0',
                fontFamily: "'Orbitron', sans-serif",
                  textShadow: '0 0 20px rgba(139, 92, 246, 0.5)',
                  letterSpacing: '0.05em',
              }}
            >
                AI AGENT
              </h3>
      </div>

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
          </div>

          {/* Content Section */}
          <div className="p-5 space-y-5">
            {/* Chat Model Section */}
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <span
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{
                    color: '#a78bfa',
                    fontFamily: "'Orbitron', sans-serif",
                    letterSpacing: '0.1em',
                  }}
                >
                  Chat Model*
                </span>
              </div>
              
              {/* Model Selector */}
              <button
                className="w-full p-3 rounded-xl transition-all duration-300"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  background: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowModelDropdown(!showModelDropdown);
                  setShowMemoryDropdown(false);
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.5)';
                  e.currentTarget.style.background = 'rgba(30, 41, 59, 0.7)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                  e.currentTarget.style.background = 'rgba(30, 41, 59, 0.5)';
                }}
              >
                {/* Model Icon/Badge */}
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${currentModel.color}, ${currentModel.color}dd)`,
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: `0 4px 12px ${currentModel.color}50, inset 0 1px 0 rgba(255, 255, 255, 0.2)`,
                  }}
                >
                  <span
                    className="font-bold text-white"
                    style={{
                      fontSize: '15px',
                      fontFamily: "'Orbitron', sans-serif",
                    }}
                  >
                    {currentModel.icon}
                  </span>
                </div>
                
                {/* Model Name */}
                <div className="flex-1 text-left">
                  <span
                    className="text-sm font-medium"
                    style={{
                      color: '#e0e8f0',
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {currentModel.name}
                  </span>
                </div>

                {/* Dropdown Arrow */}
                <svg 
                  className="w-4 h-4" 
                  fill="none" 
                  stroke="#a78bfa" 
                  viewBox="0 0 24 24"
                  style={{
                    transform: showModelDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s',
                  }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showModelDropdown && (
                <div
                  className="absolute top-full left-0 right-0 mt-2 rounded-xl shadow-2xl z-50 overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%)',
                    border: '1px solid rgba(139, 92, 246, 0.4)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {chatModels.map((model, index) => (
                    <button
                      key={model.id}
                      className="w-full p-3 transition-all duration-200 flex items-center gap-3"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedModel(model.id);
                        setShowModelDropdown(false);
                      }}
                      style={{
                        borderBottom: index < chatModels.length - 1 ? '1px solid rgba(139, 92, 246, 0.2)' : 'none',
                        background: selectedModel === model.id ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
                      }}
                      onMouseEnter={(e) => {
                        if (selectedModel !== model.id) {
                          e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedModel !== model.id) {
                          e.currentTarget.style.background = 'transparent';
                        }
                      }}
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{
                          background: model.color,
                          boxShadow: `0 2px 8px ${model.color}50`,
                        }}
                      >
                        <span className="text-white text-xs font-bold">
                          {model.icon}
                        </span>
                      </div>
                      <span className="text-sm font-medium" style={{ color: '#e0e8f0', fontFamily: "'Inter', sans-serif" }}>
                        {model.name}
                      </span>
                      {selectedModel === model.id && (
                        <svg className="w-4 h-4 ml-auto" fill="none" stroke="#8b5cf6" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                </button>
                  ))}
              </div>
              )}
            </div>

            {/* Memory Section */}
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <span
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{
                    color: '#a78bfa',
                    fontFamily: "'Orbitron', sans-serif",
                    letterSpacing: '0.1em',
                  }}
                >
                  Memory
                </span>
              </div>
              
              {/* Memory Selector */}
                <button
                className="w-full p-3 rounded-xl transition-all duration-300"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  background: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMemoryDropdown(!showMemoryDropdown);
                  setShowModelDropdown(false);
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.5)';
                  e.currentTarget.style.background = 'rgba(30, 41, 59, 0.7)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                  e.currentTarget.style.background = 'rgba(30, 41, 59, 0.5)';
                }}
              >
                {/* Memory Icon */}
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: `${currentMemory.color}20`,
                    border: `1px solid ${currentMemory.color}`,
                    boxShadow: `0 2px 8px ${currentMemory.color}40`,
                  }}
                >
                  <span
                    style={{
                      fontSize: '17px',
                      color: currentMemory.color,
                    }}
                  >
                    {currentMemory.icon}
                  </span>
                </div>
                
                {/* Memory Name */}
                <div className="flex-1 text-left">
                  <span
                    className="text-sm font-medium"
                    style={{
                      color: '#e0e8f0',
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {currentMemory.name}
                  </span>
                </div>

                {/* Dropdown Arrow */}
                <svg 
                  className="w-4 h-4" 
                  fill="none" 
                  stroke="#a78bfa" 
                  viewBox="0 0 24 24"
                  style={{
                    transform: showMemoryDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s',
                  }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showMemoryDropdown && (
                <div
                  className="absolute top-full left-0 right-0 mt-2 rounded-xl shadow-2xl z-50 overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%)',
                    border: '1px solid rgba(139, 92, 246, 0.4)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {memoryOptions.map((memory, index) => (
                    <button
                      key={memory.id}
                      className="w-full p-3 transition-all duration-200 flex items-center gap-3"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedMemory(memory.id);
                        setShowMemoryDropdown(false);
                      }}
                      style={{
                        borderBottom: index < memoryOptions.length - 1 ? '1px solid rgba(139, 92, 246, 0.2)' : 'none',
                        background: selectedMemory === memory.id ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
                      }}
                      onMouseEnter={(e) => {
                        if (selectedMemory !== memory.id) {
                          e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedMemory !== memory.id) {
                          e.currentTarget.style.background = 'transparent';
                        }
                      }}
                    >
                      <div
                        className="w-7 h-7 rounded flex items-center justify-center"
                        style={{
                          background: `${memory.color}20`,
                          border: `1px solid ${memory.color}`,
                        }}
                      >
                        <span style={{ fontSize: '13px', color: memory.color }}>
                          {memory.icon}
                        </span>
                      </div>
                      <span className="text-sm font-medium" style={{ color: '#e0e8f0', fontFamily: "'Inter', sans-serif" }}>
                        {memory.name}
                      </span>
                      {selectedMemory === memory.id && (
                        <svg className="w-4 h-4 ml-auto" fill="none" stroke="#8b5cf6" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                </button>
                  ))}
              </div>
              )}
            </div>

            {/* Remark Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{
                    color: '#a78bfa',
                    fontFamily: "'Orbitron', sans-serif",
                    letterSpacing: '0.1em',
                  }}
                >
                  Remark
                </span>
              </div>
              
              {/* Remark Input */}
              <textarea
                className="w-full p-3 rounded-xl resize-none transition-all duration-300"
                placeholder="Add a remark or note..."
                rows={3}
                value={remark}
                onChange={(e) => {
                  e.stopPropagation();
                  setRemark(e.target.value);
                }}
                onClick={(e) => {
                  e.stopPropagation();
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.5)';
                  e.currentTarget.style.background = 'rgba(30, 41, 59, 0.7)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                  e.currentTarget.style.background = 'rgba(30, 41, 59, 0.5)';
                }}
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '13px',
                  color: '#e0e8f0',
                  background: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Connection Point - Left Side (Receiving) */}
          <div
            className="absolute"
            style={{
              left: '-18px',
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          >
            <div
              className="w-6 h-6 rounded-full transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                border: '2px solid rgba(139, 92, 246, 0.5)',
                boxShadow: '0 0 20px rgba(139, 92, 246, 0.6), 0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
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
                {/* Glow Circle */}
                <div
                  className="w-6 h-6 rounded-full transition-all duration-300"
                  style={{
                    background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                    border: '2px solid rgba(139, 92, 246, 0.5)',
                    boxShadow: '0 0 20px rgba(139, 92, 246, 0.6), 0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                  }}
                />
                
                {/* Connecting Line */}
                <div
                  style={{
                    width: '60px',
                    height: '2px',
                    background: 'linear-gradient(90deg, rgba(139, 92, 246, 0.6), rgba(139, 92, 246, 0.3))',
                    boxShadow: '0 0 10px rgba(139, 92, 246, 0.4)',
                  }}
                />

                {/* Plus Button */}
                <button
                className="flex items-center justify-center rounded-lg transition-all duration-300"
                  style={{
                    width: '34px',
                    height: '34px',
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.1))',
                    border: '2px solid rgba(139, 92, 246, 0.4)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 2px 8px rgba(139, 92, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddConnection?.();
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(139, 92, 246, 0.2))';
                    e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.1))';
                    e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.4)';
                  }}
              >
                <svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="#a78bfa" 
                  viewBox="0 0 24 24" 
                  strokeWidth={2.5}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            )}
        </div>

        {/* Text Below Card */}
        <div className="mt-5 text-center">
          <h3
            className="font-bold mb-1 tracking-wide"
            style={{
              color: '#e0e8f0',
              fontFamily: "'Orbitron', sans-serif",
              fontSize: '15px',
              textShadow: '0 0 10px rgba(139, 92, 246, 0.3)',
              letterSpacing: '0.05em',
            }}
          >
            AI AGENT
          </h3>
          <p
            className="text-xs"
            style={{
              color: '#a78bfa',
              fontFamily: "'Inter', sans-serif",
              fontWeight: '400',
            }}
          >
            {currentModel.name} • {currentMemory.name}
          </p>
        </div>
      </div>
    </div>
  );
}

// Add Orbitron font import
if (typeof document !== 'undefined') {
  const link = document.createElement('link');
  link.href = 'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600&display=swap';
  link.rel = 'stylesheet';
  if (!document.querySelector(`link[href="${link.href}"]`)) {
    document.head.appendChild(link);
  }
}

