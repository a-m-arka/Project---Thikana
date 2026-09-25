import { HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import './searchBox.scss';

export default function SearchBox({ value, onChange, placeholder = 'Search properties' }) {
  return (
    <label className="search-box">
      <HiOutlineMagnifyingGlass aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
    </label>
  );
}
