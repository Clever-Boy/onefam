import React, { useState } from 'react';
import { Pencil, Trash2, User, Cake, Heart, MapPin, ChevronRight, ArrowLeft, Users2 } from 'lucide-react';
import { Button } from './ui/button';

const CardsView = ({ members, onEdit, onDelete }) => {
  const [currentParentId, setCurrentParentId] = useState(null);
  const [navigationStack, setNavigationStack] = useState([]);

  // Build family tree structure
  const buildFamilyTree = () => {
    const memberMap = {};
    members.forEach((member) => {
      memberMap[member.id] = { ...member, children: [] };
    });

    const roots = [];
    members.forEach((member) => {
      const hasParent = member.father_id || member.mother_id;
      if (hasParent) {
        // Add to father's children if father exists
        if (member.father_id && memberMap[member.father_id]) {
          memberMap[member.father_id].children.push(memberMap[member.id]);
        }
        // Also add to mother's children if mother exists (and not already added via father)
        else if (member.mother_id && memberMap[member.mother_id]) {
          memberMap[member.mother_id].children.push(memberMap[member.id]);
        }
      } else {
        roots.push(memberMap[member.id]);
      }
    });

    return { roots, memberMap };
  };

  const { roots, memberMap } = buildFamilyTree();

  // Get current level members to display
  const getCurrentLevelMembers = () => {
    if (currentParentId === null) {
      // Show root level
      return roots;
    } else {
      // Show children of current parent
      return memberMap[currentParentId]?.children || [];
    }
  };

  const currentMembers = getCurrentLevelMembers();
  const currentParent = currentParentId ? memberMap[currentParentId] : null;

  // Navigate to children of a member
  const handleNavigateToChildren = (memberId) => {
    const member = memberMap[memberId];
    if (member && member.children.length > 0) {
      setNavigationStack([...navigationStack, currentParentId]);
      setCurrentParentId(memberId);
    }
  };

  // Navigate back to parent level
  const handleNavigateBack = () => {
    if (navigationStack.length > 0) {
      const newStack = [...navigationStack];
      const previousParent = newStack.pop();
      setNavigationStack(newStack);
      setCurrentParentId(previousParent);
    }
  };

  // Get member's parents names
  const getParentsInfo = (member) => {
    const parents = [];
    if (member.father_id && memberMap[member.father_id]) {
      const father = memberMap[member.father_id];
      parents.push(`${father.first_name} ${father.last_name}`);
    }
    if (member.mother_id && memberMap[member.mother_id]) {
      const mother = memberMap[member.mother_id];
      parents.push(`${mother.first_name} ${mother.last_name}`);
    }
    return parents;
  };

  return (
    <div data-testid="cards-view" className="space-y-6">
      {/* Navigation Header */}
      {(currentParent || navigationStack.length > 0) && (
        <div className="flex items-center gap-4 pb-4 border-b" style={{ borderColor: '#D6D3C9' }}>
          <Button
            data-testid="back-button"
            onClick={handleNavigateBack}
            variant="outline"
            className="flex items-center gap-2"
            style={{ borderColor: '#2C4F42', color: '#2C4F42' }}
          >
            <ArrowLeft size={16} />
            Back
          </Button>
          {currentParent && (
            <div>
              <p className="text-xs font-mono uppercase tracking-widest" style={{ color: '#78716C' }}>
                Viewing children of
              </p>
              <h3 className="text-xl font-serif font-medium" style={{ fontFamily: 'Playfair Display', color: '#2C4F42' }}>
                {currentParent.first_name} {currentParent.last_name}
              </h3>
            </div>
          )}
        </div>
      )}

      {/* Current Level Title */}
      {!currentParent && (
        <div className="pb-4 border-b" style={{ borderColor: '#D6D3C9' }}>
          <h3 className="text-xl font-serif font-medium flex items-center gap-2" style={{ fontFamily: 'Playfair Display', color: '#2C4F42' }}>
            <Users2 size={24} />
            Root Family Members
          </h3>
          <p className="text-sm mt-1" style={{ color: '#78716C' }}>
            Click on a member to view their children
          </p>
        </div>
      )}

      {/* Cards Grid */}
      {currentMembers.length === 0 ? (
        <div className="text-center py-12">
          <Users2 size={48} style={{ color: '#C86B53', margin: '0 auto', marginBottom: '1rem' }} />
          <p className="text-lg" style={{ color: '#78716C' }}>
            {currentParent ? 'No children found' : 'No family members yet'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {currentMembers.map((member, index) => {
            const hasChildren = member.children && member.children.length > 0;
            const parentsInfo = getParentsInfo(member);

            return (
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

                {/* Parents Info */}
                {parentsInfo.length > 0 && (
                  <div className="text-center mb-3 pb-3 border-b" style={{ borderColor: '#D6D3C9' }}>
                    <p className="text-xs font-mono uppercase tracking-widest" style={{ color: '#78716C' }}>
                      Parents
                    </p>
                    <p className="text-sm mt-1" style={{ color: '#2C4F42' }}>
                      {parentsInfo.join(' & ')}
                    </p>
                  </div>
                )}

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

                {/* Children indicator and navigation */}
                {hasChildren && (
                  <div className="mb-4">
                    <button
                      data-testid={`view-children-${index}`}
                      onClick={() => handleNavigateToChildren(member.id)}
                      className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-full text-sm font-sans"
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
                      <Users2 size={16} />
                      View Children ({member.children.length})
                      <ChevronRight size={16} />
                    </button>
                  </div>
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
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CardsView;
