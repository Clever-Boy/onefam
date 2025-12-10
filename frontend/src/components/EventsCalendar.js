import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../App';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Calendar as CalendarIcon, Cake, Heart, Plus, Trash2 } from 'lucide-react';

const EventsCalendar = ({ open, onClose, familyId, members }) => {
  const [events, setEvents] = useState([]);
  const [customEvents, setCustomEvents] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAddEventDialog, setShowAddEventDialog] = useState(false);
  const [newEvent, setNewEvent] = useState({
    event_name: '',
    event_date: '',
    member_id: '',
  });

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);
  const months = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  useEffect(() => {
    if (open) {
      loadEvents();
      loadCustomEvents();
    }
  }, [open, selectedMonth, selectedYear, familyId]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedMonth) params.month = parseInt(selectedMonth);
      if (selectedYear) params.year = parseInt(selectedYear);

      const response = await axios.get(`${API}/families/${familyId}/events-calendar`, { params });
      setEvents(response.data);
    } catch (error) {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const loadCustomEvents = async () => {
    try {
      const params = {};
      if (selectedMonth) params.month = parseInt(selectedMonth);
      if (selectedYear) params.year = parseInt(selectedYear);

      const response = await axios.get(`${API}/families/${familyId}/events`, { params });
      setCustomEvents(response.data);
    } catch (error) {
      console.error('Failed to load custom events');
    }
  };

  const handleAddCustomEvent = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/families/${familyId}/events`, newEvent);
      toast.success('Event added successfully!');
      setShowAddEventDialog(false);
      setNewEvent({ event_name: '', event_date: '', member_id: '' });
      loadEvents();
      loadCustomEvents();
    } catch (error) {
      toast.error('Failed to add event');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      await axios.delete(`${API}/families/${familyId}/events/${eventId}`);
      toast.success('Event deleted successfully');
      loadEvents();
      loadCustomEvents();
    } catch (error) {
      toast.error('Failed to delete event');
    }
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'birthday':
        return <Cake size={18} style={{ color: '#C86B53' }} />;
      case 'anniversary':
        return <Heart size={18} style={{ color: '#C86B53' }} />;
      case 'custom':
        return <CalendarIcon size={18} style={{ color: '#2C4F42' }} />;
      default:
        return <CalendarIcon size={18} style={{ color: '#2C4F42' }} />;
    }
  };

  const groupedEvents = events.reduce((acc, event) => {
    const date = event.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(event);
    return acc;
  }, {});

  return (
    <>
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto custom-scroll">
          <SheetHeader>
            <SheetTitle className="font-serif text-2xl flex items-center gap-2" style={{ fontFamily: 'Playfair Display', color: '#2C4F42' }}>
              <CalendarIcon size={24} />
              Events Calendar
            </SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* Filters */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-mono uppercase tracking-widest" style={{ color: '#78716C' }}>
                    Month
                  </Label>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger data-testid="month-select">
                      <SelectValue placeholder="All Months" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Months</SelectItem>
                      {months.map((m) => (
                        <SelectItem key={m.value} value={m.value}>
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-mono uppercase tracking-widest" style={{ color: '#78716C' }}>
                    Year
                  </Label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger data-testid="year-select">
                      <SelectValue placeholder="All Years" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Years</SelectItem>
                      {years.map((y) => (
                        <SelectItem key={y} value={y.toString()}>
                          {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                data-testid="add-event-button"
                onClick={() => setShowAddEventDialog(true)}
                className="w-full rounded-full font-serif italic"
                style={{ backgroundColor: '#C86B53', color: 'white' }}
              >
                <Plus size={16} className="mr-2" />
                Add Custom Event
              </Button>
            </div>

            {/* Events List */}
            {loading ? (
              <div className="text-center py-8">
                <p style={{ color: '#78716C' }}>Loading events...</p>
              </div>
            ) : Object.keys(groupedEvents).length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon size={48} style={{ color: '#C86B53', margin: '0 auto', marginBottom: '1rem' }} />
                <p style={{ color: '#78716C' }}>No events for this period</p>
              </div>
            ) : (
              <div data-testid="events-list" className="space-y-4">
                {Object.keys(groupedEvents)
                  .sort()
                  .map((date) => (
                    <div key={date}>
                      <h3 className="text-sm font-mono uppercase tracking-widest mb-2" style={{ color: '#78716C' }}>
                        {new Date(date).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </h3>
                      <div className="space-y-2">
                        {groupedEvents[date].map((event, index) => (
                          <div
                            key={index}
                            className="bg-white/50 backdrop-blur-sm border border-white/40 rounded-xl p-3"
                            style={{
                              boxShadow: '0 4px 6px -1px rgba(44, 79, 66, 0.05)',
                            }}
                          >
                            <div className="flex items-start gap-3">
                              {getEventIcon(event.type)}
                              <div className="flex-1">
                                <h4 className="font-serif font-medium" style={{ color: '#2C4F42' }}>
                                  {event.title}
                                </h4>
                                <p className="text-xs capitalize" style={{ color: '#78716C' }}>
                                  {event.type}
                                </p>
                              </div>
                              {event.type === 'custom' && event.event_id && (
                                <button
                                  onClick={() => handleDeleteEvent(event.event_id)}
                                  className="p-1 rounded-full"
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
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Add Custom Event Dialog */}
      <Dialog open={showAddEventDialog} onOpenChange={setShowAddEventDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl" style={{ fontFamily: 'Playfair Display', color: '#2C4F42' }}>
              Add Custom Event
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddCustomEvent} className="space-y-4">
            <div>
              <Label htmlFor="event-name" className="text-xs font-mono uppercase tracking-widest" style={{ color: '#78716C' }}>
                Event Name *
              </Label>
              <Input
                id="event-name"
                data-testid="event-name-input"
                value={newEvent.event_name}
                onChange={(e) => setNewEvent({ ...newEvent, event_name: e.target.value })}
                className="font-serif text-lg"
                placeholder="e.g., Family Reunion"
                required
              />
            </div>
            <div>
              <Label htmlFor="event-date" className="text-xs font-mono uppercase tracking-widest" style={{ color: '#78716C' }}>
                Event Date *
              </Label>
              <Input
                id="event-date"
                data-testid="event-date-input"
                type="date"
                value={newEvent.event_date}
                onChange={(e) => setNewEvent({ ...newEvent, event_date: e.target.value })}
                className="font-serif text-lg"
                required
              />
            </div>
            <div>
              <Label htmlFor="event-member" className="text-xs font-mono uppercase tracking-widest" style={{ color: '#78716C' }}>
                Related Member (Optional)
              </Label>
              <Select value={newEvent.member_id} onValueChange={(value) => setNewEvent({ ...newEvent, member_id: value })}>
                <SelectTrigger data-testid="event-member-select">
                  <SelectValue placeholder="Select member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.first_name} {m.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              data-testid="submit-event-button"
              type="submit"
              className="w-full rounded-full py-3 font-serif italic"
              style={{ backgroundColor: '#2C4F42', color: '#F5F2EB' }}
            >
              Add Event
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EventsCalendar;
