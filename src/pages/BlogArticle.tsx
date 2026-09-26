import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Check, MessageSquare, Send, Calendar, Clock, ArrowRight, User } from 'lucide-react';
import { BlogItem, BlogComment } from '../types';
import { addBlogComment, fetchBlogById } from '../services/api';

interface BlogArticleProps {
  blog?: BlogItem | null;
  allBlogs?: BlogItem[];
  onSelectBlog?: (blog: BlogItem) => void;
}

export const BlogArticle: React.FC<BlogArticleProps> = ({ 
  blog: propBlog, 
  allBlogs = [], 
  onSelectBlog 
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currentBlog, setCurrentBlog] = useState<BlogItem | null>(propBlog || null);
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (propBlog) {
      setCurrentBlog(propBlog);
      setComments(propBlog.comments || []);
      return;
    }
    if (id) {
      const found = allBlogs.find(b => b.id === id || b.slug === id);
      if (found) {
        setCurrentBlog(found);
        setComments(found.comments || []);
      } else {
        fetchBlogById(id).then(b => {
          setCurrentBlog(b);
          setComments(b.comments || []);
        }).catch(console.error);
      }
    }
  }, [id, propBlog, allBlogs]);

  if (!currentBlog) {
    return (
      <div className="min-h-screen bg-[#08080a] text-white flex flex-col items-center justify-center p-8">
        <h2 className="text-xl font-bold font-display">Loading Article...</h2>
        <button
          onClick={() => navigate('/blog')}
          className="mt-4 px-4 py-2 bg-white/10 rounded-xl text-xs font-semibold"
        >
          Return to Blog
        </button>
      </div>
    );
  }

  const blog = currentBlog;

  const handleShare = () => {
    navigator.clipboard?.writeText?.(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentName || !commentText) return;
    setLoading(true);

    try {
      const res = await addBlogComment(blog.id, { name: commentName, text: commentText });
      setComments([res.comment, ...comments]);
      setCommentText('');
    } catch (err) {
      console.error('Failed to post comment', err);
    } finally {
      setLoading(false);
    }
  };

  // Find next blog
  const currentIndex = allBlogs.findIndex(b => b.id === blog.id);
  const nextBlog = allBlogs.length > 0 ? allBlogs[(currentIndex + 1) % allBlogs.length] : null;

  return (
    <div className="min-h-screen bg-[#08080a] text-white py-12 sm:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation & Breadcrumb */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
          <button
            onClick={() => navigate('/blog')}
            className="flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>BACK TO BLOG</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-neutral-300 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Share Article'}</span>
          </button>
        </div>

        {/* Article Header (matching mockup panel 8) */}
        <header className="mb-10 space-y-4">
          <div className="flex items-center gap-3 text-xs text-neutral-400">
            <span className="text-[#ff2a6d] font-mono font-bold uppercase">{blog.category}</span>
            <span>·</span>
            <span>{blog.date}</span>
            <span>·</span>
            <span>{blog.readTime}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black font-display text-white uppercase tracking-tight leading-tight">
            {blog.title}
          </h1>

          <p className="text-base sm:text-lg text-neutral-300 leading-relaxed font-normal">
            {blog.subtitle}
          </p>
        </header>

        {/* Featured Image */}
        <div className="aspect-[16/9] rounded-3xl overflow-hidden bg-neutral-900 border border-white/10 mb-12 shadow-2xl">
          <img
            src={blog.image}
            alt={blog.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Article Body Content */}
        <div className="space-y-8 text-neutral-300 text-base leading-relaxed mb-16">
          {blog.sections.map((section, idx) => (
            <div key={idx} className="space-y-4">
              {section.heading && (
                <h2 className="text-2xl font-bold font-display text-white mt-8 mb-4">
                  {section.heading}
                </h2>
              )}

              {section.paragraphs && section.paragraphs.map((p, pIdx) => (
                <p key={pIdx} className="text-neutral-300">
                  {p}
                </p>
              ))}

              {section.quote && (
                <div className="my-8 p-6 sm:p-8 bg-[#101016] border-l-4 border-[#ff2a6d] rounded-r-2xl">
                  <p className="text-lg sm:text-xl font-serif italic text-white leading-snug">
                    “{section.quote}”
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Next Post & Share footer */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-16">
          <div className="flex items-center gap-3 text-xs text-neutral-400">
            <span>Share this article:</span>
            <button onClick={handleShare} className="hover:text-[#ff2a6d] cursor-pointer">Twitter / X</button>
            <span>·</span>
            <button onClick={handleShare} className="hover:text-[#ff2a6d] cursor-pointer">LinkedIn</button>
            <span>·</span>
            <button onClick={handleShare} className="hover:text-[#ff2a6d] cursor-pointer">Copy Link</button>
          </div>

          {nextBlog && (
            <button
              onClick={() => {
                if (onSelectBlog) onSelectBlog(nextBlog);
                navigate(`/blog/${nextBlog.slug || nextBlog.id}`);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-xs font-bold text-white hover:text-[#ff2a6d] hover-card-neon flex items-center gap-1.5 transition-colors cursor-pointer group"
            >
              <span>Next Post: {nextBlog.title}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>

        {/* Interactive Comments Section */}
        <section className="bg-[#101016] border border-white/5 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#ff2a6d]" />
            <h3 className="text-lg font-bold font-display text-white">
              Discussion ({comments.length})
            </h3>
          </div>

          <form onSubmit={handleCommentSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                required
                value={commentName}
                onChange={(e) => setCommentName(e.target.value)}
                placeholder="Your name"
                className="bg-[#181820] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff2a6d]"
              />
            </div>
            <textarea
              rows={3}
              required
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Join the discussion on underground music and street culture..."
              className="w-full bg-[#181820] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#ff2a6d]"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-[#ff2a6d] hover:bg-[#ff1a5d] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? 'Posting...' : 'Post Comment'}</span>
            </button>
          </form>

          {/* List of comments */}
          <div className="divide-y divide-white/5 pt-4">
            {comments.map((c) => (
              <div key={c.id} className="py-4 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">{c.name}</span>
                  <span className="text-neutral-500 font-mono text-[10px]">{c.date}</span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">{c.text}</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};
