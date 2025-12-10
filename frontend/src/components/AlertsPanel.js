import React, { useState } from 'react';
import axios from 'axios';
import { API } from '../App';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import { Button } from './ui/button';
import { Bell, Cake, Heart, Calendar as CalendarIcon, Mail, Users } from 'lucide-react';

const AlertsPanel = ({ open, onClose, familyId, alerts }) => {
  const [sending, setSending] = useState(false);

  const handleSendAlerts = async () => {
    setSending(true);
    try {
      const response = await axios.post(`${API}/families/${familyId}/send-alerts`);
      toast.success(response.data.message);
    } catch (error) {
      if (error.response?.status === 400) {
        toast.error('No family members have email addresses. Please add emails to members.');
      } else {
        toast.error('Failed to send alert emails');
      }
    } finally {
      setSending(false);
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'birthday':
        return <Cake size={20} style={{ color: '#C86B53' }} />;
      case 'anniversary':
        return <Heart size={20} style={{ color: '#C86B53' }} />;
      case 'custom':
        return <CalendarIcon size={20} style={{ color: '#C86B53' }} />;
      default:
        return <Bell size={20} style={{ color: '#C86B53' }} />;
    }
  };

  const upcomingAlerts = alerts.filter((a) => a.days_until <= 7);
  const laterAlerts = alerts.filter((a) => a.days_until > 7);

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto custom-scroll">
        <SheetHeader>
          <SheetTitle className="font-serif text-2xl flex items-center gap-2" style={{ fontFamily: 'Playfair Display', color: '#2C4F42' }}>
            <Bell size={24} />
            Upcoming Events
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Email Notification */}
          <div
            className="bg-white/50 backdrop-blur-sm border border-white/40 rounded-xl p-4"
            style={{
              boxShadow: '0 4px 6px -1px rgba(44, 79, 66, 0.05)',
            }}
          >
            <div className="flex items-start gap-3 mb-3">
              <Users size={20} style={{ color: '#2C4F42' }} />
              <div className="flex-1">
                <h3 className="font-serif font-medium text-sm" style={{ color: '#2C4F42' }}>
                  Send to All Family Members
                </h3>
                <p className="text-xs mt-1" style={{ color: '#78716C' }}>
                  Emails will be sent to all family members who have added their email addresses
                </p>
              </div>
            </div>
            <Button
              data-testid="send-alerts-button"
              onClick={handleSendAlerts}
              disabled={sending}
              className="w-full flex items-center justify-center gap-2 rounded-full"
              style={{ backgroundColor: '#2C4F42', color: '#F5F2EB' }}
            >
              <Mail size={16} />
              {sending ? 'Sending...' : 'Send Alert Emails'}
            </Button>
            <p className="text-xs mt-2" style={{ color: '#78716C' }}>
              Notifications for events happening tomorrow (1 day before)
            </p>
          </div>

          {/* Upcoming Alerts (Next 7 Days) */}
          {upcomingAlerts.length > 0 && (
            <div>
              <h3 className="text-lg font-serif font-medium mb-3" style={{ fontFamily: 'Playfair Display', color: '#2C4F42' }}>
                This Week
              </h3>
              <div data-testid="upcoming-alerts" className="space-y-3">
                {upcomingAlerts.map((alert, index) => (
                  <div
                    key={index}
                    data-testid={`alert-item-${index}`}
                    className="bg-white/50 backdrop-blur-sm border rounded-xl p-4"
                    style={{
                      borderColor: alert.days_until === 0 ? '#D4FF33' : '#D6D3C9',
                      boxShadow: '0 4px 6px -1px rgba(44, 79, 66, 0.05)',
                    }}
                  >
                    <div className="flex items-start gap-3">
                      {getAlertIcon(alert.type)}
                      <div className="flex-1">
                        <h4 className="font-serif font-medium" style={{ color: '#2C4F42' }}>
                          {alert.title}
                        </h4>
                        <p className="text-sm mt-1" style={{ color: '#78716C' }}>
                          {new Date(alert.date).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                        <p className="text-xs mt-1 font-semibold" style={{ color: alert.days_until === 0 ? '#D4FF33' : '#C86B53' }}>
                          {alert.days_until === 0 ? 'Today!' : alert.days_until === 1 ? 'Tomorrow' : `In ${alert.days_until} days`}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Later Alerts */}
          {laterAlerts.length > 0 && (
            <div>
              <h3 className="text-lg font-serif font-medium mb-3" style={{ fontFamily: 'Playfair Display', color: '#2C4F42' }}>
                Coming Up
              </h3>
              <div className="space-y-3">
                {laterAlerts.map((alert, index) => (
                  <div
                    key={index}
                    className="bg-white/50 backdrop-blur-sm border border-white/40 rounded-xl p-4"
                    style={{
                      boxShadow: '0 4px 6px -1px rgba(44, 79, 66, 0.05)',
                    }}
                  >
                    <div className="flex items-start gap-3">
                      {getAlertIcon(alert.type)}
                      <div className="flex-1">
                        <h4 className="font-serif font-medium" style={{ color: '#2C4F42' }}>
                          {alert.title}
                        </h4>
                        <p className="text-sm mt-1" style={{ color: '#78716C' }}>
                          {new Date(alert.date).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                        <p className="text-xs mt-1" style={{ color: '#78716C' }}>
                          In {alert.days_until} days
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Alerts */}
          {alerts.length === 0 && (
            <div className="text-center py-8">
              <Bell size={48} style={{ color: '#C86B53', margin: '0 auto', marginBottom: '1rem' }} />
              <p className="text-lg" style={{ color: '#78716C' }}>No upcoming events</p>
              <p className="text-sm mt-2" style={{ color: '#78716C' }}>Add birthdays, anniversaries, or custom events to see alerts</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AlertsPanel;
