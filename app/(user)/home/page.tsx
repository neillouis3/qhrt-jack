'use client';

import { useState, useEffect } from 'react';
import IntakeForm from '@/components/IntakeForm';
import Dashboard from '@/components/Dashboard';
import Modal from '@/components/Modal';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showIntake, setShowIntake] = useState(false);
  const [intakeComplete, setIntakeComplete] = useState(false);

  useEffect(() => {
    // Fetch session from API
    const fetchSession = async () => {
      try {
        const res = await fetch('/api/auth/session');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);

          if (data.intakeCompleted) {
            setIntakeComplete(true);
            setShowIntake(false);
          } else {
            setShowIntake(true);
          }
        } else {
          setShowIntake(true);
        }
      } catch (err) {
        console.log('[fetchSession] Error:', err);
        setShowIntake(true);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, []);

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
      <Dashboard userName={user?.email} onIntakeComplete={intakeComplete} />

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
