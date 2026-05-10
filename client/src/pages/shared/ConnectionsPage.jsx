import { MessageCircle, Search, Send, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import http from "../../api/http";
import EmptyState from "../../components/EmptyState";
import SectionCard from "../../components/SectionCard";
import Skeleton from "../../components/Skeleton";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";

const tabs = [
  { key: "followers", label: "Followers" },
  { key: "following", label: "Following" },
];

const ConnectionsPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [connections, setConnections] = useState(null);
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") === "following" ? "following" : "followers");
  const [selectedUserId, setSelectedUserId] = useState(searchParams.get("user") || "");
  const [chatLoading, setChatLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [listQuery, setListQuery] = useState("");

  const profileId = id || user?.id;

  const loadConnections = async () => {
    if (!profileId) {
      return;
    }

    try {
      setLoading(true);
      const { data } = await http.get(`/profiles/${profileId}/connections`);
      setConnections(data);

      const requestedTab = searchParams.get("tab");
      const normalizedTab = requestedTab === "following" ? "following" : "followers";
      const connectionList = data[normalizedTab] || [];
      const requestedUser = searchParams.get("user");
      const hasRequestedUser = connectionList.some((entry) => entry.id === requestedUser);

      setActiveTab(normalizedTab);
      setSelectedUserId(
        hasRequestedUser ? requestedUser : connectionList[0]?.id || ""
      );
    } catch (error) {
      toast.error(
        "Unable to load connections",
        error.response?.data?.message || "Please refresh and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConnections();
  }, [profileId]);

  const activeConnections = useMemo(() => {
    const source = connections?.[activeTab] || [];
    const query = listQuery.trim().toLowerCase();

    if (!query) {
      return source;
    }

    return source.filter((entry) =>
      [entry.displayName, entry.username, entry.email, entry.registrationNumber]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query))
    );
  }, [activeTab, connections, listQuery]);

  const selectedUser = activeConnections.find((entry) => entry.id === selectedUserId)
    || (connections?.[activeTab] || []).find((entry) => entry.id === selectedUserId)
    || null;

  const loadChat = async (targetUserId) => {
    if (!targetUserId) {
      setMessages([]);
      return;
    }

    try {
      setChatLoading(true);
      const { data } = await http.get(`/profiles/${targetUserId}/chat`);
      setMessages(data);
    } catch (error) {
      toast.error(
        "Unable to load chat",
        error.response?.data?.message || "Please try again."
      );
    } finally {
      setChatLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedUserId) {
      setMessages([]);
      return;
    }

    loadChat(selectedUserId);
  }, [selectedUserId]);

  const handleTabChange = (nextTab) => {
    setActiveTab(nextTab);
    const nextList = connections?.[nextTab] || [];
    const nextSelected = nextList[0]?.id || "";
    setSelectedUserId(nextSelected);
    setSearchParams(nextSelected ? { tab: nextTab, user: nextSelected } : { tab: nextTab });
  };

  const handleSelectUser = (targetUserId) => {
    setSelectedUserId(targetUserId);
    setSearchParams({ tab: activeTab, user: targetUserId });
  };

  const handleSend = async (event) => {
    event.preventDefault();

    if (!selectedUserId || !message.trim()) {
      return;
    }

    try {
      setSending(true);
      const { data } = await http.post(`/profiles/${selectedUserId}/chat`, {
        message: message.trim(),
      });
      setMessages((current) => [...current, data]);
      setMessage("");
    } catch (error) {
      toast.error(
        "Unable to send message",
        error.response?.data?.message || "Please try again."
      );
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <Skeleton className="h-[720px]" />;
  }

  if (!connections) {
    return (
      <EmptyState
        title="Connections unavailable"
        description="This follower list is not available right now."
      />
    );
  }

  return (
    <div className="mx-auto max-w-[1360px] space-y-6">
      <SectionCard title="">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-500">
              Community
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">
              {connections.user.displayName}'s network
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Browse followers, following, and chat from one dedicated space.
            </p>
          </div>
          <Link
            to={profileId === user?.id ? "/profile" : `/profile/${profileId}`}
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:hover:bg-white/5"
          >
            Back to profile
          </Link>
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[380px_1fr]">
        <SectionCard title="">
          <div className="space-y-5">
            <div className="flex rounded-2xl bg-white/5 p-1">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  className={`flex-1 rounded-[1rem] px-4 py-3 text-sm font-semibold transition ${
                    activeTab === tab.key
                      ? "bg-brand-500 text-[var(--text-primary)]"
                      : "text-slate-500 hover:dark:hover:text-[var(--text-primary)]"
                  }`}
                  onClick={() => handleTabChange(tab.key)}
                >
                  {tab.label}
                  <span className="ml-2 text-xs opacity-80">
                    {connections[tab.key]?.length || 0}
                  </span>
                </button>
              ))}
            </div>

            <label className="card-surface flex items-center gap-3 rounded-2xl px-4 py-3">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                className="w-full bg-transparent text-sm outline-none"
                placeholder={`Search ${activeTab}`}
                value={listQuery}
                onChange={(event) => setListQuery(event.target.value)}
              />
            </label>

            <div className="space-y-3">
              {activeConnections.length ? (
                activeConnections.map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    className={`flex w-full items-center gap-4 rounded-[1.5rem] px-4 py-4 text-left transition ${
                      selectedUserId === entry.id
                        ? "bg-brand-500/15 ring-1 ring-brand-400/40"
                        : "bg-white/5 hover:bg-white/10"
                    }`}
                    onClick={() => handleSelectUser(entry.id)}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-blue-600 text-sm font-bold text-[var(--text-primary)]">
                      {entry.username.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-slate-900">
                        {entry.displayName}
                      </p>
                      <p className="truncate text-sm text-slate-500">
                        {entry.email}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {entry.registrationNumber || "No register number"}
                      </p>
                    </div>
                  </button>
                ))
              ) : (
                <EmptyState
                  title={`No ${activeTab} found`}
                  description="This list is empty right now."
                />
              )}
            </div>
          </div>
        </SectionCard>

        <SectionCard title="">
          {selectedUser ? (
            <div className="grid h-full min-h-[620px] grid-rows-[auto_1fr_auto] gap-5">
              <div className="flex items-center gap-4 rounded-[1.75rem] bg-white/5 px-5 py-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-blue-600 text-base font-bold text-[var(--text-primary)]">
                  {selectedUser.username.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-lg font-semibold text-slate-900">
                    {selectedUser.displayName}
                  </p>
                  <p className="truncate text-sm text-slate-500">
                    {selectedUser.email}
                  </p>
                </div>
              </div>

              <div className="rounded-[1.75rem] bg-white/5 p-5">
                {chatLoading ? (
                  <Skeleton className="h-full min-h-[340px]" />
                ) : messages.length ? (
                  <div className="flex h-full max-h-[360px] flex-col gap-3 overflow-y-auto pr-1">
                    {messages.map((entry) => {
                      const mine = entry.senderId === user?.id;
                      return (
                        <div
                          key={entry.id}
                          className={`max-w-[78%] rounded-[1.35rem] px-4 py-3 text-sm ${
                            mine
                              ? "ml-auto bg-brand-500 text-[var(--text-primary)]"
                              : "bg-slate-200 text-slate-800 dark:bg-white/10"
                          }`}
                        >
                          <p>{entry.message}</p>
                          <p
                            className={`mt-2 text-[11px] ${
                              mine ? "text-[var(--text-primary)]/75" : "text-slate-500"
                            }`}
                          >
                            {new Date(entry.createdAt).toLocaleString()}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <EmptyState
                    title="No messages yet"
                    description="Start the conversation from this chat window."
                  />
                )}
              </div>

              <form
                className="flex flex-col gap-3 rounded-[1.75rem] bg-white/5 p-4 sm:flex-row"
                onSubmit={handleSend}
              >
                <label className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl bg-slate-100/70 px-4 py-3 dark:bg-white/5">
                  <MessageCircle className="h-4 w-4 text-slate-400" />
                  <input
                    className="w-full bg-transparent text-sm outline-none"
                    placeholder={`Message ${selectedUser.displayName}`}
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                  />
                </label>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-500 px-5 py-3 text-sm font-semibold text-[var(--text-primary)] transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={sending || !message.trim()}
                >
                  <Send className="h-4 w-4" />
                  Send
                </button>
              </form>
            </div>
          ) : (
            <div className="flex h-full min-h-[620px] items-center justify-center rounded-[1.75rem] bg-white/5 p-6">
              <EmptyState
                icon={Users}
                title="Select a connection"
                description="Pick a follower or following user to open the chat panel."
              />
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
};

export default ConnectionsPage;



