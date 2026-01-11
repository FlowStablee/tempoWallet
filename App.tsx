/**
 * TEMPO WALLET
 * ============================================================================
 * A modern payment-first wallet for the Tempo blockchain
 * 
 * Features:
 * - Create/Import wallet
 * - Send payments with memos
 * - Receive with QR code
 * - Multiple token support
 * - Fee token selection
 * - Faucet integration
 * - Network info & settings
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, StatusBar } from 'react-native';

// Polyfills for React Native
import 'react-native-get-random-values';
import { Buffer } from 'buffer';
global.Buffer = Buffer;

// Screens
import {
  AuthScreen,
  HomeScreen,
  SendScreen,
  ReceiveScreen,
  FaucetScreen,
  TokensScreen,
  SettingsScreen,
} from './src/screens';

// Store & Service
import { useWalletStore } from './src/store/walletStore';
import { tempoService } from './src/services/tempoService';

type Screen = 'AUTH' | 'HOME' | 'SEND' | 'RECEIVE' | 'FAUCET' | 'TOKENS' | 'SETTINGS';

export default function App() {
  const { isConnected, address, privateKey } = useWalletStore();
  const [currentScreen, setCurrentScreen] = useState<Screen>('AUTH');

  // Restore wallet on app load
  useEffect(() => {
    if (isConnected && privateKey) {
      tempoService.setWallet(privateKey);
      setCurrentScreen('HOME');
    }
  }, [isConnected, privateKey]);

  // Navigate helper
  const navigate = (screen: string) => {
    setCurrentScreen(screen as Screen);
  };

  // Go back to home
  const goHome = () => setCurrentScreen('HOME');

  // Logout handler
  const handleLogout = () => setCurrentScreen('AUTH');

  // Auth success
  const onAuthSuccess = () => setCurrentScreen('HOME');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={currentScreen === 'AUTH' ? 'light-content' : 'dark-content'} />

      {currentScreen === 'AUTH' && (
        <AuthScreen onSuccess={onAuthSuccess} />
      )}

      {currentScreen === 'HOME' && (
        <HomeScreen onNavigate={navigate} />
      )}

      {currentScreen === 'SEND' && (
        <SendScreen onBack={goHome} />
      )}

      {currentScreen === 'RECEIVE' && (
        <ReceiveScreen onBack={goHome} />
      )}

      {currentScreen === 'FAUCET' && (
        <FaucetScreen onBack={goHome} />
      )}

      {currentScreen === 'TOKENS' && (
        <TokensScreen onBack={goHome} />
      )}

      {currentScreen === 'SETTINGS' && (
        <SettingsScreen onBack={goHome} onLogout={handleLogout} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
});
