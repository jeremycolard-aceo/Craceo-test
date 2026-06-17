import { Search, RefreshCcw } from 'lucide-react';

export default function Topbar({ searchQuery, setSearchQuery, onReset }) {
  return (
    <div className="topbar">
      <div className="topbar-left">
        <img 
          src={`${import.meta.env.BASE_URL}media/aceo.png`} 
          alt="aceo logo" 
          style={{ height: '35px', objectFit: 'contain' }} 
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'block';
          }}
        />
        <div style={{ color: 'var(--primary-color)', display: 'none', fontWeight: 'bold', fontSize: '1.5rem' }}>aceo</div>
      </div>
      
      <div className="topbar-center">
        <div className="search-bar">
          <Search size={18} color="var(--text-muted)" />
          <input 
            type="text" 
            placeholder="Search consultants, clients, projects..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <div className="topbar-right">
        <RefreshCcw 
          size={18} 
          color="var(--text-muted)" 
          className="cursor-pointer hover:text-primary" 
          title="Reset to default mock data"
          onClick={onReset} 
        />
      </div>
    </div>
  );
}
