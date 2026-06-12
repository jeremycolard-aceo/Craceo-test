import React from 'react';
import { Settings, Users, Bell, LogOut, CheckSquare } from 'lucide-react';

export default function Sidebar({ currentView, setCurrentView }) {
  return (
    <div className="sidebar">
      <div className="sidebar-menu">
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
          <span>Notifications</span>
        </div>
      </div>

      <div className="sidebar-footer-menu">
        <div 
          className={`menu-item ${currentView === 'settings' ? 'active' : ''}`}
          onClick={() => {}}
        >
          <Settings size={18} />
          <span>Settings</span>
        </div>
        <div 
          className="menu-item"
          onClick={() => {}}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </div>
      </div>
    </div>
  );
}
