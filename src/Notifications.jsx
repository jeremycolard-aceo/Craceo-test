import React, { useState } from 'react';
import { Info, CheckCircle, Undo, FileText, Hourglass, Search, Bell, Check } from 'lucide-react';

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

export default function Notifications({ 
  notifications, 
  setNotifications, 
  addNotification,
  consultants,
  updateConsultant 
}) {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'unread' | 'mentions'
  const [searchPerson, setSearchPerson] = useState('');
  const [filterType, setFilterType] = useState('All'); // 'All' | 'cra' | 'billing' | 'final' | 'undo'

  // Mark all notifications as read
  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Mark single notification as read
  const handleMarkRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  // Handle Interactive CRA Approval from notification card
  const handleApproveCRA = (notification) => {
    // Find consultant by employeeName
    const nameParts = notification.employeeName.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');
    
    const consultant = consultants.find(c => 
      c.firstname.toLowerCase() === firstName.toLowerCase() &&
      c.name.toLowerCase() === lastName.toLowerCase()
    );

    if (consultant) {
      // Validate all unvalidated CRAs for this consultant
      const updatedCras = consultant.cras.map(cra => ({ ...cra, validated: true }));
      updateConsultant(consultant.id, { cras: updatedCras });
      
      // Update this notification to reflect approval
      setNotifications(prev => prev.map(n => {
        if (n.id === notification.id) {
          return {
            ...n,
            read: true,
            message: `CRA for **${notification.employeeName}** has been approved by **Marie Dubois**.`
          };
        }
        return n;
      }));

      // Log CRA validated action
      addNotification(
        'cra',
        'CRA Validated',
        `CRA for **${notification.employeeName}** validated by **Marie Dubois** (via Notifications Approve).`,
        notification.employeeName,
        'Marie Dubois'
      );
    }
  };

  // Filter notifications list
  const getFilteredNotifications = () => {
    return notifications.filter(n => {
      // 1. Tab Filter
      if (activeTab === 'unread' && n.read) return false;
      if (activeTab === 'mentions') {
        // Mentions filter: notifications where Marie Dubois is mentioned or system alerts related directly to her team
        const containsMention = n.message.toLowerCase().includes('marie dubois') || n.author === 'System';
        if (!containsMention) return false;
      }

      // 2. Search Person Filter (checks actor/author or employee/consultant name)
      if (searchPerson) {
        const query = searchPerson.toLowerCase();
        const matchesAuthor = n.author?.toLowerCase().includes(query);
        const matchesEmployee = n.employeeName?.toLowerCase().includes(query);
        if (!matchesAuthor && !matchesEmployee) return false;
      }

      // 3. Type Filter
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
  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'undo':
        return {
          icon: <Undo size={16} className="text-amber-600" />,
          bgColor: '#FEF3C7',
          borderColor: '#F59E0B'
        };
      case 'billing':
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
          <h1 className="page-title">Notifications</h1>
          <p className="text-muted text-sm mt-2">Stay updated on your team's activity and system alerts.</p>
        </div>
        <button className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }} onClick={handleMarkAllRead}>
          <Check size={16} /> Mark all as read
        </button>
      </div>

      {/* Tabs */}
      <div className="notifications-tabs-container">
        <div className="notifications-tabs">
          <button 
            className={`notif-tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All <span className="tab-count-badge">{notifications.length}</span>
          </button>
          <button 
            className={`notif-tab ${activeTab === 'unread' ? 'active' : ''}`}
            onClick={() => setActiveTab('unread')}
          >
            Unread {unreadCount > 0 && <span className="tab-count-badge unread-badge">{unreadCount}</span>}
          </button>
          <button 
            className={`notif-tab ${activeTab === 'mentions' ? 'active' : ''}`}
            onClick={() => setActiveTab('mentions')}
          >
            Mentions
          </button>
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
              className={`notification-card ${!n.read ? 'unread' : ''}`}
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
                cursor: 'pointer'
              }}
              onClick={() => handleMarkRead(n.id)}
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
                <div className="flex justify-between items-start mb-1">
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

                {/* Interactive buttons for CRA submission */}
                {n.type === 'cra_submit' && !n.message.includes('approved') && (
                  <div className="flex gap-2 mt-3">
                    <button 
                      className="btn" 
                      style={{
                        padding: '4px 12px',
                        fontSize: '0.75rem',
                        backgroundColor: '#F8B335',
                        color: 'var(--primary-color)',
                        fontWeight: 600,
                        border: 'none',
                        borderRadius: '4px'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApproveCRA(n);
                      }}
                    >
                      Approve
                    </button>
                    <button 
                      className="btn btn-outline" 
                      style={{
                        padding: '4px 12px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        height: 'auto'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkRead(n.id);
                      }}
                    >
                      View Details
                    </button>
                  </div>
                )}
              </div>

              {/* Unread indicator dot */}
              {!n.read && (
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#D97706',
                  position: 'absolute',
                  right: '1.25rem',
                  bottom: '1.25rem'
                }} />
              )}
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
    </div>
  );
}
