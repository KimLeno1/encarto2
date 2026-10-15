import React, { useState } from 'react';
import { 
  Ticket as TicketIcon, 
  QrCode, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  MapPin, 
  ShieldCheck, 
  Sparkles, 
  Radio, 
  ArrowUpRight,
  UserCheck,
  Zap,
  Info
} from 'lucide-react';
import { Ticket } from './types.ts';

interface DigitalPassesProps {
  tickets: Ticket[];
  onCheckIn?: (ticketId: string) => void;
}

export const DigitalPasses: React.FC<DigitalPassesProps> = ({ tickets, onCheckIn }) => {
  // Local tickets status management for simulation
  const [localTickets, setLocalTickets] = useState<Ticket[]>(tickets);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const handleToggleCheckIn = (ticketId: string) => {
    setLocalTickets(prev =>
      prev.map(t => {
        if (t.id === ticketId) {
          const nextStatus = t.status === 'confirmed' ? 'used' : 'confirmed';
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );
    if (onCheckIn) {
      onCheckIn(ticketId);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 text-[10px] font-black uppercase tracking-widest mb-2">
            <ShieldCheck size={12} className="text-cyan-300" /> Cryptographic Entry Credentials
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
            Digital Passes
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Futuristic stadium tickets equipped with holographic security sheens, perforated tear lines, and dynamic entry status.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-purple-300 bg-purple-950/40 border border-purple-500/30 px-3 py-2 rounded-xl">
          <Sparkles size={14} className="text-cyan-300" />
          <span>Active Passes: {localTickets.length}</span>
        </div>
      </div>

      {/* Ticket Cards Grid */}
      {localTickets.length === 0 ? (
        <div className="text-center py-16 rounded-3xl bg-[#0b0b24]/60 border border-dashed border-white/10 p-8 space-y-3">
          <TicketIcon className="mx-auto text-slate-600" size={40} />
          <h4 className="text-lg font-black text-white uppercase">No Active Passes Found</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Register for any upcoming championship cup or arena tournament to generate your official biometric boarding pass.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {localTickets.map(ticket => {
            const isValid = ticket.status === 'confirmed';
            return (
              <div
                key={ticket.id}
                className="relative group transition-all duration-300 hover:-translate-y-1.5"
              >
                {/* Outer Ticket Container */}
                <div className="relative rounded-[20px] bg-[#0c0c28] border border-purple-500/30 shadow-[0_10px_35px_-10px_rgba(7,5,26,0.9),0_0_20px_rgba(168,85,247,0.15)] overflow-hidden flex flex-col justify-between">
                  
                  {/* Holographic Gradient Sheen Overlay (animated background-position) */}
                  <div className="pointer-events-none absolute inset-0 holo-sheen opacity-40 group-hover:opacity-75 transition-opacity duration-500 z-10" />

                  {/* Perforated edge styling with CSS radial-gradient cutouts */}
                  {/* Left notch */}
                  <div className="absolute -left-3.5 top-[60%] -translate-y-1/2 w-7 h-7 rounded-full bg-[#07051a] border-r border-purple-500/40 z-20 shadow-inner" />
                  {/* Right notch */}
                  <div className="absolute -right-3.5 top-[60%] -translate-y-1/2 w-7 h-7 rounded-full bg-[#07051a] border-l border-purple-500/40 z-20 shadow-inner" />
                  {/* Dashed tear line connecting notches */}
                  <div className="absolute left-6 right-6 top-[60%] -translate-y-1/2 border-t-2 border-dashed border-purple-500/25 z-20 pointer-events-none" />

                  {/* Ticket Header & Tournament Information */}
                  <div className="p-6 sm:p-7 space-y-4 relative z-20">
                    <div className="flex items-center justify-between">
                      {/* Status Badge: Valid vs Checked-in */}
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-sm ${
                          isValid
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                            : 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                        }`}
                      >
                        {isValid ? (
                          <>
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Valid Pass
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={12} className="text-purple-300" /> Checked-in
                          </>
                        )}
                      </span>

                      <span className="text-[10px] font-mono font-bold text-slate-400 tracking-wider">
                        {ticket.id}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xl font-black text-white uppercase tracking-tight leading-snug group-hover:text-cyan-200 transition-colors">
                        {ticket.tournamentName}
                      </h4>
                      <p className="text-[10px] font-mono text-purple-300/80 mt-1 flex items-center gap-1.5">
                        <MapPin size={12} className="text-cyan-400" /> Sector 07 • Cyber Stadium Prime
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">Date & Time</span>
                        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-200 mt-0.5">
                          <Calendar size={12} className="text-purple-400" />
                          <span className="truncate">{ticket.date.split('•')[0]}</span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">Seat / Tier</span>
                        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-300 mt-0.5">
                          <Zap size={12} />
                          <span>PRO TIER VIP</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ticket Bottom: QR Code Area & Tearable Stub */}
                  <div className="pt-8 pb-6 px-6 sm:px-7 bg-black/50 border-t border-purple-500/10 flex flex-col items-center text-center relative z-20">
                    <div className="relative group/qr p-3 bg-white rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.2)] mb-3 transition-transform duration-300 group-hover:scale-105">
                      <QrCode size={110} className="text-black" />
                      {/* Scan laser line animation */}
                      <div className="absolute inset-x-2 top-2 h-0.5 bg-cyan-500 shadow-[0_0_8px_#22d3ee] animate-pulse" />
                    </div>

                    <p className="text-[10px] font-mono font-black text-slate-400 tracking-[0.3em] uppercase">
                      {ticket.qrCode || ticket.id}
                    </p>

                    <div className="mt-4 w-full flex items-center gap-2">
                      <button
                        onClick={() => handleToggleCheckIn(ticket.id)}
                        className={`w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer min-h-[44px] ${
                          isValid
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.35)]'
                            : 'bg-white/5 text-purple-300 border border-purple-500/30 hover:bg-white/10'
                        }`}
                      >
                        {isValid ? 'Simulate Turnstile Check-in' : 'Mark as Valid Ticket'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
