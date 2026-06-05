'use client';

import { useState, useEffect } from 'react';
import IntakeForm from '@/components/IntakeForm';
import Dashboard from '@/components/Dashboard';
import Modal from '@/components/Modal';
import { useSession } from '@/hooks/useSession';

export default function Home() {
  // Use shared session hook - no redundant /api/auth/session fetch
  const { session, loading: sessionLoading } = useSession();
  const [showIntake, setShowIntake] = useState(false);
  const [intakeComplete, setIntakeComplete] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Once session is loaded, determine intake state
    if (sessionLoading) return;

    if (session?.intakeCompleted) {
      setIntakeComplete(true);
      setShowIntake(false);
    } else if (session) {
      setShowIntake(true);
    }

    setLoading(false);
  }, [session, sessionLoading]);

  const handleIntakeComplete = () => {
    setShowIntake(false);
    setIntakeComplete(true);
  };

  const handleIntakeCancel = () => {
    setShowIntake(false);
    setIntakeComplete(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <p className="text-muted">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 font-sans dark:bg-black">
      <Dashboard userName={session?.user?.email} onIntakeComplete={intakeComplete} />

      <Modal
        isOpen={showIntake}
        onClose={handleIntakeCancel}
        title="Welcome to QHRT — Let's get started"
      >
        <p className="text-sm text-muted mb-4">
          Before we begin, we'd like to understand a bit about you. This helps us tailor your
          experience. It takes about 3-4 minutes.
        </p>
        <IntakeForm onComplete={handleIntakeComplete} onCancel={handleIntakeCancel} />
      </Modal>
    </div>
  );
}
