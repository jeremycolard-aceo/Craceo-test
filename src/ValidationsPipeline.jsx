import React, { useState } from 'react';
import { MoreHorizontal, Paperclip, Save, FileText } from 'lucide-react';

export default function ValidationsPipeline({ consultants, setConsultants, filteredConsultants, onOpenFilter }) {
  const [selectedClient, setSelectedClient] = useState(null); // Local copy of client being edited
  const [selectedConsultant, setSelectedConsultant] = useState(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [validationModal, setValidationModal] = useState({ isOpen: false, consultant: null });

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

  const updateClientPO = (poUploaded, fileName = "") => {
    setSelectedClient(prev => ({
      ...prev,
      poUploaded,
      poFileName: fileName
    }));
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDraggingFile(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      updateClientPO(true, file.name);
    } else {
      updateClientPO(true, "invoice_po.pdf");
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      updateClientPO(true, file.name);
    }
  };

  const handleSaveChanges = () => {
    if (selectedConsultant && selectedClient) {
      setConsultants(prev => prev.map(c => {
        if (c.id === selectedConsultant.id) {
          const updatedClients = c.clients.map(cli => 
            cli.id === selectedClient.id ? selectedClient : cli
          );
          return {
            ...c,
            clients: updatedClients
          };
        }
        return c;
      }));
    }
    closePanel();
  };

  // Toggle CRA validation status
  const toggleCRAValidation = (consultantId, craId) => {
    setConsultants(prev => prev.map(c => {
      if (c.id === consultantId) {
        return {
          ...c,
          cras: c.cras.map(cra => 
            cra.id === craId ? { ...cra, validated: !cra.validated } : cra
          )
        };
      }
      return c;
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
      setConsultants(prev => prev.map(c => 
        c.id === validationModal.consultant.id ? { ...c, archived: true } : c
      ));
    }
    setValidationModal({ isOpen: false, consultant: null });
  };

  // Classify consultants into pipeline columns
  const craConsultants = filteredConsultants.filter(c => 
    !c.archived && 
    c.cras && 
    c.cras.length > 0 && 
    c.cras.some(cra => !cra.validated)
  );

  const billingConsultants = filteredConsultants.filter(c => 
    !c.archived && 
    (!c.cras || c.cras.length === 0 || c.cras.every(cra => cra.validated)) && 
    c.clients && 
    c.clients.length > 0 && 
    c.clients.some(cli => !cli.poUploaded)
  );

  const validationConsultants = filteredConsultants.filter(c => 
    !c.archived && 
    (!c.cras || c.cras.length === 0 || c.cras.every(cra => cra.validated)) && 
    (!c.clients || c.clients.length === 0 || c.clients.every(cli => cli.poUploaded))
  );

  return (
    <div className="page-content flex flex-col h-full">
      <div className="page-header flex justify-between items-center mb-6">
        <div>
          <h1 className="page-title">Timesheet Validations</h1>
          <p className="text-muted text-sm mt-2">Review and manage consultant timesheets across billing stages.</p>
        </div>
        <button className="btn btn-outline" onClick={onOpenFilter} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sliders-horizontal"><line x1="21" x2="14" y1="4" y2="4"/><line x1="10" x2="3" y1="4" y2="4"/><line x1="21" x2="6" x2="6" y1="12" y2="12"/><line x1="2" x2="3" y1="12" y2="12"/><line x1="21" x2="16" y1="20" y2="20"/><line x1="12" x2="3" y1="20" y2="20"/><line x1="14" x2="14" y1="2" y2="6"/><line x1="6" x2="6" y1="10" y2="14"/><line x1="16" x2="16" y1="18" y2="22"/></svg>
          Filter
        </button>
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
                <div className="flex justify-between items-center mb-3">
                  <h3 className="m-0 font-bold" style={{ color: 'var(--primary-color)' }}>{c.firstname} {c.name}</h3>
                  <MoreHorizontal className="text-light" size={16} />
                </div>
                <div className="flex gap-2 mb-4 flex-wrap">
                  {c.cras.map(cra => (
                    <span 
                      key={cra.id} 
                      className={`badge cursor-pointer ${cra.validated ? 'badge-validated' : 'badge-unvalidated'}`}
                      onClick={() => toggleCRAValidation(c.id, cra.id)}
                      title={cra.validated ? "Click to invalidate" : "Click to validate"}
                    >
                      {cra.validated ? '✓ ' : ''}{cra.name}
                    </span>
                  ))}
                </div>
                <div className="flex justify-between items-center text-xs text-muted">
                  <div className="avatar" style={{ width: '24px', height: '24px', fontSize: '10px' }}>{c.initials}</div>
                  <span className="font-semibold text-muted">To Validate</span>
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
                <div className="flex justify-between items-center mb-3">
                  <h3 className="m-0 font-bold" style={{ color: 'var(--primary-color)' }}>{c.firstname} {c.name}</h3>
                  <MoreHorizontal className="text-light" size={16} />
                </div>
                <div className="flex gap-2 mb-4 flex-wrap">
                  {c.clients.map(client => (
                    <span 
                      key={client.id} 
                      className={`badge cursor-pointer ${client.poUploaded ? 'badge-po-uploaded' : 'badge-po-pending'}`}
                      onClick={() => handleClientClick(c, client)}
                      title={client.poUploaded ? "PO Uploaded. Click to edit." : "PO Pending. Click to upload."}
                    >
                      {client.poUploaded ? '✓ ' : ''}{client.name}
                    </span>
                  ))}
                </div>
                <div className="flex justify-between items-center text-xs text-muted">
                  <div className="avatar" style={{ width: '24px', height: '24px', fontSize: '10px', backgroundColor: '#64748B' }}>{c.initials}</div>
                  <span className="font-semibold" style={{ color: 'var(--accent-color)' }}>Billing Pending</span>
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
          <div className="kanban-header">
            <span style={{ color: '#10B981' }}>●</span> Validation
          </div>
          <div className="kanban-cards">
            {validationConsultants.map(c => (
              <div 
                key={`val-${c.id}`} 
                className="kanban-card validation-ready"
                onClick={() => handleCardClick(c)}
                title="Click to validate definitively"
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="m-0 font-bold" style={{ color: 'var(--primary-color)' }}>{c.firstname} {c.name}</h3>
                  <span className="badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success-color)' }}>Ready</span>
                </div>
                
                <div className="text-xs text-muted mb-3">
                  {c.cras && c.cras.length > 0 && <div className="mb-1">✓ {c.cras.length} CRA(s) verified</div>}
                  {c.clients && c.clients.length > 0 && <div>✓ {c.clients.length} PO(s) uploaded</div>}
                </div>

                <div className="flex justify-between items-center text-xs text-muted">
                  <div className="avatar" style={{ width: '24px', height: '24px', fontSize: '10px' }}>{c.initials}</div>
                  <span className="font-semibold text-success-color">Click to Validate</span>
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
              <div className="flex items-center gap-4">
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
                    <span className="badge font-bold text-xs" style={{ backgroundColor: 'transparent', color: 'var(--text-main)' }}>ACTIVE ACCOUNT <Paperclip size={12} className="inline ml-1" /></span>
                  </div>

                  <div className="form-group">
                    <label className="form-label">CLIENT NAME</label>
                    <input type="text" className="form-input" value={selectedClient.name} readOnly />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">MANAGER NAME</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={selectedClient.managerName || ''} 
                      onChange={(e) => handleClientFieldChange('managerName', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">BILLING CYCLE</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={selectedClient.billingCycle || ''} 
                      onChange={(e) => handleClientFieldChange('billingCycle', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">MANAGER EMAIL</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={selectedClient.managerEmail || ''} 
                      onChange={(e) => handleClientFieldChange('managerEmail', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">PHONE NUMBER</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={selectedClient.phone || ''} 
                      onChange={(e) => handleClientFieldChange('phone', e.target.value)}
                    />
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
    </div>
  );
}
