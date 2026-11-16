import { useState } from "react";
import { Link } from "react-router-dom";
import { Clock, ArrowRight, Tag, ChevronRight } from "lucide-react";
import { blogPosts } from "../data/blogPosts";

const CATEGORIES = ["All", "Innovation", "Wearables", "Audio", "Technology", "Gaming", "Sustainability"];

const categoryColors = {
    "Innovation":     "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
    "Wearables":      "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
    "Audio":          "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    "Technology":     "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
    "Gaming":         "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    "Sustainability": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
};

export default function Blogs() {
    const [activeCategory, setActiveCategory] = useState("All");

    const filtered = activeCategory === "All"
        ? blogPosts
        : blogPosts.filter(p => p.category === activeCategory);

    const featured = filtered[0];
    const rest = filtered.slice(1);

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors">

            {/* ── Hero Banner ── */}
            <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 py-24 md:py-32">
                {/* Subtle grid pattern */}
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
                        backgroundSize: "40px 40px"
                    }}
                />
                <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
                    <div className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-500/30 rounded-full px-4 py-1.5 mb-6">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                        <span className="text-purple-300 text-sm font-semibold tracking-wider uppercase">AURA Editorial</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-none tracking-tight">
                        The <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-300">Journal</span>
                    </h1>
                    <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                        Deep-dive editorial on the technologies, materials, and ideas shaping the future of premium tech. Written for the curious and the discerning.
                    </p>
                </div>
            </section>

            {/* ── Main Content ── */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

                {/* ── Category Filters ── */}
                <div className="flex flex-wrap gap-2.5 mb-14">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer ${
                                activeCategory === cat
                                    ? "bg-purple-600 text-white shadow-lg shadow-purple-500/25"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* ── Featured Post (first card — large) ── */}
                {featured && (
                    <Link to={`/blog/${featured.slug}`} className="group block mb-14">
                        <div className="grid md:grid-cols-2 gap-0 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-xl hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300">
                            {/* Image */}
                            <div className="relative h-72 md:h-auto overflow-hidden">
                                <img
                                    src={featured.image}
                                    alt={featured.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    onError={e => {
                                        e.currentTarget.src = "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80";
                                    }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                                <span className="absolute top-4 left-4 bg-purple-600 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                                    Featured
                                </span>
                            </div>
                            {/* Content */}
                            <div className="bg-white dark:bg-slate-900 p-8 md:p-12 flex flex-col justify-center">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${categoryColors[featured.category] || "bg-slate-100 text-slate-700"}`}>
                                        {featured.category}
                                    </span>
                                    <span className="flex items-center gap-1.5 text-slate-400 text-xs">
                                        <Clock size={12} />
                                        {featured.readTime}
                                    </span>
                                </div>
                                <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-4 leading-tight group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                    {featured.title}
                                </h2>
                                <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed mb-6">
                                    {featured.excerpt}
                                </p>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-bold text-slate-900 dark:text-white">{featured.author}</p>
                                        <p className="text-xs text-slate-400">{featured.date}</p>
                                    </div>
                                    <span className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-semibold text-sm group-hover:gap-3 transition-all">
                                        Read Article <ArrowRight size={14} />
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Link>
                )}

                {/* ── Grid of remaining posts ── */}
                {rest.length > 0 && (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {rest.map(post => (
                            <Link key={post.id} to={`/blog/${post.slug}`} className="group block">
                                <article className="h-full rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-purple-200 dark:hover:border-purple-800 hover:shadow-xl hover:shadow-purple-500/8 transition-all duration-300">
                                    {/* Post Image */}
                                    <div className="relative h-52 overflow-hidden">
                                        <img
                                            src={post.image}
                                            alt={post.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            onError={e => {
                                                e.currentTarget.src = "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80";
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                                        <span className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full ${categoryColors[post.category] || "bg-white/90 text-slate-700"}`}>
                                            {post.category}
                                        </span>
                                    </div>
                                    {/* Post Content */}
                                    <div className="p-6">
                                        <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                                            <Clock size={11} />
                                            {post.readTime}
                                            <span className="mx-1 text-slate-200 dark:text-slate-700">·</span>
                                            {post.date}
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 leading-snug group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2">
                                            {post.title}
                                        </h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3 mb-4">
                                            {post.excerpt}
                                        </p>
                                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{post.author}</span>
                                            <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400 text-xs font-semibold group-hover:gap-2 transition-all">
                                                Read <ChevronRight size={12} />
                                            </span>
                                        </div>
                                    </div>
                                </article>
                            </Link>
                        ))}
                    </div>
                )}

                {filtered.length === 0 && (
                    <div className="text-center py-24 text-slate-400">
                        <Tag className="mx-auto mb-4 opacity-30" size={48} />
                        <p className="text-lg font-semibold">No articles in this category yet</p>
                        <button onClick={() => setActiveCategory("All")} className="mt-4 text-purple-600 hover:underline font-medium">View all articles</button>
                    </div>
                )}
            </div>
        </div>
    );
}
