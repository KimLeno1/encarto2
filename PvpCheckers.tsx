
import React, { useState } from 'react';
import { Circle, ShieldCheck, Swords, History } from 'lucide-react';

interface PvpCheckersProps {
  wager: number;
  opponent: string;
  onGameOver: (winner: string) => void;
}

const PvpCheckers: React.FC<PvpCheckersProps> = ({ wager, opponent, onGameOver }) => {
  const [board, setBoard] = useState<(string | null)[][]>(
    Array(8).fill(null).map((_, r) => 
      Array(8).fill(null).map((_, c) => {
        if ((r + c) % 2 !== 0) {
          if (r < 3) return 'black';
          if (r > 4) return 'white';
        }
        return null;
      })
    )
  );
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const pool = (wager * 2) * 0.8;

  const handleSquareClick = (r: number, c: number) => {
    const piece = board[r][c];
    
    if (selected) {
      const [sr, sc] = selected;
      if (piece === null && (r + c) % 2 !== 0) {
        // Basic Move logic: This represents a sync point for the backend
        const newBoard = [...board.map(row => [...row])];
        newBoard[r][c] = newBoard[sr][sc];
        newBoard[sr][sc] = null;
        setBoard(newBoard);
        setSelected(null);
      } else {
        setSelected(piece ? [r, c] : null);
      }
    } else {
      if (piece === 'white') setSelected([r, c]);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full animate-in zoom-in-95 duration-500">
      <div className="flex-grow flex flex-col items-center justify-center space-y-8">
        <div className="grid grid-cols-8 border-[10px] border-white/5 rounded-3xl overflow-hidden shadow-2xl">
          {board.map((row, r) => 
            row.map((piece, c) => (
              <div 
                key={`${r}-${c}`}
                onClick={() => handleSquareClick(r, c)}
                className={`w-10 h-10 md:w-16 md:h-16 flex items-center justify-center cursor-pointer transition-colors ${
                  (r + c) % 2 === 0 ? 'bg-zinc-800' : 'bg-zinc-900'
                } ${selected?.[0] === r && selected?.[1] === c ? 'bg-primary/20' : ''}`}
              >
                {piece && (
                  <Circle 
                    className={`${piece === 'white' ? 'text-primary' : 'text-red-500'} fill-current drop-shadow-xl ${selected?.[0] === r && selected?.[1] === c ? 'animate-pulse scale-110' : ''}`} 
                    size={32} 
                  />
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <aside className="w-full lg:w-80 glass-panel p-8 rounded-[2.5rem] border border-white/10 flex flex-col justify-between">
        <div className="space-y-8">
          <header>
            <h3 className="anime-title text-3xl text-white uppercase tracking-tighter">Checkers Blitz</h3>
            <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mt-1">Arena Session: ENC-CHK-99</p>
          </header>

          <div className="space-y-4">
            <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
              <p className="text-[8px] font-black text-gray-500 uppercase mb-2">Stake Summary</p>
              <p className="text-3xl font-black text-white">{pool.toFixed(1)} <span className="text-xs text-primary">M3GA</span></p>
            </div>
            
            <div className="p-5 bg-primary/5 border border-primary/20 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-primary">
                <History size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Match Record</span>
              </div>
              <p className="text-[10px] text-gray-400 font-medium">Capture 3 more of {opponent}'s pieces to enter "KING" phase.</p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 space-y-4">
           <button onClick={() => onGameOver('Me')} className="w-full py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-primary/20 hover:scale-105 transition-all">
             Submit Move Data
           </button>
           <div className="flex items-center justify-center gap-2 text-primary opacity-60">
             <ShieldCheck size={14}/>
             <span className="text-[8px] font-black uppercase tracking-widest">P2P MESH CONNECTED</span>
           </div>
        </div>
      </aside>
    </div>
  );
};

export default PvpCheckers;
