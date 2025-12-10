import React from 'react';
import { Pencil, Trash2, User, Cake, Heart, MapPin } from 'lucide-react';

const CardsView = ({ members, onEdit, onDelete }) => {
  return (
    <div data-testid="cards-view" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {members.map((member, index) => (
        <div
          key={member.id}
          data-testid={`member-card-${index}`}
          className="bg-white/50 backdrop-blur-sm border border-white/40 rounded-xl p-6 relative group hover-lift"
          style={{
            boxShadow: '0 4px 6px -1px rgba(44, 79, 66, 0.05), 0 2px 4px -1px rgba(44, 79, 66, 0.03)',
            animationDelay: `${index * 0.05}s`,
          }}
        >
          {/* Photo */}
          <div className="flex flex-col items-center mb-4">
            <div
              className="w-24 h-24 rounded-full overflow-hidden flex-shrink-0"
              style={{
                backgroundColor: '#E6E1D6',
                border: '3px solid #2C4F42',
              }}
            >
              {member.photo_base64 ? (
                <img
                  src={member.photo_base64}
                  alt={`${member.first_name} ${member.last_name}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ color: '#2C4F42' }}>
                  <User size={48} />
                </div>
              )}
            </div>
          </div>

          {/* Name */}
          <h3 className="text-xl font-serif font-medium text-center mb-2" style={{ fontFamily: 'Playfair Display', color: '#2C4F42' }}>
            {member.first_name} {member.last_name}
          </h3>

          {/* Address */}
          {member.address && (
            <div className="flex items-center gap-2 justify-center mb-3" style={{ color: '#78716C' }}>
              <MapPin size={14} />
              <p className="text-sm">{member.address}</p>
            </div>
          )}

          {/* Events */}
          <div className="space-y-2 mb-4">
            {member.birthday && (
              <div className="flex items-center justify-center gap-2" style={{ color: '#C86B53' }}>
                <Cake size={16} />
                <span className="text-sm">
                  Birthday: {new Date(member.birthday).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            )}
            {member.anniversary && (
              <div className="flex items-center justify-center gap-2" style={{ color: '#C86B53' }}>
                <Heart size={16} />
                <span className="text-sm">
                  Anniversary: {new Date(member.anniversary).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            )}
          </div>

          {/* Comments */}
          {member.comments && (
            <p className="text-sm text-center line-clamp-3 mb-4" style={{ color: '#78716C' }}>
              {member.comments}
            </p>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 mt-4">
            <button
              data-testid={`edit-card-member-${index}`}
              onClick={() => onEdit(member)}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-full text-sm font-sans"
              style={{
                backgroundColor: 'rgba(44, 79, 66, 0.1)',
                color: '#2C4F42',
                transition: 'background-color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(44, 79, 66, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(44, 79, 66, 0.1)';
              }}
            >
              <Pencil size={14} />
              Edit
            </button>
            <button
              data-testid={`delete-card-member-${index}`}
              onClick={() => onDelete(member.id)}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-full text-sm font-sans"
              style={{
                backgroundColor: 'rgba(200, 107, 83, 0.1)',
                color: '#C86B53',
                transition: 'background-color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(200, 107, 83, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(200, 107, 83, 0.1)';
              }}
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CardsView;
