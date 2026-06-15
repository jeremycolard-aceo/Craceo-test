import React from 'react';
import { User, CheckCircle, Send, Archive, Shield, BellOff } from 'lucide-react';

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

export default function MySpace({ 
  consultants, 
  updateConsultant, 
  notifications, 
  addNotification 
}) {
  // 1. Identify active consultants
  const activeConsultants = consultants.filter(c => c.status === 'Active' && !c.archived);

  // Helper to check if a client assignment is active in the month of the consultant's card (updatedAt)
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

  // 2. Classify active consultants into pipeline lists for tasks
  const pendingCras = activeConsultants.filter(c => 
    c.cras && c.cras.length > 0 && c.cras.some(cra => !cra.validated)
  );

  const pendingBillings = [];
  activeConsultants.forEach(c => {
    const allCrasValidated = !c.cras || c.cras.length === 0 || c.cras.every(cra => cra.validated);
    if (allCrasValidated) {
      const activeClients = c.clients ? c.clients.filter(cli => isClientActiveInMonth(c, cli)) : [];
      activeClients.forEach(cli => {
        if (!cli.sent) {
          pendingBillings.push({ consultant: c, client: cli });
        }
      });
    }
  });

  const pendingFinals = activeConsultants.filter(c => {
    const allCrasValidated = !c.cras || c.cras.length === 0 || c.cras.every(cra => cra.validated);
    if (!allCrasValidated) return false;
    const activeClients = c.clients ? c.clients.filter(cli => isClientActiveInMonth(c, cli)) : [];
    return activeClients.length === 0 || activeClients.every(cli => cli.sent);
  });

  // 3. Marie's recent actions
  const myRecentActions = notifications.filter(n => n.author === 'Marie Dubois');

  // Action handlers
  const handleQuickValidateCRA = (consultant, cra) => {
    const employeeName = `${consultant.firstname} ${consultant.name}`;
    const monthStr = new Date(consultant.updatedAt || Date.now()).toLocaleString('en-US', { month: 'long' });
    
    addNotification(
      'cra',
      'CRA Validated',
      `The CRA **${cra.name}** for **${monthStr}** has been validated by **Marie Dubois** for **${employeeName}**.`,
      employeeName,
      'Marie Dubois'
    );

    updateConsultant(consultant.id, (c) => ({
      cras: c.cras.map(item => 
        item.id === cra.id ? { ...item, validated: true } : item
      )
    }));
  };

  const handleQuickSendInvoice = (consultant, client) => {
    const employeeName = `${consultant.firstname} ${consultant.name}`;
    const updatedClient = {
      ...client,
      sent: true
    };

    addNotification(
      'billing',
      'Action Confirmed',
      `Invoice for **${client.name}** has been marked as sent by **Marie Dubois** for **${employeeName}**.`,
      employeeName,
      'Marie Dubois'
    );

    updateConsultant(consultant.id, (c) => ({
      clients: c.clients.map(cli => 
        cli.id === client.id ? updatedClient : cli
      )
    }));
  };

  const handleQuickValidateConfirm = (consultant) => {
    const employeeName = `${consultant.firstname} ${consultant.name}`;
    
    addNotification(
      'final',
      'Validation Confirmed',
      `The complete workflow for **${employeeName}** has been validated by **Marie Dubois**.`,
      employeeName,
      'Marie Dubois'
    );
    
    updateConsultant(consultant.id, { archived: true });
  };

  return (
    <div className="page-content flex flex-col h-full overflow-y-auto">
      <div className="page-header flex justify-between items-center mb-6">
        <div>
          <div className="breadcrumb">PERSONAL WORKSPACE</div>
          <h1 className="page-title">Mon Espace</h1>
          <p className="text-muted text-sm mt-2">Manage your active tasks, profile status, and history at a glance.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* PROFILE CARD */}
        <div className="card p-6 flex flex-col items-center text-center bg-white" style={{ position: 'sticky', top: 0 }}>
          <div className="avatar avatar-lg" style={{ width: '80px', height: '80px', fontSize: '2rem', borderRadius: '16px', marginBottom: '1rem' }}>
            MD
          </div>
          <h2 className="m-0 font-bold" style={{ color: 'var(--primary-color)', fontSize: '1.25rem' }}>Marie Dubois</h2>
          <p className="text-muted text-sm mt-1 mb-4 flex items-center gap-1">
            <Shield size={14} className="text-amber-500" /> Responsable Administration & Facturation
          </p>

          <div style={{ width: '100%', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', textAlign: 'left' }} className="text-xs text-muted flex flex-col gap-2">
            <div><strong>Email:</strong> m.dubois@aceo.com</div>
            <div><strong>Role Level:</strong> Administrator</div>
            <div><strong>Logged since:</strong> Today, 9:00 AM</div>
          </div>
        </div>

        {/* WORKSPACE CONTENT */}
        <div className="flex flex-col gap-6">
          
          {/* PENDING TASKS PANEL */}
          <div className="card">
            <div className="card-header" style={{ backgroundColor: '#F8FAFC' }}>
              <h3 className="m-0 font-bold text-md text-primary flex items-center gap-2">
                <span>📋</span> Tâches à faire (Tâches en attente)
              </h3>
            </div>
            <div className="card-body flex flex-col gap-4">
              
              {/* CRA VALIDATIONS */}
              {pendingCras.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-muted mb-2 uppercase tracking-wider">Feuilles de temps à valider ({pendingCras.length})</h4>
                  <div className="flex flex-col gap-2">
                    {pendingCras.map(con => (
                      <div key={`cra-${con.id}`} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200 rounded-md text-sm">
                        <div className="flex items-center gap-2">
                          <div className="avatar" style={{ width: '28px', height: '28px', fontSize: '11px' }}>{con.initials}</div>
                          <span>Validate CRAs for <strong>{con.firstname} {con.name}</strong></span>
                          {con.muted && <BellOff size={14} className="text-slate-400" title="Muted Reminders" />}
                        </div>
                        <div className="flex gap-2">
                          {con.cras.filter(cra => !cra.validated).map(cra => (
                            <button 
                              key={cra.id}
                              className="btn btn-outline"
                              style={{ padding: '4px 10px', fontSize: '0.75rem', backgroundColor: '#ffffff' }}
                              onClick={() => handleQuickValidateCRA(con, cra)}
                            >
                              Validate {cra.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* INVOICES BILLING */}
              {pendingBillings.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <h4 className="text-xs font-semibold text-muted mb-2 uppercase tracking-wider">Factures Pennylane à envoyer ({pendingBillings.length})</h4>
                  <div className="flex flex-col gap-2">
                    {pendingBillings.map(({ consultant, client }) => (
                      <div key={`bill-${consultant.id}-${client.id}`} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200 rounded-md text-sm">
                        <div className="flex items-center gap-2">
                          <div className="avatar" style={{ width: '28px', height: '28px', fontSize: '11px' }}>{consultant.initials}</div>
                          <span>Send invoice for <strong>{client.name}</strong> (Consultant: {consultant.firstname} {consultant.name})</span>
                          {(consultant.muted || client.muted) && <BellOff size={14} className="text-slate-400" title="Muted Reminders" />}
                        </div>
                        <button 
                          className="btn btn-primary"
                          style={{ padding: '4px 10px', fontSize: '0.75rem', backgroundColor: '#F97316', color: '#ffffff' }}
                          onClick={() => handleQuickSendInvoice(consultant, client)}
                        >
                          <Send size={12} /> Mark as Sent
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* FINAL VALIDATIONS */}
              {pendingFinals.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <h4 className="text-xs font-semibold text-muted mb-2 uppercase tracking-wider">Validations finales en suspens ({pendingFinals.length})</h4>
                  <div className="flex flex-col gap-2">
                    {pendingFinals.map(con => (
                      <div key={`final-${con.id}`} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200 rounded-md text-sm">
                        <div className="flex items-center gap-2">
                          <div className="avatar" style={{ width: '28px', height: '28px', fontSize: '11px' }}>{con.initials}</div>
                          <span>Validate & Archive workflow for <strong>{con.firstname} {con.name}</strong></span>
                          {con.muted && <BellOff size={14} className="text-slate-400" title="Muted Reminders" />}
                        </div>
                        <button 
                          className="btn btn-primary"
                          style={{ padding: '4px 10px', fontSize: '0.75rem', backgroundColor: 'var(--success-color)', color: '#ffffff' }}
                          onClick={() => handleQuickValidateConfirm(con)}
                        >
                          <Archive size={12} /> Validate & Archive
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {pendingCras.length === 0 && pendingBillings.length === 0 && pendingFinals.length === 0 && (
                <div className="text-center text-muted p-8 text-sm">
                  ✨ Toutes les tâches en suspens ont été traitées ! Aucun rappel ou validation en attente.
                </div>
              )}

            </div>
          </div>

          {/* MY RECENT ACTIONS */}
          <div className="card">
            <div className="card-header" style={{ backgroundColor: '#F8FAFC' }}>
              <h3 className="m-0 font-bold text-md text-primary flex items-center gap-2">
                <span>↩</span> Mes Actions Récentes
              </h3>
            </div>
            <div className="card-body flex flex-col gap-3" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {myRecentActions.map(n => (
                <div 
                  key={n.id} 
                  className="p-3 border border-slate-200 rounded-md bg-white flex justify-between items-start text-xs text-slate-600"
                  style={{ gap: '1rem' }}
                >
                  <div className="flex flex-col gap-1" style={{ minWidth: 0 }}>
                    <div className="font-bold text-slate-800" style={{ fontSize: '0.75rem' }}>{n.title}</div>
                    <div style={{ wordBreak: 'break-word', fontSize: '0.75rem' }}>{parseBoldMessage(n.message)}</div>
                  </div>
                  <span className="text-slate-400 font-medium whitespace-nowrap">{formatTimeAgo(n.time)}</span>
                </div>
              ))}
              {myRecentActions.length === 0 && (
                <div className="text-center text-muted p-6">
                  Aucune action récente enregistrée aujourd'hui.
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
