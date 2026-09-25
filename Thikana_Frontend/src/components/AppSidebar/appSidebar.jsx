import { NavLink } from 'react-router-dom';
import {
  HiOutlineBuildingOffice2,
  HiOutlineMap,
  HiOutlineUserCircle,
} from 'react-icons/hi2';
import './appSidebar.scss';

const links = [
  { to: '/app/explore', label: 'Explore', icon: HiOutlineMap },
  { to: '/app/my-properties', label: 'My Properties', icon: HiOutlineBuildingOffice2 },
  { to: '/app/profile', label: 'Profile', icon: HiOutlineUserCircle },
];
export default function AppSidebar() {
  return (
    <aside className="sidebar">
      <nav>
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `sidebar__link ${isActive ? 'active' : ''}`}
          >
            <Icon />
            {label}
          </NavLink>
        ))}
      </nav>
      <p className="sidebar__foot">Find a place that feels like home.</p>
    </aside>
  );
}
