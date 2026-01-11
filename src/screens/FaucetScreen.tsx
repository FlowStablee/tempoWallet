/**
 * FAUCET SCREEN
 * Claim testnet tokens
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Linking,
    ActivityIndicator,
} from 'react-native';
import { useWalletStore } from '../store/walletStore';
import { TEMPO_NETWORK, DEFAULT_TOKENS } from '../config/tempo';

interface FaucetScreenProps {
    onBack: () => void;
}

export function FaucetScreen({ onBack }: FaucetScreenProps) {
    const address = useWalletStore((s) => s.address);
    const [claimingIndex, setClaimingIndex] = useState<number | null>(null);

    const openFaucet = () => {
        Linking.openURL(TEMPO_NETWORK.faucetUrl);
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack}>
                    <Text style={styles.backBtn}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Testnet Faucet</Text>
                <View style={{ width: 50 }} />
            </View>

            <View style={styles.content}>
                {/* Info Card */}
                <View style={styles.infoCard}>
                    <Text style={styles.infoIcon}>💧</Text>
                    <Text style={styles.infoTitle}>Get Free Testnet Tokens</Text>
                    <Text style={styles.infoText}>
                        Claim up to 1M of each token for testing on Tempo Moderato Testnet.
                    </Text>
                </View>

                {/* Token List */}
                <Text style={styles.sectionTitle}>Available Tokens</Text>

                {DEFAULT_TOKENS.map((token, index) => (
                    <View key={token.address} style={styles.tokenItem}>
                        <View style={styles.tokenIcon}>
                            <Text style={styles.tokenIconText}>{token.symbol.charAt(0)}</Text>
                        </View>
                        <View style={styles.tokenInfo}>
                            <Text style={styles.tokenName}>{token.name}</Text>
                            <Text style={styles.tokenSymbol}>{token.symbol}</Text>
                        </View>
                        <View style={styles.tokenAmount}>
                            <Text style={styles.amountValue}>1,000,000</Text>
                            <Text style={styles.amountLabel}>per claim</Text>
                        </View>
                    </View>
                ))}

                {/* Claim Button */}
                <TouchableOpacity style={styles.claimBtn} onPress={openFaucet}>
                    <Text style={styles.claimBtnText}>Open Faucet Website</Text>
                </TouchableOpacity>

                {/* Address Display */}
                <View style={styles.addressBox}>
                    <Text style={styles.addressLabel}>Your Address</Text>
                    <Text style={styles.addressValue}>{address}</Text>
                    <Text style={styles.addressHint}>
                        Copy this address and paste it in the faucet website
                    </Text>
                </View>

                {/* Note */}
                <View style={styles.noteBox}>
                    <Text style={styles.noteText}>
                        ℹ️ The faucet is rate-limited. You can claim once per address per day.
                    </Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    backBtn: {
        fontSize: 16,
        color: '#6366F1',
        fontWeight: '500',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#0F172A',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    infoCard: {
        backgroundColor: '#EEF2FF',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        marginBottom: 24,
    },
    infoIcon: {
        fontSize: 48,
        marginBottom: 12,
    },
    infoTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0F172A',
        marginBottom: 8,
    },
    infoText: {
        fontSize: 14,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#0F172A',
        marginBottom: 12,
    },
    tokenItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
    },
    tokenIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    tokenIconText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#6366F1',
    },
    tokenInfo: {
        flex: 1,
    },
    tokenName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#0F172A',
    },
    tokenSymbol: {
        fontSize: 13,
        color: '#64748B',
    },
    tokenAmount: {
        alignItems: 'flex-end',
    },
    amountValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#10B981',
    },
    amountLabel: {
        fontSize: 11,
        color: '#94A3B8',
    },
    claimBtn: {
        backgroundColor: '#6366F1',
        paddingVertical: 18,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 24,
    },
    claimBtnText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
    addressBox: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 12,
        marginTop: 16,
    },
    addressLabel: {
        fontSize: 12,
        color: '#64748B',
        marginBottom: 8,
    },
    addressValue: {
        fontSize: 12,
        fontFamily: 'monospace',
        color: '#0F172A',
        backgroundColor: '#F1F5F9',
        padding: 12,
        borderRadius: 8,
    },
    addressHint: {
        fontSize: 12,
        color: '#94A3B8',
        marginTop: 8,
        textAlign: 'center',
    },
    noteBox: {
        backgroundColor: '#FEF3C7',
        padding: 16,
        borderRadius: 12,
        marginTop: 16,
    },
    noteText: {
        fontSize: 13,
        color: '#92400E',
        lineHeight: 18,
    },
});
