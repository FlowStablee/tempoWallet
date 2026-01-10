/**
 * TEMPO NATIVE WALLET CONCEPT
 * Built for: Tempo Testnet (Moderato)
 * Features: Stablecoin Gas, USD Display, No ETH Balance
 */

import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert
} from 'react-native';

import { createPublicClient, http, formatUnits } from 'viem';
import { tempoTestnet } from 'viem/chains';

// --- TEMPO CONFIGURATION ---
const TEMPO_RPC = 'https://rpc.moderato.tempo.xyz';

const client = createPublicClient({
  chain: tempoTestnet,
  transport: http(TEMPO_RPC),
});

// A Mock Address for Demo
const DEMO_ADDRESS = '0x1234567890123456789012345678901234567890'; 

function App(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<string>('0.00');
  const [feeToken, setFeeToken] = useState<string>('Loading...');
  const [address, setAddress] = useState(DEMO_ADDRESS);

  // --- THE CORE TEMPO LOGIC ---
  const fetchTempoData = async () => {
    setLoading(true);
    try {
      console.log('Fetching Tempo Data...');
      
      // 1. Get the Fee Token (The Tempo Special Step)
      const feeTokenData: any = await client.request({
        method: 'tempo_getUserToken',
        params: [address as `0x${string}`],
      } as any);

      setFeeToken(feeTokenData.symbol || 'USDC');

      // 2. Get the Balance of THAT Token
      const balanceData = await client.readContract({
        address: feeTokenData.address,
        abi: [{
          constant: true,
          inputs: [{ name: 'account', type: 'address' }],
          name: 'balanceOf',
          outputs: [{ name: '', type: 'uint256' }],
          type: 'function'
        }],
        functionName: 'balanceOf',
        args: [address],
      });

      const formatted = formatUnits(balanceData as bigint, 18);
      setBalance(Number(formatted).toFixed(2));

    } catch (error) {
      console.error(error);
      setBalance('0.00');
      setFeeToken('pathUSD');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTempoData();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tempo<Text style={styles.headerBold}>Wallet</Text></Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Testnet</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        
        {/* BALANCE CARD */}
        <View style={styles.card}>
          <Text style={styles.label}>Total Balance</Text>
          <View style={styles.row}>
            <Text style={styles.currency}>$</Text>
            <Text style={styles.balance}>{balance}</Text>
          </View>
          <Text style={styles.subtext}>Gas Source: {feeToken}</Text>
        </View>

        {/* ACTION BUTTONS */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.btnPrimary} onPress={() => Alert.alert('Coming Soon', 'Send Logic')}>
            <Text style={styles.btnText}>Send</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnSecondary} onPress={fetchTempoData}>
            <Text style={styles.btnTextSec}>Refresh</Text>
          </TouchableOpacity>
        </View>

        {/* ADDRESS INPUT (For Demo) */}
        <View style={styles.inputContainer}>
          <Text style={styles.labelDark}>Wallet Address</Text>
          <TextInput 
            style={styles.input} 
            value={address}
            onChangeText={setAddress}
            placeholder="0x..."
          />
          <Text style={styles.note}>
            Note: This is a Concept Wallet. It connects to Moderato Testnet and checks Stablecoin balances instead of ETH.
          </Text>
        </View>

        {/* TEMPO FEATURES LIST */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Tempo Features Active</Text>
          <FeatureItem title="Stablecoin Gas" desc="Fees paid in USD, not ETH" />
          <FeatureItem title="Payment Lanes" desc="Guaranteed blockspace" />
          <FeatureItem title="Compliance Ready" desc="TIP-403 Registry Check" />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const FeatureItem = ({title, desc}: any) => (
  <View style={styles.featureRow}>
    <View style={styles.dot} />
    <View>
      <Text style={styles.featTitle}>{title}</Text>
      <Text style={styles.featDesc}>{desc}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111' },
  header: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 24 },
  headerBold: { fontWeight: 'bold', color: '#4F86F7' },
  badge: { backgroundColor: '#222', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { color: '#888', fontSize: 12, fontWeight: 'bold' },
  scroll: { padding: 20 },
  card: { backgroundColor: '#1A1A1A', borderRadius: 20, padding: 30, alignItems: 'center', marginBottom: 25 },
  label: { color: '#888', fontSize: 14, textTransform: 'uppercase', letterSpacing: 1 },
  row: { flexDirection: 'row', alignItems: 'flex-start', marginVertical: 10 },
  currency: { color: '#4F86F7', fontSize: 24, marginTop: 8, marginRight: 4 },
  balance: { color: '#fff', fontSize: 48, fontWeight: 'bold' },
  subtext: { color: '#444', fontSize: 12 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  btnPrimary: { backgroundColor: '#4F86F7', flex: 1, padding: 15, borderRadius: 12, alignItems: 'center', marginRight: 10 },
  btnSecondary: { backgroundColor: '#222', flex: 1, padding: 15, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  btnTextSec: { color: '#fff', fontSize: 16 },
  inputContainer: { marginBottom: 30 },
  labelDark: { color: '#666', marginBottom: 8 },
  input: { backgroundColor: '#222', color: '#fff', padding: 15, borderRadius: 10, fontSize: 14 },
  note: { color: '#444', fontSize: 12, marginTop: 8 },
  infoSection: { borderTopWidth: 1, borderTopColor: '#222', paddingTop: 20 },
  sectionTitle: { color: '#fff', fontSize: 18, marginBottom: 15, fontWeight: 'bold' },
  featureRow: { flexDirection: 'row', marginBottom: 15 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4F86F7', marginTop: 6, marginRight: 10 },
  featTitle: { color: '#ddd', fontSize: 14, fontWeight: 'bold' },
  featDesc: { color: '#666', fontSize: 12 },
});

export default App;
