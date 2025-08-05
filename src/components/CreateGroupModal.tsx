import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

interface CreateGroupModalProps {
  onClose: () => void;
  onCreate: (name: string, description: string, members: string[]) => void;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [members, setMembers] = useState<string>(''); // Comma-separated user IDs for simplicity

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const memberList = members.split(',').map(m => m.trim()).filter(Boolean);
    onCreate(name, description, memberList);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">Create Group</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Group Name</label>
            <input className="w-full border rounded px-3 py-2" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Description</label>
            <input className="w-full border rounded px-3 py-2" value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Member User IDs (comma separated)</label>
            <input className="w-full border rounded px-3 py-2" value={members} onChange={e => setMembers(e.target.value)} placeholder="e.g. userId1, userId2" />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Create</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal; 