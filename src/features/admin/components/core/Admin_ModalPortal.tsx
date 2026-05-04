"use client";

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface Admin_ModalPortalProps {
  children: React.ReactNode;
}

export const Admin_ModalPortal: React.FC<Admin_ModalPortalProps> = ({ children }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  return createPortal(children, document.body);
};
