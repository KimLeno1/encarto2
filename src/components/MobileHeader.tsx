import React from 'react';
import { Volume2, VolumeX, Download, Trash2, Smartphone, Monitor } from 'lucide-react';
import { DeviceModeSetting, ActiveDevice } from '../types.ts';
import { ENCARTO_ASSETS } from '../utils/constants.ts';

interface MobileHeaderProps {
  title: string;
  deviceSetting: DeviceModeSetting;
  onDeviceSettingChange: (setting: DeviceModeSetting) => void;
  activeDevice: ActiveDevice;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onClear: () => void;
  onExport: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  title,
  deviceSetting,
  onDeviceSettingChange,
  activeDevice,
  soundEnabled,
  onToggleSound,
  onClear,
  onExport,
}) => {
  return (
    <header className="h-13 bg-[#0d0920]/95 backdrop-blur-xl border-b border-purple-500/25 px-3 flex items-center justify-between shrink-0 select-none z-30 shadow-[0_2px_20px_rgba(10,5,30,0.8)]">
      {/* Brand Icon & Name */}
      <div className="flex items-center gap-2 max-w-[55%]">
        <div className="relative w-7 h-7 rounded-lg overflow-hidden ring-1 ring-purple-500/50 shadow-[0_0_12px_rgba(168,85,247,0.4)] shrink-0 bg-purple-950">
          <img
            src={ENCARTO_ASSETS.candle}
            alt="Encarto"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-cyan-300 truncate">
            Encarto
          </span>
          <span className="text-[10px] text-zinc-400 truncate max-w-[120px]">
            {title}
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5">
        {/* Device toggle trigger */}
        <button
          onClick={() => {
            const next = deviceSetting === 'auto' ? 'mobile' : deviceSetting === 'mobile' ? 'desktop' : 'auto';
            onDeviceSettingChange(next);
          }}
          className="min-h-[44px] min-w-[40px] flex items-center justify-center text-xs font-medium text-cyan-300"
          title={`Mode: ${deviceSetting}`}
        >
          {deviceSetting === 'desktop' ? (
            <Monitor className="w-4 h-4" />
          ) : deviceSetting === 'mobile' ? (
            <Smartphone className="w-4 h-4 text-purple-400" />
          ) : (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-950/70 border border-purple-500/30 text-purple-300">
              Auto
            </span>
          )}
        </button>

        {/* Audio Toggle */}
        <button
          onClick={onToggleSound}
          className="min-h-[44px] min-w-[40px] flex items-center justify-center text-zinc-400 hover:text-cyan-300 transition-colors"
          title={soundEnabled ? 'Mute' : 'Unmute'}
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-cyan-400" />
          ) : (
            <VolumeX className="w-4 h-4" />
          )}
        </button>

        {/* Clear */}
        <button
          onClick={onClear}
          className="min-h-[44px] min-w-[40px] flex items-center justify-center text-zinc-400 hover:text-rose-400 transition-colors"
          title="Clear"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        {/* Export */}
        <button
          onClick={onExport}
          className="min-h-[44px] min-w-[40px] flex items-center justify-center text-cyan-300"
          title="Export"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
