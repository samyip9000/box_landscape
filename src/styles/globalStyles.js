export const globalStyles = `
  @keyframes titleGlow {
    0% { box-shadow: 0 8px 32px rgba(0,0,0,0.15); }
    100% { box-shadow: 0 8px 32px rgba(76, 175, 80, 0.3); }
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
  
  .ui-panel {
    animation: fadeInUp 0.6s ease-out;
    transition: all 0.3s ease;
    backdrop-filter: blur(20px);
    background: rgba(255, 255, 255, 0.9) !important;
    border: 1px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  }
  
  .ui-panel:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(0,0,0,0.2);
    background: rgba(255, 255, 255, 0.95) !important;
  }
  
  .button-hover {
    transition: all 0.3s ease;
  }
  
  .button-hover:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 20px rgba(0,0,0,0.2);
  }

  .balance-item:hover {
    transform: scale(1.02);
    box-shadow: 0 4px 16px rgba(0,0,0,0.2) !important;
  }

  .asset-item:hover {
    background: #c8e6c9 !important;
  }

  .liability-item:hover {
    background: #ffcdd2 !important;
  }
`;