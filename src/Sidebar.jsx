import React from 'react';
import { Settings, Users, Bell, Info, MessageSquare, LayoutGrid } from 'lucide-react';

export default function Sidebar({ currentView, setCurrentView }) {
  return (
    <div className="sidebar">
      <div className="sidebar-menu">
        <div className="menu-section">Management</div>
        <div 
          className={`menu-item ${currentView === 'validations' ? 'active' : ''}`}
          onClick={() => setCurrentView('validations')}
        >
          <Settings size={18} />
          <span>Timesheet Validations</span>
        </div>
        <div 
          className={`menu-item ${currentView === 'consultants' ? 'active' : ''}`}
          onClick={() => setCurrentView('consultants')}
        >
          <Users size={18} />
          <span>Consultant Configuration</span>
        </div>

        <div className="menu-item mt-2">
          <Bell size={18} />
          <span>Notifications</span>
        </div>

        <div className="menu-section mt-6">Support</div>
        <div className="menu-item">
          <Info size={18} />
          <span>About</span>
        </div>
        <div className="menu-item">
          <MessageSquare size={18} />
          <span>Feedback</span>
        </div>
        <div className="menu-item">
          <LayoutGrid size={18} />
          <span>App Gallery</span>
        </div>
      </div>

      <div className="sidebar-footer">
        © 2026 CRACEO V2.01
      </div>
    </div>
  );
}
