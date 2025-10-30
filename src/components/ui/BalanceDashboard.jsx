import React, { useState, useEffect } from 'react';

export function BalanceDashboard({ 
  accountBalances, 
  journalEntries, 
  onAssetClick, 
  onLiabilityClick 
}) {
  const [expanded, setExpanded] = useState(false);
  const [animatedAssets, setAnimatedAssets] = useState(0);
  const [animatedLiabilities, setAnimatedLiabilities] = useState(0);
  
  const totalAssets = Object.entries(accountBalances)
    .filter(([name]) => name.includes('Cash') || name.includes('Savings') || 
           name.includes('Inventory') || name.includes('Equipment') || 
           name.includes('Real Estate') || name.includes('Investments'))
    .reduce((sum, [, balance]) => sum + balance, 0);
    
  const totalLiabilities = Object.entries(accountBalances)
    .filter(([name]) => name.includes('Debt') || name.includes('Loan') || 
           name.includes('Payable') || name.includes('Mortgage') || 
           name.includes('Accrued'))
    .reduce((sum, [, balance]) => sum + balance, 0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedAssets(totalAssets);
      setAnimatedLiabilities(totalLiabilities);
    }, 100);
    return () => clearTimeout(timer);
  }, [totalAssets, totalLiabilities]);

  const netWorth = totalAssets - totalLiabilities;

  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      left: '20px',
      background: 'white',
      padding: '15px 25px',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      zIndex: 999,
      border: '2px solid #e0e0e0',
      minWidth: '300px'
    }}>
      <div 
        onClick={() => setExpanded(!expanded)}
        style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <h4 style={{ margin: 0, color: '#333' }}>💰 Financial Summary</h4>
        <span>{expanded ? '▼' : '▶'}</span>
      </div>
      
      {expanded && (
        <div style={{ marginTop: '15px' }}>
          <div 
            className="balance-item asset-item"
            onClick={onAssetClick}
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              marginBottom: '8px',
              cursor: 'pointer',
              padding: '12px',
              borderRadius: '12px',
              transition: 'all 0.3s ease',
              background: 'linear-gradient(135deg, #e8f5e9 0%, rgba(76, 175, 80, 0.1) 100%)',
              border: '2px solid #4caf50',
              boxShadow: '0 2px 8px rgba(76, 175, 80, 0.2)'
            }}
          >
            <span style={{ 
              color: '#2e7d32', 
              fontWeight: 'bold',
              textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
              fontSize: '16px'
            }}>💰 Total Assets:</span>
            <span style={{ 
              color: totalAssets >= 0 ? '#1b5e20' : '#d32f2f', 
              fontWeight: 'bold',
              textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
              fontSize: '16px'
            }}>${totalAssets.toFixed(2)}</span>
          </div>
          
          <div style={{ 
            width: '100%', 
            height: '8px', 
            backgroundColor: '#e0e0e0', 
            borderRadius: '4px',
            marginBottom: '12px',
            overflow: 'hidden',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              width: `${Math.min(100, (animatedAssets / Math.max(animatedAssets + Math.abs(animatedLiabilities), 1)) * 100)}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #4caf50 0%, #66bb6a 100%)',
              borderRadius: '4px',
              transition: 'width 0.8s ease',
              boxShadow: '0 1px 3px rgba(76, 175, 80, 0.3)'
            }} />
          </div>

          <div 
            className="balance-item liability-item"
            onClick={onLiabilityClick}
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              marginBottom: '8px',
              cursor: 'pointer',
              padding: '12px',
              borderRadius: '12px',
              transition: 'all 0.3s ease',
              background: 'linear-gradient(135deg, #ffebee 0%, rgba(244, 67, 54, 0.1) 100%)',
              border: '2px solid #f44336',
              boxShadow: '0 2px 8px rgba(244, 67, 54, 0.2)'
            }}
          >
            <span style={{ 
              color: '#c62828', 
              fontWeight: 'bold',
              textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
              fontSize: '16px'
            }}>📋 Total Liabilities:</span>
            <span style={{ 
              color: totalLiabilities >= 0 ? '#c62828' : '#2e7d32', 
              fontWeight: 'bold',
              textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
              fontSize: '16px'
            }}>${totalLiabilities.toFixed(2)}</span>
          </div>
          
          <div style={{ 
            width: '100%', 
            height: '8px', 
            backgroundColor: '#e0e0e0', 
            borderRadius: '4px',
            marginBottom: '12px',
            overflow: 'hidden',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              width: `${Math.min(100, (Math.abs(animatedLiabilities) / Math.max(animatedAssets + Math.abs(animatedLiabilities), 1)) * 100)}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #f44336 0%, #ef5350 100%)',
              borderRadius: '4px',
              transition: 'width 0.8s ease',
              boxShadow: '0 1px 3px rgba(244, 67, 54, 0.3)'
            }} />
          </div>

          <div style={{ 
            borderTop: '2px solid #e0e0e0', 
            marginTop: '10px', 
            paddingTop: '10px',
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <span style={{ fontWeight: 'bold', fontSize: '16px' }}>Net Worth:</span>
            <span style={{ 
              fontWeight: 'bold', 
              fontSize: '16px',
              color: netWorth >= 0 ? '#4caf50' : '#f44336'
            }}>
              ${netWorth.toFixed(2)}
            </span>
          </div>
          <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
            📊 Total Journals: {journalEntries.length}
          </div>
        </div>
      )}
    </div>
  );
}