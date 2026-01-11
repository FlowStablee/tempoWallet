/**
 * TOKENS SCREEN
 * Manage tokens - view list, add custom tokens
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator,
    Modal,
    Linking,
} from 'react-native';
import { useWalletStore } from '../store/walletStore';
import { tempoService } from '../services/tempoService';
import { getExplorerUrl } from '../config/tempo';

interface TokensScreenProps {
    onBack: () => void;
}

export function TokensScreen({ onBack }: TokensScreenProps) {
    const { tokens, customTokens, addCustomToken, removeCustomToken } = useWalletStore();
    const [showAddModal, setShowAddModal] = useState(false);
    const [tokenAddress, setTokenAddress] = useState('');
    const [isValidating, setIsValidating] = useState(false);

    const handleAddToken = async () => {
        if (!tokenAddress.trim()) {
            Alert.alert('Error', 'Please enter token address');
            return;
        }

        // Check if already exists
        if (
            tokens.some(t => t.address.toLowerCase() === tokenAddress.toLowerCase()) ||
            customTokens.some(t => t.address.toLowerCase() === tokenAddress.toLowerCase())
        ) {
            Alert.alert('Error', 'Token already exists in your list');
            return;
        }

        setIsValidating(true);
        try {
            const tokenInfo = await tempoService.validateToken(tokenAddress.trim());
            if (!tokenInfo) {
                Alert.alert('Invalid Token', 'Could not find a valid TIP-20 token at this address');
                return;
            }

            addCustomToken(tokenInfo);
            setShowAddModal(false);
            setTokenAddress('');
            Alert.alert('Token Added!', `${tokenInfo.name} (${tokenInfo.symbol})`);
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setIsValidating(false);
        }
    };

    const confirmRemove = (address: string, name: string) => {
        Alert.alert(
            'Remove Token',
            `Remove ${name} from your list?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Remove', style: 'destructive', onPress: () => removeCustomToken(address) },
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
                <Text style={styles.headerTitle}>Tokens</Text>
                <TouchableOpacity onPress={() => setShowAddModal(true)}>
                    <Text style={styles.addBtn}>+ Add</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                {/* Default Tokens */}
                <Text style={styles.sectionTitle}>Default Tokens</Text>
                {tokens
                    .filter(t => t.isDefault)
                    .map((token) => (
                        <TouchableOpacity
                            key={token.address}
                            style={styles.tokenItem}
                            onPress={() => Linking.openURL(getExplorerUrl.token(token.address))}
                        >
                            <View style={styles.tokenIcon}>
                                <Text style={styles.tokenIconText}>{token.symbol.charAt(0)}</Text>
                            </View>
                            <View style={styles.tokenInfo}>
                                <Text style={styles.tokenName}>{token.name}</Text>
                                <Text style={styles.tokenAddress}>
                                    {token.address.slice(0, 10)}...{token.address.slice(-8)}
                                </Text>
                            </View>
                            <View style={styles.tokenBalance}>
                                <Text style={styles.balanceValue}>${token.balanceFormatted}</Text>
                                <Text style={styles.balanceSymbol}>{token.symbol}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}

                {/* Custom Tokens */}
                {customTokens.length > 0 && (
                    <>
                        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Custom Tokens</Text>
                        {tokens
                            .filter(t => !t.isDefault)
                            .map((token) => (
                                <TouchableOpacity
                                    key={token.address}
                                    style={styles.tokenItem}
                                    onPress={() => Linking.openURL(getExplorerUrl.token(token.address))}
                                    onLongPress={() => confirmRemove(token.address, token.name)}
                                >
                                    <View style={[styles.tokenIcon, styles.customIcon]}>
                                        <Text style={styles.tokenIconText}>{token.symbol.charAt(0)}</Text>
                                    </View>
                                    <View style={styles.tokenInfo}>
                                        <Text style={styles.tokenName}>{token.name}</Text>
                                        <Text style={styles.tokenAddress}>
                                            {token.address.slice(0, 10)}...{token.address.slice(-8)}
                                        </Text>
                                    </View>
                                    <View style={styles.tokenBalance}>
                                        <Text style={styles.balanceValue}>${token.balanceFormatted}</Text>
                                        <Text style={styles.balanceSymbol}>{token.symbol}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        <Text style={styles.hint}>Long press a custom token to remove it</Text>
                    </>
                )}

                {/* Info */}
                <View style={styles.infoBox}>
                    <Text style={styles.infoTitle}>About TIP-20 Tokens</Text>
                    <Text style={styles.infoText}>
                        TIP-20 is Tempo's stablecoin standard. All TIP-20 tokens have:
                    </Text>
                    <Text style={styles.infoItem}>• 6 decimal places</Text>
                    <Text style={styles.infoItem}>• Payment memo support</Text>
                    <Text style={styles.infoItem}>• Built-in compliance policies</Text>
                    <Text style={styles.infoItem}>• On-chain DEX trading</Text>
                </View>
            </ScrollView>

            {/* Add Token Modal */}
            <Modal visible={showAddModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Add Custom Token</Text>

                        <Text style={styles.inputLabel}>Token Contract Address</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="0x20c..."
                            placeholderTextColor="#94A3B8"
                            value={tokenAddress}
                            onChangeText={setTokenAddress}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={styles.cancelBtn}
                                onPress={() => {
                                    setShowAddModal(false);
                                    setTokenAddress('');
                                }}
                            >
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.confirmBtn, isValidating && styles.btnDisabled]}
                                onPress={handleAddToken}
                                disabled={isValidating}
                            >
                                {isValidating ? (
                                    <ActivityIndicator color="#FFFFFF" />
                                ) : (
                                    <Text style={styles.confirmBtnText}>Add Token</Text>
                                )}
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
    addBtn: {
        fontSize: 16,
        color: '#6366F1',
        fontWeight: '600',
    },
    content: {
        flex: 1,
        padding: 20,
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
    customIcon: {
        backgroundColor: '#FEF3C7',
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
    tokenAddress: {
        fontSize: 11,
        fontFamily: 'monospace',
        color: '#94A3B8',
        marginTop: 4,
    },
    tokenBalance: {
        alignItems: 'flex-end',
    },
    balanceValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#0F172A',
    },
    balanceSymbol: {
        fontSize: 11,
        color: '#64748B',
        marginTop: 2,
    },
    hint: {
        fontSize: 12,
        color: '#94A3B8',
        textAlign: 'center',
        marginTop: 8,
    },
    infoBox: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 12,
        marginTop: 24,
        marginBottom: 40,
    },
    infoTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0F172A',
        marginBottom: 8,
    },
    infoText: {
        fontSize: 13,
        color: '#64748B',
        marginBottom: 8,
        lineHeight: 18,
    },
    infoItem: {
        fontSize: 13,
        color: '#64748B',
        marginLeft: 8,
        marginBottom: 4,
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
        marginBottom: 20,
        textAlign: 'center',
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        padding: 16,
        fontSize: 14,
        color: '#0F172A',
        fontFamily: 'monospace',
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 24,
    },
    cancelBtn: {
        flex: 1,
        backgroundColor: '#F1F5F9',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelBtnText: {
        color: '#64748B',
        fontSize: 16,
        fontWeight: '500',
    },
    confirmBtn: {
        flex: 1,
        backgroundColor: '#6366F1',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    confirmBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    btnDisabled: {
        opacity: 0.6,
    },
});
