import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { EventDetails } from './pages/EventDetails';
import { CreateEvent } from './pages/CreateEvent';
import { Dashboard } from './pages/Dashboard';
import CheckIn from './pages/CheckIn';
import Wishlist from './pages/Wishlist';
import { AuthProvider } from './context/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-black text-white selection:bg-white/30">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/event/:id" element={<EventDetails />} />
              <Route path="/create" element={<CreateEvent />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/check-in" element={<CheckIn />} />
              <Route path="/wishlist" element={<Wishlist />} />
            </Routes>
          </main>
          <Toaster position="top-center" richColors theme="dark" />
        </div>
      </Router>
    </AuthProvider>
  );
}

