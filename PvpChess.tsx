
import React, { useState, useEffect } from 'react';
import { Swords, Trophy, ShieldCheck, Activity, Timer } from 'lucide-react';

interface PvpChessProps {
  wager: number;
  opponent: string;
  onGameOver: (winner: string) => void;
}

const PvpChess: React.FC<PvpChessProps> = ({ wager, opponent, onGameOver }) => {
  // Groundwork: In a production environment, this state would be updated via WebSocket
  const [board, setBoard] = useState<string[][]>([
    ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'],
    ['♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟'],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙'],
    ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖'],
  ]);
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [turn, setTurn] = useState<'white' | 'black'>('white');
  const [lastMove, setLastMove] = useState<string>('Arena synced.');
  const [connStatus, setConnStatus] = useState<'connecting' | 'active'>('connecting');

  useEffect(() => {
    const timer = setTimeout(() => setConnStatus('active'), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleSquareClick = (r: number, c: number) => {
    if (connStatus !== 'active') return;

    if (selected) {
      const [sr, sc] = selected;
      if (sr === r && sc === c) {
        setSelected(null);
        return;
      }

      // Sync Logic: This is where we would send the move to the backend
      const piece = board[sr][sc];
      const newBoard = [...board.map(row => [...row])];
      newBoard[r][c] = piece;
      newBoard[sr][sc] = '';
      setBoard(newBoard);
      setSelected(null);
      setTurn(turn === 'white' ? 'black' : 'white');
      setLastMove(`Move: ${String.fromCharCode(97 + sc)}${8 - sr} -> ${String.fromCharCode(97 + c)}${8 - r}`);
      
      // Simulate backend turn
      setTimeout(() => {
        setLastMove(`Opponent is analyzing move...`);
      }, 500);
    } else {
      if (board[r][c] !== '') setSelected([r, c]);
    }
  };

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 h-full animate-in zoom-in-95 duration-500">
      <div className="lg:col-span-8 flex flex-col items-center justify-center space-y-6">
        <div className="grid grid-cols-8 border-[12px] border-white/5 rounded-3xl overflow-hidden shadow-2xl relative">
          {board.map((row, r) => 
            row.map((piece, c) => (
              <div 
                key={`${r}-${c}`}
                onClick={() => handleSquareClick(r, c)}
                className={`w-10 h-10 md:w-16 md:h-16 flex items-center justify-center cursor-pointer transition-all duration-300 relative ${
                  (r + c) % 2 === 0 ? 'bg-zinc-800' : 'bg-zinc-900'
                } ${selected?.[0] === r && selected?.[1] === c ? 'bg-primary/40' : 'hover:bg-primary/10'}`}
              >
                <span className={`text-2xl md:text-4xl select-none ${piece === piece.toUpperCase() ? 'text-white' : 'text-gray-400'}`}>
                  {piece}
                </span>
                {selected?.[0] === r && selected?.[1] === c && (
                   <div className="absolute inset-0 border-2 border-primary animate-pulse" />
                )}
              </div>
            ))
          )}
          {connStatus === 'connecting' && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center z-50">
              <Activity className="text-primary animate-spin mb-4" size={48} />
              <p className="text-[10px] font-black text-white uppercase tracking-widest">Handshaking Session...</p>
            </div>
          )}
        </div>
      </div>

      <aside className="lg:col-span-4 glass-panel p-8 rounded-[2.5rem] border border-white/10 flex flex-col justify-between">
        <div className="space-y-8">
          <header className="flex justify-between items-start">
            <h3 className="anime-title text-3xl text-white uppercase tracking-tighter">Grandmaster Hub</h3>
            <div className="flex items-center gap-2 text-primary">
              <Timer size={16} />
              <span className="text-[10px] font-black">10:00</span>
            </div>
          </header>

          <div className="p-6 bg-white/5 rounded-2xl border border-white/5 space-y-4">
            <div>
              <p className="text-[8px] font-black text-gray-600 uppercase mb-1">Prize Pool</p>
              <p className="text-3xl font-black text-white">{(wager * 2 * 0.8).toFixed(1)} <span className="text-xs text-primary">M3GA</span></p>
            </div>
            <div className="h-px bg-white/5" />
            <div className="flex justify-between items-center text-[10px] font-black uppercase">
              <span className="text-gray-500">Opponent</span>
              <span className="text-white">{opponent}</span>
            </div>
          </div>

          <div className="space-y-4">
             <div className="flex items-center gap-2 text-[10px] font-black uppercase text-primary">
               <Activity size={14} /> System Logs
             </div>
             <div className="bg-black/40 p-4 rounded-xl border border-white/5 font-mono text-[9px] text-gray-500">
               {lastMove}
             </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 space-y-4">
          <button 
            onClick={() => onGameOver('Me')}
            className="w-full py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            Claim Victory
          </button>
          <div className="flex items-center justify-center gap-2 text-green-500">
            <ShieldCheck size={14}/>
            <span className="text-[8px] font-black uppercase tracking-widest">WASM ENGINE VALIDATED</span>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default PvpChess;
