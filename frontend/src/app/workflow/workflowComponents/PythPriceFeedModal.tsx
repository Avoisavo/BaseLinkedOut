'use client';

import { useState, useEffect } from 'react';

interface PriceData {
  id: string;
  price: {
    price: string;
    conf: string;
    expo: number;
    publish_time: number;
  };
  ema_price: {
    price: string;
    conf: string;
    expo: number;
    publish_time: number;
  };
}

interface PythPriceFeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: (priceData: PriceData) => void;
}

export default function PythPriceFeedModal({ isOpen, onClose, onConfirm }: PythPriceFeedModalProps) {
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  // ETH/USD price feed ID
  const ETH_USD_PRICE_FEED_ID = '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace';
  const HERMES_URL = 'https://hermes.pyth.network';

  const fetchLatestPrice = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `${HERMES_URL}/v2/updates/price/latest?ids[]=${ETH_USD_PRICE_FEED_ID}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch price data');
      }
      
      const data = await response.json();
      
      if (data.parsed && data.parsed.length > 0) {
        setPriceData(data.parsed[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const startStreaming = () => {
    setIsStreaming(true);
    setError(null);
    
    const eventSource = new EventSource(
      `${HERMES_URL}/v2/updates/price/stream?ids[]=${ETH_USD_PRICE_FEED_ID}`
    );

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.parsed && data.parsed.length > 0) {
          setPriceData(data.parsed[0]);
        }
      } catch (err) {
        console.error('Error parsing price update:', err);
      }
    };

    eventSource.onerror = (error) => {
      console.error('EventSource error:', error);
      setError('Connection error. Retrying...');
      eventSource.close();
      setIsStreaming(false);
    };

    return eventSource;
  };

  useEffect(() => {
    let eventSource: EventSource | null = null;

    if (isOpen) {
      // Fetch initial price
      fetchLatestPrice();
      
      // Start streaming updates after initial fetch
      setTimeout(() => {
        if (isOpen && !isStreaming) {
          eventSource = startStreaming();
        }
      }, 1000);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
      setIsStreaming(false);
    };
  }, [isOpen]);

  const formatPrice = (price: string, expo: number): string => {
    const priceNum = parseFloat(price) * Math.pow(10, expo);
    return priceNum.toFixed(2);
  };

  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const handleConfirm = () => {
    if (priceData && onConfirm) {
      onConfirm(priceData);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div 
        className="relative w-full max-w-2xl mx-4 rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(30, 30, 36, 0.98), rgba(40, 40, 48, 0.98))',
          border: '1px solid rgba(150, 180, 220, 0.3)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Header */}
        <div 
          className="px-6 py-4 border-b flex items-center justify-between"
          style={{
            borderColor: 'rgba(150, 180, 220, 0.2)',
          }}
        >
          <div className="flex items-center gap-3">
            <img src="/pythlogo.png" alt="Pyth" className="w-8 h-8" />
            <h2 className="text-xl font-bold" style={{ color: '#e0e8f0' }}>
              Pyth Price Feed - ETH/USD
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
            style={{
              background: 'rgba(255, 100, 100, 0.2)',
              color: '#ff6b6b',
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading && !priceData && (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <svg className="w-10 h-10 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#8a9fb5' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span style={{ color: '#8a9fb5' }}>Fetching price data...</span>
              </div>
            </div>
          )}

          {error && !priceData && (
            <div 
              className="p-4 rounded-lg mb-4"
              style={{
                background: 'rgba(255, 100, 100, 0.1)',
                border: '1px solid rgba(255, 100, 100, 0.3)',
                color: '#ff6b6b',
              }}
            >
              {error}
            </div>
          )}

          {priceData && (
            <div className="space-y-6">
              {/* Live Status Indicator */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full animate-pulse"
                    style={{
                      background: isStreaming ? '#4ade80' : '#8a9fb5',
                      boxShadow: isStreaming ? '0 0 10px #4ade80' : 'none',
                    }}
                  />
                  <span style={{ color: '#8a9fb5', fontSize: '14px' }}>
                    {isStreaming ? 'Live Streaming' : 'Static Data'}
                  </span>
                </div>
                <button
                  onClick={fetchLatestPrice}
                  className="px-3 py-1 rounded-lg text-sm transition-all hover:scale-105"
                  style={{
                    background: 'rgba(100, 150, 200, 0.2)',
                    border: '1px solid rgba(150, 180, 220, 0.3)',
                    color: '#8ab4f8',
                  }}
                >
                  Refresh
                </button>
              </div>

              {/* Current Price */}
              <div 
                className="p-6 rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(100, 150, 200, 0.1), rgba(80, 120, 180, 0.15))',
                  border: '1px solid rgba(150, 180, 220, 0.2)',
                }}
              >
                <div className="text-sm mb-2" style={{ color: '#8a9fb5' }}>Current Price</div>
                <div className="text-4xl font-bold mb-1" style={{ color: '#e0e8f0' }}>
                  ${formatPrice(priceData.price.price, priceData.price.expo)}
                </div>
                <div className="text-sm" style={{ color: '#8a9fb5' }}>
                  ± ${formatPrice(priceData.price.conf, priceData.price.expo)} confidence
                </div>
              </div>

              {/* EMA Price */}
              <div 
                className="p-4 rounded-xl"
                style={{
                  background: 'rgba(40, 40, 48, 0.5)',
                  border: '1px solid rgba(150, 180, 220, 0.2)',
                }}
              >
                <div className="text-sm mb-2" style={{ color: '#8a9fb5' }}>
                  Exponential Moving Average (EMA)
                </div>
                <div className="text-2xl font-bold mb-1" style={{ color: '#e0e8f0' }}>
                  ${formatPrice(priceData.ema_price.price, priceData.ema_price.expo)}
                </div>
                <div className="text-sm" style={{ color: '#8a9fb5' }}>
                  ± ${formatPrice(priceData.ema_price.conf, priceData.ema_price.expo)} confidence
                </div>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4">
                <div 
                  className="p-3 rounded-lg"
                  style={{
                    background: 'rgba(40, 40, 48, 0.5)',
                    border: '1px solid rgba(150, 180, 220, 0.2)',
                  }}
                >
                  <div className="text-xs mb-1" style={{ color: '#8a9fb5' }}>Last Updated</div>
                  <div className="text-sm font-semibold" style={{ color: '#e0e8f0' }}>
                    {formatTimestamp(priceData.price.publish_time)}
                  </div>
                </div>
                <div 
                  className="p-3 rounded-lg"
                  style={{
                    background: 'rgba(40, 40, 48, 0.5)',
                    border: '1px solid rgba(150, 180, 220, 0.2)',
                  }}
                >
                  <div className="text-xs mb-1" style={{ color: '#8a9fb5' }}>Price Feed ID</div>
                  <div className="text-xs font-mono truncate" style={{ color: '#e0e8f0' }}>
                    {priceData.id}
                  </div>
                </div>
              </div>

              {/* Info Banner */}
              <div 
                className="p-3 rounded-lg"
                style={{
                  background: 'rgba(138, 180, 248, 0.1)',
                  border: '1px solid rgba(138, 180, 248, 0.2)',
                }}
              >
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#8ab4f8' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm" style={{ color: '#8ab4f8' }}>
                    Price data is provided by Pyth Network's Hermes service. Prices update in real-time and include confidence intervals.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div 
          className="px-6 py-4 border-t flex justify-end gap-3"
          style={{
            borderColor: 'rgba(150, 180, 220, 0.2)',
          }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg transition-all hover:scale-105"
            style={{
              background: 'rgba(100, 100, 100, 0.2)',
              border: '1px solid rgba(150, 150, 150, 0.3)',
              color: '#8a9fb5',
            }}
          >
            Close
          </button>
          {onConfirm && priceData && (
            <button
              onClick={handleConfirm}
              className="px-4 py-2 rounded-lg transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, rgba(100, 150, 200, 0.5), rgba(80, 120, 180, 0.6))',
                border: '1px solid rgba(150, 180, 220, 0.4)',
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(80, 120, 180, 0.3)',
              }}
            >
              Add to Workflow
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

