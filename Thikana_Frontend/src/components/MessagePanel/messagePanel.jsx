import { useCallback, useEffect, useRef, useState } from 'react';
import {
  HiOutlineArrowLeft,
  HiOutlineArrowDown,
  HiOutlinePaperAirplane,
  HiOutlineXMark,
} from 'react-icons/hi2';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import './messagePanel.scss';

const formatTime = (value) => {
  if (!value) return '';

  return new Intl.DateTimeFormat([], {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
};

const calendarDayKey = (value) => {
  const date = new Date(value);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
};

const formatDateSeparator = (value) => {
  const date = new Date(value);
  const today = new Date();

  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (calendarDayKey(date) === calendarDayKey(today)) return 'Today';

  if (calendarDayKey(date) === calendarDayKey(yesterday)) return 'Yesterday';

  return new Intl.DateTimeFormat([], {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

const messageStatus = (status) => {
  if (status === 'read') return 'Seen';
  if (status === 'delivered') return 'Delivered';

  return 'Sent';
};

export default function MessagePanel({ onClose, initialConversation }) {
  const { apiUrl, user, authenticatedFetch } = useAuth();
  const socket = useSocket();

  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [pagination, setPagination] = useState({
    hasMore: false,
    nextCursor: null,
  });
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const [showLatestButton, setShowLatestButton] = useState(false);
  const threadRef = useRef(null);

  const isThreadAtBottom = () => {
    const thread = threadRef.current;
    if (!thread) return true;

    return thread.scrollHeight - thread.scrollTop - thread.clientHeight <= 32;
  };

  const scrollThreadToBottom = () => {
    requestAnimationFrame(() => {
      if (threadRef.current) {
        threadRef.current.scrollTop = threadRef.current.scrollHeight;
      }
    });
  };

  const handleThreadScroll = (event) => {
    const thread = event.currentTarget;
    const atBottom = thread.scrollHeight - thread.scrollTop - thread.clientHeight <= 32;
    setShowLatestButton(!atBottom);

    if (thread.scrollTop <= 24) {
      loadOlderMessages(event);
    }
  };

  const request = useCallback(
    async (path, options = {}) => {
      const response = await authenticatedFetch(`${apiUrl}${path}`, {
        ...options,
        headers: {
          ...(options.headers || {}),
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to load messages');
      }

      return data;
    },
    [apiUrl, authenticatedFetch],
  );

  const loadConversations = useCallback(async () => {
    try {
      const data = await request('/messages/conversations');
      setConversations(data.data || []);
    } catch (err) {
      setError(err.message);
    }
  }, [request]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (!socket) return undefined;

    const receiveMessage = (message) => {
      loadConversations();
      const shouldStickToBottom = isThreadAtBottom();

      if (
        selected &&
        (Number(message.sender_id) === Number(selected.other_user_id) ||
          Number(message.receiver_id) === Number(selected.other_user_id))
      ) {
        setMessages((current) =>
          current.some((item) => item.message_id === message.message_id)
            ? current
            : [...current, message],
        );

          if (shouldStickToBottom) scrollThreadToBottom();

        if (Number(message.sender_id) === Number(selected.other_user_id)) {
          socket.emit('message:read', {
            otherUserId: selected.other_user_id,
          });
        }
      }
    };

    const updateReadStatus = ({ readerId }) => {
      setMessages((current) =>
        current.map((message) =>
          Number(message.sender_id) === Number(user?.user_id) &&
          Number(message.receiver_id) === Number(readerId)
            ? { ...message, read_status: 'read' }
            : message,
        ),
      );
    };

    socket.on('message:new', receiveMessage);
    socket.on('message:read', updateReadStatus);

    return () => {
      socket.off('message:new', receiveMessage);
      socket.off('message:read', updateReadStatus);
    };
  }, [socket, selected, loadConversations, user?.user_id]);

  const openConversation = async (conversation) => {
    setSelected(conversation);
    setError('');
    setPagination({ hasMore: false, nextCursor: null });

    try {
      const data = await request(
        `/messages/conversations/${conversation.other_user_id}`,
      );

      setMessages(data.data || []);
      setPagination(data.pagination || { hasMore: false, nextCursor: null });
      setShowLatestButton(false);
      scrollThreadToBottom();

      socket?.emit('message:read', {
        otherUserId: conversation.other_user_id,
      });

      loadConversations();
    } catch (err) {
      setError(err.message);
    }
  };

  const loadOlderMessages = async (event) => {
    const thread = event.currentTarget;
    if (!pagination.hasMore || !pagination.nextCursor || loadingOlder) return;

    const previousHeight = thread.scrollHeight;
    setLoadingOlder(true);

    try {
      const data = await request(
        `/messages/conversations/${selected.other_user_id}?before=${pagination.nextCursor}`,
      );
      const olderMessages = data.data || [];

      setMessages((current) => [...olderMessages, ...current]);
      setPagination(data.pagination || { hasMore: false, nextCursor: null });

      requestAnimationFrame(() => {
        thread.scrollTop += thread.scrollHeight - previousHeight;
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingOlder(false);
    }
  };

  useEffect(() => {
    if (initialConversation) {
      openConversation(initialConversation);
    }
  }, [initialConversation]);

  const sendMessage = (event) => {
    event.preventDefault();

    const text = draft.trim();

    if (!text || !selected || !socket) return;

    setError('');

    socket.emit(
      'message:send',
      {
        receiverId: selected.other_user_id,
        postId: selected.post_id,
        text,
      },
      (result) => {
        if (!result?.ok) {
          setError(result?.message || 'Unable to send message');
        }
      },
    );

    setDraft('');
    scrollThreadToBottom();
  };

  const isMine = (message) =>
    Number(message.sender_id) === Number(user?.user_id);

  return (
    <section className="message-panel" aria-label="Messages">
      <header className="message-panel__header">
        {selected ? (
          <button
            className="message-panel__back"
            onClick={() => setSelected(null)}
            title="All messages"
          >
            <HiOutlineArrowLeft />
          </button>
        ) : (
          <div>
            <p>Inbox</p>
            <h2>Messages</h2>
          </div>
        )}

        {selected && <h2>{selected.other_user_name}</h2>}

        <button
          className="message-panel__close"
          onClick={onClose}
          title="Close messages"
        >
          <HiOutlineXMark />
        </button>
      </header>

      {error && <p className="message-panel__error">{error}</p>}

      {!selected ? (
        <div className="message-panel__list">
          {conversations.map((conversation) => (
            <button
              key={conversation.other_user_id}
              className="conversation"
              onClick={() => openConversation(conversation)}
            >
              <span className="conversation__avatar">
                {conversation.other_user_name?.slice(0, 1).toUpperCase()}
              </span>

              <span className="conversation__copy">
                <strong>{conversation.other_user_name}</strong>
                <small>{conversation.message_text}</small>
              </span>

              <time>{formatTime(conversation.sent_at)}</time>
            </button>
          ))}

          {!conversations.length && (
            <p className="message-panel__empty">No conversations yet.</p>
          )}
        </div>
      ) : (
        <>
          <div className="message-panel__thread-container">
            <div
              ref={threadRef}
              className="message-panel__thread"
              onScroll={handleThreadScroll}
            >
              {loadingOlder && (
                <p className="message-panel__history-status">Loading older messages...</p>
              )}
              {messages.map((message, index) => {
              const showDate =
                index === 0 ||
                calendarDayKey(message.sent_at) !==
                  calendarDayKey(messages[index - 1].sent_at);

              const mine = isMine(message);

                return (
                  <div
                    key={message.message_id}
                    className={`message-panel__message-group ${
                      mine ? 'message-panel__message-group--mine' : ''
                    }`}
                  >
                    {showDate && (
                      <div className="message-date-separator">
                        <span>{formatDateSeparator(message.sent_at)}</span>
                      </div>
                    )}

                    <div
                      className={`message-bubble ${
                        mine ? 'message-bubble--mine' : ''
                      }`}
                    >
                      <span>{message.message_text}</span>
                      <time>{formatTime(message.sent_at)}</time>
                    </div>

                    {mine && (
                      <small className="message-bubble__status">
                        {messageStatus(message.read_status)}
                      </small>
                    )}
                  </div>
                );
              })}

              {!messages.length && (
                <p className="message-panel__empty">
                  Send the first message to {selected.other_user_name}.
                </p>
              )}
            </div>
            {showLatestButton && (
              <button
                type="button"
                className="message-panel__latest-button"
                onClick={scrollThreadToBottom}
                title="Jump to latest message"
                aria-label="Jump to latest message"
              >
                <HiOutlineArrowDown />
              </button>
            )}
          </div>

          <form
            className="message-panel__composer"
            onSubmit={sendMessage}
          >
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={`Message ${selected.other_user_name}`}
              maxLength="5000"
            />

            <button
              type="submit"
              disabled={!draft.trim() || !socket}
              title="Send message"
            >
              <HiOutlinePaperAirplane />
            </button>
          </form>
        </>
      )}
    </section>
  );
}