'use client';

import { useState } from 'react';
import { verifyTelegramBot } from '../src/lib/telegram';

interface TelegramCredentialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (botToken: string, botInfo: any) => void;
}

export default function TelegramCredentialModal({ isOpen, onClose, onSubmit }: TelegramCredentialModalProps) {
  const [botToken, setBotToken] = useState('');
  const [credentialName, setCredentialName] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!botToken.trim()) return;

    setIsVerifying(true);
    setError('');
    setSuccess(false);

    // Verify the bot token
    const result = await verifyTelegramBot(botToken.trim());

    if (result.success && result.data) {
      setSuccess(true);
      setTimeout(() => {
        onSubmit(botToken.trim(), result.data);
        setBotToken('');
        setCredentialName('');
        setIsVerifying(false);
        setSuccess(false);
        setError('');
      }, 1000);
    } else {
      setError(result.error || 'Failed to verify bot token');
      setIsVerifying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
        onClick={onClose}
        style={{ backdropFilter: 'blur(3px)' }}
      >
        {/* Modal */}
        <div
          className="relative rounded-lg shadow-2xl"
          style={{
            width: '500px',
            maxWidth: '90vw',
            background: 'white',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="px-6 py-4 border-b flex items-center justify-between"
            style={{ borderColor: 'rgba(0, 0, 0, 0.1)' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #0088cc, #00a0e9)',
                }}
              >
                <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.654-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
                </svg>
              </div>
              <h2
                className="text-xl font-semibold"
                style={{
                  color: '#1f2937',
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Connect Telegram Bot
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              style={{ color: '#6b7280' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-6">
            <p
              className="mb-6 text-sm"
              style={{
                color: '#6b7280',
                fontFamily: "'Inter', sans-serif",
                lineHeight: '1.6',
              }}
            >
              To connect your Telegram bot, you'll need to provide the bot token. You can get this from{' '}
              <a
                href="https://t.me/botfather"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                @BotFather
              </a>
              {' '}on Telegram.
            </p>

            {/* Credential Name */}
            <div className="mb-4">
              <label
                className="block text-sm font-medium mb-2"
                style={{
                  color: '#374151',
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Credential Name (Optional)
              </label>
              <input
                type="text"
                value={credentialName}
                onChange={(e) => setCredentialName(e.target.value)}
                placeholder="My Telegram Bot"
                className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                style={{
                  borderColor: 'rgba(0, 0, 0, 0.2)',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '14px',
                }}
              />
            </div>

            {/* Bot Token */}
            <div className="mb-6">
              <label
                className="block text-sm font-medium mb-2"
                style={{
                  color: '#374151',
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Bot Token <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                value={botToken}
                onChange={(e) => {
                  setBotToken(e.target.value);
                  setError('');
                }}
                placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                style={{
                  borderColor: error ? '#ef4444' : success ? '#10b981' : 'rgba(0, 0, 0, 0.2)',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '14px',
                }}
                disabled={isVerifying}
              />
              {error && (
                <p
                  className="mt-2 text-xs flex items-center gap-1"
                  style={{
                    color: '#ef4444',
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </p>
              )}
              {success && (
                <p
                  className="mt-2 text-xs flex items-center gap-1"
                  style={{
                    color: '#10b981',
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Bot verified successfully!
                </p>
              )}
              {!error && !success && (
                <p
                  className="mt-2 text-xs"
                  style={{
                    color: '#9ca3af',
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  The bot token should look like: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz
                </p>
              )}
            </div>

            {/* Info Box */}
            <div
              className="p-4 rounded-lg mb-6"
              style={{
                background: 'rgba(59, 130, 246, 0.05)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
              }}
            >
              <div className="flex gap-3">
                <svg
                  className="w-5 h-5 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  style={{ color: '#3b82f6' }}
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <p
                    className="text-sm font-medium mb-1"
                    style={{
                      color: '#1f2937',
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    How to get your bot token:
                  </p>
                  <ol
                    className="text-xs space-y-1 list-decimal ml-4"
                    style={{
                      color: '#4b5563',
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    <li>Open Telegram and search for @BotFather</li>
                    <li>Send the command /newbot or /mybots</li>
                    <li>Follow the instructions to create or manage your bot</li>
                    <li>Copy the bot token provided by BotFather</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            className="px-6 py-4 border-t flex items-center justify-end gap-3"
            style={{ borderColor: 'rgba(0, 0, 0, 0.1)' }}
          >
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg font-medium transition-all"
              style={{
                background: 'transparent',
                border: '1px solid rgba(0, 0, 0, 0.2)',
                color: '#374151',
                fontFamily: "'Inter', sans-serif",
                fontSize: '14px',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!botToken.trim() || isVerifying}
              className="px-5 py-2.5 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              style={{
                background: botToken.trim() && !isVerifying ? 'linear-gradient(135deg, #0088cc, #00a0e9)' : '#d1d5db',
                color: 'white',
                fontFamily: "'Inter', sans-serif",
                fontSize: '14px',
              }}
            >
              {isVerifying && (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {isVerifying ? 'Verifying...' : success ? 'Verified!' : 'Connect Bot'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

