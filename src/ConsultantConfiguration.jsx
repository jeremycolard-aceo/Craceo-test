import { useState } from 'react';
import { MoreHorizontal, PlusCircle, Trash2, Save, BellOff } from 'lucide-react';

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
  const [newBillingEmail, setNewBillingEmail] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  // Custom Modal State
  const [modal, setModal] = useState({
    isOpen: false,
    type: '', // 'addCra' | 'deleteCra' | 'assignmentDetail' | 'deleteAssignment' | 'deleteConsultant'
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
    billingManagers: [],
    phone: '',
    poNumber: '',
    orderEndDate: '',
    muted: false,
    consultantName: ''
  });

  const handleAddBillingEmail = () => {
    if (newBillingEmail.trim() && newBillingEmail.includes('@')) {
      setModal(prev => ({
        ...prev,
        billingManagers: [...(prev.billingManagers || []), newBillingEmail.trim()]
      }));
      setNewBillingEmail('');
    }
  };

  const handleRemoveBillingEmail = (index) => {
    setModal(prev => ({
      ...prev,
      billingManagers: prev.billingManagers.filter((_, i) => i !== index)
    }));
  };

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
      billingManagers: [],
      phone: '',
      poNumber: '',
      orderEndDate: '',
      muted: false,
      consultantName: ''
    });
    setNewBillingEmail('');
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
      muted: false,
      cras: [{ id: 'cra_boond_' + Date.now(), name: "BOOND", validated: false }],
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
    // Ensure BOOND exists
    let finalCras = editingConsultant.cras || [];
    const hasBoond = finalCras.some(cra => cra.name.toLowerCase().includes('boond'));
    if (!hasBoond) {
      finalCras = [...finalCras, { id: 'cra_boond_' + Date.now(), name: "BOOND", validated: false }];
    }
    const updatedConsultant = { 
      ...editingConsultant, 
      cras: finalCras,
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
      billingManagers: [],
      phone: '',
      poNumber: '',
      orderEndDate: today,
      muted: false
    });
  };

  const openEditAssignmentModal = (consultant, ass) => {
    const clientRecord = consultant.clients?.find(c => c.id === ass.id) || {};
    const existingEmails = clientRecord.billingManagers || (clientRecord.managerEmail ? [clientRecord.managerEmail] : []);
    setModal({
      isOpen: true,
      type: 'assignmentDetail',
      consultantId: consultant.id,
      targetId: ass.id,
      title: 'Edit Assignment & Client Info',
      craName: ass.craName || '',
      client: ass.client || '',
      startDate: ass.startDate || '',
      endDate: ass.endDate || '',
      managerName: clientRecord.managerName || '',
      billingCycle: clientRecord.billingCycle || 'Monthly',
      managerEmail: clientRecord.managerEmail || '',
      billingManagers: existingEmails,
      phone: clientRecord.phone || '',
      poNumber: clientRecord.poNumber || '',
      orderEndDate: clientRecord.orderEndDate || '',
      muted: clientRecord.muted || false
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
        endDate: modal.endDate || new Date().toISOString().split('T')[0],
        craName: modal.craName.trim(),
        muted: modal.muted || false,
        billingManagers: modal.billingManagers || []
      };
      
      const existingClient = c.clients?.find(cli => cli.id === assId) || {};
      const newClient = {
        id: assId,
        name: modal.client.trim(),
        managerName: modal.managerName.trim(),
        billingCycle: modal.billingCycle,
        managerEmail: modal.billingManagers && modal.billingManagers.length > 0 ? modal.billingManagers[0] : (modal.managerEmail || ""),
        billingManagers: modal.billingManagers || [],
        phone: modal.phone.trim(),
        poNumber: modal.poNumber.trim(),
        orderEndDate: modal.orderEndDate || new Date().toISOString().split('T')[0],
        poUploaded: existingClient.poUploaded || false,
        poFileName: existingClient.poFileName || "",
        sent: existingClient.sent || false,
        muted: modal.muted || false
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

      // Automatically add custom CRA if provided and doesn't exist
      let newCras = c.cras || [];
      if (modal.craName.trim()) {
        const craNameLower = modal.craName.trim().toLowerCase();
        const exists = newCras.some(cra => cra.name.toLowerCase() === craNameLower);
        if (!exists) {
          newCras = [...newCras, {
            id: 'cra_' + Date.now(),
            name: modal.craName.trim(),
            validated: false
          }];
        }
      }
      
      return {
        assignments: newAssignments,
        clients: newClients,
        cras: newCras
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

  const openDeleteConsultantModal = (consultantId, consultantName) => {
    setModal({
      isOpen: true,
      type: 'deleteConsultant',
      consultantId,
      title: 'Archive and Delete Consultant',
      consultantName,
      craName: '',
      client: '',
      startDate: '',
      endDate: '',
      managerName: '',
      billingCycle: 'Monthly',
      managerEmail: '',
      billingManagers: [],
      phone: '',
      poNumber: '',
      orderEndDate: '',
      muted: false
    });
  };

  const handleDeleteConsultantConfirm = () => {
    updateConsultant(modal.consultantId, { status: "Left / Archived" });
    if (editingConsultant && editingConsultant.id === modal.consultantId) {
      setEditingConsultant(null);
    }
    closeModal();
  };

  return (
    <div className="page-content">
      <div className="page-header flex justify-between items-center mb-6">
        <div>
          <div className="breadcrumb">MANAGEMENT › CONSULTANT SETUP</div>
          <h1 className="page-title">Consultant Configuration</h1>
          <p className="text-muted text-sm mt-2">Assign CRAs and projects to each consultant.</p>
        </div>
        <div className="flex gap-3 items-center">
          <label className="filter-checkbox-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', marginRight: '1rem', color: 'var(--text-main)', fontWeight: 500 }}>
            <input 
              type="checkbox" 
              checked={showArchived} 
              onChange={e => setShowArchived(e.target.checked)}
              style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--accent-color)' }}
            />
            <span>Afficher les archivés / partis</span>
          </label>
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
        {filteredConsultants.filter(c => showArchived || c.status === 'Active').map(consultant => {
          const hasHistory = consultant.history && consultant.history.length > 0;
          return (
            <div key={consultant.id} className="card" style={{ width: '380px', opacity: consultant.status !== 'Active' ? 0.75 : 1 }}>
              <div className="card-header">
                <div className="flex items-center gap-4">
                  <div className="avatar avatar-lg">{consultant.initials}</div>
                  <div>
                    <h3 className="m-0 font-bold" style={{ color: 'var(--primary-color)', display: 'flex', alignItems: 'center' }}>
                      {consultant.firstname} {consultant.name}
                      {consultant.muted && (
                        <BellOff 
                          size={14} 
                          className="text-slate-400" 
                          style={{ marginLeft: '6px', verticalAlign: 'middle' }} 
                          title="Reminders muted for this consultant"
                        />
                      )}
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
                    <p className="m-0 text-sm text-muted" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                      {consultant.role}
                      {consultant.status !== 'Active' && (
                        <span className="badge" style={{ backgroundColor: '#F1F5F9', color: '#64748B', border: '1px solid #CBD5E1', textTransform: 'none', padding: '1px 6px', fontSize: '0.65rem' }}>
                          {consultant.status === 'Left / Archived' ? 'Archivé / Parti' : consultant.status}
                        </span>
                      )}
                    </p>
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
                        <button className="dropdown-item" onClick={() => { setEditingConsultant(consultant); setCreatingConsultant(false); setActiveCardMenu(null); }}>
                          👤 Employee Details
                        </button>
                        <button 
                          className="dropdown-item" 
                          onClick={() => { handleUndo(consultant.id); setActiveCardMenu(null); }} 
                          disabled={!hasHistory}
                        >
                          ↩ Undo Last Action
                        </button>
                        {consultant.status !== 'Left / Archived' && (
                          <button 
                            className="dropdown-item" 
                            style={{ color: 'var(--danger-color)' }}
                            onClick={() => {
                              openDeleteConsultantModal(consultant.id, `${consultant.firstname} ${consultant.name}`);
                              setActiveCardMenu(null);
                            }}
                          >
                            ❌ Delete / Archive
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="card-body">
                {/* CRA CONFIGURATION */}
                <div className="flex justify-between items-center mb-4">
                  <span className="form-label m-0">CRA CONFIGURATION</span>
                </div>

                <div className="mb-6">
                  {consultant.cras.map(cra => (
                    <div key={cra.id} className="flex justify-between items-center p-2 mb-2 bg-slate-50 border border-slate-200 rounded-md">
                      <span className="text-sm font-medium">{cra.name}</span>
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

                {consultant.assignments && consultant.assignments.length > 0 ? (
                  <div className="flex flex-col gap-2" style={{ maxHeight: '180px', overflowY: 'auto' }}>
                    {consultant.assignments.map(ass => (
                      <div key={ass.id} className="flex justify-between items-center p-2 rounded-md bg-slate-50 border border-slate-200 text-xs">
                        <div className="flex flex-col" style={{ minWidth: 0 }}>
                          <span className="font-bold text-slate-800 text-ellipsis overflow-hidden whitespace-nowrap" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {ass.client}
                            {ass.muted && <BellOff size={10} className="text-slate-400" title="Reminders muted for this project" />}
                          </span>
                          <span className="text-slate-500">{ass.startDate} → {ass.endDate}</span>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            className="edit-row-btn"
                            style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '2px', fontSize: '0.9rem' }}
                            title="Edit Assignment & Client Info"
                            onClick={() => openEditAssignmentModal(consultant, ass)}
                          >
                            ✏️
                          </button>
                          <button 
                            className="delete-row-btn"
                            style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '2px', fontSize: '1rem', color: 'var(--danger-color)' }}
                            title="Delete Assignment"
                            onClick={() => openDeleteAssignmentModal(consultant.id, ass.id)}
                          >
                            &times;
                          </button>
                        </div>
                      </div>
                    ))}
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
          <div className="side-panel-overlay" onClick={() => { setEditingConsultant(null); setCreatingConsultant(false); }}></div>
          <div className="side-panel" style={{ width: '500px' }}>
            <div className="panel-header">
              <h3 className="m-0 font-bold text-lg text-primary">
                {creatingConsultant ? 'New Consultant' : 'Employee Details'}
              </h3>
              <button className="btn-text text-light text-xl" onClick={() => { setEditingConsultant(null); setCreatingConsultant(false); }}>&times;</button>
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
                    <option value="Left / Archived">Archivé / Parti</option>
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
            
            <div className="panel-footer flex flex-col gap-2">
              <button className="btn btn-primary w-full p-4" onClick={saveConsultantDetails}>
                <Save size={18} /> Save Changes
              </button>
              {!creatingConsultant && editingConsultant.status !== 'Left / Archived' && (
                <button 
                  className="btn btn-outline w-full p-4" 
                  style={{ color: 'var(--danger-color)', borderColor: 'var(--danger-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} 
                  onClick={() => {
                    openDeleteConsultantModal(editingConsultant.id, `${editingConsultant.firstname} ${editingConsultant.name}`);
                  }}
                >
                  <Trash2 size={18} /> Delete / Archive Consultant
                </button>
              )}
            </div>
          </div>
        </>
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
                      <div className="form-group mb-0">
                        <label className="form-label">Linked CRA Name (Optional)</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          placeholder="e.g. CRA VEOLIA"
                          value={modal.craName} 
                          onChange={e => setModal({ ...modal, craName: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Right Column: Detailed Contact Info */}
                    <div className="flex-1 flex flex-col gap-4">
                      <div className="form-group mb-0">
                        <label className="form-label">Nom du responsable de facturation</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          placeholder="e.g. Jean-Pierre Lambert"
                          value={modal.managerName} 
                          onChange={e => setModal({ ...modal, managerName: e.target.value })}
                        />
                      </div>
                      <div className="form-group mb-0">
                        <label className="form-label">Responsable de la facturation (E-mail)</label>
                        <div className="flex gap-2 mb-2">
                          <input 
                            type="email" 
                            className="form-input" 
                            placeholder="e.g. manager@client.com"
                            value={newBillingEmail} 
                            onChange={e => setNewBillingEmail(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddBillingEmail();
                              }
                            }}
                          />
                          <button 
                            type="button" 
                            className="btn btn-outline"
                            style={{ padding: '0 12px', height: '38px' }}
                            onClick={handleAddBillingEmail}
                          >
                            +
                          </button>
                        </div>
                        <div className="flex flex-col gap-1" style={{ maxHeight: '100px', overflowY: 'auto' }}>
                          {(modal.billingManagers || []).map((email, idx) => (
                            <div key={idx} className="flex justify-between items-center p-2 bg-slate-50 border border-slate-200 rounded-md text-xs">
                              <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '180px' }}>{email}</span>
                              <button 
                                type="button" 
                                className="text-red-500 hover:text-red-700" 
                                style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1rem', padding: '0 4px', lineHeight: 1 }}
                                onClick={() => handleRemoveBillingEmail(idx)}
                              >
                                &times;
                              </button>
                            </div>
                          ))}
                        </div>
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
                      <div className="form-group mb-0" style={{ marginTop: '0.5rem' }}>
                        <label className="filter-checkbox-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-main)', fontWeight: 500 }}>
                          <input 
                            type="checkbox" 
                            checked={!!modal.muted} 
                            onChange={e => setModal({ ...modal, muted: e.target.checked })}
                            style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--accent-color)' }}
                          />
                          <span>Mettre en silence les rappels</span>
                        </label>
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
              {modal.type === 'deleteConsultant' && (
                <p className="m-0 text-sm text-muted">
                  Are you sure you want to delete and archive the consultant <strong>{modal.consultantName}</strong>?
                </p>
              )}
            </div>
            
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={closeModal}>Cancel</button>
              {modal.type === 'assignmentDetail' && (
                <button className="btn btn-primary" onClick={handleSaveAssignmentDetail}>Save Details</button>
              )}
              {modal.type === 'deleteAssignment' && (
                <button className="btn btn-primary" style={{ backgroundColor: 'var(--danger-color)' }} onClick={handleDeleteAssignmentConfirm}>Delete</button>
              )}
              {modal.type === 'deleteConsultant' && (
                <button className="btn btn-primary" style={{ backgroundColor: 'var(--danger-color)' }} onClick={handleDeleteConsultantConfirm}>Confirm Archive</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
