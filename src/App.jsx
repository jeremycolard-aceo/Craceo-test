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

  // State and Undo History initialization
  const [history, setHistory] = useState([]);
  const [consultants, setConsultantsState] = useState(mockConsultants);

  const setConsultants = (newVal) => {
    setConsultantsState(prev => {
      const nextVal = typeof newVal === 'function' ? newVal(prev) : newVal;
      // Push copy of previous state to history if different
      if (JSON.stringify(prev) !== JSON.stringify(nextVal)) {
        setHistory(h => [...h, prev]);
      }
      return nextVal;
    });
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const previousState = history[history.length - 1];
    setHistory(history.slice(0, -1));
    setConsultantsState(previousState);
  };

  const handleReset = () => {
    setHistory([]);
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
              setConsultants={setConsultants} 
              filteredConsultants={filteredConsultants}
              onOpenFilter={() => setIsFilterOpen(true)}
              handleUndo={handleUndo}
              canUndo={history.length > 0}
            />
          )}
          {currentView === 'validations' && (
            <ValidationsPipeline 
              consultants={consultants} 
              setConsultants={setConsultants} 
              filteredConsultants={filteredConsultants}
              onOpenFilter={() => setIsFilterOpen(true)}
              handleUndo={handleUndo}
              canUndo={history.length > 0}
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
    </div>
  );
}

export default App;
