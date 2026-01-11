/**
 * SETTINGS SCREEN
 * Wallet settings - fee token, network info, export key
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    Modal,
    Clipboard,
    Linking,
    ActivityIndicator,
} from 'react-native';
import { useWalletStore } from '../store/walletStore';
import { tempoService } from '../services/tempoService';
import { TEMPO_NETWORK, DEFAULT_TOKENS, CONTRACTS, getExplorerUrl } from '../config/tempo';

interface SettingsScreenProps {
    onBack: () => void;
    onLogout: () => void;
}

export function SettingsScreen({ onBack, onLogout }: SettingsScreenProps) {
    const { address, privateKey, feeToken, setFeeToken, clearWallet, tokens } = useWalletStore();
    const [showFeeTokenModal, setShowFeeTokenModal] = useState(false);
    const [showPrivateKey, setShowPrivateKey] = useState(false);
    const [networkInfo, setNetworkInfo] = useState({ blockNumber: 0, connected: false });
    const [isUpdatingFeeToken, setIsUpdatingFeeToken] = useState(false);

    useEffect(() => {
        tempoService.getNetworkInfo().then(setNetworkInfo);
    }, []);

    const currentFeeToken = tokens.find(t => t.address === feeToken) || DEFAULT_TOKENS[0];

    const handleChangeFeeToken = async (tokenAddress: string) => {
        setIsUpdatingFeeToken(true);
        try {
            await tempoService.setUserFeeToken(tokenAddress);
            setFeeToken(tokenAddress);
            setShowFeeTokenModal(false);
            Alert.alert('Success', 'Fee token preference updated on-chain!');
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setIsUpdatingFeeToken(false);
        }
    };

    const exportPrivateKey = () => {
        Alert.alert(
            '⚠️ Warning',
            'Never share your private key with anyone. Are you sure you want to view it?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Show Key', style: 'destructive', onPress: () => setShowPrivateKey(true) },
            ]
        );
    };

    const copyPrivateKey = () => {
        if (privateKey) {
            Clipboard.setString(privateKey);
            Alert.alert('Copied', 'Private key copied to clipboard');
        }
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure? Make sure you have backed up your private key!',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: () => {
                        clearWallet();
                        onLogout();
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack}>
                    <Text style={styles.backBtn}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
                <View style={{ width: 50 }} />
            </View>

            <ScrollView style={styles.content}>
                {/* Wallet Section */}
                <Text style={styles.sectionTitle}>Wallet</Text>
                <View style={styles.section}>
                    <View style={styles.row}>
                        <Text style={styles.rowLabel}>Address</Text>
                        <Text style={styles.rowValue}>
                            {address?.slice(0, 8)}...{address?.slice(-6)}
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={styles.row}
                        onPress={() => Linking.openURL(getExplorerUrl.address(address!))}
                    >
                        <Text style={styles.rowLabel}>View on Explorer</Text>
                        <Text style={styles.rowLink}>↗</Text>
                    </TouchableOpacity>
                </View>

                {/* Fee Token Section */}
                <Text style={styles.sectionTitle}>Transaction Fees</Text>
                <View style={styles.section}>
                    <TouchableOpacity
                        style={styles.row}
                        onPress={() => setShowFeeTokenModal(true)}
                    >
                        <View>
                            <Text style={styles.rowLabel}>Fee Token</Text>
                            <Text style={styles.rowHint}>Token used to pay gas fees</Text>
                        </View>
                        <View style={styles.feeTokenBadge}>
                            <Text style={styles.feeTokenText}>{currentFeeToken.symbol}</Text>
                            <Text style={styles.rowLink}> ▼</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Network Section */}
                <Text style={styles.sectionTitle}>Network</Text>
                <View style={styles.section}>
                    <View style={styles.row}>
                        <Text style={styles.rowLabel}>Network</Text>
                        <Text style={styles.rowValue}>{TEMPO_NETWORK.name}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.rowLabel}>Chain ID</Text>
                        <Text style={styles.rowValue}>{TEMPO_NETWORK.chainId}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.rowLabel}>RPC URL</Text>
                        <Text style={[styles.rowValue, styles.mono]}>{TEMPO_NETWORK.rpc}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.rowLabel}>Status</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={[styles.statusDot, networkInfo.connected && styles.statusOnline]} />
                            <Text style={styles.rowValue}>
                                {networkInfo.connected ? 'Connected' : 'Disconnected'}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.rowLabel}>Block Number</Text>
                        <Text style={styles.rowValue}>{networkInfo.blockNumber.toLocaleString()}</Text>
                    </View>
                </View>

                {/* Contracts Section */}
                <Text style={styles.sectionTitle}>System Contracts</Text>
                <View style={styles.section}>
                    <TouchableOpacity
                        style={styles.row}
                        onPress={() => Linking.openURL(getExplorerUrl.address(CONTRACTS.FEE_MANAGER))}
                    >
                        <Text style={styles.rowLabel}>Fee Manager</Text>
                        <Text style={[styles.rowValue, styles.mono]}>
                            {CONTRACTS.FEE_MANAGER.slice(0, 10)}...
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.row}
                        onPress={() => Linking.openURL(getExplorerUrl.address(CONTRACTS.TIP20_FACTORY))}
                    >
                        <Text style={styles.rowLabel}>TIP20 Factory</Text>
                        <Text style={[styles.rowValue, styles.mono]}>
                            {CONTRACTS.TIP20_FACTORY.slice(0, 10)}...
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.row}
                        onPress={() => Linking.openURL(getExplorerUrl.address(CONTRACTS.DEX))}
                    >
                        <Text style={styles.rowLabel}>Stablecoin DEX</Text>
                        <Text style={[styles.rowValue, styles.mono]}>
                            {CONTRACTS.DEX.slice(0, 10)}...
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Security Section */}
                <Text style={styles.sectionTitle}>Security</Text>
                <View style={styles.section}>
                    <TouchableOpacity style={styles.row} onPress={exportPrivateKey}>
                        <Text style={styles.rowLabel}>Export Private Key</Text>
                        <Text style={styles.rowLink}>→</Text>
                    </TouchableOpacity>
                </View>

                {/* Logout */}
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <Text style={styles.logoutBtnText}>Logout</Text>
                </TouchableOpacity>

                {/* Version */}
                <Text style={styles.version}>Tempo Wallet v1.0.0</Text>
            </ScrollView>

            {/* Fee Token Modal */}
            <Modal visible={showFeeTokenModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select Fee Token</Text>
                        <Text style={styles.modalHint}>
                            This token will be used to pay for transaction fees
                        </Text>
                        <ScrollView style={{ maxHeight: 300 }}>
                            {tokens.map((token) => (
                                <TouchableOpacity
                                    key={token.address}
                                    style={[
                                        styles.modalItem,
                                        token.address === feeToken && styles.modalItemSelected,
                                    ]}
                                    onPress={() => handleChangeFeeToken(token.address)}
                                    disabled={isUpdatingFeeToken}
                                >
                                    <View style={styles.tokenIcon}>
                                        <Text style={styles.tokenIconText}>{token.symbol.charAt(0)}</Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.tokenName}>{token.name}</Text>
                                        <Text style={styles.tokenSymbol}>{token.symbol}</Text>
                                    </View>
                                    {isUpdatingFeeToken && token.address === feeToken ? (
                                        <ActivityIndicator />
                                    ) : token.address === feeToken ? (
                                        <Text style={styles.checkmark}>✓</Text>
                                    ) : null}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <TouchableOpacity
                            style={styles.cancelBtn}
                            onPress={() => setShowFeeTokenModal(false)}
                        >
                            <Text style={styles.cancelBtnText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Private Key Modal */}
            <Modal visible={showPrivateKey} animationType="fade" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>🔐 Private Key</Text>
                        <Text style={styles.warningText}>
                            ⚠️ Never share this with anyone!
                        </Text>
                        <View style={styles.keyBox}>
                            <Text style={styles.keyText}>{privateKey}</Text>
                        </View>
                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowPrivateKey(false)}>
                                <Text style={styles.cancelBtnText}>Close</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.confirmBtn} onPress={copyPrivateKey}>
                                <Text style={styles.confirmBtnText}>Copy</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748B',
        marginBottom: 8,
        marginTop: 16,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    section: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        overflow: 'hidden',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    rowLabel: {
        fontSize: 15,
        color: '#0F172A',
    },
    rowValue: {
        fontSize: 14,
        color: '#64748B',
    },
    rowHint: {
        fontSize: 12,
        color: '#94A3B8',
        marginTop: 2,
    },
    rowLink: {
        fontSize: 14,
        color: '#6366F1',
        fontWeight: '500',
    },
    mono: {
        fontFamily: 'monospace',
        fontSize: 12,
    },
    feeTokenBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EEF2FF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    feeTokenText: {
        color: '#6366F1',
        fontWeight: '600',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#EF4444',
        marginRight: 8,
    },
    statusOnline: {
        backgroundColor: '#10B981',
    },
    logoutBtn: {
        backgroundColor: '#FEE2E2',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 32,
    },
    logoutBtnText: {
        color: '#DC2626',
        fontSize: 16,
        fontWeight: '600',
    },
    version: {
        textAlign: 'center',
        color: '#94A3B8',
        fontSize: 12,
        marginTop: 24,
        marginBottom: 40,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0F172A',
        marginBottom: 8,
        textAlign: 'center',
    },
    modalHint: {
        fontSize: 14,
        color: '#64748B',
        textAlign: 'center',
        marginBottom: 20,
    },
    modalItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
    },
    modalItemSelected: {
        backgroundColor: '#EEF2FF',
    },
    tokenIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
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
    tokenName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#0F172A',
    },
    tokenSymbol: {
        fontSize: 12,
        color: '#64748B',
    },
    checkmark: {
        fontSize: 20,
        color: '#10B981',
        fontWeight: 'bold',
    },
    cancelBtn: {
        backgroundColor: '#F1F5F9',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 16,
        flex: 1,
    },
    cancelBtnText: {
        color: '#64748B',
        fontSize: 16,
        fontWeight: '500',
    },
    confirmBtn: {
        backgroundColor: '#6366F1',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 16,
        flex: 1,
        marginLeft: 12,
    },
    confirmBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    warningText: {
        color: '#DC2626',
        textAlign: 'center',
        marginBottom: 16,
    },
    keyBox: {
        backgroundColor: '#FEE2E2',
        padding: 16,
        borderRadius: 12,
    },
    keyText: {
        fontSize: 11,
        fontFamily: 'monospace',
        color: '#DC2626',
        textAlign: 'center',
    },
    modalActions: {
        flexDirection: 'row',
    },
});
