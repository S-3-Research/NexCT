'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DemoPasswordModal from '@/components/DemoPasswordModal';
import { isDemoUnlockedClient } from '@/lib/demoAuth';

export default function NurseMatchLayout({ children }: { children: ReactNode }) {
  const [isUnlocked, setIsUnlocked] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkUnlocked = () => {
      const unlocked = isDemoUnlockedClient('nurse-match');
      setIsUnlocked(unlocked);
    };
    
    checkUnlocked();
  }, []);

  const handleSuccess = () => {
    setIsUnlocked(true);
  };

  const handleCancel = () => {
    router.push('/');
  };

  if (isUnlocked === null) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (isUnlocked === false) {
    return (
      <DemoPasswordModal
        demoId="nurse-match"
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    );
  }

  return <>{children}</>;
}
