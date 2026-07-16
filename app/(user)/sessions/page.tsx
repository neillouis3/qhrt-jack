'use client';

import { useState, useEffect, useCallback } from 'react';
import Modal from '@/components/Modal';
import ConversationView from '@/components/conversation/ConversationView';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface KnowledgeModel {
  id: string;
  name: string;
  description: string | null;
  version: string;
}

interface UserConversation {
  id: string;
  knowledge_model_id: string;
  knowledge_model_name: string;
  status: string;
  started_at: string;
  completed_at: string | null;
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function Sessions() {
  const [knowledgeModels, setKnowledgeModels] = useState<KnowledgeModel[]>([]);
  const [conversations, setConversations] = useState<UserConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [startingModelId, setStartingModelId] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  // Fetch available Knowledge Models and existing conversations
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [modelsRes, convsRes] = await Promise.all([
        fetch('/api/conversation/models'),
        fetch('/api/conversation/sessions'),
      ]);

      if (!modelsRes.ok || !convsRes.ok) {
        throw new Error('Failed to load session data');
      }

      const modelsData = await modelsRes.json();
      const convsData = await convsRes.json();

      setKnowledgeModels(modelsData.knowledge_models ?? []);
      setConversations(convsData.conversations ?? []);
    } catch (err) {
      console.error('[Sessions] Failed to fetch data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Start a new conversation
  const handleStartConversation = async (modelId: string) => {
    setStarting(true);
    setError(null);

    try {
      const res = await fetch(`/api/conversation/start/${modelId}`, {
        method: 'POST',
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? 'Failed to start conversation');
      }

      const data = await res.json();
      setStartingModelId(null);
      setActiveConversationId(data.conversation_id);

      // Refresh conversations list
      fetchData();
    } catch (err) {
      console.error('[Sessions] Failed to start conversation:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setStartingModelId(null);
    } finally {
      setStarting(false);
    }
  };

  // Resume an existing conversation
  const handleResumeConversation = (conversationId: string) => {
    setActiveConversationId(conversationId);
  };

  // Close modal and refresh
  const handleCloseModal = () => {
    setActiveConversationId(null);
    fetchData();
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (loading) {
    return (
      <div className="flex flex-col flex-1 p-8">
        <main className="flex flex-1 flex-col items-center justify-center gap-4">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
          <p className="text-sm text-muted dark:text-gray-400">Loading sessions...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 p-8">
      <main className="flex flex-1 flex-col gap-8">
        <h1 className="text-2xl font-semibold text-foreground dark:text-white">Sessions</h1>

        {/* Error banner */}
        {error && (
          <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Available Knowledge Models */}
        <section>
          <h2 className="text-lg font-medium text-foreground mb-4 dark:text-white">
            Available Assessments
          </h2>

          {knowledgeModels.length === 0 ? (
            <div className="rounded-xl border border-border bg-background p-8 text-center dark:bg-navy">
              <p className="text-muted dark:text-gray-400">No assessments available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {knowledgeModels.map((model) => (
                <button
                  key={model.id}
                  onClick={() => setStartingModelId(model.id)}
                  disabled={starting}
                  className="flex flex-col items-start text-left rounded-xl border border-border bg-background p-5 dark:bg-navy hover:border-primary/30 transition-colors disabled:opacity-50"
                >
                  <h3 className="font-medium text-foreground dark:text-white mb-1">{model.name}</h3>
                  {model.description && (
                    <p className="text-sm text-muted dark:text-gray-400 line-clamp-2">
                      {model.description}
                    </p>
                  )}
                  <span className="mt-3 text-xs text-muted dark:text-gray-500">
                    v{model.version}
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Conversation History */}
        <section>
          <h2 className="text-lg font-medium text-foreground mb-4 dark:text-white">
            Your Conversations
          </h2>

          {conversations.length === 0 ? (
            <div className="rounded-xl border border-border bg-background p-8 text-center dark:bg-navy">
              <p className="text-muted dark:text-gray-400">
                You haven&apos;t started any conversations yet.
              </p>
              <p className="text-sm text-muted dark:text-gray-500 mt-1">
                Select an assessment above to begin.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className="flex items-center justify-between rounded-xl border border-border bg-background p-4 dark:bg-navy"
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-sm text-foreground dark:text-white">
                      {conv.knowledge_model_name}
                    </span>
                    <span className="text-xs text-muted dark:text-gray-400">
                      Started {new Date(conv.started_at).toLocaleDateString()} at{' '}
                      {new Date(conv.started_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Status badge */}
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        conv.status === 'completed'
                          ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                          : conv.status === 'active'
                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                            : 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                      }`}
                    >
                      {conv.status === 'completed'
                        ? 'Completed'
                        : conv.status === 'active'
                          ? 'In Progress'
                          : 'Paused'}
                    </span>

                    {/* Resume button for non-completed conversations */}
                    {conv.status !== 'completed' && (
                      <button
                        onClick={() => handleResumeConversation(conv.id)}
                        className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary-dark transition-colors"
                      >
                        Resume
                      </button>
                    )}

                    {/* View button for completed conversations */}
                    {conv.status === 'completed' && (
                      <button
                        onClick={() => handleResumeConversation(conv.id)}
                        className="px-3 py-1.5 border border-border rounded-lg text-xs font-medium text-muted hover:text-foreground hover:bg-muted/5 transition-colors dark:border-gray-700 dark:hover:bg-navy-light/10"
                      >
                        View
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Confirmation Modal for starting new conversation */}
      <Modal
        isOpen={startingModelId !== null}
        onClose={() => !starting && setStartingModelId(null)}
        title="Start Assessment"
        size="md"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted dark:text-gray-400">
            Are you sure you want to start a new assessment? You can pause and resume at any time.
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setStartingModelId(null)}
              disabled={starting}
              className="px-4 py-2 border border-border rounded-lg text-sm text-muted hover:text-foreground hover:bg-muted/5 transition-colors disabled:opacity-50 dark:border-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={() => startingModelId && handleStartConversation(startingModelId)}
              disabled={starting}
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {starting ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
                  Starting...
                </span>
              ) : (
                'Start'
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Conversation Modal */}
      <Modal
        isOpen={activeConversationId !== null}
        onClose={handleCloseModal}
        title="Assessment"
        size="xl"
      >
        {activeConversationId && (
          <ConversationView
            conversationId={activeConversationId}
            onClose={handleCloseModal}
            onComplete={handleCloseModal}
          />
        )}
      </Modal>
    </div>
  );
}
