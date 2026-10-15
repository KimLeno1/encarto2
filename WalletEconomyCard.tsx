import React, { useState, useEffect, useRef } from 'react';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Plus, 
  CircleMinus, 
  History, 
  TrendingUp, 
  CreditCard, 
  ShieldCheck, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  Coins
} from 'lucide-react';
import { PlayerProfile } from './types.ts';

interface Transaction {
  id: string;
  type: 'in' | 'out';
  title: string;
  category: 'Tournament Prize' | 'Armory Purchase' | 'Quest Reward' | 'Deposit' | 'PvP Duel Wager' | 'Tournament Entry';
  amount: number;
  timestamp: string;
  status: 'confirmed' | 'pending';
}

interface WalletEconomyCardProps {
  profile: PlayerProfile;
  setProfile?: (updater: (prev: PlayerProfile) => PlayerProfile) => void;
  onDeposit?: () => void;
  onWithdraw?: () => void;
}

export const WalletEconomyCard: React.FC<WalletEconomyCardProps> = ({
  profile,
  setProfile,
  onDeposit,
  onWithdraw,
}) => {
  // Count-up animation for balance
  const [displayBalance, setDisplayBalance] = useState<number>(profile.balance);
  const prevBalanceRef = useRef<number>(profile.balance);
  const animFrameRef = useRef<number | null>(null);

  // Quick Action Modal states
  const [activeModal, setActiveModal] = useState<'deposit' | 'withdraw' | 'history' | null>(null);
  const [depositAmount, setDepositAmount] = useState<number>(100);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(50);
  const [isProcessing, setIsProcessing] = useState(false);
  const [modalSuccessMsg, setModalSuccessMsg] = useState<string | null>(null);

  // Sparkline data points (normalized between 0 and 100)
  const sparklineData = [240, 290, 270, 410, 390, 520, 480, 680, 850, 920, 1150, Math.round(profile.balance)];
  const minVal = Math.min(...sparklineData);
  const maxVal = Math.max(...sparklineData);
  const range = maxVal - minVal || 1;

  // Generate SVG path for sparkline
  const width = 360;
  const height = 70;
  const points = sparklineData.map((val, i) => {
    const x = (i / (sparklineData.length - 1)) * (width - 20) + 10;
    const y = height - 12 - ((val - minVal) / range) * (height - 24);
    return { x, y, val };
  });

  const pathD = points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`, '');
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  // Dynamic Transactions state
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 'tx-9941',
      type: 'in',
      title: 'Neon Masters Knockout Prize',
      category: 'Tournament Prize',
      amount: 450,
      timestamp: 'Today, 14:22',
      status: 'confirmed'
    },
    {
      id: 'tx-9940',
      type: 'out',
      title: 'Cyber Crown Halo Purchase',
      category: 'Armory Purchase',
      amount: 120,
      timestamp: 'Today, 11:05',
      status: 'confirmed'
    },
    {
      id: 'tx-9938',
      type: 'in',
      title: 'Daily Hero Bounty Quest',
      category: 'Quest Reward',
      amount: 40,
      timestamp: 'Yesterday, 20:30',
      status: 'confirmed'
    },
    {
      id: 'tx-9934',
      type: 'in',
      title: 'Ledger Capital Injection',
      category: 'Deposit',
      amount: 500,
      timestamp: '2 days ago',
      status: 'confirmed'
    },
    {
      id: 'tx-9929',
      type: 'out',
      title: 'Grand Finals Qualifier Entry',
      category: 'Tournament Entry',
      amount: 50,
      timestamp: '3 days ago',
      status: 'confirmed'
    },
    {
      id: 'tx-9920',
      type: 'in',
      title: 'Tactical Checkers High Roller Duel',
      category: 'PvP Duel Wager',
      amount: 50,
      timestamp: '4 days ago',
      status: 'confirmed'
    }
  ]);

  // Count-up animation effect
  useEffect(() => {
    const startVal = prevBalanceRef.current;
    const endVal = profile.balance;
    prevBalanceRef.current = profile.balance;

    if (startVal === endVal) {
      setDisplayBalance(endVal);
      return;
    }

    const duration = 750; // ms
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Cubic ease-out
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = startVal + (endVal - startVal) * easeOut;
      setDisplayBalance(current);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayBalance(endVal);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [profile.balance]);

  // Handle local deposit
  const handleConfirmDeposit = () => {
    if (depositAmount <= 0) return;
    setIsProcessing(true);
    setTimeout(() => {
      const newTx: Transaction = {
        id: `tx-${Date.now().toString().slice(-4)}`,
        type: 'in',
        title: 'Digital Capital Deposit',
        category: 'Deposit',
        amount: depositAmount,
        timestamp: 'Just now',
        status: 'confirmed'
      };
      setTransactions(prev => [newTx, ...prev]);
      if (setProfile) {
        setProfile(prev => ({ ...prev, balance: prev.balance + depositAmount }));
      }
      setIsProcessing(false);
      setModalSuccessMsg(`Successfully credited +${depositAmount} M3GA to your Cyber Vault!`);
      setTimeout(() => {
        setModalSuccessMsg(null);
        setActiveModal(null);
      }, 1200);
    }, 600);
  };

  // Handle local withdraw
  const handleConfirmWithdraw = () => {
    if (withdrawAmount <= 0) return;
    if (withdrawAmount > profile.balance) {
      alert('Insufficient M3GA balance for withdrawal.');
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      const newTx: Transaction = {
        id: `tx-${Date.now().toString().slice(-4)}`,
        type: 'out',
        title: 'Vault Liquidity Withdrawal',
        category: 'Armory Purchase',
        amount: withdrawAmount,
        timestamp: 'Just now',
        status: 'confirmed'
      };
      setTransactions(prev => [newTx, ...prev]);
      if (setProfile) {
        setProfile(prev => ({ ...prev, balance: prev.balance - withdrawAmount }));
      }
      setIsProcessing(false);
      setModalSuccessMsg(`Dispatched ${withdrawAmount} M3GA to your off-chain destination!`);
      setTimeout(() => {
        setModalSuccessMsg(null);
        setActiveModal(null);
      }, 1200);
    }, 600);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Large Glass Card for Wallet */}
      <div className="economy-glass-card rounded-[2rem] p-6 sm:p-8 lg:p-10 relative overflow-hidden">
        {/* Soft radial glow backgrounds */}
        <div className="pointer-events-none absolute -right-20 -top-24 w-80 h-80 rounded-full bg-purple-600/15 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 -bottom-24 w-80 h-80 rounded-full bg-blue-600/15 blur-3xl" />

        <div className="relative z-10 grid gap-8 lg:grid-cols-12 lg:items-center">
          {/* Left: Balance & Quick Actions */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-400/30 flex items-center justify-center text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                <Wallet size={20} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-300">Encarto Cyber Vault</span>
                <p className="text-xs text-purple-300/70 font-mono">Autonomous Staking Ledger</p>
              </div>
            </div>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">Total M3GA Balance</p>
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-white tabular-nums drop-shadow-[0_0_25px_rgba(168,85,247,0.45)]">
                  {displayBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-xl font-black bg-gradient-to-r from-purple-400 to-cyan-300 bg-clip-text text-transparent tracking-wider">
                  M3GA
                </span>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                  <TrendingUp size={12} /> +18.4% 7d
                </span>
              </div>
            </div>

            {/* Quick Action Buttons (Deposit, Withdraw, History) */}
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() => {
                  if (onDeposit) onDeposit();
                  setActiveModal('deposit');
                }}
                className="group relative inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider text-white overflow-hidden bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] active:scale-95 transition-all cursor-pointer min-h-[44px]"
              >
                <Plus size={16} className="text-cyan-200 group-hover:rotate-90 transition-transform duration-300" />
                <span>Deposit</span>
              </button>

              <button
                onClick={() => {
                  if (onWithdraw) onWithdraw();
                  setActiveModal('withdraw');
                }}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider text-purple-200 bg-white/[0.04] hover:bg-purple-900/30 border border-purple-400/30 hover:border-purple-400/60 active:scale-95 transition-all cursor-pointer min-h-[44px]"
              >
                <CircleMinus size={16} className="text-purple-300" />
                <span>Withdraw</span>
              </button>

              <button
                onClick={() => setActiveModal('history')}
                className="inline-flex items-center gap-2.5 px-5 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider text-slate-300 bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-cyan-400/40 active:scale-95 transition-all cursor-pointer min-h-[44px]"
              >
                <History size={16} className="text-cyan-300" />
                <span>History</span>
              </button>
            </div>
          </div>

          {/* Right: Inline SVG Sparkline of Recent Activity */}
          <div className="lg:col-span-5 rounded-2xl bg-black/40 border border-purple-500/20 p-4 sm:p-5 relative flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles size={13} className="text-cyan-300" /> Recent Capital Flow (7D)
              </span>
              <span className="text-[10px] font-mono font-bold text-cyan-300">
                Peak {maxVal.toLocaleString()} M3GA
              </span>
            </div>

            {/* Sparkline Canvas / SVG */}
            <div className="relative w-full h-[90px] flex items-center justify-center overflow-hidden">
              <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="sparklineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#a855f7" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="sparklineStroke" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="60%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#22d3ee" />
                  </linearGradient>
                </defs>

                {/* Area under curve */}
                <path d={areaD} fill="url(#sparklineGrad)" />

                {/* Main line */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="url(#sparklineStroke)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Latest point indicator */}
                <circle
                  cx={points[points.length - 1].x}
                  cy={points[points.length - 1].y}
                  r="4"
                  fill="#22d3ee"
                  stroke="#0b0b2b"
                  strokeWidth="2"
                  className="filter drop-shadow-[0_0_8px_#22d3ee]"
                />
              </svg>
            </div>

            <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5 text-[9px] font-mono text-slate-500">
              <span>Day 1 (240 M3GA)</span>
              <span className="text-purple-300 font-bold">Ledger Block #884102</span>
              <span className="text-cyan-300">Now ({Math.round(profile.balance)} M3GA)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions as a Clean List with Colored In/Out Arrows */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-black text-white uppercase tracking-tight">Ledger Records</h3>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Live Feed
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">Showing last 6 transactions</span>
        </div>

        <div className="space-y-2.5">
          {transactions.map(tx => {
            const isIn = tx.type === 'in';
            return (
              <div
                key={tx.id}
                className="group p-4 sm:p-5 rounded-2xl bg-[#0d0d24]/80 border border-white/[0.06] hover:border-purple-400/40 hover:bg-[#121235]/90 transition-all flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 min-w-0">
                  {/* Colored In/Out Arrow Indicator */}
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                      isIn
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                        : 'bg-rose-500/15 border-rose-500/30 text-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.25)]'
                    }`}
                  >
                    {isIn ? (
                      <ArrowDownLeft size={20} className="group-hover:scale-110 transition-transform" />
                    ) : (
                      <ArrowUpRight size={20} className="group-hover:scale-110 transition-transform" />
                    )}
                  </div>

                  {/* Title & Category Details */}
                  <div className="min-w-0">
                    <p className="text-sm font-extrabold text-white truncate group-hover:text-cyan-200 transition-colors">
                      {tx.title}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 mt-0.5">
                      <span className="text-purple-300 font-mono">{tx.id}</span>
                      <span>•</span>
                      <span className="uppercase tracking-wider">{tx.category}</span>
                      <span>•</span>
                      <span className="text-slate-500 font-normal">{tx.timestamp}</span>
                    </div>
                  </div>
                </div>

                {/* Amount with Colored Sign */}
                <div className="text-right shrink-0">
                  <div
                    className={`text-lg font-black font-mono tabular-nums ${
                      isIn ? 'text-emerald-400' : 'text-slate-200'
                    }`}
                  >
                    {isIn ? '+' : '-'}{tx.amount.toLocaleString()} <span className="text-[10px] text-purple-300 font-sans">M3GA</span>
                  </div>
                  <span className="text-[9px] font-mono text-slate-500 uppercase flex items-center justify-end gap-1">
                    <CheckCircle2 size={10} className="text-emerald-400" /> Settled
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Deposit / Withdraw / History Modals */}
      {activeModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-[#0e0e29] border border-purple-500/40 p-6 sm:p-8 shadow-[0_0_50px_rgba(168,85,247,0.3)] space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center">
                  {activeModal === 'deposit' && <Plus size={20} />}
                  {activeModal === 'withdraw' && <CircleMinus size={20} />}
                  {activeModal === 'history' && <History size={20} />}
                </div>
                <h3 className="text-lg font-black text-white uppercase tracking-wider">
                  {activeModal === 'deposit' && 'Deposit M3GA Capital'}
                  {activeModal === 'withdraw' && 'Withdraw M3GA Capital'}
                  {activeModal === 'history' && 'Complete Ledger Log'}
                </h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/5 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {modalSuccessMsg && (
              <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-center">
                {modalSuccessMsg}
              </div>
            )}

            {activeModal === 'deposit' && (
              <div className="space-y-5">
                <p className="text-xs text-slate-400">
                  Select or enter amount to inject into your competitive balance:
                </p>
                <div className="grid grid-cols-3 gap-2.5">
                  {[50, 100, 250, 500, 1000].map(amt => (
                    <button
                      key={amt}
                      onClick={() => setDepositAmount(amt)}
                      className={`py-2.5 rounded-xl text-xs font-mono font-black border cursor-pointer ${
                        depositAmount === amt
                          ? 'border-cyan-400 bg-cyan-400/20 text-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.4)]'
                          : 'border-white/10 bg-white/5 text-slate-300 hover:border-purple-400/30'
                      }`}
                    >
                      +{amt} M3GA
                    </button>
                  ))}
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Custom Value</label>
                  <input
                    type="number"
                    min="1"
                    value={depositAmount}
                    onChange={e => setDepositAmount(Number(e.target.value))}
                    className="mt-1.5 w-full bg-black/50 border border-purple-500/30 rounded-xl px-4 py-3 font-mono text-white text-lg focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <button
                  disabled={isProcessing}
                  onClick={handleConfirmDeposit}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-black uppercase tracking-wider text-xs shadow-lg shadow-purple-600/30 active:scale-95 transition-all cursor-pointer"
                >
                  {isProcessing ? 'Processing Transaction...' : `Confirm Deposit (+${depositAmount} M3GA)`}
                </button>
              </div>
            )}

            {activeModal === 'withdraw' && (
              <div className="space-y-5">
                <p className="text-xs text-slate-400">
                  Transfer M3GA funds back to your secure external web3 wallet. Current balance: <strong className="text-white font-mono">{profile.balance.toFixed(2)} M3GA</strong>
                </p>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Amount to Withdraw</label>
                  <input
                    type="number"
                    min="1"
                    max={profile.balance}
                    value={withdrawAmount}
                    onChange={e => setWithdrawAmount(Number(e.target.value))}
                    className="mt-1.5 w-full bg-black/50 border border-purple-500/30 rounded-xl px-4 py-3 font-mono text-white text-lg focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <button
                  disabled={isProcessing || withdrawAmount > profile.balance}
                  onClick={handleConfirmWithdraw}
                  className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-black uppercase tracking-wider text-xs shadow-lg shadow-purple-600/30 active:scale-95 transition-all cursor-pointer"
                >
                  {isProcessing ? 'Validating Liquidity...' : `Withdraw -${withdrawAmount} M3GA`}
                </button>
              </div>
            )}

            {activeModal === 'history' && (
              <div className="space-y-4 max-h-80 overflow-y-auto custom-scrollbar">
                <p className="text-xs text-slate-400">
                  Full cryptographic ledger verification of all incoming and outgoing smart contracts:
                </p>
                <div className="space-y-2 text-xs">
                  {transactions.map(t => (
                    <div key={t.id} className="p-3 rounded-xl bg-black/40 border border-white/5 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-white">{t.title}</p>
                        <p className="text-[10px] font-mono text-slate-500">{t.id} • {t.timestamp}</p>
                      </div>
                      <span className={`font-mono font-black ${t.type === 'in' ? 'text-emerald-400' : 'text-slate-300'}`}>
                        {t.type === 'in' ? '+' : '-'}{t.amount} M3GA
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
