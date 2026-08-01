import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export const Login = () => {
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<'organizer' | 'attendee'>('attendee');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login(email, password);
        toast.success('Welcome back!');
      } else {
        await signup(email, password, displayName, role);
        toast.success('Account created!');
      }
      navigate('/');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-16">
      <h1 className="text-4xl font-display mb-2">{mode === 'login' ? 'Welcome back' : 'Create an account'}</h1>
      <p className="text-white/50 mb-8">
        {mode === 'login' ? 'Sign in to browse and book events.' : 'Sign up as an attendee or organizer.'}
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {mode === 'signup' && (
          <div className="space-y-2">
            <label htmlFor="displayName" className="text-sm text-white/70">Full name</label>
            <Input id="displayName" value={displayName} onChange={e => setDisplayName(e.target.value)} required />
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm text-white/70">Email</label>
          <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm text-white/70">Password</label>
          <Input
            id="password" type="password" value={password}
            onChange={e => setPassword(e.target.value)}
            minLength={8} required
          />
          {mode === 'signup' && <p className="text-xs text-white/40">At least 8 characters.</p>}
        </div>

        {mode === 'signup' && (
          <div className="space-y-2">
            <label className="text-sm text-white/70">I am signing up as</label>
            <div className="flex gap-3">
              <Button
                type="button" variant={role === 'attendee' ? 'default' : 'outline'}
                onClick={() => setRole('attendee')} className="flex-1"
              >
                Attendee
              </Button>
              <Button
                type="button" variant={role === 'organizer' ? 'default' : 'outline'}
                onClick={() => setRole('organizer')} className="flex-1"
              >
                Organizer
              </Button>
            </div>
          </div>
        )}

        <Button type="submit" disabled={submitting} className="w-full bg-white text-black hover:bg-white/90">
          {submitting ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Sign Up'}
        </Button>
      </form>

      <button
        onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
        className="mt-6 text-sm text-white/50 hover:text-white transition-colors w-full text-center"
      >
        {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
      </button>
    </div>
  );
};
