/**
 * HOME SCREEN
 * Main dashboard with token balances
 */

import React, { useEffect, useCallback, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    RefreshControl,
    StatusBar,
    Linking,
    Clipboard,
    Alert,
} from 'react-native';
import { useWalletStore, TokenBalance } from '../store/walletStore';
import { tempoService } from '../services/tempoService';
import { TEMPO_NETWORK, getExplorerUrl } from '../config/tempo';

interface HomeScreenProps {
    onNavigate: (screen: string) => void;
}

export function HomeScreen({ onNavigate }: HomeScreenProps) {
    const { address, tokens, customTokens, setTokens, setLoading, isLoading, setError } =
        useWalletStore();
    const [refreshing, setRefreshing] = useState(false);

    const fetchBalances = useCallback(async () => {
        if (!address) return;
        try {
            const balances = await tempoService.getAllBalances(address, customTokens);
            setTokens(balances);
        } catch (error: any) {
            setError(error.message);
        }
    }, [address, customTokens, setTokens, setError]);

    useEffect(() => {
        fetchBalances();
    }, [fetchBalances]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchBalances();
        setRefreshing(false);
    };

    const copyAddress = () => {
        if (address) {
            Clipboard.setString(address);
            Alert.alert('Copied!', 'Address copied to clipboard');
        }
    };

    const openExplorer = () => {
        if (address) {
            Linking.openURL(getExplorerUrl.address(address));
        }
    };

    const totalBalance = tokens.reduce((sum, t) => {
        const bal = parseFloat(t.balanceFormatted.replace(/[KM]/g, '')) || 0;
        const multiplier = t.balanceFormatted.includes('M') ? 1000000 :
            t.balanceFormatted.includes('K') ? 1000 : 1;
        return sum + (bal * multiplier);
    }, 0);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Tempo Wallet</Text>
                    <View style={styles.networkRow}>
                        <View style={styles.networkDot} />
                        <Text style={styles.networkText}>Moderato Testnet</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.addressBtn} onPress={copyAddress}>
                    <Text style={styles.addressText}>
                        {address?.slice(0, 6)}...{address?.slice(-4)}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Balance Card */}
            <View style={styles.balanceCard}>
                <Text style={styles.balanceLabel}>Total Balance</Text>
                <Text style={styles.balanceValue}>
                    ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
                <Text style={styles.balanceCurrency}>USD Stablecoins</Text>

                <View style={styles.cardActions}>
                    <TouchableOpacity
                        style={styles.cardActionBtn}
                        onPress={() => onNavigate('SEND')}
                    >
                        <Text style={styles.cardActionIcon}>↑</Text>
                        <Text style={styles.cardActionText}>Send</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.cardActionBtn}
                        onPress={() => onNavigate('RECEIVE')}
                    >
                        <Text style={styles.cardActionIcon}>↓</Text>
                        <Text style={styles.cardActionText}>Receive</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.cardActionBtn}
                        onPress={() => onNavigate('FAUCET')}
                    >
                        <Text style={styles.cardActionIcon}>💧</Text>
                        <Text style={styles.cardActionText}>Faucet</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Tokens List */}
            <View style={styles.tokensSection}>
                <View style={styles.tokenHeader}>
                    <Text style={styles.tokenHeaderText}>Assets</Text>
                    <TouchableOpacity onPress={() => onNavigate('TOKENS')}>
                        <Text style={styles.manageText}>Manage</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView
                    style={styles.tokensList}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                >
                    {tokens.length === 0 && !isLoading ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>Loading tokens...</Text>
                        </View>
                    ) : (
                        tokens.map((token) => (
                            <TouchableOpacity
                                key={token.address}
                                style={styles.tokenItem}
                                onPress={() => Linking.openURL(getExplorerUrl.token(token.address))}
                            >
                                <View style={styles.tokenIcon}>
                                    <Text style={styles.tokenIconText}>
                                        {token.symbol.charAt(0)}
                                    </Text>
                                </View>
                                <View style={styles.tokenInfo}>
                                    <Text style={styles.tokenName}>{token.name}</Text>
                                    <Text style={styles.tokenSymbol}>{token.symbol}</Text>
                                </View>
                                <View style={styles.tokenBalance}>
                                    <Text style={styles.tokenBalanceValue}>
                                        ${token.balanceFormatted}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </ScrollView>
            </View>

            {/* Bottom Navigation */}
            <View style={styles.bottomNav}>
                <TouchableOpacity style={[styles.navItem, styles.navItemActive]}>
                    <Text style={styles.navIcon}>🏠</Text>
                    <Text style={[styles.navText, styles.navTextActive]}>Home</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => onNavigate('SEND')}>
                    <Text style={styles.navIcon}>↗️</Text>
                    <Text style={styles.navText}>Send</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => onNavigate('TOKENS')}>
                    <Text style={styles.navIcon}>💰</Text>
                    <Text style={styles.navText}>Tokens</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => onNavigate('SETTINGS')}>
                    <Text style={styles.navIcon}>⚙️</Text>
                    <Text style={styles.navText}>Settings</Text>
                </TouchableOpacity>
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
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#0F172A',
    },
    networkRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    networkDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#10B981',
        marginRight: 6,
    },
    networkText: {
        fontSize: 12,
        color: '#64748B',
    },
    addressBtn: {
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    addressText: {
        fontFamily: 'monospace',
        fontSize: 12,
        color: '#475569',
    },
    balanceCard: {
        margin: 20,
        padding: 24,
        backgroundColor: '#6366F1',
        borderRadius: 20,
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    balanceLabel: {
        color: '#C7D2FE',
        fontSize: 14,
        fontWeight: '500',
    },
    balanceValue: {
        color: '#FFFFFF',
        fontSize: 42,
        fontWeight: 'bold',
        marginVertical: 8,
    },
    balanceCurrency: {
        color: '#A5B4FC',
        fontSize: 14,
    },
    cardActions: {
        flexDirection: 'row',
        marginTop: 24,
        gap: 12,
    },
    cardActionBtn: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    cardActionIcon: {
        fontSize: 20,
        marginBottom: 4,
    },
    cardActionText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
    tokensSection: {
        flex: 1,
        marginHorizontal: 20,
    },
    tokenHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    tokenHeaderText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#0F172A',
    },
    manageText: {
        fontSize: 14,
        color: '#6366F1',
        fontWeight: '500',
    },
    tokensList: {
        flex: 1,
    },
    tokenItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
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
        fontSize: 18,
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
        marginTop: 2,
    },
    tokenBalance: {
        alignItems: 'flex-end',
    },
    tokenBalanceValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#0F172A',
    },
    emptyState: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        color: '#94A3B8',
    },
    bottomNav: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
        paddingBottom: 20,
        paddingTop: 12,
    },
    navItem: {
        flex: 1,
        alignItems: 'center',
    },
    navItemActive: {},
    navIcon: {
        fontSize: 20,
        marginBottom: 4,
    },
    navText: {
        fontSize: 11,
        color: '#94A3B8',
    },
    navTextActive: {
        color: '#6366F1',
        fontWeight: '600',
    },
});
