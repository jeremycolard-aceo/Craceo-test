export const mockConsultants = [
  {
    id: 1,
    firstname: "Nicolas",
    name: "Sanchez",
    role: "Senior Project Manager",
    initials: "NS",
    cras: [
      { id: 'cra1', name: "CRA INETUM", validated: false },
      { id: 'cra2', name: "BOOND", validated: true },
      { id: 'cra3', name: "CRA LBC", validated: true }
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
        phone: "+33 1 23 45 67 89",
        poNumber: "VE-2024-MAINT-FR-004",
        orderEndDate: "2024-12-31",
        poUploaded: false,
        poFileName: "",
        sent: false
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
    cras: [
      { id: 'cra4', name: "CRA BOOND", validated: true }
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
        phone: "+33 1 11 22 33 44",
        poNumber: "GT-2024-11",
        orderEndDate: "2025-10-31",
        poUploaded: false,
        poFileName: "",
        sent: false
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
    cras: [
      { id: 'cra5', name: "CRA LBC", validated: true },
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
