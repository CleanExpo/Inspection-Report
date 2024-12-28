export const mockReports = [
  {
    id: '1',
    clientName: 'John Smith',
    propertyAddress: '123 Main St, Anytown, USA',
    inspectionDate: '2024-01-15',
    inspectorName: 'Mike Johnson',
    damageType: 'water',
    severity: 'high',
    status: 'completed',
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    clientName: 'Sarah Wilson',
    propertyAddress: '456 Oak Ave, Somewhere, USA',
    inspectionDate: '2024-01-16',
    inspectorName: 'Mike Johnson',
    damageType: 'mold',
    severity: 'medium',
    status: 'in-progress',
    createdAt: '2024-01-16T14:20:00Z'
  },
  {
    id: '3',
    clientName: 'Robert Brown',
    propertyAddress: '789 Pine Rd, Elsewhere, USA',
    inspectionDate: '2024-01-17',
    inspectorName: 'Lisa Davis',
    damageType: 'fire',
    severity: 'critical',
    status: 'completed',
    createdAt: '2024-01-17T09:15:00Z'
  }
];

export const getReports = () => {
  // Simulate network delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockReports);
    }, 2000);
  });
};

export const getReportById = (id) => {
  const report = mockReports.find(r => r.id === id);
  return Promise.resolve(report || null);
};
