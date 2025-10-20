'use client';

import { useState } from 'react';

interface AIAgentConfigPanelProps {
  isOpen: boolean;
  onClose: () => void;
  nodeData?: {
    chatModel?: string;
    memory?: string;
    remark?: string;
    prompt?: string;
  };
  onSave?: (data: any) => void;
}

export default function AIAgentConfigPanel({ 
  isOpen, 
  onClose, 
  nodeData,
  onSave 
}: AIAgentConfigPanelProps) {
  const [activeTab, setActiveTab] = useState<'parameters' | 'settings'>('parameters');
  const [prompt, setPrompt] = useState(nodeData?.prompt || '');
  const [outputFormat, setOutputFormat] = useState(false);
  const [fallbackMode, setFallbackMode] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    if (onSave) {
      onSave({
        ...nodeData,
        prompt,
        outputFormat,
        fallbackMode,
      });
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        className="relative flex"
        style={{
          width: '95%',
          maxWidth: '1600px',
          height: '90vh',
          background: 'white',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Panel - INPUT */}
        <div
          className="flex flex-col"
          style={{
            width: '280px',
            background: '#f9fafb',
            borderRight: '1px solid #e5e7eb',
          }}
        >
          <div
            className="px-6 py-4"
            style={{
              borderBottom: '1px solid #e5e7eb',
              background: 'white',
            }}
          >
            <h2
              className="text-lg font-bold"
              style={{
                color: '#1f2937',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              INPUT
            </h2>
          </div>

          <div className="flex-1 p-6">
            <div
              className="p-4 rounded-lg border border-gray-300 bg-white"
              style={{
                fontFamily: "'Inter', sans-serif",
              }}
            >
              <p className="text-sm text-gray-600 mb-2">No input data yet</p>
              <button
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50 transition-colors"
                style={{
                  color: '#374151',
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Execute previous nodes
              </button>
              <p className="text-xs text-gray-500 mt-2">
                (From the earliest node that needs it ⓘ)
              </p>
            </div>
          </div>
        </div>

        {/* Middle Panel - CONFIGURATION */}
        <div
          className="flex-1 flex flex-col"
          style={{
            background: 'white',
          }}
        >
          {/* Header */}
          <div
            className="px-6 py-4 flex items-center justify-between"
            style={{
              borderBottom: '1px solid #e5e7eb',
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                }}
              >
                <svg 
                  className="w-6 h-6" 
                  fill="white" 
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                </svg>
              </div>
              <h2
                className="text-xl font-bold"
                style={{
                  color: '#1f2937',
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                AI Agent
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                className="px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                style={{
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: 'white',
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Execute step
              </button>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="#6b7280" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div
            className="flex px-6"
            style={{
              borderBottom: '1px solid #e5e7eb',
            }}
          >
            <button
              className="px-4 py-3 font-semibold transition-colors"
              style={{
                color: activeTab === 'parameters' ? '#ef4444' : '#6b7280',
                borderBottom: activeTab === 'parameters' ? '2px solid #ef4444' : '2px solid transparent',
                fontFamily: "'Inter', sans-serif",
              }}
              onClick={() => setActiveTab('parameters')}
            >
              Parameters
            </button>
            <button
              className="px-4 py-3 font-semibold transition-colors"
              style={{
                color: activeTab === 'settings' ? '#ef4444' : '#6b7280',
                borderBottom: activeTab === 'settings' ? '2px solid #ef4444' : '2px solid transparent',
                fontFamily: "'Inter', sans-serif",
              }}
              onClick={() => setActiveTab('settings')}
            >
              Settings
            </button>
            <a
              href="#"
              className="ml-auto px-4 py-3 font-semibold flex items-center gap-1"
              style={{
                color: '#6b7280',
                fontFamily: "'Inter', sans-serif",
                fontSize: '14px',
              }}
            >
              Docs
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'parameters' && (
              <div className="max-w-3xl space-y-6">
                {/* Info Banner */}
                <div
                  className="p-4 rounded-lg flex items-start gap-3"
                  style={{
                    background: '#dbeafe',
                    border: '1px solid #93c5fd',
                  }}
                >
                  <svg className="w-5 h-5 mt-0.5" fill="#3b82f6" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#1e40af' }}>
                      Tip: Get a feel for agents with our quick{' '}
                      <a href="#" className="underline">tutorial</a>
                      {' '}or see an{' '}
                      <a href="#" className="underline">example</a>
                      {' '}of how this node works
                    </p>
                    <button className="text-blue-600 text-sm mt-1">×</button>
                  </div>
                </div>

                {/* Source for Prompt */}
                <div>
                  <label
                    className="block text-sm font-semibold mb-2"
                    style={{
                      color: '#374151',
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    Source for Prompt (User Message)
                  </label>
                  <select
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '14px',
                    }}
                  >
                    <option>Define below</option>
                    <option>From previous node</option>
                  </select>
                </div>

                {/* Prompt Editor */}
                <div>
                  <label
                    className="block text-sm font-semibold mb-2"
                    style={{
                      color: '#374151',
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    Prompt (User Message)
                  </label>
                  <div
                    className="relative rounded-lg border border-gray-300 bg-gray-50"
                    style={{
                      minHeight: '200px',
                    }}
                  >
                    <textarea
                      className="w-full h-full p-4 bg-transparent resize-none focus:outline-none"
                      placeholder="from the telegram {{ $json.message.text }}, extract from the sentence, user want to swap or bridge?one word reply only"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      style={{
                        fontFamily: "'Monaco', 'Courier New', monospace",
                        fontSize: '13px',
                        color: '#1f2937',
                        minHeight: '180px',
                      }}
                    />
                    <div
                      className="absolute bottom-2 right-2 flex items-center gap-2"
                    >
                      <button
                        className="p-2 rounded hover:bg-gray-200 transition-colors"
                        title="Add expression"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="#6b7280" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Use {'{{'} and {'}}'}  to reference data from previous nodes
                  </p>
                </div>

                {/* Require Specific Output Format */}
                <div className="flex items-center justify-between p-4 rounded-lg border border-gray-300">
                  <div>
                    <label
                      className="block text-sm font-semibold"
                      style={{
                        color: '#374151',
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      Require Specific Output Format
                    </label>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={outputFormat}
                      onChange={(e) => setOutputFormat(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* Enable Fallback Model */}
                <div className="flex items-center justify-between p-4 rounded-lg border border-gray-300">
                  <div>
                    <label
                      className="block text-sm font-semibold"
                      style={{
                        color: '#374151',
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      Enable Fallback Model
                    </label>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={fallbackMode}
                      onChange={(e) => setFallbackMode(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* Options */}
                <div>
                  <label
                    className="block text-sm font-semibold mb-2"
                    style={{
                      color: '#374151',
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    Options
                  </label>
                  <div className="p-4 rounded-lg border border-gray-300 text-center">
                    <p className="text-sm text-gray-500 mb-3">No properties</p>
                    <select
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none"
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '14px',
                      }}
                    >
                      <option>Add Option</option>
                    </select>
                  </div>
                </div>

                {/* Model Selection */}
                <div
                  className="p-6 rounded-lg"
                  style={{
                    background: '#f9fafb',
                    border: '1px solid #e5e7eb',
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold" style={{ color: '#374151' }}>
                        Chat Model
                      </span>
                      <span className="text-red-500">*</span>
                    </div>
                    <div
                      className="px-3 py-1 rounded-full text-xs font-semibold"
                      style={{
                        background: '#fee2e2',
                        color: '#dc2626',
                      }}
                    >
                      9
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mb-4">
                    The chat model to use for the agent
                  </p>
                  <button
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50 transition-colors text-left"
                    style={{
                      color: '#374151',
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    + Add model
                  </button>
                </div>

                {/* Memory */}
                <div
                  className="p-6 rounded-lg"
                  style={{
                    background: '#f9fafb',
                    border: '1px solid #e5e7eb',
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold" style={{ color: '#374151' }}>
                      Memory
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-4">
                    Memory to use for the agent
                  </p>
                  <button
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50 transition-colors text-left"
                    style={{
                      color: '#374151',
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    + Add memory
                  </button>
                </div>

                {/* Tool */}
                <div
                  className="p-6 rounded-lg"
                  style={{
                    background: '#f9fafb',
                    border: '1px solid #e5e7eb',
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold" style={{ color: '#374151' }}>
                      Tool
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-4">
                    Tools that the agent can use
                  </p>
                  <button
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50 transition-colors text-left"
                    style={{
                      color: '#374151',
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    + Add tool
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="max-w-3xl">
                <p className="text-gray-500">Settings panel coming soon...</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - OUTPUT */}
        <div
          className="flex flex-col"
          style={{
            width: '350px',
            background: '#f9fafb',
            borderLeft: '1px solid #e5e7eb',
          }}
        >
          <div
            className="px-6 py-4"
            style={{
              borderBottom: '1px solid #e5e7eb',
              background: 'white',
            }}
          >
            <h2
              className="text-lg font-bold"
              style={{
                color: '#1f2937',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              OUTPUT
            </h2>
            <button
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100"
              title="Edit"
            >
              <svg className="w-5 h-5" fill="none" stroke="#6b7280" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          </div>

          <div className="flex-1 p-6">
            <div
              className="p-6 rounded-lg border border-gray-300 bg-white text-center"
              style={{
                fontFamily: "'Inter', sans-serif",
              }}
            >
              <p className="text-sm text-gray-600 mb-2">Execute this node to view data</p>
              <p className="text-sm mb-4">or</p>
              <button
                className="text-sm font-medium hover:underline"
                style={{
                  color: '#ef4444',
                }}
              >
                set mock data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

