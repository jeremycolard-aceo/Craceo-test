import { useState } from 'react';
import { ArrowLeft, ChevronDown, ChevronRight } from 'lucide-react';

export default function FilterSidebar({ 
  isOpen, 
  onClose, 
  consultants, 
  activeFilters, 
  setActiveFilters 
}) {
  const [expandedSection, setExpandedSection] = useState(null);

  if (!isOpen) return null;

  // Dynamically extract unique values from consultants database
  const getUniqueValues = (field) => {
    const values = new Set();
    consultants.forEach(c => {
      if (field === 'cra') {
        c.cras?.forEach(cra => {
          if (cra.name) values.add(cra.name);
        });
      } else if (field === 'office') {
        if (c.referenceTown) values.add(c.referenceTown);
      } else if (field === 'job') {
        if (c.role) values.add(c.role);
      } else if (field === 'name') {
        if (c.name) values.add(c.name);
      } else {
        if (c[field]) values.add(c[field]);
      }
    });
    return Array.from(values).sort();
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleCheckboxChange = (category, value) => {
    setActiveFilters(prev => {
      const currentList = prev[category] || [];
      const updatedList = currentList.includes(value)
        ? currentList.filter(v => v !== value)
        : [...currentList, value];
      return {
        ...prev,
        [category]: updatedList
      };
    });
  };

  const handleClear = () => {
    setActiveFilters({
      mentor: [],
      comments: [],
      status: [],
      job: [],
      referenceTown: [],
      mail: [],
      name: [],
      cra: []
    });
  };

  const sections = [
    { id: 'mentor', label: 'Mentor', field: 'mentor', filterKey: 'mentor' },
    { id: 'comments', label: 'Comments', field: 'comments', filterKey: 'comments' },
    { id: 'status', label: 'Status', field: 'status', filterKey: 'status' },
    { id: 'job', label: 'Job', field: 'job', filterKey: 'job' },
    { id: 'office', label: 'Office', field: 'office', filterKey: 'referenceTown' },
    { id: 'mail', label: 'Mail', field: 'jobMailAceo', filterKey: 'mail' },
    { id: 'name', label: 'Name', field: 'name', filterKey: 'name' },
    { id: 'cra', label: 'CRA', field: 'cra', filterKey: 'cra' }
  ];

  return (
    <>
      <div className="side-panel-overlay" onClick={onClose}></div>
      <div className="side-panel" style={{ width: '380px', backgroundColor: '#FFFFFF' }}>
        <div className="panel-header" style={{ borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="btn-text text-primary flex items-center gap-2" onClick={onClose} style={{ fontSize: '1.25rem', fontWeight: 700, border: 'none', background: 'none', cursor: 'pointer' }}>
            <ArrowLeft size={20} /> Filter
          </button>
        </div>

        <div className="panel-body" style={{ padding: 0 }}>
          {sections.map(section => {
            const values = getUniqueValues(section.field);
            const isExpanded = expandedSection === section.id;
            const activeCount = activeFilters[section.filterKey]?.length || 0;

            return (
              <div key={section.id} style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="filter-item-header" onClick={() => toggleSection(section.id)}>
                  <span className="flex items-center gap-2">
                    {section.label}
                    {activeCount > 0 && (
                      <span className="badge" style={{ backgroundColor: 'var(--accent-color)', color: 'var(--primary-color)', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '10px' }}>
                        {activeCount}
                      </span>
                    )}
                  </span>
                  {isExpanded ? <ChevronDown size={18} color="var(--text-light)" /> : <ChevronRight size={18} color="var(--text-light)" />}
                </div>

                {isExpanded && (
                  <div className="filter-item-content">
                    {values.length > 0 ? (
                      values.map(val => {
                        const isChecked = activeFilters[section.filterKey]?.includes(val);
                        return (
                          <label key={val} className="filter-checkbox-label">
                            <input 
                              type="checkbox" 
                              checked={isChecked}
                              onChange={() => handleCheckboxChange(section.filterKey, val)}
                              style={{ width: '16px', height: '16px', accentColor: 'var(--accent-color)' }}
                            />
                            <span>{val}</span>
                          </label>
                        );
                      })
                    ) : (
                      <div className="text-xs text-muted">No values found.</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="panel-footer" style={{ justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderTop: '1px solid var(--border-color)', backgroundColor: '#ffffff' }}>
          <button className="btn btn-outline" style={{ border: 'none', color: 'var(--text-muted)', fontWeight: 600 }} onClick={handleClear}>
            Clear
          </button>
          <button className="btn btn-primary" style={{ padding: '0.625rem 2rem', fontWeight: 600, backgroundColor: 'var(--primary-color)', color: '#FFFFFF', border: 'none', borderRadius: '4px', cursor: 'pointer' }} onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </>
  );
}
