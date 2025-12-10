import React from 'react';
import { Pencil, Trash2, User, Cake, Heart } from 'lucide-react';

const TreeView = ({ members, onEdit, onDelete }) => {
  // Build tree structure with both parents support
  const buildTree = () => {
    const memberMap = {};
    members.forEach((member) => {
      memberMap[member.id] = { ...member, children: [] };
    });

    const roots = [];
    const addedToParent = new Set();

    members.forEach((member) => {
      // Add to father's children if father exists
      if (member.father_id && memberMap[member.father_id]) {
        if (!addedToParent.has(member.id)) {
          memberMap[member.father_id].children.push(memberMap[member.id]);
          addedToParent.add(member.id);
        }
      }
      // Add to mother's children if mother exists and not already added
      else if (member.mother_id && memberMap[member.mother_id]) {
        if (!addedToParent.has(member.id)) {
          memberMap[member.mother_id].children.push(memberMap[member.id]);
          addedToParent.add(member.id);
        }
      }
      // If no parents, add to roots
      else if (!member.father_id && !member.mother_id) {
        roots.push(memberMap[member.id]);
      }
    });

    return roots;
  };

  const TreeNode = ({ node, level = 0 }) => {
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div className="flex flex-col items-center" style={{ marginTop: level > 0 ? '2rem' : '0' }}>
        {/* Connector line from parent */}
        {level > 0 && (
          <div
            className="w-0.5"
            style={{
              height: '2rem',
              backgroundColor: '#2C4F42',
            }}
          />
        )}

        {/* Member Card */}
        <div
          data-testid={`tree-member-${node.id}`}
          className="bg-white/50 backdrop-blur-sm border border-white/40 rounded-xl p-4 relative group hover-lift"
          style={{
            boxShadow: '0 4px 6px -1px rgba(44, 79, 66, 0.05), 0 2px 4px -1px rgba(44, 79, 66, 0.03)',
            minWidth: '280px',
            maxWidth: '320px',
          }}
        >
          <div className="flex items-start gap-4">
            {/* Photo */}
            <div
              className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0"
              style={{
                backgroundColor: '#E6E1D6',
                border: '2px solid #2C4F42',
              }}
            >
              {node.photo_base64 ? (
                <img
                  src={node.photo_base64}
                  alt={`${node.first_name} ${node.last_name}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ color: '#2C4F42' }}>
                  <User size={32} />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-serif font-medium truncate" style={{ fontFamily: 'Playfair Display', color: '#2C4F42' }}>
                {node.first_name} {node.last_name}
              </h3>
              {node.address && (
                <p className="text-xs truncate" style={{ color: '#78716C' }}>
                  {node.address}
                </p>
              )}

              {/* Events */}
              <div className="flex items-center gap-3 mt-2">
                {node.birthday && (
                  <div className="flex items-center gap-1" style={{ color: '#C86B53' }}>
                    <Cake size={12} />
                    <span className="text-xs">{new Date(node.birthday).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                )}
                {node.anniversary && (
                  <div className="flex items-center gap-1" style={{ color: '#C86B53' }}>
                    <Heart size={12} />
                    <span className="text-xs">{new Date(node.anniversary).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Comments */}
          {node.comments && (
            <p className="text-xs mt-3 line-clamp-2" style={{ color: '#78716C' }}>
              {node.comments}
            </p>
          )}

          {/* Action buttons */}
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              data-testid={`edit-member-${node.id}`}
              onClick={() => onEdit(node)}
              className="p-1.5 rounded-full"
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
            </button>
            <button
              data-testid={`delete-member-${node.id}`}
              onClick={() => onDelete(node.id)}
              className="p-1.5 rounded-full"
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
            </button>
          </div>
        </div>

        {/* Children */}
        {hasChildren && (
          <div className="flex flex-col items-center">
            {/* Connector line to children */}
            <div
              className="w-0.5"
              style={{
                height: '2rem',
                backgroundColor: '#2C4F42',
              }}
            />

            {/* Horizontal line for multiple children */}
            {node.children.length > 1 && (
              <div
                className="h-0.5 relative"
                style={{
                  width: `${(node.children.length - 1) * 360}px`,
                  backgroundColor: '#2C4F42',
                }}
              >
                {/* Vertical connectors for each child */}
                {node.children.map((child, idx) => (
                  <div
                    key={child.id}
                    className="absolute w-0.5 h-8"
                    style={{
                      backgroundColor: '#2C4F42',
                      left: `${(idx / (node.children.length - 1)) * 100}%`,
                      top: '0',
                    }}
                  />
                ))}
              </div>
            )}

            {/* Children nodes */}
            <div className="flex gap-8 justify-center flex-wrap">
              {node.children.map((child) => (
                <TreeNode key={child.id} node={child} level={level + 1} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const treeRoots = buildTree();

  return (
    <div data-testid="tree-view" className="overflow-x-auto custom-scroll pb-8">
      <div className="inline-flex gap-8 min-w-full justify-center p-8">
        {treeRoots.map((root) => (
          <TreeNode key={root.id} node={root} />
        ))}
      </div>
    </div>
  );
};

export default TreeView;
