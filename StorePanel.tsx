import React, { useMemo, useState } from 'react';
import {
  ArrowUpRight, Check, Crown, Gamepad2, Layout, Lock, Monitor,
  Package, Search, ShieldCheck, Shirt, ShoppingBag, SlidersHorizontal,
  Sparkles, Users, Zap
} from 'lucide-react';
import { ShopItem, PlayerProfile } from './types';

interface StorePanelProps {
  items: ShopItem[];
  profile: PlayerProfile;
  onPurchase: (item: ShopItem) => void;
}

const CATEGORIES = [
  { id: 'all', label: 'All gear' },
  { id: 'team', label: 'Teams' },
  { id: 'plugin', label: 'Plugins' },
  { id: 'role', label: 'Roles & identity' },
  { id: 'decoration', label: 'Decorations' },
  { id: 'theme', label: 'Themes' },
  { id: 'merch', label: 'Merch' },
] as const;

const TYPE_META: Record<ShopItem['type'], { label: string; icon: React.ReactNode; tone: string }> = {
  team: { label: 'Team gear', icon: <Users size={23} />, tone: 'text-sky-200 bg-sky-300/10 border-sky-300/20' },
  plugin: { label: 'Plugin', icon: <Monitor size={23} />, tone: 'text-violet-200 bg-violet-300/10 border-violet-300/20' },
  role: { label: 'Role & identity', icon: <ShieldCheck size={23} />, tone: 'text-fuchsia-200 bg-fuchsia-300/10 border-fuchsia-300/20' },
  decoration: { label: 'Decoration', icon: <Sparkles size={23} />, tone: 'text-amber-200 bg-amber-300/10 border-amber-300/20' },
  theme: { label: 'Theme', icon: <Layout size={23} />, tone: 'text-blue-200 bg-blue-300/10 border-blue-300/20' },
  merch: { label: 'Merch', icon: <Shirt size={23} />, tone: 'text-emerald-200 bg-emerald-300/10 border-emerald-300/20' },
};

const StorePanel: React.FC<StorePanelProps> = ({ items, profile, onPurchase }) => {
  const [category, setCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [ownership, setOwnership] = useState<'available' | 'all' | 'owned'>('available');

  const userAge = useMemo(() => {
    if (!profile.birthday) return 0;
    const birthDate = new Date(profile.birthday);
    if (Number.isNaN(birthDate.getTime())) return 0;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    if (today.getMonth() < birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) age--;
    return age;
  }, [profile.birthday]);

  const playerRole = profile.role || 'USER';
  const filteredItems = useMemo(() => items.filter((item) => {
    const matchesCategory = category === 'all' || item.type === category;
    const matchesSearch = !search.trim() || `${item.name} ${item.description || ''} ${item.type}`.toLowerCase().includes(search.trim().toLowerCase());
    const isOwned = profile.ownedItems.includes(item.id);
    const matchesOwnership = ownership === 'all' || (ownership === 'owned' ? isOwned : !isOwned);
    return matchesCategory && matchesSearch && matchesOwnership;
  }), [items, category, search, ownership, profile.ownedItems]);

  const getAccess = (item: ShopItem) => {
    const requirements = item.requirements;
    const meetsRank = !requirements?.minRank || profile.rank >= requirements.minRank;
    const meetsAge = !requirements?.minAge || userAge >= requirements.minAge;
    const meetsRole = !requirements?.roles?.length || requirements.roles.includes(playerRole);
    const reasons: string[] = [];
    if (!meetsRank) reasons.push(`Reach Rank ${requirements?.minRank}`);
    if (!meetsAge) reasons.push(`Age ${requirements?.minAge}+`);
    if (!meetsRole) reasons.push(`Requires ${requirements?.roles?.map(role => role.toLowerCase()).join(' / ')} role`);
    return { unlocked: meetsRank && meetsAge && meetsRole, reasons };
  };

  const ownedCount = items.filter(item => profile.ownedItems.includes(item.id)).length;

  return (
    <main className="mx-auto max-w-7xl space-y-8 pb-16 animate-in fade-in duration-500">
      <section className="relative overflow-hidden rounded-[2rem] border border-violet-300/20 bg-gradient-to-br from-[#1b1238] via-[#111127] to-[#081b32] p-6 sm:p-9 lg:p-11">
        <div className="pointer-events-none absolute -right-12 -top-20 h-72 w-72 rounded-full bg-violet-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-1/4 h-64 w-64 rounded-full bg-sky-400/10 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-200/20 bg-violet-300/10 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[.2em] text-violet-200">
              <Zap size={13} /> Encarto Armory
            </div>
            <h1 className="text-4xl font-black tracking-[-.05em] sm:text-5xl lg:text-6xl">Gear up. <span className="bg-gradient-to-r from-violet-300 to-sky-300 bg-clip-text text-transparent">Stand out.</span></h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300/75 sm:text-base">Build your identity, equip useful plugins, kit out your squad, and unlock new ways to represent your rank. Your rank and platform role determine what you can access.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3"><p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Your rank</p><p className="mt-1 text-lg font-black text-white">{profile.rank}</p></div>
              <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3"><p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Your role</p><p className="mt-1 text-lg font-black capitalize text-sky-200">{playerRole.toLowerCase()}</p></div>
              <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3"><p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Owned items</p><p className="mt-1 text-lg font-black text-violet-200">{ownedCount}<span className="ml-1 text-xs font-semibold text-slate-500">/ {items.length}</span></p></div>
            </div>
          </div>
          <div className="flex min-w-44 items-center gap-4 rounded-2xl border border-sky-300/20 bg-sky-300/[.06] p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-300/10 text-sky-200"><ShoppingBag size={23} /></div>
            <div><p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Available balance</p><p className="mt-1 text-2xl font-black text-white">{profile.balance.toLocaleString()} <span className="text-xs text-sky-200">M3GA</span></p></div>
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div><h2 className="text-2xl font-black tracking-tight">Browse the collection</h2><p className="mt-1 text-sm text-slate-500">Locked gear shows exactly what you need to unlock it.</p></div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="flex min-w-0 items-center gap-2 rounded-xl border border-white/10 bg-[#0c0c1c]/90 px-4 py-3 focus-within:border-violet-300/40 sm:min-w-64">
              <Search size={17} className="shrink-0 text-slate-500" />
              <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search the armory..." className="w-full border-0 bg-transparent text-sm outline-none placeholder:text-slate-600 focus:ring-0" aria-label="Search armory items" />
            </label>
            <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#0c0c1c]/90 px-3 py-3">
              <SlidersHorizontal size={16} className="text-slate-500" />
              <select value={ownership} onChange={event => setOwnership(event.target.value as typeof ownership)} className="border-0 bg-transparent text-sm text-slate-300 outline-none focus:ring-0" aria-label="Filter by ownership">
                <option value="available">Not owned</option><option value="owned">Owned by me</option><option value="all">All items</option>
              </select>
            </label>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {CATEGORIES.map((cat) => (
            <button key={cat.id} onClick={() => setCategory(cat.id)} className={`whitespace-nowrap rounded-xl border px-4 py-2.5 text-xs font-bold transition ${category === cat.id ? 'border-violet-300/40 bg-violet-400/15 text-violet-100 shadow-[0_0_20px_rgba(139,92,246,.1)]' : 'border-white/[.08] bg-white/[.025] text-slate-500 hover:border-white/20 hover:text-white'}`} aria-pressed={category === cat.id}>{cat.label}</button>
          ))}
        </div>

        {filteredItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 px-6 py-16 text-center"><Package className="mx-auto text-slate-600" size={32} /><h3 className="mt-4 text-lg font-bold">No gear found</h3><p className="mt-1 text-sm text-slate-500">Try a different category or search term.</p><button onClick={() => { setCategory('all'); setSearch(''); setOwnership('all'); }} className="mt-4 text-sm font-bold text-sky-200 hover:text-white">Clear filters</button></div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredItems.map((item) => {
              const isOwned = profile.ownedItems.includes(item.id);
              const access = getAccess(item);
              const canAfford = profile.balance >= item.price;
              const meta = TYPE_META[item.type];
              const disabled = isOwned || !access.unlocked || !canAfford;
              return (
                <article key={item.id} className={`group flex min-w-0 flex-col overflow-hidden rounded-2xl border bg-gradient-to-b from-[#15152b] to-[#0d0d1b] transition duration-200 ${access.unlocked ? 'border-white/[.08] hover:-translate-y-1 hover:border-violet-300/30 hover:shadow-[0_18px_40px_rgba(76,29,149,.12)]' : 'border-white/[.05]'}`}>
                  <div className="relative flex aspect-[1.35/1] items-center justify-center overflow-hidden border-b border-white/[.06] bg-[radial-gradient(ellipse_at_50%_20%,rgba(139,92,246,.16),transparent_65%)]">
                    <div className="absolute left-4 top-4 rounded-lg border border-white/10 bg-black/30 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-widest text-slate-300">{meta.label}</div>
                    <div className={`flex h-20 w-20 items-center justify-center rounded-3xl border ${meta.tone} transition duration-300 group-hover:scale-105 group-hover:shadow-[0_0_30px_rgba(139,92,246,.1)]`}>{meta.icon}</div>
                    {isOwned && <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-lg border border-emerald-300/20 bg-emerald-300/10 px-2 py-1 text-[9px] font-extrabold uppercase tracking-wider text-emerald-200"><Check size={12} /> Owned</span>}
                    {!access.unlocked && !isOwned && <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-lg border border-rose-300/20 bg-rose-300/10 px-2 py-1 text-[9px] font-extrabold uppercase tracking-wider text-rose-200"><Lock size={11} /> Locked</span>}
                    {item.type === 'role' && <span className="absolute bottom-3 left-3 rounded-md bg-fuchsia-300/10 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-fuchsia-200">No automatic privilege grant</span>}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-base font-extrabold text-white">{item.name}</h3>
                    <p className="mt-2 min-h-[3.75rem] text-xs leading-5 text-slate-500">{item.description || 'A limited item from the Encarto collection.'}</p>
                    <div className="mt-4 min-h-10">
                      {access.unlocked ? <div className="flex flex-wrap gap-1.5">
                        {item.requirements?.minRank && <span className="rounded-md border border-white/[.07] px-2 py-1 text-[9px] font-semibold text-slate-500">Rank {item.requirements.minRank}+</span>}
                        {item.requirements?.roles?.length && <span className="rounded-md border border-white/[.07] px-2 py-1 text-[9px] font-semibold text-slate-500">Role restricted</span>}
                        {!item.requirements?.minRank && !item.requirements?.roles?.length && <span className="rounded-md border border-emerald-300/10 px-2 py-1 text-[9px] font-semibold text-emerald-200">Open access</span>}
                      </div> : <div className="space-y-1">{access.reasons.map(reason => <p key={reason} className="flex items-center gap-1.5 text-[10px] font-semibold text-rose-200/80"><Lock size={11} /> {reason}</p>)}</div>}
                    </div>
                    <div className="mt-auto flex items-end justify-between gap-3 border-t border-white/[.06] pt-4">
                      <div><p className="text-[9px] font-bold uppercase tracking-widest text-slate-600">Price</p><p className="mt-1 text-lg font-black text-white">{item.price.toLocaleString()} <span className="text-[10px] text-sky-200">M3GA</span></p></div>
                      {isOwned ? <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-200"><Check size={14} /> Acquired</span> :
                        <button disabled={disabled} onClick={() => onPurchase(item)} className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-extrabold transition ${disabled ? 'cursor-not-allowed border border-white/[.06] bg-white/[.025] text-slate-600' : 'bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-lg shadow-violet-950/30 hover:brightness-110'}`}>
                          {access.unlocked && !canAfford ? 'Insufficient funds' : 'Acquire'} {!disabled && <ArrowUpRight size={14} />}
                        </button>}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <aside className="flex items-start gap-3 rounded-2xl border border-sky-300/10 bg-sky-300/[.035] p-4 text-xs leading-5 text-slate-500">
        <ShieldCheck size={17} className="mt-0.5 shrink-0 text-sky-200" />
        <p><strong className="text-slate-300">Fair-play note:</strong> rank and role restrictions are displayed here for discovery. Purchases and elevated permissions must be validated by the server before production; an item purchase must never grant moderator, organizer, or admin privileges automatically. Physical merch availability, shipping, and payment are not confirmed by this catalogue.</p>
      </aside>
    </main>
  );
};

export default StorePanel;
