import {
  // HiOutlineBell,
  HiOutlineChatBubbleOvalLeft,
  HiOutlineMagnifyingGlass,
  HiOutlineArrowRightOnRectangle,
} from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import MessagePanel from '../MessagePanel/messagePanel';
import './navbar.scss';
export default function Navbar({ messagesOpen, onMessagesOpenChange, messageTarget }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const initials = (user?.name || 'U').slice(0, 1).toUpperCase();
  return (
    <header className="navbar">
      <label className="navbar__search">
        <HiOutlineMagnifyingGlass />
        <input placeholder="Search properties" />
      </label>
      <div className="navbar__actions">
        {/* <button title="Notifications" className="icon-button">
          <HiOutlineBell />
        </button> */}
        <button
          title="Messages"
          className="icon-button"
          onClick={() => onMessagesOpenChange(!messagesOpen)}
        >
          <HiOutlineChatBubbleOvalLeft />
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
