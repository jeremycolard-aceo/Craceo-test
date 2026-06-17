import React, { useState } from 'react';
import { Info, CheckCircle, Undo, FileText, Hourglass, Search, Bell } from 'lucide-react';

// Relative time formatter helper
const formatTimeAgo = (timestamp) => {
  if (!timestamp) return "Just now";
  const diffMs = Date.now() - timestamp;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
};

// Simple Markdown Bold Parser (**text** -> <strong>text</strong>)
const parseBoldMessage = (text) => {
  if (!text) return "";
  const parts = text.split(/(\*\*.*?\*\*)/);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} style={{ fontWeight: 700, color: 'var(--primary-color)' }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
};

export default function Notifications({ notifications }) {
  const [searchPerson, setSearchPerson] = useState('');
  const [filterType, setFilterType] = useState('All'); // 'All' | 'cra' | 'billing' | 'final' | 'undo'
  const [activePopupList, setActivePopupList] = useState(null); // array of names or null

  // Filter notifications list
  const getFilteredNotifications = () => {
    return notifications.filter(n => {
      // 1. Search Person Filter (checks actor/author or employee/consultant name)
      if (searchPerson) {
        const query = searchPerson.toLowerCase();
        const matchesAuthor = n.author?.toLowerCase().includes(query);
        const matchesEmployee = n.employeeName?.toLowerCase().includes(query);
        if (!matchesAuthor && !matchesEmployee) return false;
      }

      // 2. Type Filter
      if (filterType !== 'All') {
        if (filterType === 'cra' && n.type !== 'cra' && n.type !== 'cra_submit') return false;
        if (filterType === 'billing' && n.type !== 'billing') return false;
        if (filterType === 'final' && n.type !== 'final') return false;
        if (filterType === 'undo' && n.type !== 'undo') return false;
      }

      return true;
    });
  };

  const filteredNotifications = getFilteredNotifications();

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'undo':
        return {
          icon: <Undo size={16} className="text-amber-600" />,
          bgColor: '#FEF3C7',
          borderColor: '#F59E0B'
        };
      case 'billing':
      case 'final':
        return {
          icon: <CheckCircle size={16} className="text-emerald-600" />,
          bgColor: '#D1FAE5',
          borderColor: '#10B981'
        };
      case 'cra':
        return {
          icon: <CheckCircle size={16} className="text-blue-600" />,
          bgColor: '#DBEAFE',
          borderColor: '#3B82F6'
        };
      case 'cra_submit':
        return {
          icon: <FileText size={16} className="text-indigo-600" />,
          bgColor: '#E0E7FF',
          borderColor: '#6366F1'
        };
      case 'alert':
        return {
          icon: <Hourglass size={16} className="text-rose-600" />,
          bgColor: '#FEE2E2',
          borderColor: '#EF4444'
        };
      default:
        return {
          icon: <Info size={16} className="text-slate-600" />,
          bgColor: '#F1F5F9',
          borderColor: '#64748B'
        };
    }
  };

  return (
    <div className="page-content flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="page-title">Logs</h1>
          <p className="text-muted text-sm mt-2">Stay updated on your team's activity and system alerts.</p>
        </div>
      </div>

      {/* Filters bar */}
      <div className="notifications-filter-bar flex justify-between items-center gap-4 mb-6">
        <div className="search-bar" style={{ width: '300px', backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)' }}>
          <Search size={16} color="var(--text-muted)" />
          <input 
            type="text" 
            placeholder="Search by person..." 
            value={searchPerson}
            onChange={(e) => setSearchPerson(e.target.value)}
            style={{ fontSize: '0.85rem' }}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted">Filter by:</span>
          <select 
            className="form-input" 
            style={{ width: '200px', padding: '0.5rem 1rem', fontSize: '0.85rem', height: '36px', backgroundColor: '#FFFFFF' }}
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="All">All Types</option>
            <option value="cra">CRA Validations</option>
            <option value="billing">Billing / Invoices</option>
            <option value="final">Final Validations</option>
            <option value="undo">Undo Actions</option>
          </select>
        </div>
      </div>

      {/* Notification feed list */}
      <div className="notifications-feed flex flex-col gap-4 overflow-y-auto" style={{ flex: 1, paddingBottom: '2rem' }}>
        {filteredNotifications.map(n => {
          const config = getNotificationIcon(n.type);
          return (
            <div 
              key={n.id}
              className="notification-card"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--border-color)',
                borderLeft: `4px solid ${config.borderColor}`,
                borderRadius: '8px',
                padding: '1.25rem',
                position: 'relative',
                transition: 'all 0.2s ease',
                cursor: 'default'
              }}
            >
              {/* Icon container */}
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: config.bgColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {config.icon}
              </div>

              {/* Message Details */}
              <div className="flex-1" style={{ minWidth: 0 }}>
                <div className="flex justify-between items-start" style={{ marginBottom: '8px' }}>
                  <h4 className="m-0 text-sm font-bold" style={{ color: 'var(--primary-color)' }}>
                    {n.title}
                  </h4>
                  <span className="text-xs text-light font-medium whitespace-nowrap ml-2">
                    {formatTimeAgo(n.time)}
                  </span>
                </div>
                
                <p className="m-0 text-sm text-slate-600 leading-relaxed" style={{ wordBreak: 'break-word' }}>
                  {parseBoldMessage(n.message)}
                </p>

                {n.consultantsList && n.consultantsList.length > 2 && (
                  <button 
                    onClick={() => setActivePopupList(n.consultantsList)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#F97316',
                      textDecoration: 'underline',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      padding: 0,
                      marginTop: '6px',
                      cursor: 'pointer',
                      display: 'block'
                    }}
                  >
                    View validated consultants ({n.consultantsList.length})
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {filteredNotifications.length === 0 && (
          <div className="text-center text-muted p-8 border border-dashed border-slate-300 rounded-lg bg-white">
            <Bell size={24} className="mx-auto mb-2 text-light" />
            <p className="font-semibold text-sm">No notifications found.</p>
            <p className="text-xs text-light mt-1">You are all caught up!</p>
          </div>
        )}
      </div>

      {/* Batch Validations Popup Modal */}
      {activePopupList && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            width: '400px',
            maxWidth: '90%',
            padding: '1.5rem'
          }}>
            <h3 style={{
              margin: '0 0 1rem 0',
              fontSize: '1.1rem',
              fontWeight: 700,
              color: 'var(--primary-color)',
              borderBottom: '1px solid var(--border-color)',
              paddingBottom: '0.75rem'
            }}>
              Validated Consultants Batch
            </h3>
            
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              The complete workflow for these {activePopupList.length} consultants was validated together:
            </p>

            <ul style={{
              margin: 0,
              padding: '0 0 0 1.25rem',
              fontSize: '0.9rem',
              color: 'var(--primary-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              marginBottom: '1.5rem'
            }}>
              {activePopupList.map((name, idx) => (
                <li key={idx} style={{ fontWeight: 600 }}>{name}</li>
              ))}
            </ul>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                className="btn btn-primary"
                onClick={() => setActivePopupList(null)}
                style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
