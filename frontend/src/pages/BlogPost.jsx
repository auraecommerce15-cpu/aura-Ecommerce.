import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Calendar, Tag, Share2, Link2, ChevronRight } from "lucide-react";
import { blogPosts } from "../data/blogPosts";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { setPageMetadata } from "../utils/seo";

const categoryColors = {
    "Innovation":     "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
    "Wearables":      "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
    "Audio":          "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    "Technology":     "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
    "Gaming":         "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    "Sustainability": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
};

// Simple markdown-like renderer for the blog content
function RenderContent({ content }) {
    const lines = content.trim().split("\n");
    const elements = [];
    let key = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) { elements.push(<div key={key++} className="h-2" />); continue; }

        if (line.startsWith("## ")) {
            elements.push(
                <h2 key={key++} className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mt-10 mb-4 leading-tight">
                    {line.slice(3)}
                </h2>
            );
        } else if (line.startsWith("### ")) {
            elements.push(
                <h3 key={key++} className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-8 mb-3">
                    {line.slice(4)}
                </h3>
            );
        } else if (line.startsWith("**") && line.endsWith("**")) {
            elements.push(
                <p key={key++} className="font-bold text-slate-900 dark:text-white mt-4 mb-2">
                    {line.slice(2, -2)}
                </p>
            );
        } else if (line.startsWith("- ")) {
            elements.push(
                <li key={key++} className="text-slate-600 dark:text-slate-300 leading-relaxed ml-4 list-disc my-1">
                    {renderInline(line.slice(2))}
                </li>
            );
        } else if (line.startsWith("---")) {
            elements.push(<hr key={key++} className="border-t border-slate-200 dark:border-slate-700 my-10" />);
        } else if (line.startsWith("*") && line.endsWith("*")) {
            elements.push(
                <p key={key++} className="italic text-slate-500 dark:text-slate-400 text-sm mt-4 leading-relaxed">
                    {line.slice(1, -1)}
                </p>
            );
        } else {
            elements.push(
                <p key={key++} className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg mb-4">
                    {renderInline(line)}
                </p>
            );
        }
    }

    return <>{elements}</>;
}

function renderInline(text) {
    const parts = text.split(/(\[(?:[^\]]+)\]\((?!\/{2})\/[^)\s]*\)|\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
            return <strong key={i} className="font-bold text-slate-900 dark:text-white">{part.slice(2, -2)}</strong>;
        }

        const match = part.match(/^\[([^\]]+)\]\((\/[^)\s]*)\)$/);
        if (match) {
            return <Link key={i} to={match[2]} className="font-semibold text-purple-700 underline decoration-purple-300 underline-offset-4 hover:text-purple-900 dark:text-purple-300 dark:hover:text-purple-200">{match[1]}</Link>;
        }

        return part;
    });
}

export default function BlogPost() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [shareOpen, setShareOpen] = useState(false);

    const post = blogPosts.find(p => p.slug === slug);
    const related = post
        ? [
            ...blogPosts.filter(p => p.slug !== slug && p.category === post.category),
            ...blogPosts.filter(p => p.slug !== slug && p.category !== post.category)
        ].slice(0, 3)
        : [];

    useEffect(() => {
        if (!post) return undefined;
        return setPageMetadata({
            title: post.seoTitle || post.title,
            description: post.metaDescription || post.excerpt,
            keywords: post.keywords || [`premium ${post.category.toLowerCase()} technology`, "luxury consumer electronics"],
            canonicalPath: `/blog/${post.slug}`,
            image: post.image,
            type: "article"
        });
    }, [post]);

    if (!post) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-950 text-slate-900 dark:text-white">
                <h2 className="text-3xl font-black mb-4">Article Not Found</h2>
                <p className="text-slate-400 mb-8">This article doesn't exist or has been moved.</p>
                <Link to="/blog" className="bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors">
                    Back to Journal
                </Link>
            </div>
        );
    }

    const shareUrl = `https://aura-ecommerce15.vercel.app/blog/${post.slug}`;

    const copyLink = () => {
        navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied to clipboard!");
        setShareOpen(false);
    };

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors">

            {/* ── Hero Image ── */}
            <div className="relative h-[65vh] min-h-[400px] overflow-hidden">
                <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover"
                    onError={e => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80";
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                {/* Back Button */}
                <button
                    onClick={() => navigate("/blog")}
                    className="absolute top-6 left-6 flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-semibold transition-all border border-white/20 cursor-pointer"
                >
                    <ArrowLeft size={15} /> Back to Journal
                </button>

                {/* Title overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 max-w-4xl mx-auto">
                    <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full mb-4 ${categoryColors[post.category] || "bg-purple-100 text-purple-700"}`}>
                        {post.category}
                    </span>
                    <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-4 drop-shadow-lg">
                        {post.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-white/70 text-sm">
                        <span className="flex items-center gap-1.5"><Calendar size={13} />{post.date}</span>
                        <span className="flex items-center gap-1.5"><Clock size={13} />{post.readTime}</span>
                        <span className="font-semibold text-white/90">By {post.author}</span>
                    </div>
                </div>
            </div>

            {/* ── Article Body ── */}
            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">

                {/* Excerpt (lead paragraph) */}
                <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed border-l-4 border-purple-500 pl-6 py-2 mb-10 font-medium italic">
                    {post.excerpt}
                </p>

                {/* Content */}
                <div className="prose-custom">
                    <RenderContent content={post.content} />
                </div>

                {/* ── Share Bar ── */}
                <div className="mt-14 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <Tag size={16} className="text-purple-600" />
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${categoryColors[post.category] || "bg-slate-100 text-slate-700"}`}>
                            {post.category}
                        </span>
                    </div>
                    <div className="relative">
                        <button
                            onClick={() => setShareOpen(!shareOpen)}
                            className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-slate-700 dark:text-slate-300 hover:text-purple-700 dark:hover:text-purple-300 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer"
                        >
                            <Share2 size={14} /> Share
                        </button>
                        {shareOpen && (
                            <div className="absolute bottom-full right-0 mb-2 w-44 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 p-1.5 z-50">
                                <a
                                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`}
                                    target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                                >
                                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                    </svg>
                                    Share on X
                                </a>
                                <a
                                    href={`https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                                    target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                                >
                                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                    </svg>
                                    Share on Facebook
                                </a>
                                <button
                                    onClick={copyLink}
                                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                                >
                                    <Link2 size={13} /> Copy Link
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Related Articles ── */}
            <div className="bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-8">More from The Journal</h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {related.map(p => (
                            <Link key={p.id} to={`/blog/${p.slug}`} className="group block">
                                <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 hover:border-purple-200 dark:hover:border-purple-800 hover:shadow-lg transition-all">
                                    <div className="h-44 overflow-hidden">
                                        <img
                                            src={p.image}
                                            alt={p.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            onError={e => {
                                                e.currentTarget.src = "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80";
                                            }}
                                        />
                                    </div>
                                    <div className="p-5">
                                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${categoryColors[p.category] || "bg-slate-100 text-slate-700"}`}>
                                            {p.category}
                                        </span>
                                        <h3 className="text-base font-bold text-slate-900 dark:text-white mt-3 mb-2 leading-snug group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2">
                                            {p.title}
                                        </h3>
                                        <span className="flex items-center gap-1 text-xs font-semibold text-purple-600 dark:text-purple-400">
                                            Read <ChevronRight size={11} />
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
