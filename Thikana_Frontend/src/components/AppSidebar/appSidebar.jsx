import { NavLink } from 'react-router-dom';
import {
  HiOutlineBuildingOffice2,
  HiOutlineHome,
  HiOutlineMap,
  HiOutlineUserCircle,
} from 'react-icons/hi2';
import './appSidebar.scss';
import logo from '../../assets/Thikana_logo_1.png';

const links = [
  { to: '/app/home', label: 'Home', icon: HiOutlineHome },
  { to: '/app/explore', label: 'Explore', icon: HiOutlineMap },
  { to: '/app/my-properties', label: 'My Properties', icon: HiOutlineBuildingOffice2 },
  { to: '/app/profile', label: 'Profile', icon: HiOutlineUserCircle },
];
export default function AppSidebar() {
  return (
    <aside className="sidebar">
      <NavLink className="sidebar__brand" to="/app/home">
        <img src={logo} alt="Thikana Logo" />
        {/* <span>⌂</span> Thikana */}
      </NavLink>
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
