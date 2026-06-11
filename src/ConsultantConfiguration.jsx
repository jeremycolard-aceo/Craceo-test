import React, { useState } from 'react';
import { MoreHorizontal, PlusCircle, Trash2, X, Save, Eye } from 'lucide-react';

const getInitials = (firstname, lastname) => {
  const f = firstname ? firstname.charAt(0).toUpperCase() : "";
  const l = lastname ? lastname.charAt(0).toUpperCase() : "";
  return (f + l) || "NW";
};

export default function ConsultantConfiguration({ 
  consultants, 
  setConsultants, 
  updateConsultant,
  filteredConsultants, 
  onOpenFilter,
  handleUndo 
}) {
  const [editingConsultant, setEditingConsultant] = useState(null); // Employee detail side-panel
  const [creatingConsultant, setCreatingConsultant] = useState(false); // Creating employee status
  const [activeCardMenu, setActiveCardMenu] = useState(null); // ID of consultant card menu open
  const [viewingInvoiceHistoryConsultant, setViewingInvoiceHistoryConsultant] = useState(null); // Consultant profile for invoice history panel
  const [previewingFile, setPreviewingFile] = useState(null); // File name of the invoice currently being previewed

  // Custom Modal State
  const [modal, setModal] = useState({
    isOpen: false,
    type: '', // 'addCra' | 'deleteCra' | 'assignmentDetail' | 'deleteAssignment'
    consultantId: null,
    targetId: null, // assignment id
    title: '',
    craName: '',
    client: '',
    startDate: '',
    endDate: '',
    managerName: '',
    billingCycle: 'Monthly',
    managerEmail: '',
    phone: '',
    poNumber: '',
    orderEndDate: ''
  });

  const closeModal = () => {
    setModal({
      isOpen: false,
      type: '',
      consultantId: null,
      targetId: null,
      title: '',
      craName: '',
      client: '',
      startDate: '',
      endDate: '',
      managerName: '',
      billingCycle: 'Monthly',
      managerEmail: '',
      phone: '',
      poNumber: '',
      orderEndDate: ''
    });
  };

  // Create empty consultant template
  const handleCreateNew = () => {
    const newId = Date.now();
    const newConsultant = {
      id: newId,
      name: "",
      firstname: "",
      role: "Consultant",
      initials: "NEW",
      cras: [],
      assignments: [],
      clients: [],
      incomingDay: "",
      personalEmail: "",
      phone: "",
      birthday: "",
      manager: "",
      referenceTown: "",
      mentor: "",
      comments: "",
      status: "Active",
      jobMailAceo: "",
      updatedAt: Date.now()
    };
    setEditingConsultant(newConsultant);
    setCreatingConsultant(true);
  };

  const saveConsultantDetails = () => {
    const initials = getInitials(editingConsultant.firstname, editingConsultant.name);
    const updatedConsultant = { 
      ...editingConsultant, 
      initials
    };
    
    if (creatingConsultant) {
      setConsultants([...consultants, { ...updatedConsultant, updatedAt: Date.now() }]);
    } else {
      updateConsultant(editingConsultant.id, updatedConsultant);
    }
    setEditingConsultant(null);
    setCreatingConsultant(false);
  };

  // Custom modals handlers
  const openAddCraModal = (consultantId) => {
    setModal({
      isOpen: true,
      type: 'addCra',
      consultantId,
      title: 'Add CRA Configuration',
      craName: '',
      client: '',
      startDate: '',
      endDate: '',
      managerName: '',
      billingCycle: 'Monthly',
      managerEmail: '',
      phone: '',
      poNumber: '',
      orderEndDate: ''
    });
  };

  const handleAddCraConfirm = () => {
    if (!modal.craName.trim()) return;
    updateConsultant(modal.consultantId, (c) => ({
      cras: [...c.cras, { id: 'cra_' + Date.now(), name: modal.craName.trim(), validated: false }]
    }));
    closeModal();
  };

  const openDeleteCraModal = (consultantId, craId) => {
    setModal({
      isOpen: true,
      type: 'deleteCra',
      consultantId,
      targetId: craId,
      title: 'Delete CRA Configuration',
      craName: '',
      client: '',
      startDate: '',
      endDate: '',
      managerName: '',
      billingCycle: 'Monthly',
      managerEmail: '',
      phone: '',
      poNumber: '',
      orderEndDate: ''
    });
  };

  const handleDeleteCraConfirm = () => {
    updateConsultant(modal.consultantId, (c) => ({
      cras: c.cras.filter(cra => cra.id !== modal.targetId)
    }));
    closeModal();
  };

  const openAddAssignmentModal = (consultantId) => {
    const today = new Date().toISOString().split('T')[0];
    setModal({
      isOpen: true,
      type: 'assignmentDetail',
      consultantId,
      targetId: null,
      title: 'Add New Assignment & Client Info',
      craName: '',
      client: '',
      startDate: today,
      endDate: today,
      managerName: '',
      billingCycle: 'Monthly',
      managerEmail: '',
      phone: '',
      poNumber: '',
      orderEndDate: today
    });
  };

  const openEditAssignmentModal = (consultant, ass) => {
    const clientRecord = consultant.clients?.find(c => c.id === ass.id) || {};
    setModal({
      isOpen: true,
      type: 'assignmentDetail',
      consultantId: consultant.id,
      targetId: ass.id,
      title: 'Edit Assignment & Client Info',
      craName: '',
      client: ass.client || '',
      startDate: ass.startDate || '',
      endDate: ass.endDate || '',
      managerName: clientRecord.managerName || '',
      billingCycle: clientRecord.billingCycle || 'Monthly',
      managerEmail: clientRecord.managerEmail || '',
      phone: clientRecord.phone || '',
      poNumber: clientRecord.poNumber || '',
      orderEndDate: clientRecord.orderEndDate || ''
    });
  };

  const handleSaveAssignmentDetail = () => {
    if (!modal.client.trim()) return;
    
    updateConsultant(modal.consultantId, (c) => {
      const isEditing = !!modal.targetId;
      const assId = isEditing ? modal.targetId : 'ass_' + Date.now();
      
      const newAssignment = {
        id: assId,
        client: modal.client.trim(),
        startDate: modal.startDate || new Date().toISOString().split('T')[0],
        endDate: modal.endDate || new Date().toISOString().split('T')[0]
      };
      
      const existingClient = c.clients?.find(cli => cli.id === assId) || {};
      const newClient = {
        id: assId,
        name: modal.client.trim(),
        managerName: modal.managerName.trim(),
        billingCycle: modal.billingCycle,
        managerEmail: modal.managerEmail.trim(),
        phone: modal.phone.trim(),
        poNumber: modal.poNumber.trim(),
        orderEndDate: modal.orderEndDate || new Date().toISOString().split('T')[0],
        poUploaded: existingClient.poUploaded || false,
        poFileName: existingClient.poFileName || "",
        sent: existingClient.sent || false
      };
      
      let newAssignments;
      let newClients;
      if (isEditing) {
        newAssignments = c.assignments.map(ass => ass.id === assId ? newAssignment : ass);
        newClients = c.clients ? c.clients.map(cli => cli.id === assId ? newClient : cli) : [newClient];
      } else {
        newAssignments = [...c.assignments, newAssignment];
        newClients = c.clients ? [...c.clients, newClient] : [newClient];
      }
      
      return {
        assignments: newAssignments,
        clients: newClients
      };
    });
    
    closeModal();
  };

  const openDeleteAssignmentModal = (consultantId, assId) => {
    setModal({
      isOpen: true,
      type: 'deleteAssignment',
      consultantId,
      targetId: assId,
      title: 'Delete Assignment',
      craName: '',
      client: '',
      startDate: '',
      endDate: '',
      managerName: '',
      billingCycle: 'Monthly',
      managerEmail: '',
      phone: '',
      poNumber: '',
      orderEndDate: ''
    });
  };

  const handleDeleteAssignmentConfirm = () => {
    updateConsultant(modal.consultantId, (c) => {
      const newAssignments = c.assignments.filter(ass => ass.id !== modal.targetId);
      const newClients = c.clients ? c.clients.filter(cli => cli.id !== modal.targetId) : [];
      return {
        assignments: newAssignments,
        clients: newClients
      };
    });
    closeModal();
  };

  const editAssignment = (consultantId, assId, field, value) => {
    updateConsultant(consultantId, (c) => {
      const newAssignments = c.assignments.map(ass => ass.id === assId ? { ...ass, [field]: value } : ass);
      const newClients = c.clients ? c.clients.map(cli => {
        if (cli.id === assId) {
          return {
            ...cli,
            name: field === 'client' ? value : cli.name
          };
        }
        return cli;
      }) : [];
      
      return {
        assignments: newAssignments,
        clients: newClients
      };
    });
  };

  return (
    <div className="page-content">
      <div className="page-header flex justify-between items-center mb-6">
        <div>
          <div className="breadcrumb">MANAGEMENT › CONSULTANT SETUP</div>
          <h1 className="page-title">Consultant Configuration</h1>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-outline" onClick={onOpenFilter} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sliders-horizontal"><line x1="21" x2="14" y1="4" y2="4"/><line x1="10" x2="3" y1="4" y2="4"/><line x1="21" x2="6" x2="6" y1="12" y2="12"/><line x1="2" x2="3" y1="12" y2="12"/><line x1="21" x2="16" y1="20" y2="20"/><line x1="12" x2="3" y1="20" y2="20"/><line x1="14" x2="14" y1="2" y2="6"/><line x1="6" x2="6" y1="10" y2="14"/><line x1="16" x2="16" y1="18" y2="22"/></svg>
            Filter
          </button>
          <button className="btn btn-primary" onClick={handleCreateNew}>
            <PlusCircle size={18} /> New Consultant
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        {filteredConsultants.map(consultant => {
          const hasHistory = consultant.history && consultant.history.length > 0;
          return (
            <div key={consultant.id} className="card" style={{ width: '380px' }}>
              <div className="card-header">
                <div className="flex items-center gap-4">
                  <div className="avatar avatar-lg">{consultant.initials}</div>
                  <div>
                    <h3 className="m-0 font-bold" style={{ color: 'var(--primary-color)', display: 'flex', alignItems: 'center' }}>
                      {consultant.firstname} {consultant.name}
                      {consultant.external && (
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
                    <p className="m-0 text-sm text-muted">{consultant.role}</p>
                  </div>
                </div>
                <div style={{ position: 'relative' }}>
                  <MoreHorizontal 
                    className="text-light cursor-pointer hover:text-primary" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveCardMenu(activeCardMenu === consultant.id ? null : consultant.id);
                    }}
                  />
                  {activeCardMenu === consultant.id && (
                    <>
                      <div className="dropdown-overlay" onClick={() => setActiveCardMenu(null)}></div>
                      <div className="card-dropdown" style={{ right: 0, top: '24px' }}>
                        <button className="dropdown-item" onClick={() => { setEditingConsultant(consultant); setActiveCardMenu(null); }}>
                          👤 Employee Details
                        </button>
                        <button className="dropdown-item" onClick={() => { setViewingInvoiceHistoryConsultant(consultant); setActiveCardMenu(null); }}>
                          📄 Invoice History
                        </button>
                        <button 
                          className="dropdown-item" 
                          onClick={() => { handleUndo(consultant.id); setActiveCardMenu(null); }} 
                          disabled={!hasHistory}
                        >
                          ↩ Undo Last Action
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="card-body">
                {/* CRA CONFIGURATION */}
                <div className="flex justify-between items-center mb-4">
                  <span className="form-label m-0">CRA CONFIGURATION</span>
                  <button className="btn btn-text text-sm" onClick={() => openAddCraModal(consultant.id)}>+ Add Type</button>
                </div>

                <div className="mb-6">
                  {consultant.cras.map(cra => (
                    <div key={cra.id} className="flex justify-between items-center p-2 mb-2 bg-slate-50 border border-slate-200 rounded-md">
                      <span className="text-sm font-medium">{cra.name}</span>
                      <Trash2 
                        size={16} 
                        className="text-red-400 cursor-pointer hover:text-red-600" 
                        onClick={() => openDeleteCraModal(consultant.id, cra.id)}
                      />
                    </div>
                  ))}
                  {consultant.cras.length === 0 && <div className="text-xs text-muted">No CRAs configured.</div>}
                </div>

                {/* ACTIVE ASSIGNMENTS */}
                <div className="flex justify-between items-center mb-4">
                  <span className="form-label m-0" style={{ letterSpacing: '0.05em' }}>ACTIVE ASSIGNMENTS</span>
                  <button className="btn-assign" onClick={() => openAddAssignmentModal(consultant.id)}>
                    <PlusCircle size={13} /> Assign
                  </button>
                </div>

                {consultant.assignments.length > 0 ? (
                  <div className="assignments-box">
                    <table className="assignments-table">
                      <thead>
                        <tr>
                          <th>Client</th>
                          <th>Start Date</th>
                          <th>End Date</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {consultant.assignments.map(ass => (
                          <tr key={ass.id}>
                            <td className="client-cell">
                              <input 
                                type="text" 
                                className={`client-input ${ass.client.toLowerCase().includes('new client') ? 'new-client' : ''}`}
                                value={ass.client}
                                onChange={(e) => editAssignment(consultant.id, ass.id, 'client', e.target.value)}
                              />
                            </td>
                            <td className="date-cell">
                              <input 
                                type="date" 
                                className="date-pill-input"
                                value={ass.startDate}
                                onChange={(e) => editAssignment(consultant.id, ass.id, 'startDate', e.target.value)}
                              />
                            </td>
                            <td className="date-cell">
                              <input 
                                type="date" 
                                className="date-pill-input"
                                value={ass.endDate}
                                onChange={(e) => editAssignment(consultant.id, ass.id, 'endDate', e.target.value)}
                              />
                            </td>
                            <td className="action-cell">
                              <div className="flex gap-1 justify-end">
                                <button 
                                  className="edit-row-btn"
                                  title="Edit Client & Assignment Details"
                                  onClick={() => openEditAssignmentModal(consultant, ass)}
                                >
                                  ✏️
                                </button>
                                <button 
                                  className="delete-row-btn"
                                  title="Delete Assignment"
                                  onClick={() => openDeleteAssignmentModal(consultant.id, ass.id)}
                                >
                                  &times;
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="border border-dashed border-slate-300 rounded-lg p-6 text-center bg-slate-50">
                    <div className="text-xs font-bold text-muted mb-3 uppercase">NO ACTIVE ASSIGNMENTS</div>
                    <button className="btn btn-primary text-sm" onClick={() => openAddAssignmentModal(consultant.id)}>
                      <PlusCircle size={14} /> Assign to Project
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Détail Employé Side Panel */}
      {editingConsultant && (
        <>
          <div className="side-panel-overlay" onClick={() => setEditingConsultant(null)}></div>
          <div className="side-panel" style={{ width: '500px' }}>
            <div className="panel-header">
              <h3 className="m-0 font-bold text-lg text-primary">
                {creatingConsultant ? 'New Consultant' : 'Employee Details'}
              </h3>
              <button className="btn-text text-light text-xl" onClick={() => setEditingConsultant(null)}>&times;</button>
            </div>
            
            <div className="panel-body flex flex-col gap-4">
              <div className="flex gap-4">
                <div className="form-group w-full mb-0">
                  <label className="form-label">Firstname</label>
                  <input type="text" className="form-input" value={editingConsultant.firstname || ''} onChange={e => setEditingConsultant({...editingConsultant, firstname: e.target.value})} />
                </div>
                <div className="form-group w-full mb-0">
                  <label className="form-label">Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={editingConsultant.name || ''} 
                    onChange={e => setEditingConsultant({...editingConsultant, name: e.target.value})} 
                  />
                </div>
              </div>
              
              <div className="form-group mb-0">
                <label className="form-label">Role</label>
                <input type="text" className="form-input" value={editingConsultant.role} onChange={e => setEditingConsultant({...editingConsultant, role: e.target.value})} />
              </div>

              <div className="flex gap-4">
                <div className="form-group w-full mb-0">
                  <label className="form-label">Incoming Day</label>
                  <input type="date" className="form-input" value={editingConsultant.incomingDay || ''} onChange={e => setEditingConsultant({...editingConsultant, incomingDay: e.target.value})} />
                </div>
                <div className="form-group w-full mb-0">
                  <label className="form-label">Birthday</label>
                  <input type="date" className="form-input" value={editingConsultant.birthday || ''} onChange={e => setEditingConsultant({...editingConsultant, birthday: e.target.value})} />
                </div>
              </div>

              <div className="form-group mb-0">
                <label className="form-label">Personal Email</label>
                <input type="email" className="form-input" value={editingConsultant.personalEmail || ''} onChange={e => setEditingConsultant({...editingConsultant, personalEmail: e.target.value})} />
              </div>

              <div className="form-group mb-0">
                <label className="form-label">Job Mail Aceo</label>
                <input type="email" className="form-input" value={editingConsultant.jobMailAceo || ''} onChange={e => setEditingConsultant({...editingConsultant, jobMailAceo: e.target.value})} />
              </div>

              <div className="form-group mb-0">
                <label className="form-label">Phone</label>
                <input type="tel" className="form-input" value={editingConsultant.phone || ''} onChange={e => setEditingConsultant({...editingConsultant, phone: e.target.value})} />
              </div>

              <div className="flex gap-4">
                <div className="form-group w-full mb-0">
                  <label className="form-label">Manager</label>
                  <input type="text" className="form-input" value={editingConsultant.manager || ''} onChange={e => setEditingConsultant({...editingConsultant, manager: e.target.value})} />
                </div>
                <div className="form-group w-full mb-0">
                  <label className="form-label">Mentor</label>
                  <input type="text" className="form-input" value={editingConsultant.mentor || ''} onChange={e => setEditingConsultant({...editingConsultant, mentor: e.target.value})} />
                </div>
              </div>

              <div className="flex gap-4">
                <div className="form-group w-full mb-0">
                  <label className="form-label">Reference Town</label>
                  <input type="text" className="form-input" value={editingConsultant.referenceTown || ''} onChange={e => setEditingConsultant({...editingConsultant, referenceTown: e.target.value})} />
                </div>
                <div className="form-group w-full mb-0">
                  <label className="form-label">Status</label>
                  <select className="form-input" value={editingConsultant.status || 'Active'} onChange={e => setEditingConsultant({...editingConsultant, status: e.target.value})}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>
              </div>

              <div className="form-group mb-0">
                <label className="filter-checkbox-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-main)', marginTop: '0.5rem' }}>
                  <input 
                    type="checkbox" 
                    checked={!!editingConsultant.external} 
                    onChange={e => setEditingConsultant({...editingConsultant, external: e.target.checked})}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--accent-color)', cursor: 'pointer' }}
                  />
                  <span>External Consultant</span>
                </label>
              </div>
 
              <div className="form-group mb-0">
                <label className="form-label">Comments</label>
                <textarea className="form-input" rows="3" value={editingConsultant.comments || ''} onChange={e => setEditingConsultant({...editingConsultant, comments: e.target.value})}></textarea>
              </div>
            </div>
            
            <div className="panel-footer flex-col">
              <button className="btn btn-primary w-full p-4" onClick={saveConsultantDetails}>
                <Save size={18} /> Save Changes
              </button>
            </div>
          </div>
        </>
      )}

      {/* Invoice History Side Panel */}
      {viewingInvoiceHistoryConsultant && (
        <>
          <div className="side-panel-overlay" onClick={() => setViewingInvoiceHistoryConsultant(null)}></div>
          <div className="side-panel" style={{ width: '480px' }}>
            <div className="panel-header">
              <h3 className="m-0 font-bold text-lg text-primary">
                Invoice History - {viewingInvoiceHistoryConsultant.firstname} {viewingInvoiceHistoryConsultant.name}
              </h3>
              <button className="btn-text text-light text-xl" onClick={() => setViewingInvoiceHistoryConsultant(null)}>&times;</button>
            </div>
            
            <div className="panel-body flex flex-col gap-4">
              {viewingInvoiceHistoryConsultant.clients && viewingInvoiceHistoryConsultant.clients.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {viewingInvoiceHistoryConsultant.clients.map(cli => (
                    <div key={cli.id} className="card p-4 bg-slate-50" style={{ border: '1px solid var(--border-color)', boxShadow: 'none' }}>
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-bold text-primary text-md">{cli.name}</span>
                        <span className={`badge ${cli.sent ? 'badge-po-uploaded' : 'badge-po-pending'}`}>
                          {cli.sent ? 'Sent / Validated' : 'Pending'}
                        </span>
                      </div>
                      <div className="text-xs text-muted flex flex-col gap-1">
                        <div><strong>PO Number:</strong> {cli.poNumber || "Not configured"}</div>
                        <div><strong>Billing Cycle:</strong> {cli.billingCycle || "Monthly"}</div>
                        <div><strong>Manager Name:</strong> {cli.managerName || "N/A"}</div>
                        <div><strong>Manager Email:</strong> {cli.managerEmail || "N/A"}</div>
                        <div><strong>Phone Number:</strong> {cli.phone || "N/A"}</div>
                        <div><strong>Order End Date:</strong> {cli.orderEndDate || "N/A"}</div>
                        
                        {/* Fictive invoice attachment */}
                        <div className="mt-2 flex items-center justify-between p-2 bg-slate-100 rounded-md border border-slate-200">
                          <div className="flex items-center gap-2" style={{ minWidth: 0 }}>
                            <span style={{ fontSize: '1rem' }}>📎</span>
                            <span className="font-semibold text-slate-700 text-ellipsis overflow-hidden whitespace-nowrap">Facture_{cli.name.replace(/\s+/g, '')}_2026.pdf</span>
                          </div>
                          <button 
                            className="btn btn-outline p-1" 
                            style={{ padding: '4px', minWidth: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff' }}
                            title="Ouvrir la pièce jointe de la facture"
                            onClick={() => setPreviewingFile(`Facture_${cli.name.replace(/\s+/g, '')}_2026.pdf`)}
                          >
                            <Eye size={12} />
                          </button>
                        </div>

                        {cli.poUploaded ? (
                          <div className="mt-2 p-3 bg-white border border-slate-200 rounded-md flex items-center justify-between">
                            <div className="flex items-center gap-2" style={{ minWidth: 0 }}>
                              <span style={{ fontSize: '1.25rem' }}>📄</span>
                              <span className="font-medium text-slate-700 text-ellipsis overflow-hidden whitespace-nowrap">{cli.poFileName || "purchase_order.pdf"}</span>
                            </div>
                            <button 
                              className="btn btn-outline p-1" 
                              style={{ padding: '6px', minWidth: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                              title="Open Document Preview"
                              onClick={() => setPreviewingFile(cli.poFileName || "purchase_order.pdf")}
                            >
                              <Eye size={14} />
                            </button>
                          </div>
                        ) : (
                          <div className="mt-2 text-red-500 font-medium">⚠️ Purchase Order Pending Upload</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted p-8 border border-dashed border-slate-300 rounded-lg">
                  No billing/invoice history found.
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Mock Document Preview Modal */}
      {previewingFile && (
        <div className="modal-overlay" onClick={() => setPreviewingFile(null)}>
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
                    <p style={{ margin: 0, fontSize: '0.75rem' }}>No: {viewingInvoiceHistoryConsultant?.clients?.find(c => c.poFileName === previewingFile || `Facture_${c.name.replace(/\s+/g, '')}_2026.pdf` === previewingFile)?.poNumber || "VE-2024-MAINT"}</p>
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
                    <p style={{ margin: 0 }}>{viewingInvoiceHistoryConsultant?.clients?.find(c => c.poFileName === previewingFile || `Facture_${c.name.replace(/\s+/g, '')}_2026.pdf` === previewingFile)?.name || "Veolia"}</p>
                    <p style={{ margin: 0 }}>Manager: {viewingInvoiceHistoryConsultant?.clients?.find(c => c.poFileName === previewingFile || `Facture_${c.name.replace(/\s+/g, '')}_2026.pdf` === previewingFile)?.managerName || "Jean-Pierre Lambert"}</p>
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
                      <td style={{ padding: '8px 0' }}>Prestation Conseil - {viewingInvoiceHistoryConsultant?.role}</td>
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
            
            <div className="modal-footer" style={{ backgroundColor: '#ffffff' }}>
              <button className="btn btn-primary" onClick={() => setPreviewingFile(null)}>Close Preview</button>
            </div>
          </div>
        </div>
      )}

      {/* Reusable Custom Modal */}
      {modal.isOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-container" style={{ maxWidth: modal.type === 'assignmentDetail' ? '650px' : '450px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{modal.title}</h3>
              <button className="btn-text text-light text-xl" onClick={closeModal}>&times;</button>
            </div>
            
            <div className="modal-body">
              {modal.type === 'addCra' && (
                <div className="form-group mb-0">
                  <label className="form-label">CRA Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. CRA INETUM" 
                    value={modal.craName} 
                    onChange={e => setModal({ ...modal, craName: e.target.value })}
                    onKeyDown={e => e.key === 'Enter' && handleAddCraConfirm()}
                    autoFocus
                  />
                </div>
              )}
              
              {modal.type === 'deleteCra' && (
                <p className="m-0 text-sm text-muted">
                  Are you sure you want to delete this CRA configuration? This action cannot be undone.
                </p>
              )}
              
              {modal.type === 'assignmentDetail' && (
                <div className="flex flex-col gap-4">
                  <div className="flex gap-4">
                    {/* Left Column: Basic Assignment Info */}
                    <div className="flex-1 flex flex-col gap-4">
                      <div className="form-group mb-0">
                        <label className="form-label">Client Name</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          placeholder="e.g. Veolia" 
                          value={modal.client} 
                          onChange={e => setModal({ ...modal, client: e.target.value })}
                          autoFocus
                        />
                      </div>
                      <div className="form-group mb-0">
                        <label className="form-label">Start Date</label>
                        <input 
                          type="date" 
                          className="form-input" 
                          value={modal.startDate} 
                          onChange={e => setModal({ ...modal, startDate: e.target.value })}
                        />
                      </div>
                      <div className="form-group mb-0">
                        <label className="form-label">End Date</label>
                        <input 
                          type="date" 
                          className="form-input" 
                          value={modal.endDate} 
                          onChange={e => setModal({ ...modal, endDate: e.target.value })}
                        />
                      </div>
                      <div className="form-group mb-0">
                        <label className="form-label">Billing Cycle</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          placeholder="e.g. Monthly"
                          value={modal.billingCycle} 
                          onChange={e => setModal({ ...modal, billingCycle: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Right Column: Detailed Contact Info */}
                    <div className="flex-1 flex flex-col gap-4">
                      <div className="form-group mb-0">
                        <label className="form-label">Manager Name</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          placeholder="e.g. Jean-Pierre Lambert"
                          value={modal.managerName} 
                          onChange={e => setModal({ ...modal, managerName: e.target.value })}
                        />
                      </div>
                      <div className="form-group mb-0">
                        <label className="form-label">Manager Email</label>
                        <input 
                          type="email" 
                          className="form-input" 
                          placeholder="e.g. manager@client.com"
                          value={modal.managerEmail} 
                          onChange={e => setModal({ ...modal, managerEmail: e.target.value })}
                        />
                      </div>
                      <div className="form-group mb-0">
                        <label className="form-label">Phone Number</label>
                        <input 
                          type="tel" 
                          className="form-input" 
                          placeholder="e.g. +33 1 23 45 67 89"
                          value={modal.phone} 
                          onChange={e => setModal({ ...modal, phone: e.target.value })}
                        />
                      </div>
                      <div className="form-group mb-0">
                        <label className="form-label">Purchase Order Number</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          placeholder="e.g. VE-2024-MAINT"
                          value={modal.poNumber} 
                          onChange={e => setModal({ ...modal, poNumber: e.target.value })}
                        />
                      </div>
                      <div className="form-group mb-0">
                        <label className="form-label">Order End Date</label>
                        <input 
                          type="date" 
                          className="form-input" 
                          value={modal.orderEndDate} 
                          onChange={e => setModal({ ...modal, orderEndDate: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {modal.type === 'deleteAssignment' && (
                <p className="m-0 text-sm text-muted">
                  Are you sure you want to delete this active assignment? This will also remove the linked billing configuration.
                </p>
              )}
            </div>
            
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={closeModal}>Cancel</button>
              {modal.type === 'addCra' && (
                <button className="btn btn-primary" onClick={handleAddCraConfirm}>Add CRA</button>
              )}
              {modal.type === 'deleteCra' && (
                <button className="btn btn-primary" style={{ backgroundColor: 'var(--danger-color)' }} onClick={handleDeleteCraConfirm}>Delete</button>
              )}
              {modal.type === 'assignmentDetail' && (
                <button className="btn btn-primary" onClick={handleSaveAssignmentDetail}>Save Details</button>
              )}
              {modal.type === 'deleteAssignment' && (
                <button className="btn btn-primary" style={{ backgroundColor: 'var(--danger-color)' }} onClick={handleDeleteAssignmentConfirm}>Delete</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
