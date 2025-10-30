import React from 'react';

export function JournalButton({ onJournalClick, isJournalMode }) {
  return (
    <button
      className="button-hover"
      onClick={onJournalClick}
      style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        padding: '18px 35px',
        fontSize: '20px',
        fontWeight: 'bold',
        color: 'white',
        borderRadius: '15px',
        cursor: 'pointer',
        zIndex: 1001,
        background: isJournalMode 
          ? 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)' 
          : 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        transition: 'all 0.3s ease',
        backdropFilter: 'blur(10px)',
        border: '3px solid rgba(255,255,255,0.2)'
      }}
    >
      {isJournalMode ? '🚪 EXIT JOURNAL' : '📖 START JOURNAL'}
    </button>
  );
}