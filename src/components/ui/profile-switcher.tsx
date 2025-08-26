'use client';
import { useEffect, useState } from 'react';
import { profileService, Profile, ProfileType } from '@/services/profileService';
import { useAuth } from '@/lib/store';
import { Button } from '@/components/ui/button';

export function ProfileSwitcher() {
  const { refreshUser } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      const list = await profileService.list();
      setProfiles(list);
    } catch {}
  };

  useEffect(() => { load(); }, []);

  const switchTo = async (p: Profile) => {
    setLoading(true);
    try {
      await profileService.setActive(p.id);
      await refreshUser();
    } finally { setLoading(false); }
  };

  const create = async (type: ProfileType) => {
    setLoading(true);
    try {
      await profileService.create(type);
      await load();
    } finally { setLoading(false); }
  };

  return (
    <div className="flex items-center gap-2">
      {profiles.map(p => (
        <Button key={p.id} variant="outline" size="sm" onClick={() => switchTo(p)} disabled={loading}>
          {p.type}
        </Button>
      ))}
      {/* <div className="relative">
        <Button variant="ghost" size="sm" disabled={loading} onClick={() => create('professional')}>+ Pro</Button>
        <Button variant="ghost" size="sm" disabled={loading} onClick={() => create('recruiter')}>+ Rec</Button>
      </div> */}
    </div>
  );
}


