import React, { useState } from 'react';
import { MoreHorizontal, PlusCircle, Trash2, X, Save } from 'lucide-react';

// Sync clients billing record array when assignments are modified
const syncClientsWithAssignments = (assignments, existingClients) => {
  return assignments.map(ass => {
    const existing = existingClients.find(c => c.name.toLowerCase() === ass.client.toLowerCase());
    if (existing) {
      return { ...existing, name: ass.client };
    } else {
      return {
        id: 'cli_' + Date.now() + Math.random().toString(36).substring(2, 5),
        name: ass.client,
        managerName: "",
        billingCycle: "Monthly",
        managerEmail: "",
        phone: "",
        poNumber: "",
        orderEndDate: "",
        poUploaded: false,
        poFileName: ""
      };
    }
  });
};

const getInitials = (firstname, lastname) => {
  const f = firstname ? firstname.charAt(0).toUpperCase() : "";
  const l = lastname ? lastname.charAt(0).toUpperCase() : "";
  return (f + l) || "NW";
};

export default function ConsultantConfiguration({ consultants, setConsultants, filteredConsultants, onOpenFilter }) {
  const [editingConsultant, setEditingConsultant] = useState(null); // Employee detail side-panel
  const [creatingConsultant, setCreatingConsultant] = useState(false); // Creating employee status
  
  // Custom Modal State
  const [modal, setModal] = useState({
    isOpen: false,
    type: '', // 'addCra' | 'deleteCra' | 'addAssignment' | 'deleteAssignment'
    consultantId: null,
    targetId: null,
    title: '',
    craName: '',
    client: '',
    startDate: '',
    endDate: ''
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
      endDate: ''
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
      jobMailAceo: ""
    };
    setEditingConsultant(newConsultant);
    setCreatingConsultant(true);
  };

  const saveConsultantDetails = () => {
    const initials = getInitials(editingConsultant.firstname, editingConsultant.name);
    const updatedConsultant = { ...editingConsultant, initials };
    
    if (creatingConsultant) {
      setConsultants([...consultants, updatedConsultant]);
    } else {
      setConsultants(consultants.map(c => c.id === editingConsultant.id ? updatedConsultant : c));
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
      endDate: ''
    });
  };

  const handleAddCraConfirm = () => {
    if (!modal.craName.trim()) return;
    setConsultants(prev => prev.map(c => {
      if (c.id === modal.consultantId) {
        return {
          ...c,
          cras: [...c.cras, { id: 'cra_' + Date.now(), name: modal.craName.trim(), validated: false }]
        };
      }
      return c;
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
      endDate: ''
    });
  };

  const handleDeleteCraConfirm = () => {
    setConsultants(prev => prev.map(c => {
      if (c.id === modal.consultantId) {
        return {
          ...c,
          cras: c.cras.filter(cra => cra.id !== modal.targetId)
        };
      }
      return c;
    }));
    closeModal();
  };

  const openAddAssignmentModal = (consultantId) => {
    setModal({
      isOpen: true,
      type: 'addAssignment',
      consultantId,
      title: 'Add New Assignment',
      craName: '',
      client: '',
      startDate: '',
      endDate: ''
    });
  };

  const handleAddAssignmentConfirm = () => {
    if (!modal.client.trim()) return;
    setConsultants(prev => prev.map(c => {
      if (c.id === modal.consultantId) {
        const newAssignment = {
          id: 'ass_' + Date.now(),
          client: modal.client.trim(),
          startDate: modal.startDate.trim() || new Date().toISOString().split('T')[0],
          endDate: modal.endDate.trim() || new Date().toISOString().split('T')[0]
        };
        const newAssignments = [...c.assignments, newAssignment];
        const updatedClients = syncClientsWithAssignments(newAssignments, c.clients || []);
        return {
          ...c,
          assignments: newAssignments,
          clients: updatedClients
        };
      }
      return c;
    }));
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
      endDate: ''
    });
  };

  const handleDeleteAssignmentConfirm = () => {
    setConsultants(prev => prev.map(c => {
      if (c.id === modal.consultantId) {
        const newAssignments = c.assignments.filter(ass => ass.id !== modal.targetId);
        const updatedClients = syncClientsWithAssignments(newAssignments, c.clients || []);
        return {
          ...c,
          assignments: newAssignments,
          clients: updatedClients
        };
      }
      return c;
    }));
    closeModal();
  };

  const editAssignment = (consultantId, assId, field, value) => {
    setConsultants(prev => prev.map(c => {
      if (c.id === consultantId) {
        const newAssignments = c.assignments.map(ass => ass.id === assId ? { ...ass, [field]: value } : ass);
        const updatedClients = syncClientsWithAssignments(newAssignments, c.clients || []);
        return {
          ...c,
          assignments: newAssignments,
          clients: updatedClients
        };
      }
      return c;
    }));
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
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sliders-horizontal"><line x1="21" x2="14" y1="4" y2="4"/><line x1="10" x2="3" y1="4" y2="4"/><line x1="21" x2="6" y1="12" y2="12"/><line x1="2" x2="3" y1="12" y2="12"/><line x1="21" x2="16" y1="20" y2="20"/><line x1="12" x2="3" y1="20" y2="20"/><line x1="14" x2="14" y1="2" y2="6"/><line x1="6" x2="6" y1="10" y2="14"/><line x1="16" x2="16" y1="18" y2="22"/></svg>
            Filter
          </button>
          <button className="btn btn-primary" onClick={handleCreateNew}>
            <PlusCircle size={18} /> New Consultant
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        {filteredConsultants.map(consultant => (
          <div key={consultant.id} className="card" style={{ width: '380px' }}>
            <div className="card-header">
              <div className="flex items-center gap-4">
                <div className="avatar avatar-lg">{consultant.initials}</div>
                <div>
                  <h3 className="m-0 font-bold" style={{ color: 'var(--primary-color)' }}>
                    {consultant.firstname} {consultant.name}
                  </h3>
                  <p className="m-0 text-sm text-muted">{consultant.role}</p>
                </div>
              </div>
              <MoreHorizontal 
                className="text-light cursor-pointer hover:text-primary" 
                onClick={() => setEditingConsultant(consultant)}
              />
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
                            <button 
                              className="delete-row-btn"
                              title="Delete Assignment"
                              onClick={() => openDeleteAssignmentModal(consultant.id, ass.id)}
                            >
                              &times;
                            </button>
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
        ))}
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

      {/* Reusable Custom Modal */}
      {modal.isOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
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
              
              {modal.type === 'addAssignment' && (
                <div className="flex flex-col gap-4">
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
                  <div className="flex gap-4">
                    <div className="form-group w-full mb-0">
                      <label className="form-label">Start Date</label>
                      <input 
                        type="date" 
                        className="form-input" 
                        value={modal.startDate} 
                        onChange={e => setModal({ ...modal, startDate: e.target.value })}
                      />
                    </div>
                    <div className="form-group w-full mb-0">
                      <label className="form-label">End Date</label>
                      <input 
                        type="date" 
                        className="form-input" 
                        value={modal.endDate} 
                        onChange={e => setModal({ ...modal, endDate: e.target.value })}
                      />
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
              {modal.type === 'addAssignment' && (
                <button className="btn btn-primary" onClick={handleAddAssignmentConfirm}>Assign</button>
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
