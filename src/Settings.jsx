import React from 'react';
import { Moon, Sun, Monitor, Shield, User } from 'lucide-react';

export default function Settings({ darkMode, setDarkMode }) {
  return (
    <div className="page-content">
      <div className="page-header mb-6">
        <h1 className="page-title">Settings</h1>
        <p className="text-muted text-sm mt-2">Manage your preferences, account settings, and display options.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', maxWidth: '800px' }}>
        
        {/* Display Preferences Card */}
        <div className="card">
          <div className="card-header">
            <h3 className="m-0 font-bold text-sm text-primary flex items-center gap-2" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <Monitor size={16} /> Display Preferences
            </h3>
          </div>
          <div className="card-body flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <div>
                <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>Dark Mode</h4>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Switch between light and dark themes for the portal.
                </p>
              </div>
              
              <div 
                onClick={() => setDarkMode(!darkMode)}
                style={{
                  width: '56px',
                  height: '28px',
                  borderRadius: '14px',
                  backgroundColor: darkMode ? 'var(--success-color)' : '#CBD5E1',
                  padding: '2px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                <div 
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: darkMode ? 'translateX(28px)' : 'translateX(0px)'
                  }}
                >
                  {darkMode ? <Moon size={14} color="#1E293B" /> : <Sun size={14} color="#F59E0B" />}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Settings Card */}
        <div className="card">
          <div className="card-header">
            <h3 className="m-0 font-bold text-sm text-primary flex items-center gap-2" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <User size={16} /> Account Profile
            </h3>
          </div>
          <div className="card-body flex flex-col gap-4">
            <div className="flex gap-4 items-center">
              <div className="avatar avatar-lg" style={{ backgroundColor: 'var(--accent-color)', color: 'var(--primary-color)' }}>
                MD
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Marie Dubois</h4>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Administrateur / Manager ACEO</p>
              </div>
            </div>
          </div>
        </div>

        {/* Security Preferences Card */}
        <div className="card">
          <div className="card-header">
            <h3 className="m-0 font-bold text-sm text-primary flex items-center gap-2" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <Shield size={16} /> Security & System
            </h3>
          </div>
          <div className="card-body">
            <div className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid var(--border-color)' }}>
              <div>
                <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>System Notifications</span>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Receive email digests of pending timesheets</p>
              </div>
              <span className="badge badge-outline" style={{ fontSize: '0.65rem' }}>Active</span>
            </div>
            <div className="flex justify-between items-center py-2 mt-2">
              <div>
                <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>API Access Token</span>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Manage token used by BOOND synchronization service</p>
              </div>
              <span className="badge badge-outline" style={{ fontSize: '0.65rem' }}>Configured</span>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
