import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Clock, Calendar, BookOpen } from 'lucide-react';
import { BlogItem } from '../types';

interface BlogProps {
  blogs: BlogItem[];
  onSelectBlog?: (blog: BlogItem) => void;
  onNavigate?: (tab: string) => void;
}

export const Blog: React.FC<BlogProps> = ({ blogs, onSelectBlog, onNavigate }) => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('ALL');

  const categories = ['ALL', 'MUSIC', 'EVENTS', 'ARTISTS', 'CULTURE', 'LIFESTYLE'];

  const filteredBlogs = blogs.filter((b) => {
    if (activeCategory === 'ALL') return true;
    return b.category.toUpperCase() === activeCategory;
  });

  const handleBlogClick = (post: BlogItem) => {
    if (onSelectBlog) onSelectBlog(post);
    navigate(`/blog/${post.slug || post.id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-white py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header (matching mockup panel 7) */}
        <div className="mb-12">
          <span className="text-[11px] font-mono tracking-widest text-[#ff2a6d] uppercase block mb-2">
            The Journal
          </span>
          <h1 className="text-4xl sm:text-6xl font-black font-display tracking-tight text-white uppercase">
            OUR BLOG
          </h1>
          <p className="text-base text-neutral-300 mt-2">
            Stories. Insights. Music Culture.
          </p>
        </div>

        {/* Filter categories */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-10 border-b border-white/5 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 text-xs font-semibold tracking-wider rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeCategory === cat
                  ? 'bg-[#ff2a6d] text-white shadow-sm'
                  : 'bg-[#121218] text-neutral-400 hover:text-white hover:bg-[#181822]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Articles Grid (6 articles matching mockup with enhanced hover effects) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredBlogs.map((post) => (
            <article
              key={post.id}
              onClick={() => handleBlogClick(post)}
              className="group bg-[#101016] border border-white/5 hover:border-[#ff2a6d]/60 hover:shadow-[0_0_30px_rgba(255,42,109,0.22)] hover:-translate-y-2 rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div className="relative aspect-[16/10] bg-neutral-900 overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                />
                <div className="absolute top-3 left-3 px-2 py-0.5 bg-black/70 backdrop-blur-md rounded text-[10px] font-mono text-neutral-300 border border-white/10 group-hover:border-[#ff2a6d]/40 group-hover:text-white transition-all">
                  {post.category}
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-[11px] text-neutral-400 mb-2">
                    <span>{post.date}</span>
                    <span>·</span>
                    <span>{post.readTime}</span>
                  </div>

                  <h2 className="text-lg font-bold font-display text-white group-hover:text-rose-400 group-hover:drop-shadow-[0_0_8px_rgba(255,42,109,0.4)] transition-all leading-snug">
                    {post.title}
                  </h2>

                  <p className="text-xs text-neutral-400 mt-2 line-clamp-2 leading-relaxed">
                    {post.subtitle}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="text-neutral-500 font-medium">By {post.author}</span>
                  <span className="text-[#ff2a6d] font-bold group-hover:translate-x-1.5 transition-transform flex items-center gap-1">
                    <span>Read Article</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

      </div>
    </div>
  );
};
