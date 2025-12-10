import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API } from '../App';
import { toast } from 'sonner';
import { Plus, Users, LogOut, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

const Dashboard = ({ setToken }) => {
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newFamilyName, setNewFamilyName] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadFamilies();
  }, []);

  const loadFamilies = async () => {
    try {
      const response = await axios.get(`${API}/families`);
      setFamilies(response.data);
    } catch (error) {
      toast.error('Failed to load families');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFamily = async (e) => {
    e.preventDefault();
    if (!newFamilyName.trim()) return;

    try {
      await axios.post(`${API}/families`, { name: newFamilyName });
      toast.success('Family created successfully!');
      setNewFamilyName('');
      setDialogOpen(false);
      loadFamilies();
    } catch (error) {
      toast.error('Failed to create family');
    }
  };

  const handleDeleteFamily = async (familyId, familyName) => {
    if (!window.confirm(`Are you sure you want to delete "${familyName}" family? This will delete all members and events.`)) {
      return;
    }

    try {
      await axios.delete(`${API}/families/${familyId}`);
      toast.success('Family deleted successfully');
      loadFamilies();
    } catch (error) {
      toast.error('Failed to delete family');
    }
  };

  const handleLogout = () => {
    setToken(null);
    navigate('/login');
    toast.success('Logged out successfully');
  };

  return (
    <div className="min-h-screen paper-texture" style={{ background: '#F5F2EB' }}>
      {/* Header */}
      <header className="border-b" style={{ borderColor: '#D6D3C9', background: 'rgba(255, 255, 255, 0.5)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-serif tracking-tight" style={{ fontFamily: 'Playfair Display', color: '#2C4F42' }}>
                OneFam
              </h1>
              <p className="text-xs font-mono uppercase tracking-widest mt-1" style={{ color: '#78716C' }}>
                Family Trees
              </p>
            </div>
            <button
              data-testid="logout-button"
              onClick={handleLogout}
              className="flex items-center gap-2 bg-transparent border rounded-full px-6 py-2 font-sans tracking-wide"
              style={{
                borderColor: 'rgba(44, 79, 66, 0.2)',
                color: '#2C4F42',
                transition: 'background-color 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(44, 79, 66, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-serif font-medium" style={{ fontFamily: 'Playfair Display', color: '#2C4F42' }}>
              Your Families
            </h2>
            <p className="text-base md:text-lg font-sans leading-relaxed mt-2" style={{ color: '#78716C' }}>
              Select a family to view and manage the family tree
            </p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <button
                data-testid="create-family-button"
                className="flex items-center gap-2 text-white rounded-full px-6 py-3 font-serif italic"
                style={{
                  backgroundColor: '#2C4F42',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  transition: 'transform 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <Plus size={20} />
                Create Family
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-serif text-2xl" style={{ fontFamily: 'Playfair Display', color: '#2C4F42' }}>
                  Create New Family
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateFamily} className="space-y-4">
                <div>
                  <Label htmlFor="family-name" className="text-xs font-mono uppercase tracking-widest" style={{ color: '#78716C' }}>
                    Family Name
                  </Label>
                  <Input
                    id="family-name"
                    data-testid="family-name-input"
                    value={newFamilyName}
                    onChange={(e) => setNewFamilyName(e.target.value)}
                    placeholder="Enter family name"
                    className="font-serif text-lg"
                    required
                  />
                </div>
                <Button
                  data-testid="submit-family-button"
                  type="submit"
                  className="w-full rounded-full py-3 font-serif italic"
                  style={{ backgroundColor: '#2C4F42', color: '#F5F2EB' }}
                >
                  Create Family
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Families Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-lg" style={{ color: '#78716C' }}>Loading families...</p>
          </div>
        ) : families.length === 0 ? (
          <div className="text-center py-12">
            <Users size={64} style={{ color: '#C86B53', margin: '0 auto', marginBottom: '1rem' }} />
            <p className="text-lg mb-4" style={{ color: '#78716C' }}>No families yet</p>
            <p className="text-base" style={{ color: '#78716C' }}>Create your first family to get started</p>
          </div>
        ) : (
          <div data-testid="families-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {families.map((family, index) => (
              <div
                key={family.id}
                data-testid={`family-card-${index}`}
                className="bg-white/50 backdrop-blur-sm border border-white/40 rounded-xl p-6 relative overflow-hidden group hover-lift cursor-pointer"
                style={{
                  boxShadow: '0 4px 6px -1px rgba(44, 79, 66, 0.05), 0 2px 4px -1px rgba(44, 79, 66, 0.03)',
                  transition: 'border-color 0.3s ease',
                  animationDelay: `${index * 0.1}s`,
                }}
                onClick={() => navigate(`/family/${family.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-2xl font-serif font-medium mb-2" style={{ fontFamily: 'Playfair Display', color: '#2C4F42' }}>
                      {family.name}
                    </h3>
                    <p className="text-xs font-mono uppercase tracking-widest" style={{ color: '#78716C' }}>
                      {new Date(family.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    data-testid={`delete-family-button-${index}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFamily(family.id, family.name);
                    }}
                    className="p-2 rounded-full"
                    style={{
                      color: '#C86B53',
                      transition: 'background-color 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(200, 107, 83, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="mt-4 flex items-center gap-2" style={{ color: '#78716C' }}>
                  <Users size={16} />
                  <span className="text-sm">View Family Tree</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
