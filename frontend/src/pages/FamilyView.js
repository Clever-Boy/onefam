import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { API } from '../App';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Bell, Calendar, Grid3x3, GitBranch, Users2, Mail } from 'lucide-react';
import TreeView from '../components/TreeView';
import CardsView from '../components/CardsView';
import AddMemberModal from '../components/AddMemberModal';
import AlertsPanel from '../components/AlertsPanel';
import EventsCalendar from '../components/EventsCalendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';

const FamilyView = ({ setToken }) => {
  const { familyId } = useParams();
  const navigate = useNavigate();
  const [family, setFamily] = useState(null);
  const [members, setMembers] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('tree'); // 'tree' or 'cards'
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAlertsPanel, setShowAlertsPanel] = useState(false);
  const [showEventsCalendar, setShowEventsCalendar] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    loadFamilyData();
  }, [familyId]);

  const loadFamilyData = async () => {
    try {
      const [familiesRes, membersRes, alertsRes] = await Promise.all([
        axios.get(`${API}/families`),
        axios.get(`${API}/families/${familyId}/members`),
        axios.get(`${API}/families/${familyId}/alerts`),
      ]);

      const currentFamily = familiesRes.data.find((f) => f.id === familyId);
      setFamily(currentFamily);
      setMembers(membersRes.data);
      setAlerts(alertsRes.data);
    } catch (error) {
      toast.error('Failed to load family data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = () => {
    setSelectedMember(null);
    setShowAddModal(true);
  };

  const handleEditMember = (member) => {
    setSelectedMember(member);
    setShowAddModal(true);
  };

  const handleDeleteMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to delete this member?')) {
      return;
    }

    try {
      await axios.delete(`${API}/families/${familyId}/members/${memberId}`);
      toast.success('Member deleted successfully');
      loadFamilyData();
    } catch (error) {
      toast.error('Failed to delete member');
    }
  };

  const upcomingAlertsCount = alerts.filter((a) => a.days_until <= 7).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F5F2EB' }}>
        <p className="text-lg" style={{ color: '#78716C' }}>Loading family tree...</p>
      </div>
    );
  }

  if (!family) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F5F2EB' }}>
        <div className="text-center">
          <p className="text-lg mb-4" style={{ color: '#78716C' }}>Family not found</p>
          <Button onClick={() => navigate('/')} style={{ backgroundColor: '#2C4F42', color: '#F5F2EB' }}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen paper-texture" style={{ background: '#F5F2EB' }}>
      {/* Header */}
      <header className="border-b sticky top-0 z-30" style={{ borderColor: '#D6D3C9', background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                data-testid="back-button"
                onClick={() => navigate('/')}
                className="p-2 rounded-full"
                style={{
                  color: '#2C4F42',
                  transition: 'background-color 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(44, 79, 66, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-3xl md:text-4xl font-serif tracking-tight" style={{ fontFamily: 'Playfair Display', color: '#2C4F42' }}>
                  {family.name}
                </h1>
                <p className="text-xs font-mono uppercase tracking-widest" style={{ color: '#78716C' }}>
                  {members.length} Members
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                data-testid="add-member-button"
                onClick={handleAddMember}
                className="flex items-center gap-2 text-white rounded-full px-4 py-2 text-sm font-serif italic"
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
                <Plus size={16} />
                Add Member
              </button>

              <button
                data-testid="alerts-button"
                onClick={() => setShowAlertsPanel(true)}
                className="relative p-2 rounded-full"
                style={{
                  color: '#2C4F42',
                  transition: 'background-color 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(44, 79, 66, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Bell size={20} />
                {upcomingAlertsCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold pulse"
                    style={{ backgroundColor: '#D4FF33', color: '#1C1917' }}
                  >
                    {upcomingAlertsCount}
                  </span>
                )}
              </button>

              <button
                data-testid="calendar-button"
                onClick={() => setShowEventsCalendar(true)}
                className="p-2 rounded-full"
                style={{
                  color: '#2C4F42',
                  transition: 'background-color 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(44, 79, 66, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Calendar size={20} />
              </button>
            </div>
          </div>

          {/* View Toggle */}
          <div className="mt-4 flex items-center gap-2">
            <button
              data-testid="tree-view-button"
              onClick={() => setViewMode('tree')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-sans ${viewMode === 'tree' ? 'shadow-md' : ''}`}
              style={{
                backgroundColor: viewMode === 'tree' ? '#2C4F42' : 'transparent',
                color: viewMode === 'tree' ? '#F5F2EB' : '#2C4F42',
                border: viewMode === 'tree' ? 'none' : '1px solid rgba(44, 79, 66, 0.2)',
                transition: 'all 0.3s ease',
              }}
            >
              <GitBranch size={16} />
              Tree View
            </button>
            <button
              data-testid="cards-view-button"
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-sans ${viewMode === 'cards' ? 'shadow-md' : ''}`}
              style={{
                backgroundColor: viewMode === 'cards' ? '#2C4F42' : 'transparent',
                color: viewMode === 'cards' ? '#F5F2EB' : '#2C4F42',
                border: viewMode === 'cards' ? 'none' : '1px solid rgba(44, 79, 66, 0.2)',
                transition: 'all 0.3s ease',
              }}
            >
              <Grid3x3 size={16} />
              Cards View
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {members.length === 0 ? (
          <div className="text-center py-12">
            <Users2 size={64} style={{ color: '#C86B53', margin: '0 auto', marginBottom: '1rem' }} />
            <p className="text-lg mb-4" style={{ color: '#78716C' }}>No family members yet</p>
            <p className="text-base mb-6" style={{ color: '#78716C' }}>Add your first family member to start building the tree</p>
            <Button
              onClick={handleAddMember}
              style={{ backgroundColor: '#2C4F42', color: '#F5F2EB' }}
              className="rounded-full px-6 py-3 font-serif italic"
            >
              <Plus size={16} className="mr-2" />
              Add First Member
            </Button>
          </div>
        ) : (
          <>
            {viewMode === 'tree' && (
              <TreeView
                members={members}
                onEdit={handleEditMember}
                onDelete={handleDeleteMember}
              />
            )}
            {viewMode === 'cards' && (
              <CardsView
                members={members}
                onEdit={handleEditMember}
                onDelete={handleDeleteMember}
              />
            )}
          </>
        )}
      </main>

      {/* Modals */}
      <AddMemberModal
        open={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setSelectedMember(null);
        }}
        familyId={familyId}
        member={selectedMember}
        members={members}
        onSuccess={loadFamilyData}
      />

      <AlertsPanel
        open={showAlertsPanel}
        onClose={() => setShowAlertsPanel(false)}
        familyId={familyId}
        alerts={alerts}
      />

      <EventsCalendar
        open={showEventsCalendar}
        onClose={() => setShowEventsCalendar(false)}
        familyId={familyId}
        members={members}
      />
    </div>
  );
};

export default FamilyView;
