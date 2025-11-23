import React, { useState } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useWalBalance } from '../hooks/useWalBalance';
import { useSuiBalance } from '../hooks/useSuiBalance';
import { useGetWalTokens } from '../hooks/useGetWalTokens';

export const WalConversionButton: React.FC = () => {
  const [isConverting, setIsConverting] = useState(false);
  const currentAccount = useCurrentAccount();
  const { data: walBalance, refetch: refetchWalBalance } = useWalBalance();
  const { data: suiBalance } = useSuiBalance();
  const { mutateAsync: getWalTokens } = useGetWalTokens();

  const handleConvert = async () => {
    if (!currentAccount?.address) {
      alert('Please connect your wallet first');
      return;
    }

    setIsConverting(true);
    try {
      await getWalTokens();
      await refetchWalBalance();
      alert('Conversion successful!');
    } catch (error) {
      console.error('Conversion failed:', error);
      alert('Conversion failed. Please try again.');
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 2000,
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      alignItems: 'center',
      backgroundColor: 'rgba(26, 26, 38, 0.9)',
      backdropFilter: 'blur(10px)',
      borderRadius: '0.5rem',
      padding: '0.5rem',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    }}>
      <button
        onClick={handleConvert}
        disabled={isConverting || !currentAccount}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: isConverting ? '#9ca3af' : '#FFD700',
          color: 'white',
          border: 'none',
          borderRadius: '0.375rem',
          cursor: isConverting || !currentAccount ? 'not-allowed' : 'pointer',
          fontSize: '0.875rem',
          fontWeight: '500',
          transition: 'background-color 0.2s',
          minWidth: '120px'
        }}
      >
        {isConverting ? 'Converting...' : 'Convert SUI → WAL'}
      </button>
      <div style={{ fontSize: '0.75rem', color: '#9ca3af', textAlign: 'center' }}>
        <div>WAL: {walBalance || '0'}</div>
        <div>SUI: {suiBalance || '0'}</div>
      </div>
    </div>
  );
};

export default WalConversionButton;
