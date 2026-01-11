/**
 * RECEIVE SCREEN
 * Display wallet address for receiving payments
 */

import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Share,
    Alert,
    Clipboard,
} from 'react-native';
import { useWalletStore } from '../store/walletStore';
import { TEMPO_NETWORK } from '../config/tempo';

interface ReceiveScreenProps {
    onBack: () => void;
}

export function ReceiveScreen({ onBack }: ReceiveScreenProps) {
    const address = useWalletStore((s) => s.address);

    const copyAddress = () => {
        if (address) {
            Clipboard.setString(address);
            Alert.alert('Copied!', 'Address copied to clipboard');
        }
    };

    const shareAddress = async () => {
        if (address) {
            try {
                await Share.share({
                    message: `My Tempo Wallet Address:\n${address}\n\nNetwork: ${TEMPO_NETWORK.name} (Chain ID: ${TEMPO_NETWORK.chainId})`,
                });
            } catch (error) {
                console.error(error);
            }
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack}>
                    <Text style={styles.backBtn}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Receive</Text>
                <View style={{ width: 50 }} />
            </View>

            <View style={styles.content}>
                {/* QR Placeholder */}
                <View style={styles.qrContainer}>
                    <View style={styles.qrPlaceholder}>
                        <Text style={styles.qrText}>📱</Text>
                        <Text style={styles.qrLabel}>QR Code</Text>
                    </View>
                </View>

                {/* Address Display */}
                <View style={styles.addressSection}>
                    <Text style={styles.addressLabel}>Your Wallet Address</Text>
                    <View style={styles.addressBox}>
                        <Text style={styles.addressText}>{address}</Text>
                    </View>
                </View>

                {/* Network Info */}
                <View style={styles.networkInfo}>
                    <Text style={styles.networkLabel}>Network</Text>
                    <Text style={styles.networkValue}>
                        {TEMPO_NETWORK.name} (Chain ID: {TEMPO_NETWORK.chainId})
                    </Text>
                </View>

                {/* Action Buttons */}
                <View style={styles.actions}>
                    <TouchableOpacity style={styles.copyBtn} onPress={copyAddress}>
                        <Text style={styles.copyBtnText}>📋 Copy Address</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.shareBtn} onPress={shareAddress}>
                        <Text style={styles.shareBtnText}>📤 Share</Text>
                    </TouchableOpacity>
                </View>

                {/* Instructions */}
                <View style={styles.infoBox}>
                    <Text style={styles.infoTitle}>How to receive tokens</Text>
                    <Text style={styles.infoItem}>
                        1. Share your address with the sender
                    </Text>
                    <Text style={styles.infoItem}>
                        2. Make sure they send on Tempo Moderato Testnet
                    </Text>
                    <Text style={styles.infoItem}>
                        3. Tokens will appear in ~0.5 seconds
                    </Text>
                </View>

                {/* Supported Tokens */}
                <View style={styles.supportedBox}>
                    <Text style={styles.supportedTitle}>Supported Tokens</Text>
                    <Text style={styles.supportedText}>
                        pathUSD, AlphaUSD, BetaUSD, ThetaUSD, and any TIP-20 token
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
    qrContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    qrPlaceholder: {
        width: 200,
        height: 200,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    qrText: {
        fontSize: 64,
    },
    qrLabel: {
        fontSize: 14,
        color: '#94A3B8',
        marginTop: 8,
    },
    addressSection: {
        marginBottom: 16,
    },
    addressLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
        marginBottom: 8,
    },
    addressBox: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    addressText: {
        fontSize: 12,
        fontFamily: 'monospace',
        color: '#0F172A',
        textAlign: 'center',
    },
    networkInfo: {
        backgroundColor: '#EEF2FF',
        padding: 12,
        borderRadius: 8,
        marginBottom: 24,
    },
    networkLabel: {
        fontSize: 12,
        color: '#6366F1',
        fontWeight: '600',
    },
    networkValue: {
        fontSize: 13,
        color: '#4338CA',
        marginTop: 4,
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    copyBtn: {
        flex: 1,
        backgroundColor: '#6366F1',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    copyBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    shareBtn: {
        flex: 1,
        backgroundColor: '#E2E8F0',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    shareBtnText: {
        color: '#475569',
        fontSize: 16,
        fontWeight: '600',
    },
    infoBox: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
    infoTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0F172A',
        marginBottom: 12,
    },
    infoItem: {
        fontSize: 13,
        color: '#64748B',
        marginBottom: 8,
        lineHeight: 18,
    },
    supportedBox: {
        backgroundColor: '#F0FDF4',
        padding: 16,
        borderRadius: 12,
    },
    supportedTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#166534',
        marginBottom: 4,
    },
    supportedText: {
        fontSize: 13,
        color: '#15803D',
        lineHeight: 18,
    },
});
