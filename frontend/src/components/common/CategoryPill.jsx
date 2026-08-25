import './CategoryPill.css';

export default function CategoryPill({ label, isActive, onClick }) {
  return (
    <button
      className={`category-pill ${isActive ? 'category-pill--active' : ''}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
