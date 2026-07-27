import { useEffect, useState } from 'react';
import { api } from '@/api/client';
import { Button, Card, LoadingState, PageHeader } from '@/components/ui';
import { usePageTitle } from '@/hooks/usePageTitle';
import styles from './RequestsPage.module.css';

interface RequestItem {
  id: string;
  server: string;
  title: string;
  requested_by: string;
  urgency: 'Whenever' | 'Soon' | 'Urgent';
  description: string;
  created_at: string;
  completed?: boolean;
  archived?: boolean;
}

interface CreateRequestForm {
  server: string;
  title: string;
  requested_by: string;
  urgency: RequestItem['urgency'];
  description: string;
}

const EMPTY_FORM: CreateRequestForm = {
  server: 'valheim-main',
  title: '',
  requested_by: '',
  urgency: 'Whenever',
  description: '',
};

const FALLBACK_REQUESTS: RequestItem[] = [
  {
    id: 'sample-1',
    server: 'valheim-main',
    title: 'Weekend raid night',
    requested_by: 'Alex',
    urgency: 'Soon',
    description: 'We should host a shared raid night this weekend and rotate who leads the event.',
    created_at: '2026-07-27T18:00:00Z',
    completed: false,
  },
  {
    id: 'sample-2',
    server: 'valheim-main',
    title: 'More server upkeep',
    requested_by: 'Maya',
    urgency: 'Whenever',
    description: 'A few quality-of-life upgrades would make the server feel more welcoming for new players.',
    created_at: '2026-07-27T17:30:00Z',
    completed: true,
  },
];

export default function RequestsPage() {
  usePageTitle('Requests');
  const [requests, setRequests] = useState<RequestItem[]>(FALLBACK_REQUESTS);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState<CreateRequestForm>(EMPTY_FORM);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadRequests() {
      setLoading(true);

      const response = await api.get<RequestItem[] | { requests?: RequestItem[]; items?: RequestItem[]; data?: RequestItem[] }>('/requests');

      if (cancelled) {
        return;
      }

      if (response.success) {
        const payload = response.data;
        const list = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.requests)
            ? payload.requests
            : Array.isArray(payload?.items)
              ? payload.items
              : Array.isArray(payload?.data)
                ? payload.data
                : [];

        setRequests(list.length ? list : FALLBACK_REQUESTS);
      } else {
        setRequests(FALLBACK_REQUESTS);
      }

      setLoading(false);
    }

    loadRequests();

    return () => {
      cancelled = true;
    };
  }, []);

  function handleCreateRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const title = form.title.trim();
    const requestedBy = form.requested_by.trim();
    const description = form.description.trim();

    if (!title || !requestedBy || !description) {
      setFeedback('Please fill in the title, requested by, and description fields.');
      return;
    }

    const newRequest: RequestItem = {
      id: `local-${Date.now()}`,
      server: form.server,
      title,
      requested_by: requestedBy,
      urgency: form.urgency,
      description,
      created_at: new Date().toISOString(),
      completed: false,
    };

    setRequests((current) => [newRequest, ...current]);
    setForm(EMPTY_FORM);
    setFeedback('Your request has been added to the board.');
    setShowCreateModal(false);
  }

  async function toggleCompletion(request: RequestItem) {
    const nextCompleted = !request.completed;

    const response = await api.put<{ success: true; data: RequestItem }>(`/requests/${request.id}`, {
      completed: nextCompleted,
    });

    if (response.success) {
      setRequests((current) => current.map((item) => (item.id === request.id ? { ...item, completed: response.data.data?.completed ?? nextCompleted } : item)));
      setFeedback(nextCompleted ? 'Request marked as complete.' : 'Request marked as incomplete.');
    } else {
      setFeedback(response.error.message);
    }
  }

  return (
    <div className={styles.root}>
      <PageHeader
        title="Requests"
        subtitle="Help the community by completing requests from other players."
      />

      <div className={styles.notice}>
        <strong>Privacy Reminder:</strong> This website is publicly accessible. Please do not include real names, addresses, passwords, or other sensitive personal information in your requests.
      </div>

      <div className={styles.toolbar}>
        <Button onClick={() => setShowCreateModal(true)}>Create Request</Button>
      </div>

      {feedback && <p className={styles.feedback}>{feedback}</p>}

      {loading ? (
        <LoadingState message="Loading requests…" />
      ) : requests.length === 0 ? (
        <Card className={styles.emptyCard}>
          <h2 className={styles.emptyTitle}>Nothing has been requested yet.</h2>
          <p className={styles.emptyText}>Be the first to ask the community for help.</p>
          <Button onClick={() => setShowCreateModal(true)}>Create the first request</Button>
        </Card>
      ) : (
        <div className={styles.list}>
          {requests.map((request) => (
            <Card key={request.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <h2 className={styles.title}>{request.title}</h2>
                  <p className={styles.meta}>Requested by {request.requested_by}</p>
                </div>
                <div className={styles.badges}>
                  <span className={styles.serverBadge}>{request.server}</span>
                  <span className={styles.urgencyBadge}>{request.urgency}</span>
                </div>
              </div>
              <p className={styles.description}>{request.description}</p>
              <div className={styles.footer}>
                <p className={styles.timestamp}>{request.created_at}</p>
                <Button
                  type="button"
                  variant={request.completed ? 'secondary' : 'primary'}
                  size="sm"
                  onClick={() => toggleCompletion(request)}
                >
                  {request.completed ? 'Mark Incomplete' : 'Mark Complete'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showCreateModal && (
        <div className={styles.overlay} role="presentation" onClick={() => setShowCreateModal(false)}>
          <div className={styles.modal} role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Create Request</h2>
              <button className={styles.closeButton} type="button" onClick={() => setShowCreateModal(false)} aria-label="Close request form">
                ×
              </button>
            </div>

            <form className={styles.form} onSubmit={handleCreateRequest}>
              <label className={styles.field}>
                <span>Server</span>
                <input
                  value={form.server}
                  onChange={(event) => setForm((current) => ({ ...current, server: event.target.value }))}
                  placeholder="valheim-main"
                />
              </label>

              <label className={styles.field}>
                <span>Title</span>
                <input
                  value={form.title}
                  onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                  placeholder="Need help with a build project"
                />
              </label>

              <label className={styles.field}>
                <span>Requested By</span>
                <input
                  value={form.requested_by}
                  onChange={(event) => setForm((current) => ({ ...current, requested_by: event.target.value }))}
                  placeholder="Your name or handle"
                />
              </label>

              <label className={styles.field}>
                <span>Urgency</span>
                <select
                  value={form.urgency}
                  onChange={(event) => setForm((current) => ({ ...current, urgency: event.target.value as RequestItem['urgency'] }))}
                >
                  <option value="Whenever">Whenever</option>
                  <option value="Soon">Soon</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </label>

              <label className={styles.field}>
                <span>Description</span>
                <textarea
                  rows={6}
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  placeholder="Describe what you need help with."
                />
              </label>

              <div className={styles.modalActions}>
                <Button type="button" variant="ghost" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                <Button type="submit">Create Request</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}