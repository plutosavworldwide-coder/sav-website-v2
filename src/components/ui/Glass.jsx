import { cn } from "@/lib/utils";

export const GlassCard = ({ children, className, hoverEffect = false, ...props }) => (
    <div
        className={cn(
            "relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/50 backdrop-blur-xl transition-all duration-500",
            hoverEffect && "hover:bg-zinc-800/60 hover:border-white/20 hover:shadow-2xl hover:shadow-black/50 group",
            className
        )}
        {...props}
    >
        {children}
    </div>
);

export const GlassButton = ({ children, onClick, className, variant = "primary", disabled, ...props }) => {
    const variants = {
        primary: "bg-white text-black hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed",
        secondary: "bg-zinc-800/50 text-white border border-white/5 hover:bg-zinc-800 disabled:opacity-50",
        ghost: "hover:bg-white/5 text-zinc-400 hover:text-white disabled:opacity-50",
        premium: "bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20"
    };
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2",
                variants[variant] || variants.primary,
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
};

export const Badge = ({ children, className, variant = "default" }) => {
    const variants = {
        default: "bg-zinc-800/50 text-zinc-300 border-zinc-700/50",
        active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        premium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        outline: "bg-transparent border-white/10 text-zinc-400"
    };
    return (
        <span className={cn(
            "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border backdrop-blur-md",
            variants[variant] || variants.default,
            className
        )}>
            {children}
        </span>
    );
};
