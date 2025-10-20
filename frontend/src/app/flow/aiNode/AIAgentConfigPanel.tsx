'use client';

import { useState } from 'react';
import TelegramCredentialModal from '../triggerNode/TelegramCredentialModal';

interface AIAgentConfigPanelProps {
  isOpen: boolean;
  onClose: () => void;
  nodeData?: {
    chatModel?: string;
    memory?: string;
    remark?: string;
    prompt?: string;
    parentNode?: {
      type: string;
      data: any;
      name: string;
    };
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
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState(false);
  const [telegramOutput, setTelegramOutput] = useState<any>(null);
  const [isLoadingOutput, setIsLoadingOutput] = useState(false);

  if (!isOpen) return null;

  // Execute previous node - fetch real data from Telegram
  const handleExecutePreviousNode = () => {
    if (nodeData?.parentNode?.type === 'telegram-trigger') {
      // If we already have the bot token from parent, fetch updates
      if (nodeData.parentNode.data.botToken) {
        fetchTelegramUpdates(nodeData.parentNode.data.botToken);
      } else {
        // Otherwise, open modal to get token
        setIsTelegramModalOpen(true);
      }
    }
  };

  // Fetch actual Telegram updates
  const fetchTelegramUpdates = async (token: string) => {
    setIsLoadingOutput(true);
    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/getUpdates?limit=1&offset=-1`);
      const data = await response.json();
      
      if (data.ok && data.result && data.result.length > 0) {
        setTelegramOutput(data.result[0]);
      } else {
        setTelegramOutput({ 
          message: 'No messages yet. Send a message to your bot to see data here.',
          isEmpty: true 
        });
      }
    } catch (error) {
      console.error('Error fetching Telegram updates:', error);
      setTelegramOutput({ 
        error: 'Failed to fetch Telegram data. Please check your bot token.',
        isEmpty: true 
      });
    } finally {
      setIsLoadingOutput(false);
    }
  };

  // Handle Telegram credential submission
  const handleTelegramSubmit = (token: string, botInfo: any) => {
    setIsTelegramModalOpen(false);
    fetchTelegramUpdates(token);
  };

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

          <div className="flex-1 p-6 overflow-y-auto">
            {nodeData?.parentNode ? (
              <div
                className="p-4 rounded-lg border border-gray-300 bg-white"
                style={{
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
                  <div
                    className="w-6 h-6 rounded flex items-center justify-center"
                    style={{
                      background: nodeData.parentNode.type === 'telegram-trigger' 
                        ? 'linear-gradient(135deg, #10b981, #059669)' 
                        : 'linear-gradient(135deg, #6366f1, #4f46e5)',
                    }}
                  >
                    {nodeData.parentNode.type === 'telegram-trigger' ? (
                      <svg className="w-4 h-4" fill="white" viewBox="0 0 24 24">
                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.654-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="white" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold" style={{ color: '#6b7280' }}>
                      INPUT FROM
                    </p>
                    <p className="text-sm font-bold" style={{ color: '#1f2937' }}>
                      {nodeData.parentNode.name}
                    </p>
                  </div>
                  {!telegramOutput && (
                    <button
                      onClick={handleExecutePreviousNode}
                      disabled={isLoadingOutput}
                      className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                      style={{
                        color: '#374151',
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      {isLoadingOutput ? 'Loading...' : 'Execute'}
                    </button>
                  )}
                </div>

                {nodeData.parentNode.type === 'telegram-trigger' && (
                  <div className="space-y-2">
                    {/* Bot Info */}
                    {nodeData.parentNode.data.botInfo && (
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-xs font-semibold text-gray-500 mb-1">Bot Info</p>
                        <p className="text-sm font-medium text-gray-900">
                          @{nodeData.parentNode.data.botInfo.username || 'bot'}
                        </p>
                        <p className="text-xs text-gray-600">
                          {nodeData.parentNode.data.botInfo.first_name || 'Telegram Bot'}
                        </p>
                      </div>
                    )}
                    
                    {/* Trigger Type */}
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-xs font-semibold text-gray-500 mb-1">Trigger Type</p>
                      <p className="text-sm font-medium text-gray-900">
                        {nodeData.parentNode.data.triggerType?.replace(/-/g, ' ').toUpperCase() || 'MESSAGE'}
                      </p>
                    </div>

                    {/* Actual Output Data from Telegram */}
                    {telegramOutput && !telegramOutput.isEmpty ? (
                      <div className="bg-green-50 p-3 rounded border border-green-200">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-semibold text-green-700">Live Data</p>
                          <button
                            onClick={handleExecutePreviousNode}
                            className="text-xs text-green-700 hover:underline"
                          >
                            Refresh
                          </button>
                        </div>
                        <div className="bg-white p-2 rounded text-xs font-mono overflow-auto max-h-48">
                          <pre className="text-gray-800 whitespace-pre-wrap">
                            {JSON.stringify(telegramOutput, null, 2)}
                          </pre>
                        </div>
                        {telegramOutput.message && (
                          <div className="mt-2 space-y-1">
                            <p className="text-xs text-green-800">
                              <strong>Message:</strong> {telegramOutput.message.text || 'N/A'}
                            </p>
                            <p className="text-xs text-green-800">
                              <strong>From:</strong> @{telegramOutput.message.from?.username || 'Unknown'}
                            </p>
                            <p className="text-xs text-green-800">
                              <strong>Chat ID:</strong> {telegramOutput.message.chat?.id || 'N/A'}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : telegramOutput?.isEmpty ? (
                      <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                        <p className="text-xs text-yellow-800">
                          {telegramOutput.message || telegramOutput.error}
                        </p>
                        <button
                          onClick={handleExecutePreviousNode}
                          className="mt-2 text-xs text-yellow-700 hover:underline font-medium"
                        >
                          Try Again
                        </button>
                      </div>
                    ) : (
                      <div className="bg-blue-50 p-3 rounded border border-blue-200">
                        <p className="text-xs font-semibold text-blue-700 mb-1">Available Data Fields</p>
                        <code className="text-xs text-blue-900 block">
                          {'{{ $json.message.text }}'}
                        </code>
                        <code className="text-xs text-blue-900 block mt-1">
                          {'{{ $json.message.from.username }}'}
                        </code>
                        <code className="text-xs text-blue-900 block mt-1">
                          {'{{ $json.message.chat.id }}'}
                        </code>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
            <div
              className="p-4 rounded-lg border border-gray-300 bg-white"
              style={{
                fontFamily: "'Inter', sans-serif",
              }}
            >
              <p className="text-sm text-gray-600 mb-2">No input data yet</p>
              <button
                  onClick={handleExecutePreviousNode}
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
            )}
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
                      placeholder={nodeData?.parentNode?.type === 'telegram-trigger' 
                        ? "From the telegram message {{ $json.message.text }}, extract what the user wants to do. Does the user want to swap or bridge? Reply with one word only."
                        : "Enter your prompt here. Use {{ $json.field }} to reference data from previous nodes."}
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

          <div className="flex-1 p-6 overflow-y-auto">
            <div
              className="rounded-lg border border-gray-300 bg-white"
              style={{
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {telegramOutput && !telegramOutput.isEmpty ? (
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <svg className="w-5 h-5" fill="#10b981" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Input Data Retrieved</p>
                      <p className="text-xs text-gray-500">Ready to process with AI Agent</p>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-3 rounded border border-blue-200 mb-3">
                    <p className="text-xs font-semibold text-blue-700 mb-1">Sample Output Format</p>
                    <p className="text-xs text-blue-900">
                      The AI Agent will analyze the input and return a response based on your prompt configuration.
                    </p>
                  </div>

                  {telegramOutput.message?.text && (
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-xs font-semibold text-gray-600 mb-1">User Message</p>
                      <p className="text-sm text-gray-900">&quot;{telegramOutput.message.text}&quot;</p>
                      <p className="text-xs text-gray-500 mt-2">
                        → Will be processed by AI Agent
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6">
                  <div className="text-center mb-4">
                    <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="#9ca3af" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-sm text-gray-600 mb-2">Execute previous node to view AI response</p>
                  </div>
                  
                  {nodeData?.parentNode && (
                    <div className="bg-blue-50 p-3 rounded border border-blue-200">
                      <p className="text-xs font-semibold text-blue-700 mb-1">Expected Output</p>
                      <p className="text-xs text-blue-900">
                        AI Agent will process the input from <strong>{nodeData.parentNode.name}</strong> and return a response based on your prompt.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Telegram Credential Modal */}
      <TelegramCredentialModal
        isOpen={isTelegramModalOpen}
        onClose={() => setIsTelegramModalOpen(false)}
        onSubmit={handleTelegramSubmit}
      />
    </div>
  );
}

