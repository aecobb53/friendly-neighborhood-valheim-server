import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
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

interface ServerSummary {
  name: string;
}

interface ServerGroup {
  servers: ServerSummary[];
}

interface ServerStatusResponse {
  games: ServerGroup[];
}

type ApiUrgency = 'URGENT' | 'SOON' | 'WHENEVER';

function createEmptyForm(server = ''): CreateRequestForm {
  return {
    server,
    title: '',
    requested_by: '',
    urgency: 'Whenever',
    description: '',
  };
}

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

function toApiUrgency(urgency: string): ApiUrgency {
  switch (urgency.toUpperCase()) {
    case 'URGENT':
      return 'URGENT';
    case 'SOON':
      return 'SOON';
    default:
      return 'WHENEVER';
  }
}

function toUiUrgency(urgency: unknown): RequestItem['urgency'] {
  if (typeof urgency !== 'string') {
    return 'Whenever';
  }

  switch (urgency.toUpperCase()) {
    case 'URGENT':
      return 'Urgent';
    case 'SOON':
      return 'Soon';
    default:
      return 'Whenever';
  }
}

function normalizeRequest(raw: Partial<RequestItem> & { urgency?: unknown }, fallback: RequestItem): RequestItem {
  return {
    ...fallback,
    ...raw,
    id: String(raw.id ?? fallback.id),
    server: String(raw.server ?? fallback.server),
    title: String(raw.title ?? fallback.title),
    requested_by: String(raw.requested_by ?? fallback.requested_by),
    description: String(raw.description ?? fallback.description),
    created_at: String(raw.created_at ?? fallback.created_at),
    urgency: toUiUrgency(raw.urgency ?? fallback.urgency),
    completed: raw.completed ?? fallback.completed,
    archived: raw.archived ?? fallback.archived,
  };
}

function LinkIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

export default function RequestsPage() {
  usePageTitle('Requests');
  const [searchParams, setSearchParams] = useSearchParams();
  const idFilter = searchParams.get('id');
  const [requests, setRequests] = useState<RequestItem[]>(FALLBACK_REQUESTS);
  const [availableServers, setAvailableServers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState<CreateRequestForm>(createEmptyForm());
  const [feedback, setFeedback] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  function copyLink(requestId: string) {
    const url = `${window.location.origin}/requests?id=${requestId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(requestId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }

  function openCreateModal() {
    const defaultServer = availableServers[0] ?? '';
    setForm((current) => ({
      ...current,
      server: current.server || defaultServer,
    }));
    setShowCreateModal(true);
  }

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

    async function loadAvailableServers() {
      const response = await api.get<ServerStatusResponse>('/server-status');

      if (cancelled || !response.success) {
        return;
      }

      const names = response.data.games
        .flatMap((group) => group.servers.map((server) => server.name))
        .filter((name): name is string => Boolean(name));
      const uniqueNames = Array.from(new Set(names));

        setAvailableServers(uniqueNames);
        if (uniqueNames.length > 0) {
          setForm((current) => ({
            ...current,
            server: uniqueNames.includes(current.server) ? current.server : uniqueNames[0],
          }));
        }
    }

    loadRequests();
    loadAvailableServers();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleCreateRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const title = form.title.trim();
    const requestedBy = form.requested_by.trim();
    const description = form.description.trim();

    if (!form.server || !title || !requestedBy || !description) {
      setFeedback('Please choose a server and fill in the title, requested by, and description fields.');
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
      archived: false,
    };

    const response = await api.post<{ data?: Partial<RequestItem> & { urgency?: unknown } } | (Partial<RequestItem> & { urgency?: unknown })>('/requests', {
      ...newRequest,
      urgency: toApiUrgency(newRequest.urgency),
      image: null,
    });

    if (!response.success) {
      setFeedback(response.error.message);
      return;
    }

    const createdFromApi = (response.data as { data?: Partial<RequestItem> & { urgency?: unknown } })?.data ?? (response.data as Partial<RequestItem> & { urgency?: unknown });
    const createdRequest = createdFromApi ? normalizeRequest(createdFromApi, newRequest) : newRequest;

    setRequests((current) => [createdRequest, ...current]);
    setForm(createEmptyForm(availableServers[0] ?? ''));
    setFeedback('Your request has been added to the board.');
    setShowCreateModal(false);
  }

  async function toggleCompletion(request: RequestItem) {
    const nextCompleted = !request.completed;

    const response = await api.put<{ data?: Partial<RequestItem> & { urgency?: unknown } } | (Partial<RequestItem> & { urgency?: unknown })>(`/requests/${request.id}`, {
      ...request,
      urgency: toApiUrgency(request.urgency),
      completed: nextCompleted,
      archived: request.archived ?? false,
      image: null,
    });

    if (response.success) {
      const updatedFromApi = (response.data as { data?: Partial<RequestItem> & { urgency?: unknown } })?.data ?? (response.data as Partial<RequestItem> & { urgency?: unknown });
      const updatedRequest = updatedFromApi
        ? normalizeRequest(updatedFromApi, { ...request, completed: nextCompleted })
        : { ...request, completed: nextCompleted };

      setRequests((current) => current.map((item) => (item.id === request.id ? updatedRequest : item)));
      setFeedback(nextCompleted ? 'Request marked as complete.' : 'Request marked as incomplete.');
    } else {
      setFeedback(response.error.message);
    }
  }

  const visibleRequests = idFilter ? requests.filter((r) => r.id === idFilter) : requests;

  return (
    <div className={styles.root}>
      <PageHeader
        title="Requests"
        subtitle="Help the community by completing requests from other players."
      />

      <div className={styles.notice}>
        <strong>Privacy Reminder:</strong> This website is publicly accessible. Please do not include real names, addresses, passwords, or other sensitive personal information in your requests.
      </div>

      {idFilter && (
        <div className={styles.filterBanner}>
          Showing a single request.{' '}
          <button className={styles.clearFilter} type="button" onClick={() => setSearchParams({})}>
            Show all requests
          </button>
        </div>
      )}

      <div className={styles.toolbar}>
        {!idFilter && <Button onClick={openCreateModal}>Create Request</Button>}
      </div>

      {feedback && <p className={styles.feedback}>{feedback}</p>}

      {loading ? (
        <LoadingState message="Loading requests…" />
      ) : visibleRequests.length === 0 ? (
        <Card className={styles.emptyCard}>
          {idFilter ? (
            <>
              <h2 className={styles.emptyTitle}>Request not found.</h2>
              <p className={styles.emptyText}>This request may have been removed or the link is invalid.</p>
              <Button onClick={() => setSearchParams({})}>View all requests</Button>
            </>
          ) : (
            <>
              <h2 className={styles.emptyTitle}>Nothing has been requested yet.</h2>
              <p className={styles.emptyText}>Be the first to ask the community for help.</p>
              <Button onClick={openCreateModal}>Create the first request</Button>
            </>
          )}
        </Card>
      ) : (
        <div className={styles.list}>
          {visibleRequests.map((request) => (
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
                <div className={styles.footerActions}>
                  <button
                    type="button"
                    className={styles.copyButton}
                    onClick={() => copyLink(request.id)}
                    aria-label="Copy link to this request"
                    title={copiedId === request.id ? 'Copied!' : 'Copy link'}
                  >
                    <LinkIcon />
                    {copiedId === request.id && <span className={styles.copiedLabel}>Copied!</span>}
                  </button>
                  <Button
                    type="button"
                    variant={request.completed ? 'secondary' : 'primary'}
                    size="sm"
                    onClick={() => toggleCompletion(request)}
                  >
                    {request.completed ? 'Mark Incomplete' : 'Mark Complete'}
                  </Button>
                </div>
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
                <select
                  value={form.server}
                  onChange={(event) => setForm((current) => ({ ...current, server: event.target.value }))}
                  disabled={availableServers.length === 0}
                >
                  {availableServers.length === 0 ? (
                    <option value="">No servers available</option>
                  ) : (
                    availableServers.map((serverName) => (
                      <option key={serverName} value={serverName}>{serverName}</option>
                    ))
                  )}
                </select>
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