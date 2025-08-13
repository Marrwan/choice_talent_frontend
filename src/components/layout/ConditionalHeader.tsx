"use client";
import { usePathname } from 'next/navigation';
import { HeaderWithAuth } from './HeaderWithAuth';

export function ConditionalHeader() {
  const pathname = usePathname();
  
  // Always render header on all pages
  return <HeaderWithAuth />;
  
  return <HeaderWithAuth />;
}
