"use client";
import React, { useState, useEffect } from 'react';
import Vapi from '@vapi-ai/web';

interface VapiWidgetProps {
  apiKey: string;
  assistantId: string;
  config?: Record<string, unknown>;
}

const VapiWidget: React.FC<VapiWidgetProps> = ({
  apiKey,
  assistantId,
  config = {}
}) => {
  const [vapi, setVapi] = useState<Vapi | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [bottomOffset, setBottomOffset] = useState(24);

  useEffect(() => {
    const updateOffset = () => {
      const isMobile = window.innerWidth < 768;
      setBottomOffset(isMobile ? 200 : 120);
    };
    updateOffset();
    window.addEventListener('resize', updateOffset);
    return () => window.removeEventListener('resize', updateOffset);
  }, []);

  useEffect(() => {
    const vapiInstance = new Vapi(apiKey);
    setVapi(vapiInstance);

    vapiInstance.on('call-start', () => {
      setIsConnected(true);
    });

    vapiInstance.on('call-end', () => {
      setIsConnected(false);
      setIsSpeaking(false);
    });

    vapiInstance.on('speech-start', () => {
      setIsSpeaking(true);
    });

    vapiInstance.on('speech-end', () => {
      setIsSpeaking(false);
    });

    vapiInstance.on('error', (error) => {
      console.error('Vapi error:', error);
    });

    return () => {
      vapiInstance?.stop();
    };
  }, [apiKey]);

  const startCall = () => {
    if (!assistantId) {
      console.error("No assistantId provided to VapiWidget! Cannot start call.");
      return;
    }
    if (vapi) vapi.start(assistantId);
  };

  const endCall = () => {
    if (vapi) vapi.stop();
  };

  return (
    <div style={{
      position: 'fixed',
      right: '32px',
      bottom: '120px',
      zIndex: 1000,
      fontFamily: 'Arial, sans-serif',
    }}>
      {!isConnected ? (
        <button
          onClick={startCall}
          style={{
            background: isSpeaking
              ? 'linear-gradient(135deg, #12A594 0%, #8e44ad 100%)'
              : 'linear-gradient(135deg, #12A594 0%, #00c3ff 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '50%',
            width: '64px',
            height: '64px',
            fontSize: '32px',
            boxShadow: '0 4px 16px rgba(18, 165, 148, 0.3)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            animation: isSpeaking ? 'micPulse 1s infinite alternate' : 'none',
          }}
          title="Talk to Assistant"
        >
          🎙️
        </button>
      ) : (
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          border: '1px solid #e1e5e9',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: isSpeaking ? '#ff4444' : '#12A594',
                animation: isSpeaking ? 'pulse 1s infinite' : 'none',
              }}></div>
              <span style={{ fontWeight: 'bold', color: '#333', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {isSpeaking ? (
                  <>
                    <span role="img" aria-label="Speaking">🔊</span>
                    Assistant Speaking...
                  </>
                ) : (
                  <>
                    <span role="img" aria-label="Listening">🦻</span>
                    Listening...
                  </>
                )}
              </span>
            </div>
            <button
              onClick={endCall}
              style={{
                background: '#ff4444',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              End Call
            </button>
          </div>
        </div>
      )}
      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
        @keyframes micPulse {
          0% {
            filter: brightness(1) drop-shadow(0 0 0 #12A594);
          }
          100% {
            filter: brightness(1.2) drop-shadow(0 0 16px #8e44ad);
          }
        }
      `}</style>
    </div>
  );
};

export default VapiWidget;