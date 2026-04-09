"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Mail, KeyRound, Loader2, ArrowLeft, User, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      // Handle Sign In
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.ok) {
        toast.success("Successfully signed in!");
        router.push("/events");
      } else {
        toast.error("Invalid credentials. Please try again.");
        setLoading(false);
      }
    } else {
      // Handle Sign Up
      try {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });

        const data = await res.json();

        if (res.ok) {
          toast.success("Account created! Please sign in.");
          setIsLogin(true);
          setPassword("");
        } else {
          toast.error(data.error || "Failed to create account");
        }
      } catch (err) {
        toast.error("Something went wrong");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4 relative overflow-hidden w-full">
      {/* Background Enhancements */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#1a1025] to-[#0a0a0a] z-0" />
      <div className="bg-glow absolute inset-0 z-0 opacity-50" />
      
      <button
        onClick={() => {
          // window.history.length > 2 means there's a real page before this one
          // (length 1 = direct open, length 2 = one prior page which may be external)
          if (window.history.length > 2) {
            window.history.back();
          } else {
            router.push("/");
          }
        }}
        className="absolute top-24 left-6 sm:left-8 flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-white transition-all duration-200 z-[60] group px-3 py-2 rounded-xl hover:bg-white/8 border border-transparent hover:border-white/10"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform duration-200" />
        Back
      </button>

      <div className="glass-card w-full max-w-md p-8 relative z-10 border-white/10 shadow-2xl shadow-brand-purple/5">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-purple/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-brand-purple/20 border border-brand-purple/30">
            <ShieldCheck className="text-brand-purple" size={32} />
          </div>
          <h1 className="text-3xl font-black mb-2 tracking-tight">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="text-gray-400">
            {isLogin ? "Sign in to access your tickets" : "Join EventSphere and explore experiences"}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-white/5 p-1 rounded-xl mb-8">
          <button 
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${isLogin ? 'bg-brand-purple text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
          >
            Sign In
          </button>
          <button 
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${!isLogin ? 'bg-brand-purple text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          {!isLogin && (
             <div className="space-y-2">
               <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Full Name</label>
               <div className="relative">
                 <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                 <input
                   type="text"
                   required
                   placeholder="John Doe"
                   className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:border-brand-purple outline-none transition-colors focus:bg-white/10 text-white"
                   value={name}
                   onChange={(e) => setName(e.target.value)}
                 />
               </div>
             </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="email"
                required
                placeholder="name@email.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:border-brand-purple outline-none transition-colors focus:bg-white/10 text-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Password</label>
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="password"
                required
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:border-brand-purple outline-none transition-colors focus:bg-white/10 text-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-4 text-sm mt-4 shadow-xl shadow-brand-purple/20">
            {loading ? <Loader2 className="animate-spin" /> : (isLogin ? "Sign In" : "Create Account")}
          </button>
        </form>
      </div>
    </div>
  );
}
