import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import './SearchBar.css';

export default function SearchBar({ onSearch, value: propValue = '' }) {
  const [query, setQuery] = useState(propValue);

  useEffect(() => {
    if (propValue !== undefined) {
      setQuery(propValue);
    }
  }, [propValue]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query);
    }
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit} id="search-bar">
      <Search size={20} className="search-bar-icon" />
      <input
        type="text"
        className="search-bar-input"
        placeholder="Search for shops, brands, or items..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        id="search-input"
      />
      <button type="submit" className="search-bar-btn" id="search-submit">
        <Search size={16} />
        <span>Search</span>
      </button>
    </form>
  );
}
