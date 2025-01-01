export interface ClaimStats {
  totalClaims: number;
  openClaims: number;
  closedClaims: number;
  averageAge: number;
}

export interface ClaimByType {
  type: string;
  count: number;
  value: number;
}

export interface ClaimByAge {
  range: string;
  count: number;
  percentage: number;
}

export interface EquipmentStats {
  totalEquipment: number;
  activeEquipment: number;
  equipmentByType: {
    type: string;
    count: number;
  }[];
  utilizationRate: number;
}

export interface MonthlyStats {
  month: string;
  newClaims: number;
  closedClaims: number;
  activeEquipment: number;
}

export interface RegionalStats {
  region: string;
  claimCount: number;
  equipmentCount: number;
  averageResolutionTime: number;
}

export interface PerformanceMetrics {
  averageResolutionTime: number;
  clientSatisfactionRate: number;
  equipmentUtilizationRate: number;
  inspectionCompletionRate: number;
}

export interface AnalyticsDashboardData {
  claimStats: ClaimStats;
  claimsByType: ClaimByType[];
  claimsByAge: ClaimByAge[];
  equipmentStats: EquipmentStats;
  monthlyStats: MonthlyStats[];
  regionalStats: RegionalStats[];
  performanceMetrics: PerformanceMetrics;
}
