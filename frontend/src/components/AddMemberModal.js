import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../App';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { Upload, User } from 'lucide-react';

const AddMemberModal = ({ open, onClose, familyId, member, members, onSuccess }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    address: '',
    birthday: '',
    anniversary: '',
    comments: '',
    parent_id: '',
    photo_base64: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (member) {
      setFormData({
        first_name: member.first_name || '',
        last_name: member.last_name || '',
        address: member.address || '',
        birthday: member.birthday || '',
        anniversary: member.anniversary || '',
        comments: member.comments || '',
        parent_id: member.parent_id || '',
        photo_base64: member.photo_base64 || '',
      });
    } else {
      setFormData({
        first_name: '',
        last_name: '',
        address: '',
        birthday: '',
        anniversary: '',
        comments: '',
        parent_id: '',
        photo_base64: '',
      });
    }
  }, [member, open]);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Photo size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photo_base64: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        parent_id: formData.parent_id === 'root' ? null : formData.parent_id || null,
      };

      if (member) {
        // Update existing member
        await axios.put(`${API}/families/${familyId}/members/${member.id}`, submitData);
        toast.success('Member updated successfully!');
      } else {
        // Create new member
        await axios.post(`${API}/families/${familyId}/members`, submitData);
        toast.success('Member added successfully!');
      }

      onSuccess();
      onClose();
    } catch (error) {
      toast.error(member ? 'Failed to update member' : 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  // Filter out current member from parent options when editing
  const availableParents = member
    ? members.filter((m) => m.id !== member.id)
    : members;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto custom-scroll">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl" style={{ fontFamily: 'Playfair Display', color: '#2C4F42' }}>
            {member ? 'Edit Family Member' : 'Add Family Member'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo Upload */}
          <div className="flex flex-col items-center">
            <div
              className="w-32 h-32 rounded-full overflow-hidden mb-4"
              style={{
                backgroundColor: '#E6E1D6',
                border: '3px solid #2C4F42',
              }}
            >
              {formData.photo_base64 ? (
                <img src={formData.photo_base64} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ color: '#2C4F42' }}>
                  <User size={64} />
                </div>
              )}
            </div>
            <label
              htmlFor="photo-upload"
              className="flex items-center gap-2 cursor-pointer px-4 py-2 rounded-full text-sm font-sans"
              style={{
                backgroundColor: 'rgba(44, 79, 66, 0.1)',
                color: '#2C4F42',
              }}
            >
              <Upload size={16} />
              Upload Photo
            </label>
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name" className="text-xs font-mono uppercase tracking-widest" style={{ color: '#78716C' }}>
                First Name *
              </Label>
              <Input
                id="first_name"
                data-testid="first-name-input"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="font-serif text-lg"
                required
              />
            </div>
            <div>
              <Label htmlFor="last_name" className="text-xs font-mono uppercase tracking-widest" style={{ color: '#78716C' }}>
                Last Name *
              </Label>
              <Input
                id="last_name"
                data-testid="last-name-input"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="font-serif text-lg"
                required
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <Label htmlFor="address" className="text-xs font-mono uppercase tracking-widest" style={{ color: '#78716C' }}>
              Address
            </Label>
            <Input
              id="address"
              data-testid="address-input"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="font-serif text-lg"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="birthday" className="text-xs font-mono uppercase tracking-widest" style={{ color: '#78716C' }}>
                Birthday
              </Label>
              <Input
                id="birthday"
                data-testid="birthday-input"
                type="date"
                value={formData.birthday}
                onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                className="font-serif text-lg"
              />
            </div>
            <div>
              <Label htmlFor="anniversary" className="text-xs font-mono uppercase tracking-widest" style={{ color: '#78716C' }}>
                Anniversary
              </Label>
              <Input
                id="anniversary"
                data-testid="anniversary-input"
                type="date"
                value={formData.anniversary}
                onChange={(e) => setFormData({ ...formData, anniversary: e.target.value })}
                className="font-serif text-lg"
              />
            </div>
          </div>

          {/* Parent Selection */}
          <div>
            <Label htmlFor="parent" className="text-xs font-mono uppercase tracking-widest" style={{ color: '#78716C' }}>
              Parent (Optional)
            </Label>
            <Select
              value={formData.parent_id}
              onValueChange={(value) => setFormData({ ...formData, parent_id: value })}
            >
              <SelectTrigger data-testid="parent-select" className="font-serif text-lg">
                <SelectValue placeholder="Select parent (root if none)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="root">Root (No Parent)</SelectItem>
                {availableParents.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.first_name} {m.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Comments */}
          <div>
            <Label htmlFor="comments" className="text-xs font-mono uppercase tracking-widest" style={{ color: '#78716C' }}>
              Comments
            </Label>
            <Textarea
              id="comments"
              data-testid="comments-input"
              value={formData.comments}
              onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
              className="font-serif text-lg"
              rows={3}
              placeholder="Add any notes or comments about this family member"
            />
          </div>

          {/* Submit Button */}
          <Button
            data-testid="submit-member-button"
            type="submit"
            disabled={loading}
            className="w-full rounded-full py-3 font-serif italic"
            style={{ backgroundColor: '#2C4F42', color: '#F5F2EB' }}
          >
            {loading ? 'Saving...' : member ? 'Update Member' : 'Add Member'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMemberModal;
