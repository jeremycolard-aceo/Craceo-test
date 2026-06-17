import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Filter, Calendar, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { mockDelays } from './data';

export default function DelayHistory({ searchQuery }) {
  const [expandedRows, setExpandedRows] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filter States
  const [showFilters, setShowFilters] = useState(false);
  const [selectedConsultant, setSelectedConsultant] = useState('');
  const [minDuration, setMinDuration] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState('');

  const toggleRow = (id) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Helper to parse days from string (e.g. "5 days Late" or "2 days" -> 5 or 2)
  const parseDays = (str) => {
    const match = str.match(/([0-9.]+)/);
    return match ? parseFloat(match[1]) : 0;
  };

  // Extract unique months from all delay entries for filter select options
  const uniqueMonths = Array.from(new Set(mockDelays.flatMap(item => 
    item.delays.map(d => d.period.split(" (")[0])
  )));

  // Filter logic
  const filteredDelays = mockDelays.map(item => {
    const filteredDetails = item.delays.filter(d => {
      // Month/Period filter
      if (selectedMonth) {
        const periodMonth = d.period.split(" (")[0];
        if (periodMonth !== selectedMonth) return false;
      }
      // Duration filter
      if (minDuration > 0) {
        const days = parseDays(d.duration);
        if (days < minDuration) return false;
      }
      return true;
    });

    return {
      ...item,
      filteredDetails
    };
  }).filter(item => {
    // 1. Search Query filter (matches full name or role)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const fullName = `${item.firstname} ${item.name}`.toLowerCase();
      if (!fullName.includes(query) && !item.role.toLowerCase().includes(query)) {
        return false;
      }
    }

    // 2. Consultant filter dropdown
    if (selectedConsultant) {
      const fullName = `${item.firstname} ${item.name}`;
      if (fullName !== selectedConsultant) return false;
    }

    // 3. Month & Duration filters: consultant must have at least one delay matching the filters
    if ((selectedMonth || minDuration > 0) && item.filteredDetails.length === 0) {
      return false;
    }

    return true;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredDelays.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDelays.slice(indexOfFirstItem, indexOfLastItem);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // Helper to generate display summary text dynamically
  const getDisplaySummary = (item) => {
    const isFiltered = selectedMonth || minDuration > 0;
    const count = isFiltered ? item.filteredDetails.length : item.delayCount;
    
    let breakdownText;
    if (isFiltered) {
      const craCount = item.filteredDetails.filter(d => d.period.toLowerCase().includes('cra')).length;
      const invCount = item.filteredDetails.filter(d => d.period.toLowerCase().includes('invoice')).length;
      const parts = [];
      if (craCount > 0) parts.push(`CRA: ${craCount}`);
      if (invCount > 0) parts.push(`Inv: ${invCount}`);
      breakdownText = parts.join(', ');
    } else {
      breakdownText = item.breakdown;
    }

    return `${count} ${count > 1 ? 'delays' : 'delay'} (${breakdownText})`;
  };

  return (
    <div className="page-content flex flex-col h-full">
      {/* Header section */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="page-title">CRA & Invoice Delay History</h1>
          <p className="text-muted text-sm mt-1">Reviewing bottlenecks for active closure periods</p>
        </div>
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="btn flex items-center gap-2" 
          style={{ 
            backgroundColor: showFilters ? 'var(--primary-color)' : '#FFFFFF', 
            border: '1px solid var(--border-color)', 
            color: showFilters ? '#FFFFFF' : 'var(--text-main)', 
            padding: '0.5rem 1rem', 
            borderRadius: '6px', 
            fontSize: '0.875rem',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <Filter size={16} />
          <span>Filter</span>
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="card" style={{ 
          padding: '1.25rem', 
          marginBottom: '1.5rem', 
          display: 'flex', 
          gap: '1.5rem', 
          backgroundColor: '#FFFFFF', 
          border: '1px solid var(--border-color)', 
          borderRadius: '8px',
          alignItems: 'flex-end',
          flexWrap: 'wrap'
        }}>
          {/* Consultant Dropdown */}
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-color)', marginBottom: '0.35rem' }}>
              Consultant
            </label>
            <select
              value={selectedConsultant}
              onChange={(e) => setSelectedConsultant(e.target.value)}
              className="form-input"
              style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', height: '38px', backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '6px' }}
            >
              <option value="">All Consultants</option>
              {mockDelays.map(c => (
                <option key={c.id} value={`${c.firstname} ${c.name}`}>{c.firstname} {c.name}</option>
              ))}
            </select>
          </div>

          {/* Delay Duration Threshold Dropdown */}
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-color)', marginBottom: '0.35rem' }}>
              Delay Duration
            </label>
            <select
              value={minDuration}
              onChange={(e) => setMinDuration(parseFloat(e.target.value))}
              style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', height: '38px', backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '6px' }}
            >
              <option value="0">All Durations</option>
              <option value="1">&gt; 1 day</option>
              <option value="3">&gt;= 3 days</option>
              <option value="5">&gt;= 5 days</option>
            </select>
          </div>

          {/* Period Month Dropdown */}
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-color)', marginBottom: '0.35rem' }}>
              Period (Month)
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="form-input"
              style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', height: '38px', backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '6px' }}
            >
              <option value="">All Months</option>
              {uniqueMonths.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Reset Filters Button */}
          <div>
            <button
              onClick={() => {
                setSelectedConsultant('');
                setMinDuration(0);
                setSelectedMonth('');
              }}
              className="btn"
              style={{
                height: '38px',
                padding: '0 1.25rem',
                fontSize: '0.85rem',
                backgroundColor: '#F1F5F9',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                fontWeight: 600,
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}

      {/* Main card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-color)' }}>Consolidated Validation Delays</h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Late submissions grouped by consultant</p>
        </div>

        {/* Table container */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '1rem 1.5rem' }}>Consultant</th>
                <th style={{ padding: '1rem 1.5rem' }}>Summary</th>
                <th style={{ padding: '1rem 1.5rem' }}>Delay Duration</th>
                <th style={{ padding: '1rem 1.5rem' }}>Resolution Date</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item) => {
                const isExpanded = !!expandedRows[item.id];
                return (
                  <React.Fragment key={item.id}>
                    {/* Main Row */}
                    <tr 
                      onClick={() => toggleRow(item.id)}
                      style={{ 
                        borderBottom: '1px solid var(--border-color)', 
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                        backgroundColor: isExpanded ? '#F8FAFC' : 'transparent'
                      }}
                      className="hover-bg-slate"
                    >
                      {/* Consultant info with avatar */}
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div className="flex items-center gap-4">
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: '#E2E8F0',
                            color: 'var(--primary-color)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            flexShrink: 0
                          }}>
                            {item.initials}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--primary-color)' }}>
                              {item.firstname} {item.name}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {item.role}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Summary pill */}
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <span style={{
                          backgroundColor: '#FEE2E2',
                          color: '#EF4444',
                          border: '1px solid #FCA5A5',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          padding: '0.25rem 0.6rem',
                          borderRadius: '9999px'
                        }}>
                          {getDisplaySummary(item)}
                        </span>
                      </td>

                      {/* Delay duration */}
                      <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#EF4444' }}>
                        {item.avgDuration}
                      </td>

                      {/* Resolution date and caret */}
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div className="flex items-center justify-between" style={{ minWidth: '120px' }}>
                          <span style={{ color: 'var(--text-main)', fontSize: '0.85rem' }}>Last: {item.lastResolution}</span>
                          {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                        </div>
                      </td>
                    </tr>

                    {/* Collapsible Details Row */}
                    {isExpanded && (
                      <tr>
                        <td colSpan="4" style={{ padding: 0, backgroundColor: '#FCFDFE', borderBottom: '1px solid var(--border-color)' }}>
                          <div style={{ padding: '1.25rem 1.5rem 1.5rem 4rem' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.825rem' }}>
                              <thead>
                                <tr style={{ color: 'var(--text-light)', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em' }}>
                                  <th style={{ padding: '0.5rem 0' }}>Period / Type</th>
                                  <th style={{ padding: '0.5rem 0' }}>Timestamp</th>
                                  <th style={{ padding: '0.5rem 0' }}>Duration</th>
                                  <th style={{ padding: '0.5rem 0' }}>Resolution</th>
                                </tr>
                              </thead>
                              <tbody>
                                {item.filteredDetails.map((delay) => (
                                  <tr key={delay.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                    <td style={{ padding: '0.75rem 0' }}>
                                      <div className="flex items-center gap-2" style={{ fontWeight: 500, color: 'var(--primary-color)' }}>
                                        {delay.period.includes('Invoice') ? (
                                          <FileText size={14} className="text-amber-500" />
                                        ) : (
                                          <Calendar size={14} className="text-blue-500" />
                                        )}
                                        {delay.period}
                                      </div>
                                    </td>
                                    <td style={{ padding: '0.75rem 0', color: 'var(--text-muted)' }}>
                                      {delay.timestamp}
                                    </td>
                                    <td style={{ padding: '0.75rem 0', fontWeight: 600, color: '#EF4444' }}>
                                      {delay.duration}
                                    </td>
                                    <td style={{ padding: '0.75rem 0', color: 'var(--text-main)' }}>
                                      {delay.resolution}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}

              {filteredDelays.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No delays history found for this search/filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer with pagination */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'between',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          width: '100%'
        }} className="justify-between">
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Showing {filteredDelays.length} {filteredDelays.length > 1 ? 'consultants' : 'consultant'} with pending delays
          </span>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button 
                onClick={handlePrevPage} 
                disabled={currentPage === 1}
                className="btn" 
                style={{
                  padding: '0.25rem 0.5rem',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--border-color)',
                  color: currentPage === 1 ? 'var(--text-light)' : 'var(--text-main)',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  borderRadius: '4px'
                }}
              >
                <ChevronLeft size={16} />
              </button>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>
                {currentPage} / {totalPages}
              </span>
              <button 
                onClick={handleNextPage} 
                disabled={currentPage === totalPages}
                className="btn" 
                style={{
                  padding: '0.25rem 0.5rem',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--border-color)',
                  color: currentPage === totalPages ? 'var(--text-light)' : 'var(--text-main)',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  borderRadius: '4px'
                }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
