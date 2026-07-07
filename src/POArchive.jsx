import React, { useState } from 'react';
import { Eye, Archive, Download, Printer, RotateCcw, X, FileText } from 'lucide-react';
import { mockArchivedPOs } from './data';

export default function POArchive() {
  const [selectedConsultant, setSelectedConsultant] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Local list state to support "Restoring" POs (removing them from local archive for the mockup feel)
  const [archivedPOs, setArchivedPOs] = useState(mockArchivedPOs);
  const [toastMessage, setToastMessage] = useState('');
  const [selectedPO, setSelectedPO] = useState(null); // For detail view modal

  // Filter distinct consultants and projects for dropdowns
  const distinctConsultants = Array.from(
    new Set(mockArchivedPOs.map(po => `${po.consultant.firstname} ${po.consultant.name}`))
  );
  
  const distinctProjects = Array.from(
    new Set(mockArchivedPOs.map(po => po.project))
  );

  // Apply filters locally
  const [filteredPOs, setFilteredPOs] = useState(mockArchivedPOs);

  const handleApplyFilters = () => {
    let result = archivedPOs;

    if (selectedConsultant) {
      result = result.filter(
        po => `${po.consultant.firstname} ${po.consultant.name}` === selectedConsultant
      );
    }

    if (selectedProject) {
      result = result.filter(po => po.project === selectedProject);
    }

    if (startDate) {
      result = result.filter(po => po.startDate >= startDate);
    }

    if (endDate) {
      result = result.filter(po => po.endDate <= endDate);
    }

    setFilteredPOs(result);
  };

  const handleResetFilters = () => {
    setSelectedConsultant('');
    setSelectedProject('');
    setStartDate('');
    setEndDate('');
    setFilteredPOs(archivedPOs);
  };

  // Mock Restore (Retrieve) Action
  const handleRestore = (po) => {
    // Remove from archive list
    const updated = archivedPOs.filter(item => item.id !== po.id);
    setArchivedPOs(updated);
    setFilteredPOs(updated.filter(item => {
      // Re-apply filters if active
      if (selectedConsultant && `${item.consultant.firstname} ${item.consultant.name}` !== selectedConsultant) return false;
      if (selectedProject && item.project !== selectedProject) return false;
      if (startDate && item.startDate < startDate) return false;
      if (endDate && item.endDate > endDate) return false;
      return true;
    }));

    // Trigger Toast
    setToastMessage(`PO ${po.poNumber} has been successfully restored to Active commitments.`);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(val);
  };

  const formatDate = (dateStr) => {
    const options = { year: 'numeric', month: 'short', day: '2-digit' };
    return new Date(dateStr).toLocaleDateString('en-US', options);
  };

  return (
    <div className="page-content flex flex-col h-full" style={{ padding: '2rem' }}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: '#10B981',
          color: '#FFFFFF',
          padding: '1rem 1.5rem',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          zIndex: 1000,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          animation: 'slideIn 0.3s ease-out'
        }}>
          <span>✓</span> {toastMessage}
        </div>
      )}

      {/* Header section */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="page-title" style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-color)', margin: 0 }}>
            Purchase Order Archive
          </h1>
          <p className="text-muted text-sm mt-1" style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
            Review and manage historical project commitments and financial records.
          </p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={() => alert("Exporting CSV...")}
            className="btn" 
            style={{ 
              backgroundColor: '#FFFFFF', 
              border: '1px solid var(--border-color)', 
              color: 'var(--text-main)', 
              padding: '0.6rem 1.2rem', 
              borderRadius: '6px', 
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            <Download size={16} />
            <span>Export CSV</span>
          </button>
          <button 
            onClick={() => alert("Printing Summary...")}
            className="btn" 
            style={{ 
              backgroundColor: 'var(--primary-color)', 
              border: '1px solid ' + (window.getComputedStyle ? 'var(--primary-color)' : '#262E52'), 
              color: '#FFFFFF', 
              padding: '0.6rem 1.2rem', 
              borderRadius: '6px', 
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            <Printer size={16} />
            <span>Print Summary</span>
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      <div className="card" style={{ 
        padding: '1.5rem', 
        marginBottom: '2rem', 
        display: 'flex', 
        gap: '1.5rem', 
        backgroundColor: '#FFFFFF', 
        border: '1px solid var(--border-color)', 
        borderRadius: '8px',
        alignItems: 'flex-end',
        flexWrap: 'wrap',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
      }}>
        {/* Consultant Dropdown */}
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-color)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Consultant
          </label>
          <select
            value={selectedConsultant}
            onChange={(e) => setSelectedConsultant(e.target.value)}
            className="form-input"
            style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.875rem', height: '42px', backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '6px' }}
          >
            <option value="">All Consultants</option>
            {distinctConsultants.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>

        {/* Project Dropdown */}
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-color)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Project Name
          </label>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="form-input"
            style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.875rem', height: '42px', backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '6px' }}
          >
            <option value="">All Projects</option>
            {distinctProjects.map(proj => (
              <option key={proj} value={proj}>{proj}</option>
            ))}
          </select>
        </div>

        {/* Date Range Start */}
        <div style={{ flex: 1, minWidth: '150px' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-color)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Date Range
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input 
              type="date" 
              value={startDate} 
              onChange={e => setStartDate(e.target.value)} 
              className="form-input"
              style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.875rem', height: '42px', backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '6px' }}
            />
            <span style={{ color: 'var(--text-muted)' }}>to</span>
            <input 
              type="date" 
              value={endDate} 
              onChange={e => setEndDate(e.target.value)} 
              className="form-input"
              style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.875rem', height: '42px', backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '6px' }}
            />
          </div>
        </div>

        {/* Apply & Reset Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleApplyFilters}
            className="btn"
            style={{
              height: '42px',
              padding: '0 1.5rem',
              fontSize: '0.875rem',
              backgroundColor: '#FEF3C7',
              border: '1px solid #F59E0B',
              color: '#B45309',
              fontWeight: 700,
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Apply Active Filters
          </button>
          
          {(selectedConsultant || selectedProject || startDate || endDate) && (
            <button
              onClick={handleResetFilters}
              className="btn btn-outline"
              style={{
                height: '42px',
                padding: '0 1rem',
                fontSize: '0.875rem',
                borderColor: 'var(--border-color)',
                color: 'var(--text-main)',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Reset Filters"
            >
              <RotateCcw size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: '#FFFFFF' }}>
        
        {/* Table container */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#262E52', color: '#FFFFFF', borderBottom: '1px solid var(--border-color)', fontWeight: 600, fontSize: '0.785rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                <th style={{ padding: '1.2rem 1.5rem' }}>PO Reference</th>
                <th style={{ padding: '1.2rem 1.5rem' }}>Consultant</th>
                <th style={{ padding: '1.2rem 1.5rem' }}>Project / Client</th>
                <th style={{ padding: '1.2rem 1.5rem' }}>Period</th>
                <th style={{ padding: '1.2rem 1.5rem', textAlign: 'right' }}>Total Amount</th>
                <th style={{ padding: '1.2rem 1.5rem', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPOs.map((po) => (
                <tr 
                  key={po.id} 
                  style={{ 
                    borderBottom: '1px solid var(--border-color)', 
                    transition: 'background-color 0.2s'
                  }}
                  className="hover-bg-slate"
                >
                  {/* PO Ref */}
                  <td style={{ padding: '1.2rem 1.5rem' }}>
                    <div style={{ fontWeight: 700, color: 'var(--primary-color)', fontSize: '0.95rem' }}>
                      {po.poNumber}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      ● {po.archivedDate}
                    </div>
                  </td>

                  {/* Consultant */}
                  <td style={{ padding: '1.2rem 1.5rem' }}>
                    <div className="flex items-center" style={{ gap: '12px' }}>
                      <div style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        backgroundColor: po.consultant.color + '15',
                        color: po.consultant.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        border: `1.5px solid ${po.consultant.color}35`,
                        flexShrink: 0
                      }}>
                        {po.consultant.initials}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                          {po.consultant.firstname} {po.consultant.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {po.consultant.role}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Project / Client */}
                  <td style={{ padding: '1.2rem 1.5rem' }}>
                    <div style={{ fontWeight: 700, color: 'var(--primary-color)' }}>
                      {po.project}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {po.client}
                    </div>
                  </td>

                  {/* Period */}
                  <td style={{ padding: '1.2rem 1.5rem', color: 'var(--text-main)', fontSize: '0.85rem' }}>
                    <div>{formatDate(po.startDate)}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0' }}>→</div>
                    <div>{formatDate(po.endDate)}</div>
                  </td>

                  {/* Total Amount */}
                  <td style={{ padding: '1.2rem 1.5rem', textAlign: 'right', fontWeight: 800, color: 'var(--primary-color)', fontSize: '1rem' }}>
                    {formatCurrency(po.totalAmount)}
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '1.2rem 1.5rem', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
                      <button 
                        onClick={() => setSelectedPO(po)}
                        className="btn-text p-1" 
                        style={{ color: 'var(--text-muted)', cursor: 'pointer', transition: 'color 0.2s', border: 'none', background: 'transparent' }}
                        title="View Details"
                      >
                        <Eye size={18} className="hover:text-primary" />
                      </button>
                      <button 
                        onClick={() => handleRestore(po)}
                        className="btn-text p-1" 
                        style={{ color: 'var(--text-muted)', cursor: 'pointer', transition: 'color 0.2s', border: 'none', background: 'transparent' }}
                        title="Restore Commitment"
                      >
                        <RotateCcw size={18} className="hover:text-primary" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredPOs.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    No archived commitments matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Pagination */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'between', alignItems: 'center', backgroundColor: '#F8FAFC' }} className="justify-between">
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Showing 1 to {filteredPOs.length} of {filteredPOs.length} results
          </div>
          <div style={{ display: 'flex', gap: '5px' }}>
            <button className="btn" disabled style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', border: '1px solid var(--border-color)', backgroundColor: '#FFFFFF', borderRadius: '4px', cursor: 'not-allowed', opacity: 0.5 }}>Previous</button>
            <button className="btn" disabled style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', border: '1px solid var(--border-color)', backgroundColor: '#FFFFFF', borderRadius: '4px', cursor: 'not-allowed', opacity: 0.5 }}>Next</button>
          </div>
        </div>
      </div>

      {/* PO Detail Viewer Modal */}
      {selectedPO && (
        <div className="modal-overlay" style={{ zIndex: 1000 }} onClick={() => setSelectedPO(null)}>
          <div className="modal-container" style={{ maxWidth: '600px', width: '90%' }} onClick={e => e.stopPropagation()}>
            
            <div className="modal-header" style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
              <div>
                <h3 className="modal-title" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-color)', margin: 0 }}>
                  PO Commitment Detail
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Ref: {selectedPO.poNumber} ({selectedPO.archivedDate})
                </span>
              </div>
              <button 
                className="btn-text" 
                onClick={() => setSelectedPO(null)}
                style={{ fontSize: '1.5rem', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ padding: '1.5rem', color: 'var(--text-main)' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Consultant</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: selectedPO.consultant.color + '15',
                      color: selectedPO.consultant.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 700
                    }}>
                      {selectedPO.consultant.initials}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700 }}>{selectedPO.consultant.firstname} {selectedPO.consultant.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{selectedPO.consultant.role}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Project / Client</span>
                  <div style={{ marginTop: '4px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--primary-color)' }}>{selectedPO.project}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selectedPO.client}</div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem', borderTop: '1px solid #F1F5F9', paddingTop: '1.25rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Period</span>
                  <div style={{ marginTop: '4px', fontWeight: 600, fontSize: '0.9rem' }}>
                    {formatDate(selectedPO.startDate)} - {formatDate(selectedPO.endDate)}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Financial Value</span>
                  <div style={{ marginTop: '4px', fontWeight: 800, color: 'var(--primary-color)', fontSize: '1.15rem' }}>
                    {formatCurrency(selectedPO.totalAmount)}
                  </div>
                </div>
              </div>

              {/* Linked files list */}
              <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '1.25rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Archived PO Document</span>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'between',
                  padding: '0.75rem 1rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  backgroundColor: '#F8FAFC',
                  marginTop: '6px'
                }} className="justify-between">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={18} style={{ color: 'var(--primary-color)' }} />
                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>purchase_order_{selectedPO.poNumber.toLowerCase()}.pdf</span>
                  </div>
                  <button 
                    onClick={() => alert("Downloading purchase order PDF (mock file)...")}
                    style={{
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: 'var(--primary-color)',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Download size={14} /> Download
                  </button>
                </div>
              </div>

            </div>

            <div className="modal-footer" style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'end', gap: '10px' }}>
              <button 
                className="btn btn-outline" 
                onClick={() => setSelectedPO(null)}
                style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
              >
                Close View
              </button>
              <button 
                className="btn" 
                onClick={() => { handleRestore(selectedPO); setSelectedPO(null); }}
                style={{ 
                  padding: '0.5rem 1.25rem', 
                  fontSize: '0.85rem',
                  backgroundColor: 'var(--primary-color)',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Restore PO
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
