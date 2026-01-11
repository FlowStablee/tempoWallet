/**
 * AUTH SCREEN
 * Create new wallet or import existing
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { tempoService } from '../services/tempoService';
import { useWalletStore } from '../store/walletStore';
import { TEMPO_NETWORK } from '../config/tempo';

interface AuthScreenProps {
    onSuccess: () => void;
}

export function AuthScreen({ onSuccess }: AuthScreenProps) {
    const [mode, setMode] = useState<'welcome' | 'import'>('welcome');
    const [privateKey, setPrivateKey] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const setWallet = useWalletStore((s) => s.setWallet);

    const handleCreate = async () => {
        setIsLoading(true);
        try {
            const { address, privateKey } = tempoService.createWallet();
            setWallet(address, privateKey);
            Alert.alert(
                'Wallet Created! 🎉',
                `Your address: ${address.slice(0, 10)}...\n\n⚠️ IMPORTANT: Backup your private key from Settings!`,
                [{ text: 'Got it', onPress: onSuccess }]
            );
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleImport = async () => {
        if (!privateKey.trim()) {
            Alert.alert('Error', 'Please enter your private key');
            return;
        }

        setIsLoading(true);
        try {
            const result = tempoService.importWallet(privateKey.trim());
            setWallet(result.address, result.privateKey);
            Alert.alert('Wallet Imported!', `Address: ${result.address.slice(0, 10)}...`);
            onSuccess();
        } catch (error: any) {
            Alert.alert('Invalid Key', error.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (mode === 'import') {
        return (
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <StatusBar barStyle="light-content" />
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => setMode('welcome')}>
                        <Text style={styles.backText}>← Back</Text>
                    </TouchableOpacity>

                    <Text style={styles.title}>Import Wallet</Text>
                    <Text style={styles.subtitle}>Enter your private key to restore your wallet</Text>

                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Private Key</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="0x..."
                            placeholderTextColor="#6B7280"
                            value={privateKey}
                            onChangeText={setPrivateKey}
                            autoCapitalize="none"
                            autoCorrect={false}
                            secureTextEntry
                            multiline
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.btnPrimary, isLoading && styles.btnDisabled]}
                        onPress={handleImport}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={styles.btnPrimaryText}>Import Wallet</Text>
                        )}
                    </TouchableOpacity>

                    <Text style={styles.warning}>
                        ⚠️ Never share your private key with anyone
                    </Text>
                </ScrollView>
            </KeyboardAvoidingView>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            <View style={styles.content}>
                {/* Logo */}
                <View style={styles.logoContainer}>
                    <Text style={styles.logo}>TEMPO</Text>
                    <Text style={styles.tagline}>The Payment-First Blockchain</Text>
                </View>

                {/* Features */}
                <View style={styles.features}>
                    <View style={styles.featureRow}>
                        <Text style={styles.featureIcon}>⚡</Text>
                        <Text style={styles.featureText}>500ms Finality</Text>
                    </View>
                    <View style={styles.featureRow}>
                        <Text style={styles.featureIcon}>💵</Text>
                        <Text style={styles.featureText}>Pay Gas in Stablecoins</Text>
                    </View>
                    <View style={styles.featureRow}>
                        <Text style={styles.featureIcon}>🔐</Text>
                        <Text style={styles.featureText}>No Native Token Needed</Text>
                    </View>
                    <View style={styles.featureRow}>
                        <Text style={styles.featureIcon}>📝</Text>
                        <Text style={styles.featureText}>Payment Memos Built-in</Text>
                    </View>
                </View>

                {/* Network Badge */}
                <View style={styles.networkBadge}>
                    <View style={styles.networkDot} />
                    <Text style={styles.networkText}>
                        {TEMPO_NETWORK.name} (Chain ID: {TEMPO_NETWORK.chainId})
                    </Text>
                </View>

                {/* Buttons */}
                <View style={styles.buttons}>
                    <TouchableOpacity
                        style={[styles.btnPrimary, isLoading && styles.btnDisabled]}
                        onPress={handleCreate}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={styles.btnPrimaryText}>Create New Wallet</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.btnSecondary}
                        onPress={() => setMode('import')}
                    >
                        <Text style={styles.btnSecondaryText}>Import Existing Wallet</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
    },
    scrollContent: {
        flexGrow: 1,
        padding: 24,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },
    backBtn: {
        marginBottom: 20,
    },
    backText: {
        color: '#818CF8',
        fontSize: 16,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logo: {
        fontSize: 56,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: 4,
    },
    tagline: {
        fontSize: 16,
        color: '#94A3B8',
        marginTop: 8,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#94A3B8',
        marginBottom: 32,
    },
    features: {
        marginBottom: 40,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    featureIcon: {
        fontSize: 24,
        marginRight: 16,
    },
    featureText: {
        fontSize: 18,
        color: '#E2E8F0',
    },
    networkBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1E293B',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginBottom: 40,
        alignSelf: 'center',
    },
    networkDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#10B981',
        marginRight: 8,
    },
    networkText: {
        color: '#94A3B8',
        fontSize: 12,
    },
    inputContainer: {
        marginBottom: 24,
    },
    inputLabel: {
        color: '#94A3B8',
        fontSize: 14,
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#1E293B',
        borderWidth: 1,
        borderColor: '#334155',
        borderRadius: 12,
        padding: 16,
        color: '#FFFFFF',
        fontSize: 16,
        minHeight: 100,
    },
    buttons: {
        gap: 16,
    },
    btnPrimary: {
        backgroundColor: '#6366F1',
        paddingVertical: 18,
        borderRadius: 12,
        alignItems: 'center',
    },
    btnPrimaryText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
    btnSecondary: {
        backgroundColor: '#1E293B',
        paddingVertical: 18,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#334155',
    },
    btnSecondaryText: {
        color: '#818CF8',
        fontSize: 18,
        fontWeight: '600',
    },
    btnDisabled: {
        opacity: 0.6,
    },
    warning: {
        color: '#F59E0B',
        textAlign: 'center',
        marginTop: 24,
        fontSize: 14,
    },
});
