export const mockConsultants = [
  {
    id: 1,
    firstname: "Nicolas",
    name: "Sanchez",
    role: "Senior Project Manager",
    initials: "NS",
    muted: false,
    cras: [
      { id: 'cra2', name: "BOOND", validated: true }
    ],
    assignments: [
      { id: 'ass1', client: "Veolia", startDate: "2023-01-15", endDate: "2024-12-31" }
    ],
    clients: [
      {
        id: 'ass1',
        name: "Veolia",
        managerName: "Jean-Pierre Lambert",
        billingCycle: "Monthly",
        managerEmail: "j.lambert@veolia.com",
        billingManagers: ["j.lambert@veolia.com"],
        phone: "+33 1 23 45 67 89",
        billingContacts: [
          {
            name: "Jean-Pierre Lambert",
            email: "j.lambert@veolia.com",
            phone: "+33 1 23 45 67 89"
          }
        ],
        poNumber: "",
        orderEndDate: "2024-12-31",
        poUploaded: false,
        poFileName: "",
        sent: false,
        muted: false
      }
    ],
    incomingDay: "2023-01-15",
    personalEmail: "nicolas.sanchez@gmail.com",
    phone: "+33 6 12 34 56 78",
    birthday: "1988-05-12",
    manager: "Alexandre Rossi",
    referenceTown: "Paris",
    mentor: "Sébastien Dubois",
    comments: "Senior Profile, key consultant for Veolia account.",
    status: "Active",
    jobMailAceo: "n.sanchez@aceo.com",
    updatedAt: Date.now() - 3600000 * 2 // 2 hours ago
  },
  {
    id: 2,
    firstname: "Guillaume",
    name: "Duluc",
    role: "Strategy Consultant",
    initials: "GD",
    muted: false,
    cras: [
      { id: 'cra4', name: "BOUND", validated: true }
    ],
    assignments: [
      { id: 'ass2', client: "Global Tech", startDate: "2024-03-01", endDate: "2025-09-30" }
    ],
    clients: [
      {
        id: 'ass2',
        name: "Global Tech",
        managerName: "Luc Martin",
        billingCycle: "Monthly",
        managerEmail: "luc.martin@globaltech.com",
        billingManagers: ["luc.martin@globaltech.com"],
        phone: "+33 1 11 22 33 44",
        billingContacts: [
          {
            name: "Luc Martin",
            email: "luc.martin@globaltech.com",
            phone: "+33 1 11 22 33 44"
          }
        ],
        poNumber: "",
        orderEndDate: "2025-10-31",
        poUploaded: false,
        poFileName: "",
        sent: false,
        muted: false
      }
    ],
    incomingDay: "2024-03-01",
    personalEmail: "guillaume.duluc@outlook.com",
    phone: "+33 6 98 76 54 32",
    birthday: "1991-09-22",
    manager: "Alexandre Rossi",
    referenceTown: "Lyon",
    mentor: "Nicolas Sanchez",
    comments: "Leads key operations for Global Tech.",
    status: "Active",
    jobMailAceo: "g.duluc@aceo.com",
    updatedAt: Date.now() - 3600000 * 24 // 24 hours ago (Yesterday)
  },
  {
    id: 3,
    firstname: "Quentin",
    name: "Astarie",
    role: "DevOps Architect",
    initials: "QA",
    muted: false,
    cras: [
      { id: 'cra6', name: "BOOND", validated: true }
    ],
    assignments: [],
    clients: [],
    incomingDay: "2025-02-01",
    personalEmail: "quentin.astarie@gmail.com",
    phone: "+33 6 55 44 33 22",
    birthday: "1994-11-05",
    manager: "Sarah Jenkins",
    referenceTown: "Nantes",
    mentor: "Guillaume Duluc",
    comments: "Expert in Kubernetes and Cloud infrastructures.",
    status: "Active",
    jobMailAceo: "q.astarie@aceo.com",
    updatedAt: Date.now() - 60000 // 1 minute ago
  }
];

export const craTypes = ["CRA INETUM", "BOOND", "CRA LBC", "CRA NEW"];

export const mockDelays = [
  {
    id: 1,
    firstname: "Nicolas",
    name: "Sanchez",
    initials: "NS",
    role: "Senior Project Manager",
    delayCount: 3,
    breakdown: "CRA: 2, Inv: 1",
    avgDuration: "Avg: 3.3 days",
    lastResolution: "10/02/2024",
    delays: [
      {
        id: "d1_1",
        period: "Jan 2024 (CRA)",
        timestamp: "05/02/2024 10:26",
        duration: "5 days Late",
        resolution: "06/02/2024"
      },
      {
        id: "d1_2",
        period: "Mar 2024 (CRA)",
        timestamp: "04/04/2024 14:15",
        duration: "3 days Late",
        resolution: "05/04/2024"
      },
      {
        id: "d1_3",
        period: "May 2024 (Invoice)",
        timestamp: "02/06/2024 09:45",
        duration: "2 days Late",
        resolution: "03/06/2024"
      }
    ]
  },
  {
    id: 2,
    firstname: "Guillaume",
    name: "Duluc",
    initials: "GD",
    role: "Strategy Consultant",
    delayCount: 1,
    breakdown: "CRA: 1",
    avgDuration: "2 days",
    lastResolution: "08/06/2024",
    delays: [
      {
        id: "d2_1",
        period: "May 2024 (CRA)",
        timestamp: "03/06/2024 11:30",
        duration: "2 days Late",
        resolution: "08/06/2024"
      }
    ]
  },
  {
    id: 4,
    firstname: "Anaëlle",
    name: "Juarez",
    initials: "AJ",
    role: "UX/UI Designer",
    delayCount: 2,
    breakdown: "Inv: 2",
    avgDuration: "Avg: 1 day",
    lastResolution: "02/03/2024",
    delays: [
      {
        id: "d4_1",
        period: "Jan 2024 (Invoice)",
        timestamp: "02/02/2024 09:15",
        duration: "1 day Late",
        resolution: "02/02/2024"
      },
      {
        id: "d4_2",
        period: "Feb 2024 (Invoice)",
        timestamp: "02/03/2024 09:00",
        duration: "1 day Late",
        resolution: "03/03/2024"
      }
    ]
  }
];

export const mockNotificationRules = [
  {
    id: "rule_1",
    name: "Monthly Submission J-1",
    tag: "CRITICAL",
    active: true,
    messageTemplate: "🚨 Attention, dernier rappel ! Votre CRA doit être complétée avant la fin de la journée. Tout retard pourrait impacter vos avantages. Merci de votre réactivité. 📋",
    channels: ["personal"],
    relativeDay: -1,
    timeOfDay: "09:00",
    lastUpdated: "2 days ago by Admin"
  },
  {
    id: "rule_2",
    name: "Initial Reminder J0",
    tag: "STANDARD",
    active: true,
    messageTemplate: "The CRA period is now open for entry. Please submit your timesheet as soon as possible.",
    channels: ["general"],
    relativeDay: 0,
    timeOfDay: "10:30",
    lastUpdated: "5 days ago by Admin"
  },
  {
    id: "rule_3",
    name: "Late Reminder J+2",
    tag: "URGENT",
    active: true,
    messageTemplate: "Action required: Your CRA is now 2 days late. Please submit it immediately to avoid penalties.",
    channels: ["email"],
    relativeDay: 2,
    timeOfDay: "14:00",
    lastUpdated: "1 week ago by Admin"
  }
];

export const mockArchivedPOs = [
  {
    id: "arch_1",
    poNumber: "VE-2024-MAINT-FR-004",
    archivedDate: "Archived Mar 2024",
    consultant: {
      firstname: "Nicolas",
      name: "Sanchez",
      role: "Senior Engineer",
      initials: "NS",
      color: "#2563EB"
    },
    project: "Venus",
    client: "Veolia",
    startDate: "2024-01-01",
    endDate: "2024-03-31",
    totalAmount: 42500.00
  },
  {
    id: "arch_2",
    poNumber: "EN-2023-STRAT-GB-089",
    archivedDate: "Archived Dec 2023",
    consultant: {
      firstname: "Sarah",
      name: "Jenkins",
      role: "Strategy Consultant",
      initials: "SJ",
      color: "#E29C21"
    },
    project: "Apollo Cloud",
    client: "Engie",
    startDate: "2023-08-15",
    endDate: "2023-12-15",
    totalAmount: 118200.00
  },
  {
    id: "arch_3",
    poNumber: "TO-2023-AUDIT-DE-112",
    archivedDate: "Archived Nov 2023",
    consultant: {
      firstname: "Marc",
      name: "Dubois",
      role: "Risk Auditor",
      initials: "MD",
      color: "#64748B"
    },
    project: "Hydra Maintenance",
    client: "TotalEnergies",
    startDate: "2023-09-01",
    endDate: "2023-11-30",
    totalAmount: 28750.00
  },
  {
    id: "arch_4",
    poNumber: "ST-2023-TITAN-US-021",
    archivedDate: "Archived Oct 2023",
    consultant: {
      firstname: "Elena",
      name: "Rodriguez",
      role: "Architecture Lead",
      initials: "ER",
      color: "#8B5CF6"
    },
    project: "Titan Infrastructure",
    client: "Stellantis",
    startDate: "2023-05-10",
    endDate: "2023-10-20",
    totalAmount: 210000.00
  }
];


