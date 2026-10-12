import React, { useState } from 'react';
import {
  ArrowRight, ArrowUpRight, Clock, Gamepad2, Newspaper, Radio,
  ShieldAlert, Sparkles, Swords, Trophy, Users, Zap
} from 'lucide-react';
import { BLOG_POSTS, UPCOMING_TOURNAMENTS, MATCH_FIXTURES } from './mockData.ts';
import { LogoComponent } from './components.tsx';

interface LandingPanelProps {
  onEnter: () => void;
  onAdminAccess: () => void;
}

const LandingPanel: React.FC<LandingPanelProps> = ({ onEnter, onAdminAccess }) => {
  const [secretCounter, setSecretCounter] = useState(0);
  const featuredTournament = UPCOMING_TOURNAMENTS[0];
  const pulseCards = [
    { icon: <Trophy size={19} />, title: 'Compete', copy: 'Enter tournaments, climb brackets, and make every match count.', tone: 'violet' },
    { icon: <Users size={19} />, title: 'Find your squad', copy: 'Build a team with players who share your ambition.', tone: 'blue' },
    { icon: <Zap size={19} />, title: 'Level up', copy: 'Track your progress and turn wins into a reputation.', tone: 'violet' },
    { icon: <Radio size={19} />, title: 'Stay in the loop', copy: 'Follow fixtures, community news, and the next big event.', tone: 'blue' },
  ];

  return (
    <main className="min-h-screen overflow-x-hidden text-white pb-16">
      <header className="sticky top-0 z-40 border-b border-white/[0.07] bg-[#080814]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
          <button onClick={onEnter} className="flex items-center gap-3 rounded-xl text-left" aria-label="Enter Encarto">
            <LogoComponent className="h-10 w-10" />
            <span className="anime-title text-xl tracking-tight md:text-2xl">ENCARTO<span className="text-sky-300">.</span></span>
          </button>
          <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-400 md:flex" aria-label="Main navigation">
            <a href="#discover" className="transition hover:text-white">Discover</a>
            <a href="#tournaments" className="transition hover:text-white">Tournaments</a>
            <a href="#community" className="transition hover:text-white">Community</a>
          </nav>
          <button onClick={onEnter} className="inline-flex items-center gap-2 rounded-xl border border-violet-300/30 bg-violet-400/10 px-4 py-2.5 text-sm font-bold text-violet-100 transition hover:border-violet-200/70 hover:bg-violet-400/20">
            Sign in <ArrowUpRight size={16} />
          </button>
        </div>
      </header>

      <section className="relative isolate overflow-hidden">
        <div className="pointer-events-none absolute -left-48 top-10 -z-10 h-[34rem] w-[34rem] rounded-full bg-violet-700/20 blur-[130px]" />
        <div className="pointer-events-none absolute -right-32 top-24 -z-10 h-[30rem] w-[30rem] rounded-full bg-sky-500/15 blur-[120px]" />
        <div className="mx-auto grid min-h-[650px] max-w-7xl items-center gap-14 px-5 py-20 md:px-8 lg:grid-cols-[1.08fr_.92fr] lg:py-24">
          <div className="relative z-10">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-sky-300/20 bg-sky-300/[0.07] px-3.5 py-2 text-[10px] font-extrabold uppercase tracking-[0.2em] text-sky-200 sm:text-xs">
              <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-300 opacity-60" /><span className="relative inline-flex h-2 w-2 rounded-full bg-sky-300" /></span>
              Your next match starts here
            </div>
            <h1 className="max-w-3xl text-5xl font-black leading-[0.98] tracking-[-0.06em] sm:text-6xl md:text-7xl xl:text-[5.5rem]">
              PLAY HARD.
              <span className="mt-2 block bg-gradient-to-r from-violet-300 via-purple-400 to-sky-300 bg-clip-text text-transparent">RISE HIGHER.</span>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-slate-400 sm:text-lg">
              One home for competitive gaming. Find your squad, enter tournaments, follow the action, and build a name that means something.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <button onClick={onEnter} className="group inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 px-7 py-4 text-sm font-extrabold tracking-wide text-white shadow-[0_10px_40px_rgba(109,40,217,.28)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_46px_rgba(56,189,248,.2)]">
                ENTER THE ARENA <ArrowRight size={18} className="transition group-hover:translate-x-1" />
              </button>
              <a href="#discover" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.035] px-7 py-4 text-sm font-bold text-slate-200 transition hover:border-violet-300/30 hover:bg-white/[0.07]">
                Explore Encarto <ArrowUpRight size={17} />
              </a>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-xs font-semibold text-slate-500 sm:text-sm">
              <span className="inline-flex items-center gap-2"><Trophy size={15} className="text-violet-300" /> Competitive tournaments</span>
              <span className="inline-flex items-center gap-2"><Users size={15} className="text-sky-300" /> Player community</span>
              <span className="inline-flex items-center gap-2"><Gamepad2 size={15} className="text-violet-300" /> Games & arcade</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -inset-5 rounded-[2.5rem] bg-gradient-to-br from-violet-600/20 via-transparent to-sky-500/20 blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-violet-300/20 bg-[#111126]/90 p-4 shadow-2xl shadow-violet-950/40 sm:p-6">
              <div className="flex items-center justify-between border-b border-white/[0.07] pb-4">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-500">Encarto / Arena</p>
                  <h2 className="mt-1 text-lg font-extrabold tracking-tight">The competitive pulse</h2>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/[0.08] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-200"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> Live hub</span>
              </div>

              <div className="relative mt-5 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-violet-950 via-[#171337] to-sky-950 p-6 sm:p-8">
                <div className="absolute -right-8 -top-10 h-44 w-44 rounded-full border border-violet-300/20" />
                <div className="absolute -right-2 -top-4 h-32 w-32 rounded-full border border-sky-300/20" />
                <div className="relative">
                  <span className="inline-flex items-center gap-2 rounded-md bg-violet-300/15 px-2.5 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-violet-200"><Sparkles size={12} /> Featured event</span>
                  <h3 className="mt-5 max-w-sm text-3xl font-black leading-tight tracking-tight sm:text-4xl">{featuredTournament?.name || 'Your next arena awaits'}</h3>
                  <p className="mt-2 text-sm text-slate-300/80">{featuredTournament?.game || 'Competitive gaming'} <span className="px-1.5 text-slate-500">/</span> Open competition</p>
                  <div className="mt-7 flex items-end justify-between gap-4">
                    <div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Prize pool</p><p className="mt-1 text-2xl font-black text-sky-200">{featuredTournament?.prize || 'Compete to win'}</p></div>
                    <button onClick={onEnter} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-extrabold text-slate-950 transition hover:bg-sky-100">View event <ArrowRight size={15} /></button>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4">
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-violet-400/10 text-violet-200"><Swords size={18} /></div>
                  <p className="text-xl font-black">{MATCH_FIXTURES.length.toString().padStart(2, '0')}</p><p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">Match fixtures</p>
                </div>
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4">
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-sky-400/10 text-sky-200"><Trophy size={18} /></div>
                  <p className="text-xl font-black">{UPCOMING_TOURNAMENTS.length.toString().padStart(2, '0')}</p><p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">Upcoming events</p>
                </div>
              </div>
              <p className="mt-4 text-center text-[10px] font-medium text-slate-600">A better arena for players, teams, and organizers.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="discover" className="mx-auto max-w-7xl px-5 py-20 md:px-8">
        <div className="mb-9 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div><p className="text-xs font-extrabold uppercase tracking-[0.22em] text-sky-300">Built for the climb</p><h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Everything in your arena.</h2></div>
          <p className="max-w-md text-sm leading-6 text-slate-400">Less clutter. Better signals. The tools you need to compete and connect, all in one place.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {pulseCards.map((card) => (
            <article key={card.title} className="group rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.055] to-white/[0.015] p-6 transition hover:-translate-y-1 hover:border-violet-300/30 hover:shadow-[0_18px_40px_rgba(76,29,149,.12)]">
              <div className={`mb-5 flex h-11 w-11 items-center justify-center rounded-xl border ${card.tone === 'blue' ? 'border-sky-300/20 bg-sky-300/10 text-sky-200' : 'border-violet-300/20 bg-violet-300/10 text-violet-200'}`}>{card.icon}</div>
              <h3 className="text-base font-extrabold">{card.title}</h3><p className="mt-2 text-sm leading-6 text-slate-400">{card.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="tournaments" className="mx-auto max-w-7xl px-5 py-16 md:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div><p className="text-xs font-extrabold uppercase tracking-[0.22em] text-violet-300">The next challenge</p><h2 className="mt-3 text-3xl font-black tracking-tight">Upcoming tournaments</h2></div>
          <button onClick={onEnter} className="hidden items-center gap-2 text-sm font-bold text-sky-200 transition hover:text-white sm:inline-flex">View all <ArrowRight size={16} /></button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {UPCOMING_TOURNAMENTS.slice(0, 2).map((tournament, index) => (
            <button key={tournament.id} onClick={onEnter} className="group flex w-full items-center gap-4 rounded-2xl border border-white/[0.08] bg-[#101020]/80 p-5 text-left transition hover:border-violet-300/30 hover:bg-violet-500/[0.06] sm:p-6">
              <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${index === 0 ? 'bg-violet-400/10 text-violet-200' : 'bg-sky-400/10 text-sky-200'}`}><Trophy size={24} /></div>
              <div className="min-w-0 flex-1"><p className="truncate text-base font-extrabold">{tournament.name}</p><p className="mt-1 text-xs font-semibold text-slate-500">{tournament.game} <span className="px-1">·</span> {tournament.date}</p></div>
              <div className="text-right"><p className="text-sm font-black text-sky-200">{tournament.prize}</p><p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">Prize pool</p></div>
              <ArrowUpRight size={17} className="shrink-0 text-slate-600 transition group-hover:text-violet-200" />
            </button>
          ))}
        </div>
      </section>

      <section id="community" className="mx-auto grid max-w-7xl gap-8 px-5 py-20 md:px-8 lg:grid-cols-[.9fr_1.1fr]">
        <div className="relative overflow-hidden rounded-3xl border border-violet-300/20 bg-gradient-to-br from-violet-950/70 via-[#15132b] to-sky-950/60 p-8 sm:p-10">
          <div className="absolute -bottom-20 -right-16 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />
          <div className="relative"><div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-300/20 bg-violet-300/10 text-violet-200"><Gamepad2 size={23} /></div><p className="text-xs font-extrabold uppercase tracking-[0.22em] text-violet-200">Your name. Your legacy.</p><h2 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">The arena is better when you’re in it.</h2><p className="mt-4 max-w-md text-sm leading-6 text-slate-300/75">Create your profile, find your people, follow the action, and start building your competitive story.</p><button onClick={onEnter} className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-slate-950 transition hover:bg-sky-100">Claim your place <ArrowRight size={16} /></button></div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-3"><Newspaper className="text-sky-200" size={19} /><h2 className="text-xl font-black">Latest from the feed</h2></div>
          {BLOG_POSTS.slice(0, 3).map((post) => (
            <button key={post.id} onClick={onEnter} className="group flex w-full items-center gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 text-left transition hover:border-sky-300/20 hover:bg-white/[0.045]">
              <div className="h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-900"><img src={post.image} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" alt="" loading="lazy" /></div>
              <div className="min-w-0 flex-1"><h3 className="truncate text-sm font-extrabold">{post.title}</h3><p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{post.excerpt}</p></div><ArrowUpRight size={16} className="shrink-0 text-slate-600 group-hover:text-sky-200" />
            </button>
          ))}
          {MATCH_FIXTURES.slice(0, 1).map((fixture) => <div key={fixture.id} className="flex items-center justify-between gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4"><div><p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-violet-200">Next fixture</p><p className="mt-2 text-sm font-bold">{fixture.teamA} <span className="px-2 text-slate-600">VS</span> {fixture.teamB}</p><p className="mt-1 text-xs text-slate-500">{fixture.tournamentName}</p></div><span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-bold text-sky-200"><Clock size={13} /> {fixture.time}</span></div>)}
        </div>
      </section>

      <footer className="border-t border-white/[0.07] px-5 py-8 md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 sm:flex-row">
          <div className="flex items-center gap-3"><LogoComponent className="h-8 w-8" /><span className="text-xs font-extrabold tracking-[0.16em] text-slate-400">ENCARTO <span className="text-slate-600">/ PLAY YOUR STORY</span></span></div>
          <div className="text-xs text-slate-600">Built for the next generation of competition.</div>
          <button aria-label="Admin access" onClick={() => setSecretCounter((count) => count + 1)} className="rounded px-2 py-1 text-[10px] text-slate-700 transition hover:text-slate-400">© <span>2026</span></button>
        </div>
        {secretCounter >= 5 && <div className="mt-5 flex justify-center"><button onClick={onAdminAccess} className="inline-flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-2 text-xs font-bold text-red-200 transition hover:bg-red-400/20"><ShieldAlert size={15} /> Admin access</button></div>}
      </footer>
    </main>
  );
};

export default LandingPanel;
