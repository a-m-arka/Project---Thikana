import {
  // HiOutlineBell,
  HiOutlineChatBubbleOvalLeft,
  HiOutlineArrowRightOnRectangle,
  HiOutlineMoon,
  HiOutlineSun,
} from 'react-icons/hi2';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import MessagePanel from '../MessagePanel/messagePanel';
import { useSocket } from '../../context/SocketContext';
import './navbar.scss';
import logo from '../../assets/Thikana_logo_1.png';

export default function Navbar({
  messagesOpen,
  onMessagesOpenChange,
  messageTarget,
  theme,
  onToggleTheme,
}) {
  const { apiUrl, authenticatedFetch, user, logout } = useAuth();
  const socket = useSocket();
  const navigate = useNavigate();
  const [unreadMessages, setUnreadMessages] = useState(0);
  const initials = (user?.name || 'U').slice(0, 1).toUpperCase();

  const loadUnreadMessages = useCallback(async () => {
    try {
      const response = await authenticatedFetch(`${apiUrl}/messages/conversations`);
      if (!response.ok) return;

      const data = await response.json();
      const unreadTotal = (data.data || []).reduce(
        (total, conversation) => total + Number(conversation.unread_count || 0),
        0,
      );
      setUnreadMessages(unreadTotal);
    } catch {
      // The authenticated request helper handles expired sessions.
    }
  }, [apiUrl, authenticatedFetch]);

  useEffect(() => {
    loadUnreadMessages();
  }, [loadUnreadMessages]);

  useEffect(() => {
    if (!socket) return undefined;

    socket.on('message:new', loadUnreadMessages);
    socket.on('message:read', loadUnreadMessages);

    return () => {
      socket.off('message:new', loadUnreadMessages);
      socket.off('message:read', loadUnreadMessages);
    };
  }, [socket, loadUnreadMessages]);

  return (
    <header className="navbar">
      <button className="navbar__brand" onClick={() => navigate('/app/explore')}>
        <img src={logo} alt="Thikana Logo" />
      </button>
      <div className="navbar__actions">
        {/* <button title="Notifications" className="icon-button">
          <HiOutlineBell />
        </button> */}
        <button
          title="Messages"
          className="icon-button navbar__messages"
          onClick={() => onMessagesOpenChange(!messagesOpen)}
        >
          <HiOutlineChatBubbleOvalLeft />
          {unreadMessages > 0 && (
            <span className="navbar__unread-badge">
              {unreadMessages > 99 ? '99+' : unreadMessages}
            </span>
          )}
        </button>
        <button
          type="button"
          className="icon-button navbar__theme-toggle"
          onClick={onToggleTheme}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          aria-pressed={theme === 'dark'}
        >
          {theme === 'dark' ? <HiOutlineSun /> : <HiOutlineMoon />}
        </button>
        <button className="navbar__user" onClick={() => navigate('/app/profile')}>
          <span>{initials}</span>
          <strong>{user?.name || 'My account'}</strong>
        </button>
        <button
          onClick={() => {
            logout();
            navigate('/');
          }}
          title="Log out"
          className="icon-button navbar__logout"
        >
          <HiOutlineArrowRightOnRectangle />
        </button>
      </div>
      {messagesOpen && (
        <MessagePanel
          onClose={() => onMessagesOpenChange(false)}
          initialConversation={messageTarget}
        />
      )}
    </header>
  );
}
