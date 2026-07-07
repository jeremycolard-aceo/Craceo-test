import { Users, Bell, LogOut, CheckSquare, Calendar, Sliders, Archive } from 'lucide-react';

export default function Sidebar({ currentView, setCurrentView }) {
  return (
    <div className="sidebar">
      <div className="sidebar-menu">
        <div className="menu-section">Management</div>
        <div 
          className={`menu-item ${currentView === 'validations' ? 'active' : ''}`}
          onClick={() => setCurrentView('validations')}
        >
          <CheckSquare size={18} />
          <span>Timesheet And Invoice Validations</span>
        </div>
        <div 
          className={`menu-item ${currentView === 'consultants' ? 'active' : ''}`}
          onClick={() => setCurrentView('consultants')}
        >
          <Users size={18} />
          <span>Consultant Configuration</span>
        </div>
        <div 
          className={`menu-item ${currentView === 'notifications' ? 'active' : ''}`}
          onClick={() => setCurrentView('notifications')}
        >
          <Bell size={18} />
          <span>Logs</span>
        </div>
        
        {/* New Menus */}
        <div 
          className={`menu-item ${currentView === 'delayHistory' ? 'active' : ''}`}
          onClick={() => setCurrentView('delayHistory')}
        >
          <Calendar size={18} />
          <span>CRA & Invoice Delay History</span>
        </div>
        <div 
          className={`menu-item ${currentView === 'notificationConfig' ? 'active' : ''}`}
          onClick={() => setCurrentView('notificationConfig')}
        >
          <Sliders size={18} />
          <span>Notification Configuration</span>
        </div>
        <div 
          className={`menu-item ${currentView === 'archive' ? 'active' : ''}`}
          onClick={() => setCurrentView('archive')}
        >
          <Archive size={18} />
          <span>Archive</span>
        </div>
      </div>

      <div className="sidebar-footer-menu">
        <div 
          className="menu-item"
          onClick={() => alert('Logging out...')}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </div>
      </div>
    </div>
  );
}


