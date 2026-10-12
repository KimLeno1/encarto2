
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Send, 
  Globe, 
  Users, 
  MessageCircle, 
  ShieldCheck, 
  Lock, 
  Search, 
  User as UserIcon, 
  Smile, 
  Paperclip,
  MoreVertical,
  Circle,
  Plus,
  X,
  FileIcon,
  Check,
  CheckCheck,
  ChevronLeft,
  Filter
} from 'lucide-react';
import { PlayerProfile, Team } from './types';

interface Reaction {
  emoji: string;
  count: number;
  users: string[];
}

interface Attachment {
  name: string;
  url: string;
  type: string;
}

interface Message {
  id: string;
  sender: string;
  recipient?: string;
  avatar: string;
  text: string;
  timestamp: string;
  isMe: boolean;
  type: 'world' | 'team' | 'dm';
  reactions?: Reaction[];
  attachment?: Attachment;
  isRead?: boolean;
  readBy?: string[];
}

interface ChatPanelProps {
  profile: PlayerProfile;
  myTeam: Team | null;
}

const EMOJI_OPTIONS = ['🔥', '🏆', '💀', '🎯', '❤️', '😮', '👍', '😂'];

const ChatPanel: React.FC<ChatPanelProps> = ({ profile, myTeam }) => {
  const [activeTab, setActiveTab] = useState<'world' | 'team' | 'dm'>('world');
  const [selectedDmUser, setSelectedDmUser] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'BakugoBoom', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bakugo', text: 'Who is ready for the tournament tonight?!', timestamp: '10:05 AM', isMe: false, type: 'world', reactions: [{ emoji: '🔥', count: 3, users: ['User1', 'User2', 'User3'] }] },
    { id: '2', sender: 'LuffyKing', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Luffy', text: 'I am taking the championship trophy for sure!', timestamp: '10:06 AM', isMe: false, type: 'world', reactions: [{ emoji: '🏆', count: 1, users: ['BakugoBoom'] }] },
    { id: '3', sender: 'DekuMaster', avatar: profile.avatar, text: 'I am training hard, lets have a good match!', timestamp: '10:07 AM', isMe: true, type: 'world' },
    { id: '4', sender: 'LuffyKing', recipient: 'DekuMaster', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Luffy', text: 'Hey, did you see the new patch notes?', timestamp: '11:15 AM', isMe: false, type: 'dm', isRead: true },
    { id: '5', sender: 'DekuMaster', recipient: 'LuffyKing', avatar: profile.avatar, text: 'Yeah, the nerfs to the speedsters are crazy.', timestamp: '11:16 AM', isMe: true, type: 'dm', isRead: true },
    { id: '6', sender: 'BakugoBoom', recipient: 'DekuMaster', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bakugo', text: 'Don\'t think you can hide from me in the qualifiers.', timestamp: '12:30 PM', isMe: false, type: 'dm', isRead: false },
    { id: '7', sender: 'ZoroSlash', recipient: 'DekuMaster', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zoro', text: 'Where is the hidden shop in level 4?', timestamp: '01:05 PM', isMe: false, type: 'dm', isRead: true },
    { id: '8', sender: 'BakugoBoom', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bakugo', text: 'Squad, check in. We need to practice the cross-up combos.', timestamp: '02:00 PM', isMe: false, type: 'team' },
  ]);
  
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState<string | null>(null);
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);
  const [pendingAttachment, setPendingAttachment] = useState<Attachment | null>(null);
  const [showSearchMobile, setShowSearchMobile] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dmContacts = useMemo(() => {
    const contactsMap = new Map<string, { sender: string; avatar: string; lastMsg: string; time: string; unread: boolean }>();
    messages.filter(m => m.type === 'dm').forEach(m => {
      const partner = m.isMe ? m.recipient! : m.sender;
      const avatar = m.isMe ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${partner}` : m.avatar;
      contactsMap.set(partner, {
        sender: partner,
        avatar: avatar,
        lastMsg: m.text,
        time: m.timestamp,
        unread: !m.isMe && !m.isRead
      });
    });
    return Array.from(contactsMap.values()).sort((a, b) => b.time.localeCompare(a.time));
  }, [messages]);

  useEffect(() => {
    if (activeTab === 'world') return;
    setMessages(prev => prev.map(m => {
      const isRelevantDM = activeTab === 'dm' && selectedDmUser && ((m.sender === selectedDmUser && m.recipient === profile.name) || (m.sender === profile.name && m.recipient === selectedDmUser));
      const isRelevantTeam = activeTab === 'team' && m.type === 'team';
      if ((isRelevantDM || isRelevantTeam) && !m.isMe && !m.isRead) {
        return { ...m, isRead: true, readBy: [...(m.readBy || []), profile.name] };
      }
      return m;
    }));
  }, [activeTab, selectedDmUser, messages.length]);

  useEffect(() => {
    const typingInterval = setInterval(() => {
      if (activeTab === 'world' || (activeTab === 'dm' && selectedDmUser)) {
        const users = activeTab === 'world' ? ['BakugoBoom', 'LuffyKing', 'ZoroSlash'] : [selectedDmUser!];
        const randomUser = users[Math.floor(Math.random() * users.length)];
        setIsTyping(randomUser);
        setTimeout(() => setIsTyping(null), 3000);
      }
    }, 20000);

    const readReceiptInterval = setInterval(() => {
      setMessages(prev => prev.map(m => {
        if (m.isMe && !m.isRead && (m.type === 'dm' || m.type === 'team')) {
          return { ...m, isRead: true, readBy: ['SimulatedRecipient'] };
        }
        return m;
      }));
    }, 12000);

    return () => {
      clearInterval(typingInterval);
      clearInterval(readReceiptInterval);
    };
  }, [activeTab, selectedDmUser]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeTab, isTyping, selectedDmUser]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !pendingAttachment) return;
    if (activeTab === 'dm' && !selectedDmUser) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: profile.name,
      recipient: activeTab === 'dm' ? selectedDmUser! : undefined,
      avatar: profile.avatar,
      text: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
      type: activeTab,
      reactions: [],
      attachment: pendingAttachment || undefined,
      isRead: false,
      readBy: []
    };

    setMessages([...messages, newMessage]);
    setInputText('');
    setPendingAttachment(null);
  };

  const handleAddReaction = (messageId: string, emoji: string) => {
    setMessages(prev => prev.map(m => {
      if (m.id === messageId) {
        const reactions = [...(m.reactions || [])];
        const existingIdx = reactions.findIndex(r => r.emoji === emoji);
        if (existingIdx > -1) {
          const r = reactions[existingIdx];
          if (r.users.includes(profile.name)) {
            r.users = r.users.filter(u => u !== profile.name);
            r.count--;
            if (r.count === 0) reactions.splice(existingIdx, 1);
          } else {
            r.users.push(profile.name);
            r.count++;
          }
        } else {
          reactions.push({ emoji, count: 1, users: [profile.name] });
        }
        return { ...m, reactions };
      }
      return m;
    }));
    setShowReactionPicker(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPendingAttachment({
          name: file.name,
          url: event.target?.result as string,
          type: file.type
        });
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const filteredMessages = useMemo(() => {
    let result = messages.filter(m => m.type === activeTab);
    if (activeTab === 'dm' && selectedDmUser) {
      result = result.filter(m => 
        (m.sender === selectedDmUser && m.recipient === profile.name) || 
        (m.sender === profile.name && m.recipient === selectedDmUser)
      );
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(m => 
        m.sender.toLowerCase().includes(q) || 
        m.text.toLowerCase().includes(q) || 
        m.timestamp.toLowerCase().includes(q)
      );
    }
    return result;
  }, [messages, activeTab, selectedDmUser, searchQuery, profile.name]);

  const DmContactCard = ({ contact }: { contact: any; key?: any }) => (
    <button 
      onClick={() => setSelectedDmUser(contact.sender)}
      className={`w-full p-4 rounded-[1.5rem] border transition-all flex items-center gap-4 group ${selectedDmUser === contact.sender ? 'bg-primary/20 border-primary shadow-lg shadow-primary/10' : 'bg-white/5 border-white/5 hover:border-primary/20'}`}
    >
      <div className="relative flex-shrink-0">
        <img src={contact.avatar} className="w-12 h-12 rounded-full border border-white/10" alt={contact.sender} />
        <Circle size={10} className="absolute bottom-0 right-0 fill-green-500 text-green-500 stroke-[3px] stroke-black" />
      </div>
      <div className="flex-grow text-left overflow-hidden">
        <div className="flex justify-between items-center mb-0.5">
          <span className="text-[11px] font-black text-white uppercase truncate">{contact.sender}</span>
          <span className="text-[8px] font-bold text-gray-500 whitespace-nowrap">{contact.time}</span>
        </div>
        <p className={`text-[10px] font-medium truncate ${contact.unread ? 'text-primary font-black' : 'text-gray-500'}`}>
          {contact.lastMsg}
        </p>
      </div>
      {contact.unread && (
        <div className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse flex-shrink-0" />
      )}
    </button>
  );

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-140px)] md:h-[calc(100vh-180px)] glass-panel rounded-[2rem] md:rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in slide-in-from-bottom-4 duration-500 relative">
      
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,.pdf,.doc,.docx,.txt" />

      {/* Device-aware Navigation Sidebar */}
      <aside className="w-full md:w-20 lg:w-64 bg-black/40 border-b md:border-b-0 md:border-r border-white/10 flex md:flex-col overflow-x-auto md:overflow-x-visible no-scrollbar">
        <div className="p-6 hidden lg:block border-b border-white/5">
          <h2 className="anime-title text-xl text-white uppercase tracking-widest">Encarto Comms</h2>
          <p className="text-[8px] font-black text-gray-600 uppercase tracking-[0.2em] mt-1">SATELLITE LINK V5.1</p>
        </div>
        
        <nav className="flex md:flex-col p-2 md:p-4 gap-2 md:space-y-3 flex-grow">
          <button 
            onClick={() => { setActiveTab('world'); setSelectedDmUser(null); }}
            className={`flex-1 md:flex-none flex flex-col md:flex-row items-center justify-center lg:justify-start gap-2 lg:gap-4 p-3 lg:p-4 rounded-xl md:rounded-2xl transition-all group whitespace-nowrap ${activeTab === 'world' ? 'bg-primary text-white border border-primary/20 shadow-lg shadow-primary/10' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
          >
            <Globe size={20} className={activeTab === 'world' ? 'animate-pulse' : ''} />
            <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest">World</span>
          </button>
          
          <button 
            onClick={() => { setActiveTab('team'); setSelectedDmUser(null); }}
            className={`flex-1 md:flex-none flex flex-col md:flex-row items-center justify-center lg:justify-start gap-2 lg:gap-4 p-3 lg:p-4 rounded-xl md:rounded-2xl transition-all group relative whitespace-nowrap ${activeTab === 'team' ? 'bg-blue-500 text-white border border-blue-500/20 shadow-lg shadow-blue-500/10' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
          >
            <Users size={20} />
            <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest">Squad</span>
            {!myTeam && <Lock size={10} className="absolute top-2 right-2 opacity-50 hidden lg:block" />}
          </button>
          
          <button 
            onClick={() => setActiveTab('dm')}
            className={`flex-1 md:flex-none flex flex-col md:flex-row items-center justify-center lg:justify-start gap-2 lg:gap-4 p-3 lg:p-4 rounded-xl md:rounded-2xl transition-all group relative whitespace-nowrap ${activeTab === 'dm' ? 'bg-purple-500 text-white border border-purple-500/20 shadow-lg shadow-purple-500/10' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
          >
            <MessageCircle size={20} />
            <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest">DMs</span>
            {dmContacts.some(c => c.unread) && <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />}
          </button>
        </nav>

        <div className="p-4 lg:p-6 border-t border-white/5 hidden md:block mt-auto">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img src={profile.avatar} className="w-8 h-8 rounded-full border border-primary/20" alt="Me" />
              <Circle size={8} className="absolute bottom-0 right-0 fill-green-500 text-green-500 stroke-[3px] stroke-black" />
            </div>
            <div className="hidden lg:flex flex-col">
              <span className="text-[9px] font-black text-white uppercase truncate w-24">{profile.name}</span>
              <span className="text-[7px] font-black text-gray-600 uppercase">SIGNAL ACTIVE</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Chat / Interaction Area */}
      <div className="flex-grow flex flex-col md:flex-row bg-black/40 overflow-hidden relative">
        
        {/* DM Contacts Sub-Sidebar (only in DM tab) */}
        {activeTab === 'dm' && (
          <div className={`w-full md:w-72 lg:w-80 border-r border-white/10 flex flex-col bg-black/20 absolute md:relative inset-0 z-20 transition-transform duration-300 ${selectedDmUser ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}`}>
            <div className="p-5 border-b border-white/5 flex items-center justify-between">
              <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Direct Links</h4>
              <button className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-all">
                <Plus size={16}/>
              </button>
            </div>
            <div className="flex-grow overflow-y-auto custom-scrollbar p-3 space-y-2">
              {dmContacts.length > 0 ? (
                dmContacts.map(contact => (
                  <DmContactCard key={contact.sender} contact={contact} />
                ))
              ) : (
                <div className="text-center py-12 px-6">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                    <MessageCircle className="text-gray-800" size={32} />
                  </div>
                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest leading-relaxed">Secure link established. No active transmissions found.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Messaging Pane */}
        <div className={`flex-grow flex flex-col h-full overflow-hidden transition-all duration-300 ${activeTab === 'dm' && !selectedDmUser ? 'hidden md:flex' : 'flex'}`}>
          
          {/* Header Pane */}
          <header className="px-5 md:px-8 py-4 md:py-6 border-b border-white/5 flex items-center justify-between bg-black/40 backdrop-blur-md z-10">
            <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
              {activeTab === 'dm' && selectedDmUser && (
                <button onClick={() => setSelectedDmUser(null)} className="p-2 md:hidden hover:bg-white/5 rounded-full text-gray-500 hover:text-white transition-all">
                  <ChevronLeft size={20} />
                </button>
              )}
              <div className={`p-2.5 rounded-xl flex-shrink-0 ${activeTab === 'world' ? 'bg-primary/10 text-primary' : activeTab === 'team' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'}`}>
                {activeTab === 'world' ? <Globe size={20}/> : activeTab === 'team' ? <ShieldCheck size={20}/> : <Lock size={20}/>}
              </div>
              <div className="overflow-hidden">
                <h3 className="text-sm md:text-xl font-black text-white uppercase tracking-tight truncate">
                  {activeTab === 'world' ? 'Global Lobby' : activeTab === 'team' ? (myTeam?.name || 'SQUAD RESTRICTED') : (selectedDmUser || 'ENCRYPTED CHANNEL')}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-[7px] md:text-[8px] font-black text-gray-500 uppercase tracking-widest truncate">
                    {activeTab === 'world' ? '2.4K PLAYERS ONLINE' : activeTab === 'team' ? (myTeam ? 'SQUAD PROTOCOL ACTIVE' : 'AUTH FAILED') : 'END-TO-END ENCRYPTED'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 md:gap-4">
              <div className={`relative ${showSearchMobile ? 'fixed inset-x-0 top-0 p-4 bg-black/90 z-50 flex items-center' : 'hidden md:block'}`}>
                {showSearchMobile && <button onClick={() => setShowSearchMobile(false)} className="mr-2 text-gray-500"><ChevronLeft/></button>}
                <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-gray-600" size={14} />
                <input 
                  type="text" 
                  placeholder="Find transmission..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-[10px] font-bold text-white focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all w-full md:w-40 lg:w-56"
                />
              </div>
              <button onClick={() => setShowSearchMobile(true)} className="p-2 md:hidden hover:bg-white/5 rounded-full text-gray-500"><Search size={18}/></button>
              <button className="p-2 hover:bg-white/5 rounded-full transition-all text-gray-500"><MoreVertical size={20}/></button>
            </div>
          </header>

          {/* Messages Scroller */}
          <div className="flex-grow overflow-y-auto p-4 md:p-8 space-y-6 md:space-y-8 custom-scrollbar bg-black/10">
            {activeTab === 'team' && !myTeam ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="p-12 rounded-full bg-red-500/10 border-2 border-red-500/20 text-red-500 animate-pulse mb-8">
                  <Lock size={48} />
                </div>
                <h4 className="anime-title text-2xl text-white uppercase mb-3">Biometric Mismatch</h4>
                <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest max-w-xs leading-relaxed">Access to squad comms requires valid legion registration.</p>
              </div>
            ) : activeTab === 'dm' && !selectedDmUser ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center border border-white/5 mb-6 text-gray-700">
                  <ShieldCheck size={48} className="opacity-20" />
                </div>
                <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em]">Initialize handshake protocol to begin decryption</p>
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-700">
                <p className="text-[10px] font-black uppercase tracking-widest animate-pulse">Awaiting incoming signal...</p>
              </div>
            ) : (
              filteredMessages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 md:gap-4 ${msg.isMe ? 'flex-row-reverse' : 'flex-row'} animate-in fade-in slide-in-from-bottom-2 duration-300 group`}>
                  <div className="relative flex-shrink-0 mt-1">
                    <img src={msg.avatar} className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-white/10" alt={msg.sender} />
                    {!msg.isMe && <Circle size={10} className="absolute bottom-0 right-0 fill-green-500 text-green-500 stroke-[2px] stroke-black" />}
                  </div>
                  
                  <div className={`flex flex-col max-w-[85%] md:max-w-[70%] space-y-1 ${msg.isMe ? 'items-end' : 'items-start'}`}>
                    <div className={`flex items-center gap-2 ${msg.isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                      {!msg.isMe && <span className="text-[9px] font-black text-primary uppercase">{msg.sender}</span>}
                      <span className="text-[7px] font-bold text-gray-600 uppercase">{msg.timestamp}</span>
                      {msg.isMe && (
                        <span className="transition-all duration-300">
                          {msg.isRead ? <CheckCheck size={10} className="text-primary" /> : <Check size={10} className="text-gray-700" />}
                        </span>
                      )}
                    </div>
                    
                    <div className="relative group/bubble">
                      <div className={`p-3 md:p-4 rounded-2xl text-[13px] md:text-[14px] font-medium leading-relaxed shadow-lg ${
                        msg.isMe 
                          ? 'bg-primary text-white rounded-tr-none shadow-primary/10' 
                          : 'bg-white/5 text-gray-200 border border-white/10 rounded-tl-none backdrop-blur-sm'
                      }`}>
                        {msg.attachment && (
                          <div className="mb-3">
                            {msg.attachment.type.startsWith('image/') ? (
                              <img src={msg.attachment.url} alt={msg.attachment.name} className="max-w-full rounded-xl border border-white/10 shadow-lg" />
                            ) : (
                              <div className="flex items-center gap-3 p-3 bg-black/20 rounded-xl border border-white/5">
                                <FileIcon size={20} className="text-gray-400" />
                                <div className="flex flex-col overflow-hidden">
                                  <span className="text-[10px] font-bold uppercase truncate">{msg.attachment.name}</span>
                                  <span className="text-[8px] text-gray-500 uppercase">BINARY OBJECT</span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        {msg.text}
                      </div>

                      {/* Floating Reactions Toolbar */}
                      <div className={`absolute top-0 flex items-center opacity-0 group-hover/bubble:opacity-100 transition-opacity bg-black/60 rounded-full p-1 border border-white/10 backdrop-blur-md z-30 ${msg.isMe ? 'right-full mr-2' : 'left-full ml-2'}`}>
                        <button onClick={() => setShowReactionPicker(showReactionPicker === msg.id ? null : msg.id)} className="p-1.5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                          <Smile size={14} />
                        </button>
                        {showReactionPicker === msg.id && (
                          <div className="absolute bottom-full mb-2 bg-black/80 backdrop-blur-xl p-2 rounded-2xl border border-white/10 flex gap-1 shadow-2xl animate-in zoom-in-90 duration-200">
                            {EMOJI_OPTIONS.map(emoji => (
                              <button key={emoji} onClick={() => handleAddReaction(msg.id, emoji)} className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-lg text-lg">
                                {emoji}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Displayed Reactions */}
                      {msg.reactions && msg.reactions.length > 0 && (
                        <div className={`flex flex-wrap gap-1 mt-2 ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                          {msg.reactions.map(r => (
                            <button 
                              key={r.emoji} 
                              onClick={() => handleAddReaction(msg.id, r.emoji)}
                              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] border transition-all ${r.users.includes(profile.name) ? 'bg-primary/20 border-primary/40 text-primary' : 'bg-white/5 border-white/10 text-gray-500'}`}
                            >
                              <span>{r.emoji}</span>
                              <span className="font-black">{r.count}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}

            {isTyping && (activeTab === 'world' || (activeTab === 'dm' && isTyping === selectedDmUser)) && (
              <div className="flex gap-4 animate-in fade-in slide-in-from-left-2">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                  <UserIcon size={14} className="text-gray-700" />
                </div>
                <div className="bg-white/5 border border-white/5 px-4 py-2 rounded-2xl rounded-tl-none flex items-center gap-2">
                  <span className="text-[9px] font-black text-primary uppercase tracking-widest">{isTyping} is typing</span>
                  <div className="flex gap-1">
                    <div className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1 h-1 bg-primary rounded-full animate-bounce" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Persistent Input Bar */}
          <footer className={`p-4 md:p-6 lg:p-8 border-t border-white/10 bg-black/60 backdrop-blur-xl ${activeTab === 'dm' && !selectedDmUser ? 'hidden' : 'block'}`}>
            {pendingAttachment && (
              <div className="mb-4 flex items-center gap-4 animate-in slide-in-from-bottom-2">
                <div className="relative w-14 h-14 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center overflow-hidden">
                  {pendingAttachment.type.startsWith('image/') ? <img src={pendingAttachment.url} className="w-full h-full object-cover" /> : <FileIcon size={20} className="text-primary" />}
                  <button onClick={() => setPendingAttachment(null)} className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity"><X size={16}/></button>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-white uppercase truncate max-w-[150px]">{pendingAttachment.name}</span>
                  <span className="text-[8px] font-bold text-primary uppercase tracking-widest">Uplink Ready</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSendMessage} className="flex gap-3 md:gap-4 items-center">
              <button type="button" onClick={() => fileInputRef.current?.click()} className={`p-3 bg-white/5 hover:bg-white/10 text-gray-500 hover:text-white rounded-xl md:rounded-2xl transition-all border border-white/10 ${pendingAttachment ? 'border-primary text-primary' : ''}`}>
                <Paperclip size={20}/>
              </button>
              
              <div className="flex-grow relative">
                <input 
                  type="text" 
                  placeholder={activeTab === 'team' && !myTeam ? "CHANNEL LOCKED" : "Transmit signal..."} 
                  value={inputText}
                  disabled={(activeTab === 'team' && !myTeam) || (activeTab === 'dm' && !selectedDmUser)}
                  onChange={(e) => setInputText(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl md:rounded-[1.5rem] py-3.5 md:py-5 pl-5 md:pl-8 pr-12 md:pr-16 text-sm font-bold text-white focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all disabled:opacity-50"
                />
                <button 
                  type="submit"
                  disabled={(!inputText.trim() && !pendingAttachment) || (activeTab === 'team' && !myTeam) || (activeTab === 'dm' && !selectedDmUser)}
                  className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 p-2.5 md:p-3 bg-primary text-white rounded-xl shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                >
                  {/* FIX: Removed invalid 'md:size' prop from Send icon as Lucide icons only accept 'size' */}
                  <Send size={20} />
                </button>
              </div>
            </form>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
