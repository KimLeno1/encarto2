import React from 'react';
import { ArmoryVault } from './ArmoryVault.tsx';
import { ShopItem, PlayerProfile } from './types.ts';

interface StorePanelProps {
  items?: ShopItem[];
  profile: PlayerProfile;
  onPurchase: (item: ShopItem) => void;
  onEquip: (item: ShopItem) => void;
}

const StorePanel: React.FC<StorePanelProps> = ({ profile, onPurchase, onEquip }) => {
  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300 pb-16">
      <ArmoryVault profile={profile} onPurchase={onPurchase} onEquip={onEquip} />
    </div>
  );
};

export default StorePanel;
