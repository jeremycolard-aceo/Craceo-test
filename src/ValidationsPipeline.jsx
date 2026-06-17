import { useState, useEffect } from 'react';
import { MoreHorizontal, Paperclip, Save, FileText, Send, Eye, EyeOff, BellOff, Phone, Mail } from 'lucide-react';

const MONTHS_FR = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

// Relative time formatter helper
const formatTimeAgo = (timestamp) => {
  if (!timestamp) return "Update just now";
  const diffMs = Date.now() - timestamp;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Update just now";
  if (diffMins < 60) return `Update ${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `Update ${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `Update ${diffDays}d ago`;
};

// Check if a client assignment is active in the month of the consultant's card (updatedAt)
const isClientActiveInMonth = (consultant, client) => {
  const ass = consultant.assignments?.find(a => a.id === client.id);
  if (!ass) return false;
  
  const cardDate = new Date(consultant.updatedAt || Date.now());
  const startOfMonth = new Date(cardDate.getFullYear(), cardDate.getMonth(), 1);
  const endOfMonth = new Date(cardDate.getFullYear(), cardDate.getMonth() + 1, 0, 23, 59, 59, 999);
  
  const assStart = new Date(ass.startDate);
  const assEnd = ass.endDate ? new Date(ass.endDate) : null;
  
  return assStart <= endOfMonth && (!assEnd || assEnd >= startOfMonth);
};

export default function ValidationsPipeline({ 
  consultants, 
  updateConsultant,
  filteredConsultants, 
  onOpenFilter,
  handleUndo,
  addNotification
}) {
  const [selectedClient, setSelectedClient] = useState(null); // Local copy of client being edited
  const [selectedConsultant, setSelectedConsultant] = useState(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [validationModal, setValidationModal] = useState({ isOpen: false, consultant: null });
  const [activeCardMenu, setActiveCardMenu] = useState(null); // ID of active 3-dots menu
  const [previewingFile, setPreviewingFile] = useState(null); // Document preview state
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [bulkSelectedIds, setBulkSelectedIds] = useState([]);
  const [bulkValidationModalOpen, setBulkValidationModalOpen] = useState(false);
  const getCurrentMonthString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthString());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(new Date().getFullYear());

  const getSelectedMonthLabel = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    if (!year || !month || month < 1 || month > 12) return selectedMonth;
    return `${MONTHS_FR[month - 1]} ${year}`;
  };

  const [showArchives, setShowArchives] = useState(false);

  const handleBulkValidateConfirm = () => {
    const selectedConsultants = bulkSelectedIds
      .map(id => consultants.find(con => con.id === id))
      .filter(Boolean);

    if (selectedConsultants.length === 1) {
      const con = selectedConsultants[0];
      const employeeName = `${con.firstname} ${con.name}`;
      addNotification(
        'final',
        'Validation Confirmed',
        `The complete workflow for **${employeeName}** has been validated by **Marie Dubois**.`,
        employeeName,
        'Marie Dubois'
      );
    } else if (selectedConsultants.length > 1) {
      const count = selectedConsultants.length;
      const names = selectedConsultants.map(con => `${con.firstname} ${con.name}`);
      addNotification(
        'final',
        'Validation Confirmed',
        `The complete workflow for **${count}** consultants has been validated by **Marie Dubois**.`,
        names.join(', '),
        'Marie Dubois',
        { consultantsList: names }
      );
    }

    bulkSelectedIds.forEach(id => {
      updateConsultant(id, { archived: true });
    });
    setBulkSelectedIds([]);
    setIsBulkMode(false);
    setBulkValidationModalOpen(false);
  };

  // Force re-renders for live relative time updates
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 30000); // Rerender every 30s
    return () => clearInterval(interval);
  }, []);

  const handleClientClick = (consultant, client) => {
    setSelectedConsultant(consultant);
    setSelectedClient({ ...client });
  };

  const closePanel = () => {
    setSelectedClient(null);
    setSelectedConsultant(null);
  };

  const handleClientFieldChange = (field, value) => {
    setSelectedClient(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateClientPO = (poUploaded, fileName = "", fileUrl = "") => {
    setSelectedClient(prev => ({
      ...prev,
      poUploaded,
      poFileName: fileName,
      poFileUrl: fileUrl
    }));
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDraggingFile(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const fileUrl = URL.createObjectURL(file);
      updateClientPO(true, file.name, fileUrl);
    } else {
      updateClientPO(true, "invoice_po.pdf", "");
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const fileUrl = URL.createObjectURL(file);
      updateClientPO(true, file.name, fileUrl);
    }
  };

  const handleSaveChanges = () => {
    if (!selectedClient.poNumber || !selectedClient.poNumber.trim()) {
      alert("Le champ PURCHASE ORDER NUMBER (Numéro de commande) est obligatoire.");
      return;
    }
    if (selectedConsultant && selectedClient) {
      updateConsultant(selectedConsultant.id, (c) => ({
        clients: c.clients.map(cli => 
          cli.id === selectedClient.id ? selectedClient : cli
        )
      }));
    }
    closePanel();
  };

  const handleMarkAsSend = () => {
    if (!selectedClient.poNumber || !selectedClient.poNumber.trim()) {
      alert("Le champ PURCHASE ORDER NUMBER (Numéro de commande) est obligatoire.");
      return;
    }
    if (selectedConsultant && selectedClient) {
      const updatedClient = {
        ...selectedClient,
        sent: true
      };
      const employeeName = `${selectedConsultant.firstname} ${selectedConsultant.name}`;
      addNotification(
        'billing',
        'Action Confirmed',
        `Invoice for **${selectedClient.name}** has been marked as sent by **Marie Dubois** for **${employeeName}**.`,
        employeeName,
        'Marie Dubois'
      );
      updateConsultant(selectedConsultant.id, (c) => ({
        clients: c.clients.map(cli => 
          cli.id === selectedClient.id ? updatedClient : cli
        )
      }));
    }
    closePanel();
  };

  // Toggle CRA validation status
  const handleToggleCRAValidation = (consultantId, craId) => {
    const consultant = consultants.find(con => con.id === consultantId);
    const cra = consultant?.cras?.find(c => c.id === craId);
    if (consultant && cra) {
      const willBeValidated = !cra.validated;
      const employeeName = `${consultant.firstname} ${consultant.name}`;
      const monthStr = new Date(consultant.updatedAt || 0).toLocaleString('en-US', { month: 'long' });
      const message = willBeValidated 
        ? `The CRA **${cra.name}** for **${monthStr}** has been validated by **Marie Dubois** for **${employeeName}**.`
        : `The CRA **${cra.name}** for **${monthStr}** has been unvalidated for correction by **Marie Dubois** for **${employeeName}**.`;
      addNotification(
        'cra',
        willBeValidated ? 'CRA Validated' : 'Validation Revoked',
        message,
        employeeName,
        'Marie Dubois'
      );
    }
    updateConsultant(consultantId, (c) => ({
      cras: c.cras.map(cra => 
        cra.id === craId ? { ...cra, validated: !cra.validated } : cra
      )
    }));
  };

  // Open final validation modal
  const handleCardClick = (consultant) => {
    setValidationModal({
      isOpen: true,
      consultant
    });
  };

  const handleValidateConfirm = () => {
    if (validationModal.consultant) {
      const employeeName = `${validationModal.consultant.firstname} ${validationModal.consultant.name}`;
      addNotification(
        'final',
        'Validation Confirmed',
        `The complete workflow for **${employeeName}** has been validated by **Marie Dubois**.`,
        employeeName,
        'Marie Dubois'
      );
      updateConsultant(validationModal.consultant.id, { archived: true });
    }
    setValidationModal({ isOpen: false, consultant: null });
  };

  // Filter by selected month/year (input type="month")
  const monthFilteredConsultants = filteredConsultants.filter(c => {
    const cardDate = new Date(c.updatedAt || 0);
    
    const [targetYear, targetMonth] = selectedMonth.split('-').map(Number);
    
    return cardDate.getFullYear() === targetYear && (cardDate.getMonth() + 1) === targetMonth;
  });

  // Classify consultants into pipeline columns
  const craConsultants = monthFilteredConsultants.filter(c => 
    c.status === 'Active' &&
    !c.archived && 
    c.cras && 
    c.cras.length > 0 && 
    c.cras.some(cra => !cra.validated)
  );

  // Moves to Billing if all CRAs are validated AND at least one ACTIVE client invoice is NOT sent yet
  const billingConsultants = monthFilteredConsultants.filter(c => {
    if (c.status !== 'Active') return false;
    if (c.archived) return false;
    const allCrasValidated = !c.cras || c.cras.length === 0 || c.cras.every(cra => cra.validated);
    if (!allCrasValidated) return false;
    
    const activeClients = c.clients ? c.clients.filter(cli => isClientActiveInMonth(c, cli)) : [];
    return activeClients.length > 0 && activeClients.some(cli => !cli.sent);
  });

  // Moves to Validation if all CRAs are validated AND all ACTIVE client invoices are sent
  const validationConsultants = monthFilteredConsultants.filter(c => {
    if (c.status !== 'Active') return false;
    if (c.archived && !showArchives) return false;
    if (c.archived) return true;
    const allCrasValidated = !c.cras || c.cras.length === 0 || c.cras.every(cra => cra.validated);
    if (!allCrasValidated) return false;
    
    const activeClients = c.clients ? c.clients.filter(cli => isClientActiveInMonth(c, cli)) : [];
    return activeClients.length === 0 || activeClients.every(cli => cli.sent);
  });

  return (
    <div className="page-content flex flex-col h-full">
      <div className="page-header flex justify-between items-center mb-6">
        <div>
          <h1 className="page-title">Timesheet And Invoice Validations</h1>
          <p className="text-muted text-sm mt-2">Review and manage consultant timesheets across billing stages.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Date:</span>
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => {
                  const [year] = selectedMonth.split('-').map(Number);
                  setPickerYear(year || new Date().getFullYear());
                  setIsDatePickerOpen(!isDatePickerOpen);
                }}
                className="form-input"
                style={{
                  width: '160px',
                  padding: '6px 12px',
                  fontSize: '0.875rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--surface-color)',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                  height: '38px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span>{getSelectedMonthLabel()}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-light)' }}>▼</span>
              </button>
              
              {isDatePickerOpen && (
                <>
                  <div 
                    style={{ position: 'fixed', inset: 0, zIndex: 99 }} 
                    onClick={() => setIsDatePickerOpen(false)}
                  />
                  <div 
                    style={{
                      position: 'absolute',
                      top: '42px',
                      right: 0,
                      backgroundColor: '#FFFFFF',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                      padding: '1rem',
                      zIndex: 100,
                      width: '280px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', fontWeight: 'bold' }}>
                      <button 
                        type="button"
                        className="btn btn-outline" 
                        style={{ padding: '2px 8px', height: '28px', minWidth: '28px', border: '1px solid var(--border-color)' }} 
                        onClick={() => setPickerYear(y => y - 1)}
                      >
                        &lt;
                      </button>
                      <span style={{ color: 'var(--primary-color)' }}>{pickerYear}</span>
                      <button 
                        type="button"
                        className="btn btn-outline" 
                        style={{ padding: '2px 8px', height: '28px', minWidth: '28px', border: '1px solid var(--border-color)' }} 
                        onClick={() => setPickerYear(y => y + 1)}
                      >
                        &gt;
                      </button>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                      {MONTHS_FR.map((m, idx) => {
                        const monthVal = String(idx + 1).padStart(2, '0');
                        const targetVal = `${pickerYear}-${monthVal}`;
                        const isSelected = selectedMonth === targetVal;
                        return (
                          <button
                            key={idx}
                            type="button"
                            style={{
                              padding: '6px 4px',
                              fontSize: '0.75rem',
                              backgroundColor: isSelected ? 'var(--primary-color)' : 'transparent',
                              color: isSelected ? '#FFFFFF' : 'var(--text-main)',
                              border: isSelected ? 'none' : '1px solid var(--border-color)',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontWeight: isSelected ? 'bold' : 'normal'
                            }}
                            onClick={() => {
                              setSelectedMonth(targetVal);
                              setIsDatePickerOpen(false);
                            }}
                          >
                            {m.substring(0, 4)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <button className="btn btn-outline" onClick={onOpenFilter} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', height: '38px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sliders-horizontal"><line x1="21" x2="14" y1="4" y2="4"/><line x1="10" x2="3" y1="4" y2="4"/><line x1="21" x2="6" x2="6" y1="12" y2="12"/><line x1="2" x2="3" y1="12" y2="12"/><line x1="21" x2="16" y1="20" y2="20"/><line x1="12" x2="3" y1="20" y2="20"/><line x1="14" x2="14" y1="2" y2="6"/><line x1="6" x2="6" y1="10" y2="14"/><line x1="16" x2="16" y1="18" y2="22"/></svg>
            Filter
          </button>
        </div>
      </div>

      <div className="kanban-board">
        {/* Column 1: CRAs */}
        <div className="kanban-column">
          <div className="kanban-header">
            <span style={{ color: '#94A3B8' }}>●</span> CRAs
          </div>
          <div className="kanban-cards">
            {craConsultants.map(c => (
              <div key={`cra-${c.id}`} className="kanban-card">
                <div className="flex justify-between items-center" style={{ marginBottom: '1.25rem', position: 'relative' }}>
                  <h3 className="m-0 font-bold" style={{ color: 'var(--primary-color)', display: 'flex', alignItems: 'center' }}>
                    {c.firstname} {c.name}
                    {c.muted && (
                      <BellOff 
                        size={14} 
                        className="text-slate-400" 
                        style={{ marginLeft: '6px', verticalAlign: 'middle' }} 
                        title="Reminders muted"
                      />
                    )}
                    {c.external && (
                      <span 
                        style={{ 
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: '#E0F2FE',
                          color: '#0369A1',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          marginLeft: '6px',
                          verticalAlign: 'middle'
                        }}
                        title="External Consultant"
                      >
                        E
                      </span>
                    )}
                  </h3>
                  <MoreHorizontal 
                    className="text-light cursor-pointer hover:text-primary" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveCardMenu(activeCardMenu === c.id ? null : c.id);
                    }} 
                  />
                  {activeCardMenu === c.id && (
                    <>
                      <div className="dropdown-overlay" onClick={(e) => { e.stopPropagation(); setActiveCardMenu(null); }}></div>
                      <div className="card-dropdown" style={{ right: 0, top: '24px' }}>
                        <button 
                          className="dropdown-item" 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            handleUndo(c.id); 
                            setActiveCardMenu(null); 
                          }}
                          disabled={!c.history || c.history.length === 0}
                        >
                          ↩ Undo Last Action
                        </button>
                        <button 
                          className="dropdown-item" 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            updateConsultant(c.id, { muted: !c.muted }); 
                            setActiveCardMenu(null); 
                          }}
                        >
                          {c.muted ? '🔔 Reactivate Reminders' : '🔕 Mute CRA Reminders'}
                        </button>
                      </div>
                    </>
                  )}
                </div>
                <div className="flex gap-2 mb-4 flex-wrap">
                  {c.cras.map(cra => (
                    <span 
                      key={cra.id} 
                      className={`badge cursor-pointer ${cra.validated ? 'badge-validated' : 'badge-unvalidated'}`}
                      onClick={() => handleToggleCRAValidation(c.id, cra.id)}
                      title={cra.validated ? "Click to invalidate" : "Click to validate"}
                    >
                      {cra.validated ? '✓ ' : ''}{cra.name}
                    </span>
                  ))}
                </div>
                <div className="flex justify-between items-center text-xs text-muted">
                  <div className="avatar" style={{ width: '24px', height: '24px', fontSize: '10px' }}>{c.initials}</div>
                  <span className="font-semibold text-light">{formatTimeAgo(c.updatedAt)}</span>
                </div>
              </div>
            ))}
            {craConsultants.length === 0 && (
              <div className="text-xs text-center text-muted p-4">No CRAs pending validation.</div>
            )}
          </div>
        </div>

        {/* Column 2: Billing */}
        <div className="kanban-column">
          <div className="kanban-header">
            <span style={{ color: 'var(--accent-color)' }}>●</span> Billing
          </div>
          <div className="kanban-cards">
            {billingConsultants.map(c => (
              <div key={`bill-${c.id}`} className="kanban-card">
                <div className="flex justify-between items-center" style={{ marginBottom: '1.25rem', position: 'relative' }}>
                  <h3 className="m-0 font-bold" style={{ color: 'var(--primary-color)', display: 'flex', alignItems: 'center' }}>
                    {c.firstname} {c.name}
                    {c.muted && (
                      <BellOff 
                        size={14} 
                        className="text-slate-400" 
                        style={{ marginLeft: '6px', verticalAlign: 'middle' }} 
                        title="Reminders muted"
                      />
                    )}
                    {c.external && (
                      <span 
                        style={{ 
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: '#E0F2FE',
                          color: '#0369A1',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          marginLeft: '6px',
                          verticalAlign: 'middle'
                        }}
                        title="External Consultant"
                      >
                        E
                      </span>
                    )}
                  </h3>
                  <MoreHorizontal 
                    className="text-light cursor-pointer hover:text-primary" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveCardMenu(activeCardMenu === c.id ? null : c.id);
                    }} 
                  />
                  {activeCardMenu === c.id && (
                    <>
                      <div className="dropdown-overlay" onClick={(e) => { e.stopPropagation(); setActiveCardMenu(null); }}></div>
                      <div className="card-dropdown" style={{ right: 0, top: '24px' }}>
                        <button 
                          className="dropdown-item" 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            handleUndo(c.id); 
                            setActiveCardMenu(null); 
                          }}
                          disabled={!c.history || c.history.length === 0}
                        >
                          ↩ Undo Last Action
                        </button>
                      </div>
                    </>
                  )}
                </div>
                <div className="flex gap-2 mb-4 flex-wrap">
                  {c.clients.filter(client => isClientActiveInMonth(c, client)).map(client => {
                    let badgeClass = "badge-po-pending";
                    let prefix = "";
                    let title = "PO pending. Click to upload/send.";
                    if (client.sent) {
                      badgeClass = "badge-po-uploaded";
                      prefix = "✓ ";
                      title = "Sent / Validated. Click to edit.";
                    } else if (client.poUploaded) {
                      badgeClass = "badge-blue";
                      prefix = "📄 ";
                      title = "PO Uploaded. Click to mark as sent.";
                    }
                    
                    return (
                      <span 
                        key={client.id} 
                        className={`badge cursor-pointer ${badgeClass}`}
                        onClick={() => handleClientClick(c, client)}
                        title={title}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        {prefix}{client.name}
                        {client.muted && <BellOff size={10} style={{ color: 'inherit' }} title="Project reminders muted" />}
                      </span>
                    );
                  })}
                </div>
                <div className="flex justify-between items-center text-xs text-muted">
                  <div className="avatar" style={{ width: '24px', height: '24px', fontSize: '10px', backgroundColor: '#64748B' }}>{c.initials}</div>
                  <span className="font-semibold text-light">{formatTimeAgo(c.updatedAt)}</span>
                </div>
              </div>
            ))}
            {billingConsultants.length === 0 && (
              <div className="text-xs text-center text-muted p-4">No clients pending PO billing.</div>
            )}
          </div>
        </div>

        {/* Column 3: Validation */}
        <div className="kanban-column">
          <div className="kanban-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#10B981' }}>●</span> Validation
              <button
                className="btn-icon"
                style={{
                  padding: '2px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: showArchives ? 'var(--primary-color)' : 'var(--text-light)',
                  marginLeft: '4px'
                }}
                onClick={() => setShowArchives(!showArchives)}
                title={showArchives ? "Hide validated cards (Archives)" : "Show validated cards (Archives)"}
              >
                {showArchives ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            </div>
            {validationConsultants.filter(c => !c.archived).length > 0 && (
              <button 
                className="btn btn-outline" 
                style={{ padding: '4px 8px', fontSize: '0.75rem', height: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}
                onClick={() => {
                  setIsBulkMode(!isBulkMode);
                  setBulkSelectedIds([]);
                }}
              >
                {isBulkMode ? 'Cancel' : 'Bulk Validate'}
              </button>
            )}
          </div>

          {isBulkMode && validationConsultants.filter(c => !c.archived).length > 0 && (
            <div className="bulk-control-bar" style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              padding: '10px',
              marginBottom: '10px',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '6px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 500 }}>
                  <input 
                    type="checkbox"
                    checked={bulkSelectedIds.length === validationConsultants.filter(c => !c.archived).length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setBulkSelectedIds(validationConsultants.filter(c => !c.archived).map(c => c.id));
                      } else {
                        setBulkSelectedIds([]);
                      }
                    }}
                    style={{ cursor: 'pointer' }}
                  />
                  Select All
                </label>
                <span className="font-semibold" style={{ color: 'var(--text-muted)' }}>
                  {bulkSelectedIds.length} / {validationConsultants.filter(c => !c.archived).length} selected
                </span>
              </div>
              <button
                className="btn btn-primary"
                style={{
                  padding: '6px 12px',
                  fontSize: '0.75rem',
                  backgroundColor: 'var(--success-color)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: bulkSelectedIds.length > 0 ? 'pointer' : 'not-allowed',
                  opacity: bulkSelectedIds.length > 0 ? 1 : 0.6,
                  fontWeight: 600,
                  width: '100%'
                }}
                disabled={bulkSelectedIds.length === 0}
                onClick={() => setBulkValidationModalOpen(true)}
              >
                Validate Selected
              </button>
            </div>
          )}

          <div className="kanban-cards">
            {validationConsultants.map(c => (
              <div 
                key={`val-${c.id}`} 
                className={`kanban-card validation-ready ${isBulkMode && bulkSelectedIds.includes(c.id) ? 'bulk-selected' : ''}`}
                onClick={() => {
                  if (c.archived) return;
                  if (isBulkMode) {
                    setBulkSelectedIds(prev => 
                      prev.includes(c.id) ? prev.filter(id => id !== c.id) : [...prev, c.id]
                    );
                  } else {
                    handleCardClick(c);
                  }
                }}
                title={c.archived ? "Archived consultant" : (isBulkMode ? "Click to toggle selection" : "Click to validate definitively")}
                style={{ 
                  position: 'relative',
                  border: c.archived 
                    ? '1px dashed #94a3b8' 
                    : (isBulkMode && bulkSelectedIds.includes(c.id) ? '2px solid var(--success-color)' : '1px solid var(--border-color)'),
                  backgroundColor: c.archived
                    ? '#f8fafc'
                    : (isBulkMode && bulkSelectedIds.includes(c.id) ? 'rgba(16, 185, 129, 0.03)' : ''),
                  cursor: c.archived ? 'default' : 'pointer',
                  opacity: c.archived ? 0.75 : 1
                }}
              >
                <div className="flex justify-between items-center mb-3" style={{ position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                    {isBulkMode && !c.archived && (
                      <input 
                        type="checkbox"
                        checked={bulkSelectedIds.includes(c.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          setBulkSelectedIds(prev => 
                            prev.includes(c.id) ? prev.filter(id => id !== c.id) : [...prev, c.id]
                          );
                        }}
                        style={{ cursor: 'pointer', width: '16px', height: '16px', flexShrink: 0 }}
                      />
                    )}
                    <h3 className="m-0 font-bold" style={{ color: 'var(--primary-color)', display: 'flex', alignItems: 'center', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {c.firstname} {c.name}
                      {c.muted && (
                        <BellOff 
                          size={14} 
                          className="text-slate-400" 
                          style={{ marginLeft: '6px', verticalAlign: 'middle' }} 
                          title="Reminders muted"
                        />
                      )}
                      {c.external && (
                        <span 
                          style={{ 
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#E0F2FE',
                            color: '#0369A1',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            marginLeft: '6px',
                            verticalAlign: 'middle',
                            flexShrink: 0
                          }}
                          title="External Consultant"
                        >
                          E
                        </span>
                      )}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {c.archived ? (
                      <span className="badge" style={{ backgroundColor: 'rgba(148, 163, 184, 0.1)', color: '#64748B' }}>Archived</span>
                    ) : (
                      <span className="badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success-color)' }}>Ready</span>
                    )}
                    {!isBulkMode && (
                      <MoreHorizontal 
                        className="text-light cursor-pointer hover:text-primary" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveCardMenu(activeCardMenu === c.id ? null : c.id);
                        }} 
                      />
                    )}
                  </div>
                  {activeCardMenu === c.id && (
                    <>
                      <div className="dropdown-overlay" onClick={(e) => { e.stopPropagation(); setActiveCardMenu(null); }}></div>
                      <div className="card-dropdown" style={{ right: 0, top: '24px' }}>
                        <button 
                          className="dropdown-item" 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            handleUndo(c.id); 
                            setActiveCardMenu(null); 
                          }}
                          disabled={!c.history || c.history.length === 0}
                        >
                          ↩ Undo Last Action
                        </button>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="text-xs text-muted mb-3">
                  {c.cras && c.cras.length > 0 && <div className="mb-1">✓ {c.cras.length} CRA(s) verified</div>}
                  {c.clients && c.clients.filter(cli => isClientActiveInMonth(c, cli)).length > 0 && (
                    <div>✓ {c.clients.filter(cli => isClientActiveInMonth(c, cli)).length} PO(s) sent</div>
                  )}
                </div>

                <div className="flex justify-between items-center text-xs text-muted">
                  <div className="avatar" style={{ width: '24px', height: '24px', fontSize: '10px' }}>{c.initials}</div>
                  <span className="font-semibold text-light">{formatTimeAgo(c.updatedAt)}</span>
                </div>
              </div>
            ))}
            {validationConsultants.length === 0 && (
              <div className="text-xs text-center text-muted p-4">No cards ready for validation.</div>
            )}
          </div>
        </div>
      </div>

      {/* Side Panel for Billing Edition */}
      {selectedClient && (
        <>
          <div className="side-panel-overlay" onClick={closePanel}></div>
          <div className="side-panel">
            <div className="panel-header">
              <div className="flex items-center gap-5">
                <div className="avatar" style={{ backgroundColor: '#F4F5F7', color: 'var(--primary-color)', width: '48px', height: '48px' }}>
                  {selectedConsultant?.initials}
                </div>
                <div>
                  <h3 className="m-0 font-bold" style={{ color: 'var(--primary-color)', fontSize: '1.25rem' }}>{selectedConsultant?.firstname} {selectedConsultant?.name}</h3>
                  <p className="m-0 text-sm text-muted">{selectedConsultant?.role}</p>
                </div>
              </div>
              <button className="btn-text text-light" onClick={closePanel} style={{ fontSize: '1.5rem' }}>&times;</button>
            </div>
            
            <div className="panel-body">
              <h4 className="font-bold mb-4" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
                <span style={{ width: '4px', height: '16px', backgroundColor: 'var(--accent-color)', display: 'inline-block' }}></span>
                Billing & Contact Information
              </h4>
              
              <div className="tabs">
                {selectedConsultant?.clients.map(client => (
                  <div 
                    key={client.id} 
                    className={`tab ${selectedClient.id === client.id ? 'active' : ''}`}
                    onClick={() => {
                      if (selectedClient.id !== client.id) {
                        const newClient = selectedConsultant.clients.find(cli => cli.id === client.id);
                        setSelectedClient({ ...newClient });
                      }
                    }}
                  >
                    {client.name}
                  </div>
                ))}
              </div>

              <div className="card" style={{ border: '1px solid var(--border-color)', boxShadow: 'none' }}>
                <div className="card-body">
                  <div className="flex justify-between items-center mb-6">
                    <div style={{ width: '32px', height: '32px', backgroundColor: 'var(--primary-color)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span className="text-white" style={{ fontSize: '10px' }}>📄</span>
                    </div>
                    <span className="badge font-bold text-xs" style={{ backgroundColor: 'transparent', color: 'var(--text-main)' }}><Paperclip size={12} className="inline ml-1" /></span>
                  </div>

                  <div className="form-group">
                    <label className="form-label">CLIENT NAME</label>
                    <input type="text" className="form-input" value={selectedClient.name} readOnly style={{ backgroundColor: 'var(--bg-color)' }} />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">BILLING CYCLE</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={selectedClient.billingCycle || ''} 
                      readOnly
                      style={{ backgroundColor: 'var(--bg-color)' }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>BILLING CONTACTS</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '0.5rem' }}>
                      {(selectedClient.billingContacts || (selectedClient.managerName ? [{
                        name: selectedClient.managerName,
                        email: selectedClient.managerEmail || selectedClient.billingManagers?.[0] || "",
                        phone: selectedClient.phone || ""
                      }] : [])).map((contact, idx) => (
                        <div 
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px 16px',
                            backgroundColor: '#F8FAFC',
                            border: '1px solid #E2E8F0',
                            borderRadius: '8px',
                          }}
                        >
                          <span style={{ fontWeight: 500, fontSize: '0.9rem', color: '#1E293B' }}>
                            {contact.name || 'Unnamed Contact'}
                          </span>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {contact.phone && (
                              <div className="tooltip-container" style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                                <Phone size={14} style={{ color: '#475569' }} />
                                <div 
                                  className="tooltip-text" 
                                  style={{
                                    visibility: 'hidden',
                                    position: 'absolute',
                                    bottom: '125%',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    backgroundColor: '#1E293B',
                                    color: '#FFFFFF',
                                    padding: '6px 10px',
                                    borderRadius: '6px',
                                    whiteSpace: 'nowrap',
                                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                                    zIndex: 10,
                                    opacity: 0,
                                    transition: 'opacity 0.2s',
                                    fontSize: '0.75rem',
                                    pointerEvents: 'none'
                                  }}
                                >
                                  {contact.phone}
                                </div>
                              </div>
                            )}

                            {contact.email && (
                              <div className="tooltip-container" style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                                <Mail size={14} style={{ color: '#475569' }} />
                                <div 
                                  className="tooltip-text" 
                                  style={{
                                    visibility: 'hidden',
                                    position: 'absolute',
                                    bottom: '125%',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    backgroundColor: '#1E293B',
                                    color: '#FFFFFF',
                                    padding: '6px 10px',
                                    borderRadius: '6px',
                                    whiteSpace: 'nowrap',
                                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                                    zIndex: 10,
                                    opacity: 0,
                                    transition: 'opacity 0.2s',
                                    fontSize: '0.75rem',
                                    pointerEvents: 'none'
                                  }}
                                >
                                  {contact.email}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      {(!selectedClient.billingContacts || selectedClient.billingContacts.length === 0) && !selectedClient.managerName && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', fontStyle: 'italic' }}>No contacts found</div>
                      )}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">PURCHASE ORDER NUMBER</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={selectedClient.poNumber || ''} 
                      onChange={(e) => handleClientFieldChange('poNumber', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">ORDER END DATE</label>
                    <input 
                      type="date" 
                      className="form-input" 
                      value={selectedClient.orderEndDate || ''} 
                      onChange={(e) => handleClientFieldChange('orderEndDate', e.target.value)}
                    />
                  </div>

                  <div className="form-group mt-6">
                    <label className="form-label">UPLOAD PURCHASE ORDER</label>
                    {selectedClient.poUploaded ? (
                      <div className="uploaded-file-box">
                        <div className="flex items-center gap-3">
                          <div className="file-icon-wrapper">
                            <FileText size={20} className="text-primary" />
                          </div>
                          <div className="flex-1" style={{ minWidth: 0 }}>
                            <div className="font-bold text-sm text-ellipsis overflow-hidden whitespace-nowrap" style={{ color: 'var(--primary-color)' }}>
                              {selectedClient.poFileName || "purchase_order.pdf"}
                            </div>
                            <div className="text-xs text-success-color font-medium">✓ Uploaded & Linked</div>
                          </div>
                          <button 
                            className="btn btn-outline p-1" 
                            style={{ padding: '6px', minWidth: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '4px' }}
                            title="Preview Document"
                            onClick={() => setPreviewingFile(selectedClient.poFileName || "purchase_order.pdf")}
                          >
                            <Eye size={14} />
                          </button>
                          <button 
                            className="btn btn-outline p-1" 
                            style={{ padding: '6px', minWidth: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '4px' }}
                            title="Download Document"
                            onClick={() => {
                              const fileName = selectedClient.poFileName || "purchase_order.pdf";
                              const fileUrl = selectedClient.poFileUrl;
                              if (fileUrl) {
                                const a = document.createElement('a');
                                a.href = fileUrl;
                                a.download = fileName;
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                              } else {
                                const blob = new Blob(["Mock Invoice/PO File Content for " + fileName], { type: "text/plain" });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = fileName;
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                URL.revokeObjectURL(url);
                              }
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                          </button>
                          <button 
                            className="btn-delete-file"
                            onClick={() => updateClientPO(false, "")}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div 
                        className={`dropzone ${isDraggingFile ? 'active' : ''}`}
                        onDragOver={(e) => { e.preventDefault(); setIsDraggingFile(true); }}
                        onDragLeave={() => setIsDraggingFile(false)}
                        onDrop={handleFileDrop}
                        onClick={() => document.getElementById('po-file-input').click()}
                      >
                        <Paperclip size={24} className="text-muted mb-2 mx-auto" />
                        <p className="m-0 text-sm font-semibold">Click or drag and drop your invoice here</p>
                        <p className="text-xs text-muted mt-1">PDF, PNG, JPG up to 10MB (mock upload)</p>
                        <input 
                          type="file" 
                          id="po-file-input" 
                          style={{ display: 'none' }} 
                          onChange={handleFileSelect} 
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="panel-footer flex-col">
              <button 
                className="btn w-full p-4" 
                style={{ 
                  backgroundColor: selectedClient.sent ? 'var(--success-color)' : '#F97316', 
                  color: '#FFFFFF',
                  fontWeight: 600,
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onClick={handleMarkAsSend}
              >
                <Send size={16} />
                {selectedClient.sent ? 'Validated & Sent' : 'Mark as Send'}
              </button>
              <button className="btn btn-primary w-full p-4" onClick={handleSaveChanges}>
                <Save size={18} /> Save Changes
              </button>
              <button className="btn btn-outline w-full p-4" onClick={closePanel}>
                Cancel
              </button>
            </div>
            
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>CRACEO PORTAL</span>
              <span>Internal Access Only</span>
            </div>
          </div>
        </>
      )}

      {/* Validation Confirmation Custom Modal */}
      {validationModal.isOpen && (
        <div className="modal-overlay" onClick={() => setValidationModal({ isOpen: false, consultant: null })}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Final Timesheet Validation</h3>
              <button 
                className="btn-text text-light text-xl" 
                onClick={() => setValidationModal({ isOpen: false, consultant: null })}
              >
                &times;
              </button>
            </div>
            
            <div className="modal-body">
              <p className="m-0 text-sm text-muted mb-4">
                Are you sure you want to definitively validate timesheets and archive the folder for <strong>{validationModal.consultant?.firstname} {validationModal.consultant?.name}</strong>?
              </p>
              <p className="m-0 text-xs text-light">
                This will complete the validation process and make their card disappear from the validations pipeline.
              </p>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn btn-outline" 
                onClick={() => setValidationModal({ isOpen: false, consultant: null })}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                style={{ backgroundColor: 'var(--success-color)' }}
                onClick={handleValidateConfirm}
              >
                Validate & Archive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Validation Confirmation Modal */}
      {bulkValidationModalOpen && (
        <div className="modal-overlay" onClick={() => setBulkValidationModalOpen(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Bulk Timesheet Validation</h3>
              <button 
                className="btn-text text-light text-xl" 
                onClick={() => setBulkValidationModalOpen(false)}
              >
                &times;
              </button>
            </div>
            
            <div className="modal-body">
              <p className="m-0 text-sm text-muted mb-4">
                Are you sure you want to validate timesheets and archive the folder for the following <strong>{bulkSelectedIds.length} consultant(s)</strong>?
              </p>
              <div style={{
                maxHeight: '150px',
                overflowY: 'auto',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '10px',
                backgroundColor: '#F8FAFC',
                marginBottom: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                {validationConsultants.filter(c => bulkSelectedIds.includes(c.id)).map(c => (
                  <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary-color)' }}>
                    <div className="avatar" style={{ width: '20px', height: '20px', fontSize: '8px' }}>{c.initials}</div>
                    <span>{c.firstname} {c.name}</span>
                  </div>
                ))}
              </div>
              <p className="m-0 text-xs text-light">
                This will validate all selected folders and archive them. This action can be undone individually on each consultant's profile if needed.
              </p>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn btn-outline" 
                onClick={() => setBulkValidationModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                style={{ backgroundColor: 'var(--success-color)' }}
                onClick={handleBulkValidateConfirm}
              >
                Confirm Bulk Validation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mock Document Preview Modal */}
      {previewingFile && (
        <div className="modal-overlay" onClick={() => setPreviewingFile(null)} style={{ zIndex: 1100 }}>
          <div className="modal-container" style={{ maxWidth: '600px', backgroundColor: '#F8FAFC' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ backgroundColor: '#ffffff' }}>
              <h3 className="modal-title flex items-center gap-2">
                <span>📄</span> Document Preview: {previewingFile}
              </h3>
              <button className="btn-text text-light text-xl" onClick={() => setPreviewingFile(null)}>&times;</button>
            </div>
            
            <div className="modal-body" style={{ padding: '2rem' }}>
              {/* Document Sheet layout */}
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '2.5rem',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                fontFamily: 'Courier New, Courier, monospace',
                position: 'relative'
              }}>
                {/* Draft watermark */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%) rotate(-30deg)',
                  fontSize: '3rem',
                  fontWeight: 900,
                  color: 'rgba(239, 68, 68, 0.08)',
                  pointerEvents: 'none',
                  whiteSpace: 'nowrap'
                }}>
                  ACEO DOCUMENT PREVIEW
                </div>

                <div className="flex justify-between items-center mb-6" style={{ borderBottom: '2px solid #262E52', paddingBottom: '1rem' }}>
                  <div>
                    <h2 style={{ color: '#262E52', margin: 0, fontWeight: 700, fontFamily: 'sans-serif' }}>ACEO</h2>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B', fontFamily: 'sans-serif' }}>Timesheet & Billing Portal</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>{previewingFile.toLowerCase().includes('facture') ? 'INVOICE / FACTURE' : 'PURCHASE ORDER'}</p>
                    <p style={{ margin: 0, fontSize: '0.75rem' }}>No: {selectedConsultant?.clients?.find(c => c.poFileName === previewingFile)?.poNumber || "VE-2024-MAINT"}</p>
                  </div>
                </div>

                <div className="flex justify-between mb-6" style={{ fontSize: '0.8rem' }}>
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontWeight: 'bold' }}>From:</p>
                    <p style={{ margin: 0 }}>ACEO SAS</p>
                    <p style={{ margin: 0 }}>12 Rue de la Paix</p>
                    <p style={{ margin: 0 }}>75002 Paris, France</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: '0 0 4px 0', fontWeight: 'bold' }}>To:</p>
                    <p style={{ margin: 0 }}>{selectedClient?.name || "Veolia"}</p>
                    <p style={{ margin: 0 }}>Manager: {selectedClient?.managerName || "Jean-Pierre Lambert"}</p>
                  </div>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', marginTop: '1.5rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #CBD5E1', textAlign: 'left' }}>
                      <th style={{ padding: '8px 0' }}>Description</th>
                      <th style={{ padding: '8px 0', textAlign: 'center' }}>Qty</th>
                      <th style={{ padding: '8px 0', textAlign: 'right' }}>Rate</th>
                      <th style={{ padding: '8px 0', textAlign: 'right' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <td style={{ padding: '8px 0' }}>Prestation Conseil - {selectedConsultant?.role}</td>
                      <td style={{ padding: '8px 0', textAlign: 'center' }}>20 days</td>
                      <td style={{ padding: '8px 0', textAlign: 'right' }}>650.00 €</td>
                      <td style={{ padding: '8px 0', textAlign: 'right' }}>13,000.00 €</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '8px 0' }}>Frais de déplacement client</td>
                      <td style={{ padding: '8px 0', textAlign: 'center' }}>1</td>
                      <td style={{ padding: '8px 0', textAlign: 'right' }}>240.00 €</td>
                      <td style={{ padding: '8px 0', textAlign: 'right' }}>240.00 €</td>
                    </tr>
                  </tbody>
                </table>

                <div style={{ borderTop: '2px solid #E2E8F0', marginTop: '1.5rem', paddingTop: '1rem', textAlign: 'right', fontSize: '0.85rem' }}>
                  <p style={{ margin: '0 0 4px 0' }}>Subtotal: 13,240.00 €</p>
                  <p style={{ margin: '0 0 4px 0' }}>VAT (20%): 2,648.00 €</p>
                  <h3 style={{ margin: 0, color: '#262E52', fontWeight: 'bold' }}>Total: 15,888.00 €</h3>
                </div>
              </div>
            </div>
            
            <div className="modal-footer" style={{ backgroundColor: '#ffffff', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button 
                className="btn btn-outline"
                onClick={() => {
                  const fileName = selectedClient?.poFileName || previewingFile;
                  const fileUrl = selectedClient?.poFileUrl;
                  if (fileUrl) {
                    const a = document.createElement('a');
                    a.href = fileUrl;
                    a.download = fileName;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  } else {
                    const blob = new Blob(["Mock Invoice/PO File Content for " + fileName], { type: "text/plain" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = fileName;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }
                }}
              >
                Download File
              </button>
              <button className="btn btn-primary" onClick={() => setPreviewingFile(null)}>Close Preview</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
