import { AnalyticsDashboardData } from '../types/analytics';

export class AnalyticsService {
  private static instance: AnalyticsService;

  private constructor() {}

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  public async getDashboardData(): Promise<AnalyticsDashboardData> {
    // In production, this would be an API call
    return Promise.resolve({
      claimStats: {
        totalClaims: 156,
        openClaims: 42,
        closedClaims: 114,
        averageAge: 15 // days
      },
      claimsByType: [
        { type: 'Water Damage', count: 65, value: 325000 },
        { type: 'Fire Damage', count: 23, value: 460000 },
        { type: 'Storm Damage', count: 45, value: 225000 },
        { type: 'Mold', count: 15, value: 75000 },
        { type: 'Other', count: 8, value: 40000 }
      ],
      claimsByAge: [
        { range: '0-7 days', count: 15, percentage: 35.7 },
        { range: '8-14 days', count: 12, percentage: 28.6 },
        { range: '15-30 days', count: 8, percentage: 19.0 },
        { range: '31-60 days', count: 5, percentage: 11.9 },
        { range: '60+ days', count: 2, percentage: 4.8 }
      ],
      equipmentStats: {
        totalEquipment: 250,
        activeEquipment: 180,
        equipmentByType: [
          { type: 'Dehumidifiers', count: 85 },
          { type: 'Air Movers', count: 120 },
          { type: 'Air Scrubbers', count: 25 },
          { type: 'Moisture Meters', count: 15 },
          { type: 'Other', count: 5 }
        ],
        utilizationRate: 72 // percentage
      },
      monthlyStats: [
        { month: 'Jan', newClaims: 18, closedClaims: 15, activeEquipment: 165 },
        { month: 'Feb', newClaims: 22, closedClaims: 19, activeEquipment: 172 },
        { month: 'Mar', newClaims: 15, closedClaims: 21, activeEquipment: 168 },
        { month: 'Apr', newClaims: 19, closedClaims: 17, activeEquipment: 175 },
        { month: 'May', newClaims: 25, closedClaims: 22, activeEquipment: 182 },
        { month: 'Jun', newClaims: 20, closedClaims: 18, activeEquipment: 180 }
      ],
      regionalStats: [
        {
          region: 'Melbourne Metro',
          claimCount: 45,
          equipmentCount: 85,
          averageResolutionTime: 12
        },
        {
          region: 'Western Victoria',
          claimCount: 28,
          equipmentCount: 45,
          averageResolutionTime: 15
        },
        {
          region: 'Eastern Victoria',
          claimCount: 35,
          equipmentCount: 65,
          averageResolutionTime: 14
        },
        {
          region: 'Northern Victoria',
          claimCount: 25,
          equipmentCount: 35,
          averageResolutionTime: 16
        },
        {
          region: 'Southern Victoria',
          claimCount: 23,
          equipmentCount: 40,
          averageResolutionTime: 13
        }
      ],
      performanceMetrics: {
        averageResolutionTime: 14.5, // days
        clientSatisfactionRate: 92, // percentage
        equipmentUtilizationRate: 72, // percentage
        inspectionCompletionRate: 95 // percentage
      }
    });
  }

  public async getHistoricalData(months: number = 12): Promise<any> {
    // In production, this would fetch historical data from an API
    return Promise.resolve([]);
  }

  public async getRegionalBreakdown(): Promise<any> {
    // In production, this would fetch regional data from an API
    return Promise.resolve([]);
  }

  public async getEquipmentAnalytics(): Promise<any> {
    // In production, this would fetch equipment analytics from an API
    return Promise.resolve([]);
  }
}
