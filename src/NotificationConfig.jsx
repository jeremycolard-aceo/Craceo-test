import { useState, useEffect } from 'react';
import { Clock, MessageSquare, Users, Mail, Plus, Check } from 'lucide-react';
import { mockNotificationRules } from './data';

export default function NotificationConfig() {
  const [rules, setRules] = useState(mockNotificationRules);
  const [selectedRuleId, setSelectedRuleId] = useState(mockNotificationRules[0]?.id || null);
  const [editingRule, setEditingRule] = useState(mockNotificationRules[0] ? { ...mockNotificationRules[0] } : null);
  const [toastMessage, setToastMessage] = useState('');

  // Success toast timer
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleSelectRule = (id) => {
    setSelectedRuleId(id);
    const rule = rules.find(r => r.id === id);
    setEditingRule(rule ? { ...rule } : null);
  };

  const handleFieldChange = (field, value) => {
    setEditingRule(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleChannelToggle = (channel) => {
    if (!editingRule) return;
    const currentChannels = editingRule.channels || [];
    let newChannels;
    if (currentChannels.includes(channel)) {
      newChannels = currentChannels.filter(c => c !== channel);
    } else {
      newChannels = [...currentChannels, channel];
    }
    handleFieldChange('channels', newChannels);
  };

  const handleSave = () => {
    if (!editingRule) return;

    // Validation
    if (!editingRule.name.trim()) {
      alert("Please enter a rule name.");
      return;
    }

    const updatedRule = {
      ...editingRule,
      lastUpdated: "Just now by Admin"
    };

    setRules(prev => prev.map(r => {
      if (r.id === editingRule.id) {
        return updatedRule;
      }
      return r;
    }));

    setEditingRule(updatedRule);
    setToastMessage("Rule configuration saved successfully!");
  };

  const handleDiscard = () => {
    const original = rules.find(r => r.id === selectedRuleId);
    if (original) {
      setEditingRule({ ...original });
    }
  };

  const handleAddNewRule = () => {
    const newId = 'rule_' + Date.now();
    const newRule = {
      id: newId,
      name: "New Reminder Rule",
      tag: "STANDARD",
      active: true,
      messageTemplate: "Write your message template here...",
      channels: ["general"],
      relativeDay: 0,
      timeOfDay: "12:00",
      lastUpdated: "Created just now"
    };

    setRules(prev => [...prev, newRule]);
    setSelectedRuleId(newId);
    setEditingRule({ ...newRule });
    setToastMessage("New rule created! Configure it below.");
  };


  // Helper to format J relative days
  const formatRelativeDayLabel = (val) => {
    const num = parseInt(val, 10);
    if (isNaN(num)) return "J0";
    if (num > 0) return `J+${num}`;
    return `J${num}`;
  };

  const getTagStyle = (tag) => {
    switch (tag) {
      case 'CRITICAL':
        return { backgroundColor: '#FEF3C7', color: '#D97706', border: '1px solid #FDE68A' };
      case 'URGENT':
        return { backgroundColor: '#FEE2E2', color: '#EF4444', border: '1px solid #FCA5A5' };
      default:
        return { backgroundColor: '#F1F5F9', color: '#64748B', border: '1px solid #E2E8F0' };
    }
  };

  const getChannelLabel = (channel) => {
    switch (channel) {
      case 'personal': return 'Personal';
      case 'general': return 'General';
      case 'email': return 'Email';
      default: return channel;
    }
  };

  const getChannelIcon = (channel, size = 14) => {
    switch (channel) {
      case 'personal': return <MessageSquare size={size} />;
      case 'general': return <Users size={size} />;
      case 'email': return <Mail size={size} />;
      default: return null;
    }
  };

  return (
    <div className="page-content flex flex-col h-full" style={{ position: 'relative' }}>
      {/* Toast Alert */}
      {toastMessage && (
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          backgroundColor: '#10B981',
          color: '#FFFFFF',
          padding: '0.75rem 1.5rem',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          zIndex: 100,
          fontWeight: 600,
          fontSize: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Check size={18} />
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="page-title">Notification Configuration</h1>
          <p className="text-muted text-sm mt-1">Manage automated reminders and schedule alerts for consultant activity reports (CRA).</p>
        </div>
      </div>

      {/* Layout Content */}
      <div className="flex gap-6" style={{ flex: 1, minHeight: 0 }}>
        
        {/* Left Column - Active Rules list */}
        <div className="card flex flex-col" style={{ width: '380px', padding: '1.5rem', flexShrink: 0, gap: '1rem', overflowY: 'auto' }}>
          <div className="flex justify-between items-center pb-2" style={{ borderBottom: '1px solid var(--border-color)' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--primary-color)' }}>Active Rules</h3>
            <span style={{
              backgroundColor: '#F1F5F9',
              color: 'var(--text-muted)',
              fontSize: '0.75rem',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: '9999px'
            }}>{rules.length} total</span>
          </div>

          {/* Rules List */}
          <div className="flex flex-col gap-3" style={{ flex: 1 }}>
            {rules.map((rule) => {
              const isSelected = rule.id === selectedRuleId;
              const tagStyle = getTagStyle(rule.tag);
              return (
                <div
                  key={rule.id}
                  onClick={() => handleSelectRule(rule.id)}
                  style={{
                    padding: '1rem',
                    borderRadius: '8px',
                    border: isSelected ? '2px solid #262E52' : '1px solid var(--border-color)',
                    backgroundColor: isSelected ? '#F8FAFC' : '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    opacity: rule.active ? 1 : 0.6
                  }}
                  className="hover-shadow-sm"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h4 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary-color)' }}>
                      {rule.name}
                    </h4>
                    <span style={{
                      ...tagStyle,
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}>
                      {rule.tag}
                    </span>
                  </div>
                  
                  <p style={{
                    margin: '0 0 0.75rem 0',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {rule.messageTemplate}
                  </p>

                  <div className="flex gap-4 text-xs text-light font-medium">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {rule.timeOfDay}
                    </span>
                    <span className="flex items-center gap-1">
                      {getChannelIcon(rule.channels[0], 12)}
                      {getChannelLabel(rule.channels[0])}
                      {rule.channels.length > 1 && ` +${rule.channels.length - 1}`}
                    </span>
                    <span style={{ marginLeft: 'auto', fontWeight: 600, color: rule.active ? '#10B981' : 'var(--text-light)' }}>
                      {rule.active ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add New Rule Button */}
          <button
            onClick={handleAddNewRule}
            style={{
              width: '100%',
              padding: '0.875rem',
              borderRadius: '8px',
              border: '2px dashed var(--border-color)',
              backgroundColor: 'transparent',
              color: 'var(--primary-color)',
              fontWeight: 600,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            className="btn-add-rule-dashed"
          >
            <Plus size={16} />
            Add New Reminder Rule
          </button>
        </div>

        {/* Right Column - Editor Form */}
        <div className="card flex flex-col" style={{ flex: 1, padding: 0, overflow: 'hidden' }}>
          {editingRule ? (
            <div className="flex flex-col h-full">
              {/* Form Header */}
              <div style={{
                padding: '1.5rem',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'between',
                alignItems: 'center'
              }} className="justify-between">
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-color)' }}>
                    Editing: {editingRule.name}
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Last updated: {editingRule.lastUpdated}
                  </p>
                </div>
                
                {/* Active Status Switch */}
                <div className="flex items-center gap-3">
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary-color)' }}>
                    Active Status
                  </span>
                  
                  {/* Switch toggle markup */}
                  <label style={{
                    position: 'relative',
                    display: 'inline-block',
                    width: '44px',
                    height: '24px',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={editingRule.active}
                      onChange={(e) => handleFieldChange('active', e.target.checked)}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span style={{
                      position: 'absolute',
                      top: 0, left: 0, right: 0, bottom: 0,
                      backgroundColor: editingRule.active ? '#262E52' : '#CBD5E1',
                      transition: '0.3s',
                      borderRadius: '34px'
                    }}>
                      <span style={{
                        position: 'absolute',
                        content: '',
                        height: '18px',
                        width: '18px',
                        left: editingRule.active ? '22px' : '3px',
                        bottom: '3px',
                        backgroundColor: '#FFFFFF',
                        transition: '0.3s',
                        borderRadius: '50%',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                      }} />
                    </span>
                  </label>
                </div>
              </div>

              {/* Form Content */}
              <div style={{ padding: '1.5rem', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Rule Name Field */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-color)', marginBottom: '0.5rem' }}>
                    Rule Name
                  </label>
                  <input
                    type="text"
                    value={editingRule.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    className="form-input"
                    style={{ width: '100%', padding: '0.625rem 1rem', fontSize: '0.9rem', backgroundColor: '#FFFFFF' }}
                  />
                </div>

                {/* Rule Priority Tag Field */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-color)', marginBottom: '0.5rem' }}>
                    Rule Type / Priority Tag
                  </label>
                  <div className="flex gap-3">
                    {['STANDARD', 'CRITICAL', 'URGENT'].map((tagOption) => {
                      const isSelected = editingRule.tag === tagOption;
                      const style = getTagStyle(tagOption);
                      return (
                        <button
                          key={tagOption}
                          type="button"
                          onClick={() => handleFieldChange('tag', tagOption)}
                          style={{
                            ...style,
                            padding: '0.5rem 1rem',
                            borderRadius: '6px',
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: isSelected ? '0 0 0 2px var(--primary-color)' : 'none',
                            opacity: isSelected ? 1 : 0.6
                          }}
                        >
                          {tagOption}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Message Template textarea */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-color)', marginBottom: '0.5rem' }}>
                    Message Template
                  </label>
                  <textarea
                    rows={4}
                    value={editingRule.messageTemplate}
                    onChange={(e) => handleFieldChange('messageTemplate', e.target.value)}
                    className="form-input"
                    style={{
                      width: '100%',
                      padding: '1rem',
                      fontFamily: 'inherit',
                      fontSize: '0.9rem',
                      lineHeight: '1.5',
                      height: '120px',
                      resize: 'vertical',
                      backgroundColor: '#FFFFFF'
                    }}
                    placeholder="Write the message template text here..."
                  />
                </div>

                {/* Notification Channels checkboxes */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-color)', marginBottom: '0.5rem' }}>
                    Notification Channels
                  </label>
                  <div className="flex flex-col gap-3">
                    
                    {/* General Chat Option */}
                    <div
                      onClick={() => handleChannelToggle('general')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'between',
                        padding: '1rem',
                        borderRadius: '8px',
                        border: editingRule.channels?.includes('general') ? '2px solid #262E52' : '1px solid var(--border-color)',
                        backgroundColor: '#FFFFFF',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      className="justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={editingRule.channels?.includes('general')}
                          onChange={() => {}} // handled by parent div click
                          style={{ accentColor: '#262E52', width: '16px', height: '16px' }}
                        />
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '6px',
                          backgroundColor: '#F1F5F9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#262E52'
                        }}>
                          <Users size={16} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--primary-color)' }}>General Chat</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                            {editingRule.channels?.includes('general') ? 'ENABLED' : 'ENABLE CHANNEL'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Personal Message Option */}
                    <div
                      onClick={() => handleChannelToggle('personal')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'between',
                        padding: '1rem',
                        borderRadius: '8px',
                        border: editingRule.channels?.includes('personal') ? '2px solid #262E52' : '1px solid var(--border-color)',
                        backgroundColor: '#FFFFFF',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      className="justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={editingRule.channels?.includes('personal')}
                          onChange={() => {}} // handled by parent div click
                          style={{ accentColor: '#262E52', width: '16px', height: '16px' }}
                        />
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '6px',
                          backgroundColor: '#F1F5F9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#262E52'
                        }}>
                          <MessageSquare size={16} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--primary-color)' }}>Personal Message to Consultant</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                            {editingRule.channels?.includes('personal') ? 'ENABLED' : 'ENABLE CHANNEL'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Email Option */}
                    <div
                      onClick={() => handleChannelToggle('email')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'between',
                        padding: '1rem',
                        borderRadius: '8px',
                        border: editingRule.channels?.includes('email') ? '2px solid #262E52' : '1px solid var(--border-color)',
                        backgroundColor: '#FFFFFF',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      className="justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={editingRule.channels?.includes('email')}
                          onChange={() => {}} // handled by parent div click
                          style={{ accentColor: '#262E52', width: '16px', height: '16px' }}
                        />
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '6px',
                          backgroundColor: '#F1F5F9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#262E52'
                        }}>
                          <Mail size={16} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--primary-color)' }}>Email</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                            {editingRule.channels?.includes('email') ? 'ENABLED' : 'ENABLE CHANNEL'}
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Scheduling Logic inputs */}
                <div className="flex gap-6">
                  {/* Relative Day J+X */}
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-color)', marginBottom: '0.5rem' }}>
                      Scheduling Logic
                    </label>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                      Relative Day (J+X)
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                      <input
                        type="number"
                        value={editingRule.relativeDay}
                        onChange={(e) => handleFieldChange('relativeDay', parseInt(e.target.value, 10))}
                        className="form-input"
                        style={{ width: '100%', padding: '0.625rem 1rem', fontSize: '0.9rem', backgroundColor: '#FFFFFF' }}
                        placeholder="e.g. 5"
                      />
                      <span style={{
                        position: 'absolute',
                        right: '35px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: 'var(--text-light)'
                      }}>
                        ({formatRelativeDayLabel(editingRule.relativeDay)})
                      </span>
                    </div>
                  </div>

                  {/* Time of Day */}
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-color)', marginBottom: '0.5rem', visibility: 'hidden' }}>
                      Time of Day
                    </label>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                      Time of Day (Local)
                    </div>
                    <input
                      type="time"
                      value={editingRule.timeOfDay}
                      onChange={(e) => handleFieldChange('timeOfDay', e.target.value)}
                      className="form-input"
                      style={{ width: '100%', padding: '0.625rem 1rem', fontSize: '0.9rem', backgroundColor: '#FFFFFF', height: '40px' }}
                    />
                  </div>
                </div>
              </div>

              {/* Form Footer Buttons */}
              <div style={{
                padding: '1.25rem 1.5rem',
                borderTop: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '1rem',
                backgroundColor: '#F8FAFC'
              }}>
                <button
                  onClick={handleDiscard}
                  className="btn"
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid var(--border-color)',
                    color: 'var(--primary-color)',
                    fontWeight: 600,
                    padding: '0.625rem 1.25rem',
                    fontSize: '0.875rem',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Discard Changes
                </button>
                <button
                  onClick={handleSave}
                  className="btn btn-primary"
                  style={{
                    backgroundColor: '#262E52',
                    color: '#FFFFFF',
                    border: 'none',
                    fontWeight: 600,
                    padding: '0.625rem 1.5rem',
                    fontSize: '0.875rem',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Save Rule Configuration
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyCenter: 'center', height: '100%', color: 'var(--text-muted)' }} className="justify-center">
              Please select a rule to configure.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
