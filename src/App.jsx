import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import ConsultantConfiguration from './ConsultantConfiguration';
import ValidationsPipeline from './ValidationsPipeline';
import Notifications from './Notifications';
import Settings from './Settings';
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

  // Dark mode state
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // In-memory consultants database state
  const [consultants, setConsultantsState] = useState(mockConsultants);

  // In-memory notifications log database state
  const [notifications, setNotifications] = useState([
    {
      id: 'month_alert_cra',
      type: 'alert',
      title: 'Monthly CRA Alert',
      message: 'The CRAs of **Nicolas Sanchez** and **Guillaume Duluc** have not been validated.',
      author: 'System',
      employeeName: 'Multiple',
      time: Date.now() - 10000,
      read: false
    },
    {
      id: 'month_alert_billing',
      type: 'alert',
      title: 'Monthly Billing Alert',
      message: 'The invoices for **Guillaume Duluc** and **Quentin Astarie** have not been sent.',
      author: 'System',
      employeeName: 'Multiple',
      time: Date.now() - 12000,
      read: false
    },
    {
      id: 'month_alert_final',
      type: 'alert',
      title: 'Monthly Final Validation Alert',
      message: 'The final validation for **Nicolas Sanchez** has not been completed.',
      author: 'System',
      employeeName: 'Multiple',
      time: Date.now() - 14000,
      read: false
    },
    {
      id: 1,
      type: 'undo',
      title: 'Action Cancelled',
      message: 'The last action concerning **Nicolas Sanchez** has been canceled by **Marie Dubois**.',
      author: 'Marie Dubois',
      employeeName: 'Nicolas Sanchez',
      time: Date.now() - 30000, // Just now
      read: true
    },
    {
      id: 2,
      type: 'billing',
      title: 'Action Confirmed',
      message: 'Invoice for **Air Liquide** has been marked as sent by **Marie Dubois** for **Nicolas Sanchez**.',
      author: 'Marie Dubois',
      employeeName: 'Nicolas Sanchez',
      time: Date.now() - 300000, // 5m ago
      read: false
    },
    {
      id: 4,
      type: 'cra_submit',
      title: 'CRA Validation Submitted',
      message: 'The CRA **BOOND** for **October** has been validated by **Marie Dubois** for the consultant **Nicolas Sanchez**.',
      author: 'Marie Dubois',
      employeeName: 'Nicolas Sanchez',
      time: Date.now() - 7200000, // 2h ago
      read: false
    },
    {
      id: 5,
      type: 'alert',
      title: 'Mission Ending Alert',
      message: 'Mission for **Air Liquide** is ending in 30 days for **Nicolas Sanchez**.',
      author: 'System',
      employeeName: 'Nicolas Sanchez',
      time: Date.now() - 18000000, // 5h ago
      read: false
    }
  ]);

  const addNotification = (type, title, message, employeeName, author = 'Marie Dubois', extra = {}) => {
    setNotifications(prev => [
      {
        id: Date.now() + Math.random(),
        type,
        title,
        message,
        author,
        employeeName,
        time: Date.now(),
        read: false,
        ...extra
      },
      ...prev
    ]);
  };

  // Undo action for a specific consultant
  const handleUndo = (consultantId) => {
    setConsultantsState(prev => prev.map(c => {
      if (c.id === consultantId) {
        if (!c.history || c.history.length === 0) return c;
        const lastState = c.history[c.history.length - 1];
        const remainingHistory = c.history.slice(0, -1);

        addNotification(
          'undo',
          'Action Cancelled',
          `The last action concerning **${c.firstname} ${c.name}** has been canceled by **Marie Dubois**.`,
          `${c.firstname} ${c.name}`,
          'Marie Dubois'
        );

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

        // Ensure BOOND cra exists and is mandatory
        let finalCras = updatedFields.cras || c.cras || [];
        const hasBoond = finalCras.some(cra => cra.name.toLowerCase().includes('boond'));
        if (!hasBoond) {
          finalCras = [...finalCras, { id: 'cra_boond_' + Date.now(), name: "BOOND", validated: false }];
        }

        return {
          ...c,
          ...updatedFields,
          cras: finalCras,
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
              addNotification={addNotification}
            />
          )}
          {currentView === 'notifications' && (
            <Notifications 
              notifications={notifications}
              setNotifications={setNotifications}
              addNotification={addNotification}
              consultants={consultants}
              updateConsultant={updateConsultant}
            />
          )}
          {currentView === 'settings' && (
            <Settings 
              darkMode={darkMode}
              setDarkMode={setDarkMode}
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
