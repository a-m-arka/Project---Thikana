import { Navigate, Route, Routes } from 'react-router-dom';
import { useLayoutEffect, useState } from 'react';
import ProtectedRoute from './components/ProtectedRoute/protectedRoute';
import AppSidebar from './components/AppSidebar/appSidebar';
import Navbar from './components/Navbar/navbar';
import Landing from './pages/Landing/landing';
import Login from './pages/Login/login';
import Signup from './pages/Signup/signup';
import Explore from './pages/Explore/explore';
import MyProperties from './pages/MyProperties/myProperties';
import Profile from './pages/Profile/profile';
import PropertyDetails from './pages/PropertyDetails/propertyDetails';
import EditProperty from './pages/EditProperty/editProperty';
import './App.scss';

function AppLayout({ theme, onToggleTheme }) {
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [messageTarget, setMessageTarget] = useState(null);
  const messageOwner = (property) => {
    setMessageTarget({
      other_user_id: property.user_id,
      other_user_name: property.owner_name || 'Property owner',
      post_id: property.post_id || null,
    });
    setMessagesOpen(true);
  };

  return (
    <div className="app-layout">
      <AppSidebar />
      <div className="app-content">
        <Navbar
          messagesOpen={messagesOpen}
          onMessagesOpenChange={setMessagesOpen}
          messageTarget={messageTarget}
          theme={theme}
          onToggleTheme={onToggleTheme}
        />
        <main>
          <Routes>
            <Route path="explore" element={<Explore onMessageOwner={messageOwner} />} />
            <Route path="my-properties" element={<MyProperties />} />
            <Route
              path="properties/:propertyId"
              element={<PropertyDetails onMessageOwner={messageOwner} />}
            />
            <Route path="properties/:propertyId/edit" element={<EditProperty />} />
            <Route path="profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="explore" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const [theme, setTheme] = useState(() =>
    localStorage.getItem('thikana_theme') === 'dark' ? 'dark' : 'light',
  );

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('thikana_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
  };

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route element={<ProtectedRoute />}>
        <Route
          path="/app/*"
          element={<AppLayout theme={theme} onToggleTheme={toggleTheme} />}
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
