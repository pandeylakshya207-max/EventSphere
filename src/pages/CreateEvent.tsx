import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { generateEventDescription } from '../lib/gemini';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export const CreateEvent = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    category: 'Music',
    price: 0,
    capacity: 100,
    imageUrl: ''
  });

  const handleAiGenerate = async () => {
    if (!formData.title) {
      toast.error("Please enter a title first");
      return;
    }
    setAiLoading(true);
    const desc = await generateEventDescription(formData.title, formData.category);
    setFormData(prev => ({ ...prev, description: desc }));
    setAiLoading(false);
    toast.success("Description generated!");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setLoading(true);
    try {
      await api.createEvent({
        title: formData.title,
        description: formData.description,
        eventDate: new Date(formData.date).toISOString(),
        location: formData.location,
        category: formData.category,
        imageUrl: formData.imageUrl || undefined,
        price: Number(formData.price),
        capacity: Number(formData.capacity),
      });
      toast.success("Event created successfully!");
      navigate('/');
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-4xl">Create New Event</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm text-white/60 uppercase tracking-widest">Event Title</label>
              <Input 
                required
                value={formData.title}
                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. Midnight Jazz Session"
                className="bg-white/5 border-white/10"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm text-white/60 uppercase tracking-widest">Description</label>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleAiGenerate}
                  disabled={aiLoading}
                  className="text-white/50 hover:text-white gap-2"
                >
                  {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  AI Generate
                </Button>
              </div>
              <textarea 
                required
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your event..."
                className="w-full min-h-[150px] bg-white/5 border border-white/10 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-white/60 uppercase tracking-widest">Date & Time</label>
                <Input 
                  required
                  type="datetime-local"
                  value={formData.date}
                  onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white/60 uppercase tracking-widest">Category</label>
                <select 
                  value={formData.category}
                  onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full h-10 bg-white/5 border border-white/10 rounded-md px-3 focus:outline-none focus:ring-2 focus:ring-white/20"
                >
                  <option value="Music">Music</option>
                  <option value="Tech">Tech</option>
                  <option value="Art">Art</option>
                  <option value="Food">Food</option>
                  <option value="Sports">Sports</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-white/60 uppercase tracking-widest">Location</label>
              <Input 
                required
                value={formData.location}
                onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Venue name or address"
                className="bg-white/5 border-white/10"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-white/60 uppercase tracking-widest">Price ($)</label>
                <Input 
                  type="number"
                  min="0"
                  value={formData.price}
                  onChange={e => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white/60 uppercase tracking-widest">Capacity</label>
                <Input 
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={e => setFormData(prev => ({ ...prev, capacity: Number(e.target.value) }))}
                  className="bg-white/5 border-white/10"
                />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full premium-button h-12 text-lg">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Publish Event"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
