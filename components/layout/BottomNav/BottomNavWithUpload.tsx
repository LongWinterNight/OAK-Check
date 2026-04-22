'use client';

import { useState } from 'react';
import { BottomNavLinks } from './BottomNavLinks';
import { UploadSheet } from '@/components/mobile/UploadSheet/UploadSheet';

interface Props {
  role: string;
}

export function BottomNavWithUpload({ role }: Props) {
  const [uploadOpen, setUploadOpen] = useState(false);

  return (
    <>
      <BottomNavLinks role={role} onUpload={() => setUploadOpen(true)} />
      <UploadSheet open={uploadOpen} onClose={() => setUploadOpen(false)} />
    </>
  );
}
