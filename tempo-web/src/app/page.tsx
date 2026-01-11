'use client';

import { useState, useEffect } from 'react';
import { ethers, Wallet, Contract, formatUnits, parseUnits } from 'ethers';

// Tempo Network Config
const TEMPO = {
  chainId: 42431,
  rpc: 'https://rpc.moderato.tempo.xyz',
  explorer: 'https://explore.tempo.xyz',
  faucet: 'https://docs.tempo.xyz/quickstart/faucet',
};

const TOKENS = [
  { address: '0x20c0000000000000000000000000000000000000', symbol: 'pathUSD', name: 'Path USD' },
  { address: '0x20c0000000000000000000000000000000000001', symbol: 'αUSD', name: 'Alpha USD' },
  { address: '0x20c0000000000000000000000000000000000002', symbol: 'βUSD', name: 'Beta USD' },
  { address: '0x20c0000000000000000000000000000000000003', symbol: 'θUSD', name: 'Theta USD' },
];

const TIP20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function balanceOf(address) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function transferWithMemo(address to, uint256 amount, bytes32 memo)',
];

type Screen = 'auth' | 'home' | 'send' | 'receive' | 'faucet' | 'settings';
type TokenBalance = { address: string; symbol: string; name: string; balance: string };

export default function TempoWallet() {
  const [screen, setScreen] = useState<Screen>('auth');
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [address, setAddress] = useState<string>('');
  const [privateKey, setPrivateKey] = useState<string>('');
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [loading, setLoading] = useState(false);
  const [importKey, setImportKey] = useState('');

  // Send form
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [selectedToken, setSelectedToken] = useState(TOKENS[0].address);
  const [txHash, setTxHash] = useState('');

  // Faucet
  const [faucetStatus, setFaucetStatus] = useState<'idle' | 'claiming' | 'success' | 'error'>('idle');
  const [faucetMessage, setFaucetMessage] = useState('');

  const provider = new ethers.JsonRpcProvider(TEMPO.rpc);

  const createWallet = () => {
    const newWallet = Wallet.createRandom();
    const connectedWallet = new Wallet(newWallet.privateKey, provider);
    setWallet(connectedWallet);
    setAddress(connectedWallet.address);
    setPrivateKey(newWallet.privateKey);
    localStorage.setItem('tempo_pk', newWallet.privateKey);
    setScreen('home');
    fetchBalances(connectedWallet.address);
  };

  const importWallet = () => {
    try {
      const pk = importKey.startsWith('0x') ? importKey : `0x${importKey}`;
      const imported = new Wallet(pk, provider);
      setWallet(imported);
      setAddress(imported.address);
      setPrivateKey(imported.privateKey);
      localStorage.setItem('tempo_pk', imported.privateKey);
      setScreen('home');
      fetchBalances(imported.address);
    } catch (e) {
      alert('Invalid private key');
    }
  };

  const fetchBalances = async (addr: string) => {
    setLoading(true);
    const bals: TokenBalance[] = [];
    for (const token of TOKENS) {
      try {
        const contract = new Contract(token.address, TIP20_ABI, provider);
        const bal = await contract.balanceOf(addr);
        bals.push({ ...token, balance: formatUnits(bal, 6) });
      } catch {
        bals.push({ ...token, balance: '0.00' });
      }
    }
    setBalances(bals);
    setLoading(false);
  };

  const sendPayment = async () => {
    if (!wallet || !recipient || !amount) return;
    setLoading(true);
    try {
      const contract = new Contract(selectedToken, TIP20_ABI, wallet);
      const amtUnits = parseUnits(amount, 6);
      let tx;
      if (memo.trim()) {
        const memoBytes = memo.length > 31
          ? ethers.keccak256(ethers.toUtf8Bytes(memo))
          : ethers.encodeBytes32String(memo.slice(0, 31));
        tx = await contract.transferWithMemo(recipient, amtUnits, memoBytes);
      } else {
        tx = await contract.transfer(recipient, amtUnits);
      }
      setTxHash(tx.hash);
      await tx.wait();
      fetchBalances(address);
      setRecipient('');
      setAmount('');
      setMemo('');
    } catch (e: any) {
      alert('Transaction failed: ' + e.message);
    }
    setLoading(false);
  };

  const claimFaucet = async () => {
    if (!address) return;
    setFaucetStatus('claiming');
    setFaucetMessage('');

    try {
      // Call tempo_fundAddress RPC method directly
      const response = await fetch(TEMPO.rpc, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'tempo_fundAddress',
          params: [address],
          id: 1,
        }),
      });

      const data = await response.json();

      if (data.error) {
        setFaucetStatus('error');
        setFaucetMessage(data.error.message || 'Faucet error');
      } else {
        setFaucetStatus('success');
        setFaucetMessage('Tokens claimed successfully! Refresh to see balance.');
        // Refresh balances after short delay
        setTimeout(() => fetchBalances(address), 2000);
      }
    } catch (e: any) {
      setFaucetStatus('error');
      setFaucetMessage(e.message || 'Failed to claim tokens');
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem('tempo_pk');
    if (stored) {
      try {
        const w = new Wallet(stored, provider);
        setWallet(w);
        setAddress(w.address);
        setPrivateKey(stored);
        setScreen('home');
        fetchBalances(w.address);
      } catch { }
    }
  }, []);

  const totalBalance = balances.reduce((sum, b) => sum + parseFloat(b.balance || '0'), 0);

  // AUTH SCREEN
  if (screen === 'auth') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-12">
            <h1 className="text-6xl font-black text-white tracking-wider mb-2">TEMPO</h1>
            <p className="text-purple-300">The Payment-First Blockchain</p>
          </div>

          <div className="space-y-4 mb-8 text-purple-200">
            <div className="flex items-center gap-3"><span>⚡</span> 500ms Finality</div>
            <div className="flex items-center gap-3"><span>💵</span> Pay Gas in Stablecoins</div>
            <div className="flex items-center gap-3"><span>📝</span> Built-in Payment Memos</div>
          </div>

          <div className="bg-slate-800/50 p-4 rounded-xl mb-6 border border-slate-700">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
              Moderato Testnet (42431)
            </div>
          </div>

          <button
            onClick={createWallet}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-xl font-semibold text-lg mb-4 transition"
          >
            Create New Wallet
          </button>

          <div className="space-y-3">
            <input
              type="password"
              placeholder="Enter private key to import..."
              value={importKey}
              onChange={(e) => setImportKey(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500"
            />
            <button
              onClick={importWallet}
              className="w-full bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl font-semibold transition"
            >
              Import Wallet
            </button>
          </div>
        </div>
      </div>
    );
  }

  // HOME SCREEN
  if (screen === 'home') {
    return (
      <div className="min-h-screen bg-slate-100">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Tempo Wallet</h1>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              Moderato Testnet
            </div>
          </div>
          <button
            onClick={() => setScreen('settings')}
            className="px-3 py-1 bg-slate-100 rounded-lg text-sm font-mono"
          >
            {address.slice(0, 6)}...{address.slice(-4)}
          </button>
        </div>

        {/* Balance Card */}
        <div className="m-6 p-6 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl text-white shadow-xl">
          <p className="text-indigo-200 text-sm font-medium">Total Balance</p>
          <p className="text-4xl font-bold my-2">${totalBalance.toFixed(2)}</p>
          <p className="text-indigo-200 text-sm">USD Stablecoins</p>

          <div className="flex gap-3 mt-6">
            <button onClick={() => setScreen('send')} className="flex-1 bg-white/20 hover:bg-white/30 py-3 rounded-xl font-semibold transition">
              ↑ Send
            </button>
            <button onClick={() => setScreen('receive')} className="flex-1 bg-white/20 hover:bg-white/30 py-3 rounded-xl font-semibold transition">
              ↓ Receive
            </button>
            <button onClick={() => setScreen('faucet')} className="flex-1 bg-white/20 hover:bg-white/30 py-3 rounded-xl font-semibold transition">
              💧 Faucet
            </button>
          </div>
        </div>

        {/* Token List */}
        <div className="px-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-slate-800">Assets</h2>
            <button onClick={() => fetchBalances(address)} className="text-sm text-indigo-600 font-medium">
              {loading ? '...' : 'Refresh'}
            </button>
          </div>

          <div className="space-y-3">
            {balances.map((token) => (
              <div key={token.address} className="bg-white p-4 rounded-xl flex items-center shadow-sm">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-lg mr-4">
                  {token.symbol.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-800">{token.name}</p>
                  <p className="text-sm text-slate-500">{token.symbol}</p>
                </div>
                <p className="font-semibold text-slate-800">${parseFloat(token.balance).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // SEND SCREEN
  if (screen === 'send') {
    return (
      <div className="min-h-screen bg-slate-100">
        <div className="bg-white border-b px-6 py-4 flex items-center gap-4">
          <button onClick={() => setScreen('home')} className="text-indigo-600 font-medium">← Back</button>
          <h1 className="text-lg font-semibold">Send Payment</h1>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-600 mb-2 block">Token</label>
            <select
              value={selectedToken}
              onChange={(e) => setSelectedToken(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl p-4"
            >
              {balances.map((t) => (
                <option key={t.address} value={t.address}>{t.symbol} (${parseFloat(t.balance).toFixed(2)})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-600 mb-2 block">Recipient</label>
            <input
              type="text"
              placeholder="0x..."
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl p-4"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-600 mb-2 block">Amount</label>
            <input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl p-4"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-600 mb-2 block">Memo (Optional)</label>
            <input
              type="text"
              placeholder="Invoice ID, note..."
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl p-4"
            />
            <p className="text-xs text-slate-500 mt-2">💡 Memos are stored on-chain for payment reconciliation</p>
          </div>

          <button
            onClick={sendPayment}
            disabled={loading || !recipient || !amount}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-400 text-white py-4 rounded-xl font-semibold mt-6 transition"
          >
            {loading ? 'Sending...' : 'Send Payment'}
          </button>

          {txHash && (
            <div className="bg-green-50 border border-green-200 p-4 rounded-xl">
              <p className="text-green-700 font-medium">Transaction Sent!</p>
              <a
                href={`${TEMPO.explorer}/tx/${txHash}`}
                target="_blank"
                className="text-sm text-green-600 underline"
              >
                View on Explorer →
              </a>
            </div>
          )}
        </div>
      </div>
    );
  }

  // RECEIVE SCREEN
  if (screen === 'receive') {
    return (
      <div className="min-h-screen bg-slate-100">
        <div className="bg-white border-b px-6 py-4 flex items-center gap-4">
          <button onClick={() => setScreen('home')} className="text-indigo-600 font-medium">← Back</button>
          <h1 className="text-lg font-semibold">Receive</h1>
        </div>

        <div className="p-6">
          <div className="bg-white p-8 rounded-2xl text-center shadow-sm">
            <div className="w-48 h-48 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="text-6xl">📱</span>
            </div>
            <p className="text-sm text-slate-500 mb-4">Your Wallet Address</p>
            <div className="bg-slate-100 p-4 rounded-xl font-mono text-sm break-all mb-4">
              {address}
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(address)}
              className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium"
            >
              📋 Copy Address
            </button>
          </div>

          <div className="mt-6 bg-indigo-50 p-4 rounded-xl">
            <p className="text-indigo-800 font-medium mb-2">Network</p>
            <p className="text-indigo-600 text-sm">Tempo Moderato Testnet (Chain ID: 42431)</p>
          </div>
        </div>
      </div>
    );
  }

  // FAUCET SCREEN
  if (screen === 'faucet') {
    return (
      <div className="min-h-screen bg-slate-100">
        <div className="bg-white border-b px-6 py-4 flex items-center gap-4">
          <button onClick={() => setScreen('home')} className="text-indigo-600 font-medium">← Back</button>
          <h1 className="text-lg font-semibold">Testnet Faucet</h1>
        </div>

        <div className="p-6">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-2xl text-center mb-6 text-white">
            <span className="text-5xl mb-4 block">💧</span>
            <h2 className="text-xl font-bold mb-2">Get Free Testnet Tokens</h2>
            <p className="text-indigo-100">Claim test stablecoins instantly via RPC</p>
          </div>

          <div className="space-y-3 mb-6">
            {TOKENS.map((token) => (
              <div key={token.address} className="bg-white p-4 rounded-xl flex items-center">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold mr-4">
                  {token.symbol.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{token.name}</p>
                  <p className="text-sm text-slate-500">{token.symbol}</p>
                </div>
                <p className="text-green-600 font-medium">✓</p>
              </div>
            ))}
          </div>

          {/* Claim Button */}
          <button
            onClick={claimFaucet}
            disabled={faucetStatus === 'claiming'}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 text-white py-4 rounded-xl font-semibold transition flex items-center justify-center gap-2"
          >
            {faucetStatus === 'claiming' ? (
              <>
                <span className="animate-spin">⏳</span>
                Claiming...
              </>
            ) : (
              <>
                💧 Claim Testnet Tokens
              </>
            )}
          </button>

          {/* Status Messages */}
          {faucetStatus === 'success' && (
            <div className="mt-4 bg-green-50 border border-green-200 p-4 rounded-xl">
              <p className="text-green-700 font-medium">✓ {faucetMessage}</p>
            </div>
          )}

          {faucetStatus === 'error' && (
            <div className="mt-4 bg-red-50 border border-red-200 p-4 rounded-xl">
              <p className="text-red-700 font-medium">✗ {faucetMessage}</p>
              <p className="text-sm text-red-500 mt-2">Try again in a few minutes (rate limited)</p>
            </div>
          )}

          {/* Info */}
          <div className="mt-6 bg-amber-50 border border-amber-200 p-4 rounded-xl">
            <p className="text-amber-800 font-medium mb-2">ℹ️ How it works</p>
            <p className="text-amber-700 text-sm">
              Uses <code className="bg-amber-100 px-1 rounded">tempo_fundAddress</code> RPC method to drip test tokens directly to your wallet. Rate limited per address.
            </p>
          </div>

          {/* Address Display */}
          <div className="mt-4 bg-white p-4 rounded-xl">
            <p className="text-sm text-slate-500 mb-2">Your wallet address:</p>
            <div className="bg-slate-100 p-3 rounded-lg font-mono text-xs break-all">{address}</div>
          </div>
        </div>
      </div>
    );
  }

  // SETTINGS SCREEN
  if (screen === 'settings') {
    return (
      <div className="min-h-screen bg-slate-100">
        <div className="bg-white border-b px-6 py-4 flex items-center gap-4">
          <button onClick={() => setScreen('home')} className="text-indigo-600 font-medium">← Back</button>
          <h1 className="text-lg font-semibold">Settings</h1>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-white rounded-xl overflow-hidden">
            <div className="p-4 border-b flex justify-between">
              <span className="text-slate-600">Address</span>
              <span className="font-mono text-sm">{address.slice(0, 10)}...{address.slice(-8)}</span>
            </div>
            <a href={`${TEMPO.explorer}/address/${address}`} target="_blank" className="p-4 border-b flex justify-between hover:bg-slate-50">
              <span className="text-slate-600">View on Explorer</span>
              <span className="text-indigo-600">↗</span>
            </a>
          </div>

          <div className="bg-white rounded-xl overflow-hidden">
            <div className="p-4 border-b">
              <span className="text-slate-600">Network</span>
              <p className="font-medium mt-1">Tempo Moderato Testnet</p>
            </div>
            <div className="p-4 border-b flex justify-between">
              <span className="text-slate-600">Chain ID</span>
              <span className="font-medium">42431</span>
            </div>
            <div className="p-4 flex justify-between">
              <span className="text-slate-600">RPC</span>
              <span className="text-sm font-mono text-slate-500">{TEMPO.rpc}</span>
            </div>
          </div>

          <div className="bg-white rounded-xl overflow-hidden">
            <button
              onClick={() => {
                if (confirm('Show private key? Never share this!')) {
                  alert(privateKey);
                }
              }}
              className="w-full p-4 text-left hover:bg-slate-50"
            >
              <span className="text-slate-600">Export Private Key</span>
            </button>
          </div>

          <button
            onClick={() => {
              localStorage.removeItem('tempo_pk');
              setWallet(null);
              setAddress('');
              setScreen('auth');
            }}
            className="w-full bg-red-50 text-red-600 py-4 rounded-xl font-semibold"
          >
            Logout
          </button>

          <p className="text-center text-slate-400 text-sm">Tempo Wallet v1.0.0</p>
        </div>
      </div>
    );
  }

  return null;
}
