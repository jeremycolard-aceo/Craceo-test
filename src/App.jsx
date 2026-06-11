import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import ConsultantConfiguration from './ConsultantConfiguration';
import ValidationsPipeline from './ValidationsPipeline';
import FilterSidebar from './FilterSidebar';
import { mockConsultants } from './data';
import './index.css';

function App() {
  const [currentView, setCurrentView] = useState('consultants');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter sidebar state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    mentor: [],
    comments: [],
    status: [],
    job: [],
    referenceTown: [],
    mail: [],
    name: [],
    cra: []
  });

  // Toast notifications for undos
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // In-memory consultants database state
  const [consultants, setConsultantsState] = useState(mockConsultants);

  // Undo action for a specific consultant
  const handleUndo = (consultantId) => {
    setConsultantsState(prev => prev.map(c => {
      if (c.id === consultantId) {
        if (!c.history || c.history.length === 0) return c;
        const lastState = c.history[c.history.length - 1];
        const remainingHistory = c.history.slice(0, -1);
        return {
          ...lastState,
          history: remainingHistory,
          updatedAt: Date.now()
        };
      }
      return c;
    }));
  };

  // Centralized update function that logs history per consultant
  const updateConsultant = (consultantId, updatedFieldsOrFn) => {
    setConsultantsState(prev => prev.map(c => {
      if (c.id === consultantId) {
        const updatedFields = typeof updatedFieldsOrFn === 'function' ? updatedFieldsOrFn(c) : updatedFieldsOrFn;
        
        // Push current state to this consultant's local history (stripping previous history references)
        const { history: _, ...snapshot } = c;
        const newHistory = c.history ? [...c.history, snapshot] : [snapshot];
        
        // Show undo toast if we are archiving a card
        if (updatedFields.archived === true) {
          setToast({
            message: `${c.firstname} ${c.name} has been validated and archived.`,
            consultantId: c.id
          });
        }

        return {
          ...c,
          ...updatedFields,
          history: newHistory,
          updatedAt: Date.now()
        };
      }
      return c;
    }));
  };

  const handleReset = () => {
    setToast(null);
    setConsultantsState(mockConsultants);
  };

  // Perform combining filters
  const getFilteredConsultants = () => {
    return consultants.filter(c => {
      // 1. Search Query filter (matches full concatenated name, role, or client assignments)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const fullName = `${c.firstname || ''} ${c.name || ''}`.toLowerCase();
        const matchesName = fullName.includes(query);
        const matchesRole = c.role?.toLowerCase().includes(query);
        const matchesClient = c.assignments?.some(ass => ass.client?.toLowerCase().includes(query));
        if (!matchesName && !matchesRole && !matchesClient) {
          return false;
        }
      }

      // 2. Sidebar Filter checks
      if (activeFilters.mentor.length > 0) {
        if (!c.mentor || !activeFilters.mentor.includes(c.mentor)) return false;
      }
      if (activeFilters.comments.length > 0) {
        if (!c.comments || !activeFilters.comments.includes(c.comments)) return false;
      }
      if (activeFilters.status.length > 0) {
        if (!c.status || !activeFilters.status.includes(c.status)) return false;
      }
      if (activeFilters.job.length > 0) {
        if (!c.role || !activeFilters.job.includes(c.role)) return false;
      }
      if (activeFilters.referenceTown.length > 0) {
        if (!c.referenceTown || !activeFilters.referenceTown.includes(c.referenceTown)) return false;
      }
      if (activeFilters.mail.length > 0) {
        if (!c.jobMailAceo || !activeFilters.mail.includes(c.jobMailAceo)) return false;
      }
      if (activeFilters.name.length > 0) {
        if (!c.name || !activeFilters.name.includes(c.name)) return false;
      }
      if (activeFilters.cra.length > 0) {
        const hasMatchingCra = c.cras?.some(cra => activeFilters.cra.includes(cra.name));
        if (!hasMatchingCra) return false;
      }

      return true;
    });
  };

  const filteredConsultants = getFilteredConsultants();

  return (
    <div className="app-container">
      <Topbar 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        onReset={handleReset} 
      />
      <div className="main-area">
        <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
        <div className="main-content">
          {currentView === 'consultants' && (
            <ConsultantConfiguration 
              consultants={consultants} 
              setConsultants={setConsultantsState} 
              updateConsultant={updateConsultant}
              filteredConsultants={filteredConsultants}
              onOpenFilter={() => setIsFilterOpen(true)}
              handleUndo={handleUndo}
            />
          )}
          {currentView === 'validations' && (
            <ValidationsPipeline 
              consultants={consultants} 
              setConsultants={setConsultantsState} 
              updateConsultant={updateConsultant}
              filteredConsultants={filteredConsultants}
              onOpenFilter={() => setIsFilterOpen(true)}
              handleUndo={handleUndo}
            />
          )}
        </div>
      </div>

      <FilterSidebar 
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        consultants={consultants}
        activeFilters={activeFilters}
        setActiveFilters={setActiveFilters}
      />

      {toast && (
        <div className="toast-container">
          <div className="toast">
            <span>{toast.message}</span>
            {toast.consultantId && (
              <button 
                className="toast-action-btn"
                onClick={() => {
                  handleUndo(toast.consultantId);
                  setToast(null);
                }}
              >
                UNDO
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
