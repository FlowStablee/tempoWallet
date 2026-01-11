/**
 * SEND SCREEN
 * Send TIP-20 payments with optional memo
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
    Switch,
    Modal,
    Linking,
} from 'react-native';
import { useWalletStore } from '../store/walletStore';
import { tempoService } from '../services/tempoService';
import { DEFAULT_TOKENS, getExplorerUrl } from '../config/tempo';

interface SendScreenProps {
    onBack: () => void;
}

export function SendScreen({ onBack }: SendScreenProps) {
    const { tokens, feeToken, isSponsored, setSponsored, addTransaction } =
        useWalletStore();
    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState('');
    const [memo, setMemo] = useState('');
    const [selectedToken, setSelectedToken] = useState(DEFAULT_TOKENS[0].address);
    const [isLoading, setIsLoading] = useState(false);
    const [showTokenPicker, setShowTokenPicker] = useState(false);

    const selectedTokenInfo = tokens.find(t => t.address === selectedToken) || DEFAULT_TOKENS[0];

    const handleSend = async () => {
        if (!recipient.trim()) {
            Alert.alert('Error', 'Please enter recipient address');
            return;
        }
        if (!amount.trim() || parseFloat(amount) <= 0) {
            Alert.alert('Error', 'Please enter a valid amount');
            return;
        }

        setIsLoading(true);
        try {
            const hash = await tempoService.transfer(
                selectedToken,
                recipient.trim(),
                amount,
                memo.trim() || undefined
            );

            // Add to transaction history
            addTransaction({
                hash,
                from: tempoService.getAddress()!,
                to: recipient.trim(),
                amount,
                token: selectedToken,
                tokenSymbol: selectedTokenInfo.symbol,
                memo: memo.trim() || undefined,
                timestamp: Date.now(),
                status: 'pending',
            });

            Alert.alert(
                'Transaction Sent! ✓',
                `Hash: ${hash.slice(0, 16)}...`,
                [
                    { text: 'View on Explorer', onPress: () => Linking.openURL(getExplorerUrl.tx(hash)) },
                    { text: 'Done', onPress: onBack },
                ]
            );

            // Wait for confirmation and update
            tempoService.waitForTransaction(hash).then(({ status }) => {
                useWalletStore.getState().updateTransaction(hash, status ? 'confirmed' : 'failed');
            });
        } catch (error: any) {
            Alert.alert('Transaction Failed', error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack}>
                    <Text style={styles.backBtn}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Send Payment</Text>
                <View style={{ width: 50 }} />
            </View>

            <ScrollView style={styles.content}>
                {/* Token Selector */}
                <Text style={styles.label}>Asset</Text>
                <TouchableOpacity
                    style={styles.tokenSelector}
                    onPress={() => setShowTokenPicker(true)}
                >
                    <View style={styles.tokenRow}>
                        <View style={styles.tokenIcon}>
                            <Text style={styles.tokenIconText}>{selectedTokenInfo.symbol.charAt(0)}</Text>
                        </View>
                        <View>
                            <Text style={styles.tokenName}>{selectedTokenInfo.symbol}</Text>
                            <Text style={styles.tokenBalance}>
                                Balance: ${tokens.find(t => t.address === selectedToken)?.balanceFormatted || '0.00'}
                            </Text>
                        </View>
                    </View>
                    <Text style={styles.dropdownArrow}>▼</Text>
                </TouchableOpacity>

                {/* Recipient */}
                <Text style={styles.label}>Recipient Address</Text>
                <TextInput
                    style={styles.input}
                    placeholder="0x..."
                    placeholderTextColor="#94A3B8"
                    value={recipient}
                    onChangeText={setRecipient}
                    autoCapitalize="none"
                    autoCorrect={false}
                />

                {/* Amount */}
                <Text style={styles.label}>Amount</Text>
                <View style={styles.amountContainer}>
                    <TextInput
                        style={[styles.input, styles.amountInput]}
                        placeholder="0.00"
                        placeholderTextColor="#94A3B8"
                        value={amount}
                        onChangeText={setAmount}
                        keyboardType="decimal-pad"
                    />
                    <TouchableOpacity
                        style={styles.maxBtn}
                        onPress={() => {
                            const bal = tokens.find(t => t.address === selectedToken)?.balanceFormatted || '0';
                            const numBal = parseFloat(bal.replace(/[KM]/g, '')) || 0;
                            setAmount(numBal.toString());
                        }}
                    >
                        <Text style={styles.maxText}>MAX</Text>
                    </TouchableOpacity>
                </View>

                {/* Memo */}
                <Text style={styles.label}>Memo (Optional)</Text>
                <TextInput
                    style={[styles.input, styles.memoInput]}
                    placeholder="Invoice ID, note, reference..."
                    placeholderTextColor="#94A3B8"
                    value={memo}
                    onChangeText={setMemo}
                    multiline
                />
                <Text style={styles.memoHint}>
                    💡 Memos are on-chain and can be used for payment reconciliation
                </Text>

                {/* Sponsorship Toggle */}
                <View style={styles.sponsorRow}>
                    <View>
                        <Text style={styles.sponsorLabel}>Sponsor Gas Fees</Text>
                        <Text style={styles.sponsorHint}>Pay no fees (if sponsored)</Text>
                    </View>
                    <Switch
                        value={isSponsored}
                        onValueChange={setSponsored}
                        trackColor={{ true: '#6366F1', false: '#E2E8F0' }}
                        thumbColor="#FFFFFF"
                    />
                </View>

                {/* Send Button */}
                <TouchableOpacity
                    style={[styles.sendBtn, isLoading && styles.sendBtnDisabled]}
                    onPress={handleSend}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.sendBtnText}>Send Payment</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>

            {/* Token Picker Modal */}
            <Modal visible={showTokenPicker} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select Token</Text>
                        <ScrollView>
                            {tokens.map((token) => (
                                <TouchableOpacity
                                    key={token.address}
                                    style={[
                                        styles.modalItem,
                                        token.address === selectedToken && styles.modalItemSelected,
                                    ]}
                                    onPress={() => {
                                        setSelectedToken(token.address);
                                        setShowTokenPicker(false);
                                    }}
                                >
                                    <View style={styles.tokenIcon}>
                                        <Text style={styles.tokenIconText}>{token.symbol.charAt(0)}</Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.tokenName}>{token.name}</Text>
                                        <Text style={styles.tokenSymbol}>{token.symbol}</Text>
                                    </View>
                                    <Text style={styles.modalBalance}>${token.balanceFormatted}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <TouchableOpacity
                            style={styles.modalClose}
                            onPress={() => setShowTokenPicker(false)}
                        >
                            <Text style={styles.modalCloseText}>Cancel</Text>
                        </TouchableOpacity>
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
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
        marginBottom: 8,
        marginTop: 16,
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#0F172A',
    },
    tokenSelector: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    tokenRow: {
        flexDirection: 'row',
        alignItems: 'center',
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
        fontSize: 16,
        fontWeight: '600',
        color: '#0F172A',
    },
    tokenSymbol: {
        fontSize: 13,
        color: '#64748B',
    },
    tokenBalance: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 2,
    },
    dropdownArrow: {
        fontSize: 12,
        color: '#94A3B8',
    },
    amountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    amountInput: {
        flex: 1,
        marginRight: 8,
    },
    maxBtn: {
        backgroundColor: '#EEF2FF',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderRadius: 12,
    },
    maxText: {
        color: '#6366F1',
        fontWeight: '600',
    },
    memoInput: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    memoHint: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 8,
    },
    sponsorRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 12,
        marginTop: 24,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    sponsorLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#0F172A',
    },
    sponsorHint: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 2,
    },
    sendBtn: {
        backgroundColor: '#6366F1',
        paddingVertical: 18,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 32,
        marginBottom: 40,
    },
    sendBtnDisabled: {
        opacity: 0.6,
    },
    sendBtnText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        maxHeight: '70%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0F172A',
        marginBottom: 16,
        textAlign: 'center',
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
    modalBalance: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0F172A',
    },
    modalClose: {
        backgroundColor: '#F1F5F9',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 16,
    },
    modalCloseText: {
        color: '#64748B',
        fontSize: 16,
        fontWeight: '500',
    },
});
