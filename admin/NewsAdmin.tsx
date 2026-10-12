import React from 'react';
import { Newspaper, Plus, Edit3, Trash2, Eye, Calendar } from 'lucide-react';
import { BLOG_POSTS } from '../mockData.ts';

const NewsAdmin: React.FC = () => {
  return (
    <div className="space-y-8 animate-in slide-in-from-left-4 duration-500">
      <header className="flex justify-between items-center">
        <h3 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
          <Newspaper size={20} className="text-primary" /> The Signal Console
        </h3>
        <button className="px-8 py-3 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-2">
          <Plus size={16} /> Broadcast Transmission
        </button>
      </header>

      <div className="grid gap-6">
        {BLOG_POSTS.map(post => (
          <div key={post.id} className="glass-panel rounded-[2.5rem] border border-white/5 overflow-hidden flex flex-col md:flex-row group hover:border-red-600/20 transition-all">
             <div className="w-full md:w-48 h-32 md:h-auto relative overflow-hidden grayscale group-hover:grayscale-0 transition-all">
                <img src={post.image} className="w-full h-full object-cover" alt="Blog" />
             </div>
             <div className="p-8 flex-grow flex flex-col justify-center space-y-4">
                <div className="flex justify-between items-start">
                   <div>
                     <span className="px-2 py-0.5 bg-primary/20 text-primary text-[8px] font-black rounded uppercase tracking-widest">{post.category}</span>
                     <h4 className="text-xl font-black text-white uppercase mt-1 leading-tight">{post.title}</h4>
                   </div>
                   <div className="flex gap-2">
                      <button className="p-2 text-gray-500 hover:text-white"><Edit3 size={16}/></button>
                      <button className="p-2 text-gray-500 hover:text-red-500"><Trash2 size={16}/></button>
                   </div>
                </div>
                <div className="flex items-center gap-6 pt-4 border-t border-white/5">
                   <div className="flex items-center gap-2 text-[10px] font-black text-gray-600 uppercase">
                      <Calendar size={12}/> {post.date}
                   </div>
                   <div className="flex items-center gap-2 text-[10px] font-black text-gray-600 uppercase">
                      <Eye size={12}/> 1.2k Views
                   </div>
                </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsAdmin;
