"use client";
import { Header } from './header';
import { useAuth } from '@/lib/store';

export function HeaderWithAuth() {
  const { isAuthenticated, user, logout } = useAuth();
  return <Header isAuthenticated={isAuthenticated} user={user || undefined} onLogout={logout} />;
}