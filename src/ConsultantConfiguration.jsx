import { useState } from 'react';
import { MoreHorizontal, PlusCircle, Trash2, Save, BellOff, Building } from 'lucide-react';

const getInitials = (firstname, lastname) => {
  const f = firstname ? firstname.charAt(0).toUpperCase() : "";
  const l = lastname ? lastname.charAt(0).toUpperCase() : "";
  return (f + l) || "NW";
};

const generateId = (prefix) => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
  const [showArchived, setShowArchived] = useState(false);

  // Billing and Assignment Side Panel State
  const [billingPanel, setBillingPanel] = useState({
    isOpen: false,
    consultantId: null,
    activeAssignmentId: null,
    assignments: [],
    clients: []
  });

  const panelConsultant = consultants.find(c => c.id === billingPanel.consultantId);
  const activeAss = billingPanel.assignments.find(ass => ass.id === billingPanel.activeAssignmentId);
  const activeCli = billingPanel.clients.find(cli => cli.id === billingPanel.activeAssignmentId);
  const activeContacts = activeCli?.billingContacts || [];

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

  const openBillingPanel = (consultant, activeAssId = null) => {
    const assignments = consultant.assignments ? JSON.parse(JSON.stringify(consultant.assignments)) : [];
    const clients = consultant.clients ? JSON.parse(JSON.stringify(consultant.clients)) : [];
    
    clients.forEach(cli => {
      if (!cli.billingContacts) {
        if (cli.managerName || cli.managerEmail || cli.phone || (cli.billingManagers && cli.billingManagers.length > 0)) {
          cli.billingContacts = [{
            name: cli.managerName || "",
            email: cli.managerEmail || cli.billingManagers?.[0] || "",
            phone: cli.phone || ""
          }];
          if (cli.billingManagers && cli.billingManagers.length > 1) {
            cli.billingManagers.slice(1).forEach(email => {
              cli.billingContacts.push({ name: '', email: email, phone: '' });
            });
          }
        } else {
          cli.billingContacts = [];
        }
      }
    });

    let selectedAssId = activeAssId;
    if (!selectedAssId && assignments.length > 0) {
      selectedAssId = assignments[0].id;
    }

    if (assignments.length === 0) {
      const newAssId = generateId('ass');
      assignments.push({
        id: newAssId,
        client: 'New Assignment',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        craName: '',
        muted: false
      });
      clients.push({
        id: newAssId,
        name: 'New Assignment',
        managerName: '',
        billingCycle: 'Monthly',
        managerEmail: '',
        billingManagers: [],
        phone: '',
        orderEndDate: new Date().toISOString().split('T')[0],
        billingContacts: [],
        muted: false
      });
      selectedAssId = newAssId;
    }

    setBillingPanel({
      isOpen: true,
      consultantId: consultant.id,
      activeAssignmentId: selectedAssId,
      assignments,
      clients
    });
  };

  const handleCloseBillingPanel = () => {
    setBillingPanel({
      isOpen: false,
      consultantId: null,
      activeAssignmentId: null,
      assignments: [],
      clients: []
    });
  };

  const handleAddNewAssignmentTab = () => {
    const newAssId = generateId('ass');
    const newAss = {
      id: newAssId,
      client: 'New Assignment',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      craName: '',
      muted: false
    };
    const newClient = {
      id: newAssId,
      name: 'New Assignment',
      managerName: '',
      billingCycle: 'Monthly',
      managerEmail: '',
      billingManagers: [],
      phone: '',
      orderEndDate: new Date().toISOString().split('T')[0],
      billingContacts: [],
      muted: false
    };
    
    setBillingPanel(prev => ({
      ...prev,
      assignments: [...prev.assignments, newAss],
      clients: [...prev.clients, newClient],
      activeAssignmentId: newAssId
    }));
  };

  const handleDeleteActiveAssignment = () => {
    if (window.confirm("Are you sure you want to delete this assignment?")) {
      const updatedAssignments = billingPanel.assignments.filter(ass => ass.id !== billingPanel.activeAssignmentId);
      const updatedClients = billingPanel.clients.filter(cli => cli.id !== billingPanel.activeAssignmentId);
      
      let nextActiveId = null;
      if (updatedAssignments.length > 0) {
        nextActiveId = updatedAssignments[0].id;
      }
      
      setBillingPanel(prev => ({
        ...prev,
        assignments: updatedAssignments,
        clients: updatedClients,
        activeAssignmentId: nextActiveId
      }));
    }
  };

  const updateActiveClientField = (field, value) => {
    setBillingPanel(prev => ({
      ...prev,
      clients: prev.clients.map(cli => 
        cli.id === prev.activeAssignmentId ? { ...cli, [field]: value } : cli
      )
    }));
  };

  const updateActiveAssignmentField = (field, value) => {
    setBillingPanel(prev => ({
      ...prev,
      assignments: prev.assignments.map(ass => 
        ass.id === prev.activeAssignmentId ? { ...ass, [field]: value } : ass
      )
    }));
  };

  const handleClientNameChange = (newName) => {
    setBillingPanel(prev => {
      const updatedAssignments = prev.assignments.map(ass => 
        ass.id === prev.activeAssignmentId ? { ...ass, client: newName } : ass
      );
      const updatedClients = prev.clients.map(cli => 
        cli.id === prev.activeAssignmentId ? { ...cli, name: newName } : cli
      );
      return {
        ...prev,
        assignments: updatedAssignments,
        clients: updatedClients
      };
    });
  };

  const handleAddContact = () => {
    const newContact = { name: '', email: '', phone: '' };
    updateActiveClientField('billingContacts', [...activeContacts, newContact]);
  };

  const handleUpdateContact = (index, field, value) => {
    const updated = activeContacts.map((c, idx) => 
      idx === index ? { ...c, [field]: value } : c
    );
    updateActiveClientField('billingContacts', updated);
  };

  const handleRemoveContact = (index) => {
    const updated = activeContacts.filter((_, idx) => idx !== index);
    updateActiveClientField('billingContacts', updated);
  };

  const handleSaveBillingPanel = () => {
    const hasEmptyClient = billingPanel.assignments.some(ass => !ass.client.trim());
    if (hasEmptyClient) {
      alert("Please enter a client name for all assignments.");
      return;
    }

    const finalClients = billingPanel.clients.map(cli => {
      const contacts = cli.billingContacts || [];
      return {
        ...cli,
        managerName: contacts[0]?.name || "",
        managerEmail: contacts[0]?.email || "",
        phone: contacts[0]?.phone || "",
        billingManagers: contacts.map(c => c.email).filter(Boolean)
      };
    });

    const finalAssignments = billingPanel.assignments.map(ass => {
      const cli = finalClients.find(c => c.id === ass.id);
      return {
        ...ass,
        muted: cli ? cli.muted : ass.muted
      };
    });

    const currentConsultant = consultants.find(c => c.id === billingPanel.consultantId);
    let newCras = currentConsultant ? [...(currentConsultant.cras || [])] : [];
    
    finalAssignments.forEach(ass => {
      if (ass.craName && ass.craName.trim()) {
        const craNameLower = ass.craName.trim().toLowerCase();
        const exists = newCras.some(cra => cra.name.toLowerCase() === craNameLower);
        if (!exists) {
          newCras.push({
            id: generateId('cra'),
            name: ass.craName.trim(),
            validated: false
          });
        }
      }
    });

    updateConsultant(billingPanel.consultantId, {
      assignments: finalAssignments,
      clients: finalClients,
      cras: newCras
    });

    handleCloseBillingPanel();
  };

  const openAddAssignmentModal = (consultantId) => {
    const consultant = consultants.find(c => c.id === consultantId);
    if (consultant) {
      openBillingPanel(consultant);
    }
  };

  const openEditAssignmentModal = (consultant, ass) => {
    openBillingPanel(consultant, ass.id);
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

      {/* Billing & Contact Information Side Panel */}
      {billingPanel.isOpen && (
        <>
          <div className="side-panel-overlay" onClick={handleCloseBillingPanel}></div>
          <div className="side-panel" style={{ width: '600px' }}>
            <div className="panel-header">
              <div className="flex items-center gap-3">
                <div className="avatar">
                  {panelConsultant ? getInitials(panelConsultant.firstname, panelConsultant.name) : 'NW'}
                </div>
                <div>
                  <h3 className="m-0 font-bold text-lg text-primary">
                    {panelConsultant ? `${panelConsultant.firstname} ${panelConsultant.name}` : ''}
                  </h3>
                  <p className="m-0 text-xs text-muted">
                    {panelConsultant ? panelConsultant.role : ''}
                  </p>
                </div>
              </div>
              <button className="btn-text text-light text-xl" onClick={handleCloseBillingPanel}>&times;</button>
            </div>
            
            <div className="panel-body flex flex-col gap-4">
              <h4 className="font-bold mb-2" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', color: 'var(--primary-color)' }}>
                <span style={{ width: '4px', height: '16px', backgroundColor: 'var(--accent-color)', display: 'inline-block' }}></span>
                Billing & Contact Information
              </h4>

              <div className="tabs" style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {billingPanel.assignments.map(ass => (
                  <div 
                    key={ass.id} 
                    className={`tab ${billingPanel.activeAssignmentId === ass.id ? 'active' : ''}`}
                    onClick={() => setBillingPanel(prev => ({ ...prev, activeAssignmentId: ass.id }))}
                  >
                    {ass.client || "New Assignment"}
                  </div>
                ))}
                <div 
                  className="tab"
                  onClick={handleAddNewAssignmentTab}
                  style={{ color: 'var(--accent-color)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <PlusCircle size={14} /> Add Mission
                </div>
              </div>

              {activeAss && activeCli && (
                <div className="card" style={{ border: '1px solid var(--border-color)', boxShadow: 'none', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: '#FFFFFF' }}>
                  <div className="flex justify-between items-center mb-2">
                    <div style={{ width: '36px', height: '36px', backgroundColor: '#EFF6FF', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Building size={16} style={{ color: '#2563EB' }} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="badge font-bold text-xs" style={{ backgroundColor: '#DEF7EC', color: '#03543F' }}>ACTIVE ACCOUNT</span>
                      {billingPanel.assignments.length > 1 && (
                        <button 
                          className="btn-text" 
                          style={{ color: 'var(--danger-color)', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', border: 'none', background: 'transparent', cursor: 'pointer' }}
                          onClick={handleDeleteActiveAssignment}
                          title="Delete this assignment"
                        >
                          <Trash2 size={14} /> Delete Mission
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="form-group mb-0">
                    <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 600 }}>Nom du client</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Air Liquide" 
                      value={activeAss.client} 
                      onChange={e => handleClientNameChange(e.target.value)} 
                    />
                  </div>

                  <div className="flex gap-4">
                    <div className="form-group w-full mb-0">
                      <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 600 }}>Facturation</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="e.g. Mensuelle" 
                        value={activeCli.billingCycle || ''} 
                        onChange={e => updateActiveClientField('billingCycle', e.target.value)} 
                      />
                    </div>
                    <div className="form-group w-full mb-0">
                      <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 600 }}>Date de fin de la commande</label>
                      <input 
                        type="date" 
                        className="form-input" 
                        value={activeCli.orderEndDate || ''} 
                        onChange={e => updateActiveClientField('orderEndDate', e.target.value)} 
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="form-group w-full mb-0">
                      <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 600 }}>Start Date</label>
                      <input 
                        type="date" 
                        className="form-input" 
                        value={activeAss.startDate || ''} 
                        onChange={e => updateActiveAssignmentField('startDate', e.target.value)} 
                      />
                    </div>
                    <div className="form-group w-full mb-0">
                      <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 600 }}>End Date</label>
                      <input 
                        type="date" 
                        className="form-input" 
                        value={activeAss.endDate || ''} 
                        onChange={e => updateActiveAssignmentField('endDate', e.target.value)} 
                      />
                    </div>
                  </div>

                  <div className="form-group mb-0">
                    <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 600 }}>Linked CRA Name</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. CRA VEOLIA" 
                      value={activeAss.craName || ''} 
                      onChange={e => updateActiveAssignmentField('craName', e.target.value)} 
                    />
                  </div>

                  <div className="form-group mb-0">
                    <label className="filter-checkbox-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 500 }}>
                      <input 
                        type="checkbox" 
                        checked={!!activeCli.muted} 
                        onChange={e => {
                          updateActiveClientField('muted', e.target.checked);
                          updateActiveAssignmentField('muted', e.target.checked);
                        }}
                        style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--accent-color)' }}
                      />
                      <span>Mettre en silence les rappels</span>
                    </label>
                  </div>

                  {/* Billing Contacts section */}
                  <div style={{ marginTop: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                    <div className="flex justify-between items-center mb-3">
                      <span className="form-label m-0" style={{ letterSpacing: '0.05em', fontSize: '0.75rem', fontWeight: 700 }}>BILLING CONTACTS</span>
                      <button 
                        type="button" 
                        className="btn-text" 
                        style={{ fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--primary-color)' }}
                        onClick={handleAddContact}
                      >
                        <PlusCircle size={14} /> Add Another Contact
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {activeContacts.length > 0 && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 32px', gap: '0.5rem', padding: '0.25rem 0.5rem', backgroundColor: '#F8FAFC', borderRadius: '4px' }}>
                          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Responsible Name</span>
                          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Responsible Email</span>
                          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Phone Number</span>
                          <span></span>
                        </div>
                      )}

                      {activeContacts.map((contact, index) => (
                        <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 32px', gap: '0.5rem', alignItems: 'center' }}>
                          <input 
                            type="text" 
                            className="form-input" 
                            placeholder="Jean-Pierre" 
                            value={contact.name || ''} 
                            onChange={e => handleUpdateContact(index, 'name', e.target.value)} 
                            style={{ padding: '0.5rem' }}
                          />
                          <input 
                            type="email" 
                            className="form-input" 
                            placeholder="j.lambert@veolia.com" 
                            value={contact.email || ''} 
                            onChange={e => handleUpdateContact(index, 'email', e.target.value)} 
                            style={{ padding: '0.5rem' }}
                          />
                          <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                            <span style={{ position: 'absolute', left: '8px', color: 'var(--text-light)', fontSize: '0.8rem' }}>📞</span>
                            <input 
                              type="tel" 
                              className="form-input" 
                              placeholder="+33..." 
                              value={contact.phone || ''} 
                              onChange={e => handleUpdateContact(index, 'phone', e.target.value)} 
                              style={{ padding: '0.5rem 0.5rem 0.5rem 1.75rem' }}
                            />
                          </div>
                          <button 
                            type="button" 
                            className="btn-text" 
                            style={{ color: 'var(--danger-color)', fontSize: '1.25rem', border: 'none', background: 'transparent', cursor: 'pointer', padding: '0', display: 'flex', justifyContent: 'center' }}
                            onClick={() => handleRemoveContact(index)}
                            title="Remove Contact"
                          >
                            &times;
                          </button>
                        </div>
                      ))}

                      {activeContacts.length === 0 && (
                        <div style={{ border: '1px dashed var(--border-color)', padding: '1rem', borderRadius: '6px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                          No billing contacts added. Click "+ Add Another Contact" to add one.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="panel-footer flex flex-col gap-2">
              <button className="btn btn-primary w-full p-4" onClick={handleSaveBillingPanel} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Save size={18} /> Save Changes
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
