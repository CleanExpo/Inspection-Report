import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  IconButton,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip
} from '@mui/material';
import {
  Timeline as TimelineIcon,
  BarChart as BarChartIcon,
  BubbleChart as BubbleChartIcon,
  Map as MapIcon,
  PictureAsPdf as PdfIcon,
  TableChart as TableIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import {
  Line,
  Bar,
  Scatter,
  Bubble
} from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  TimeScale
} from 'chart.js';
import 'chartjs-adapter-date-fns';

import { MoistureReading, MATERIAL_GUIDELINES } from '../types/moisture';
import { Report } from '../types/shared';
import { TimeSeriesData } from '../types/lidar';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  TimeScale
);

interface AdvancedReportingProps {
  reports: Report[];
  moistureReadings: MoistureReading[];
  timeSeriesData: TimeSeriesData[];
  onExport: (format: 'pdf' | 'csv' | 'xlsx') => void;
  onPrint: () => void;
  onShare: (reportId: string) => void;
}

interface PageConfig {
  id: string;
  title: string;
  description: string;
  component: React.ReactNode;
}

export default function AdvancedReporting({
  reports,
  moistureReadings,
  timeSeriesData,
  onExport,
  onPrint,
  onShare
}: AdvancedReportingProps) {
  const [selectedPage, setSelectedPage] = useState(0);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');
  const [chartType, setChartType] = useState<'line' | 'bar' | 'scatter'>('line');

  // Prepare data for time series chart
  const timeSeriesChartData = useMemo(() => {
    const data = timeSeriesData.map(series => ({
      x: new Date(series.timestamp),
      y: series.moistureReadings.reduce((sum, r) => sum + r.reading.value, 0) / 
         series.moistureReadings.length
    }));

    return {
      datasets: [
        {
          label: 'Average Moisture Content',
          data,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
        }
      ]
    };
  }, [timeSeriesData]);

  // Prepare data for material comparison chart
  const materialComparisonData = useMemo(() => {
    const materialAverages = Object.entries(
      moistureReadings.reduce((acc, reading) => {
        if (!acc[reading.materialType]) {
          acc[reading.materialType] = { sum: 0, count: 0 };
        }
        acc[reading.materialType].sum += reading.value;
        acc[reading.materialType].count += 1;
        return acc;
      }, {} as Record<string, { sum: number; count: number }>)
    ).map(([material, { sum, count }]) => ({
      material,
      average: sum / count,
      guideline: MATERIAL_GUIDELINES[material]?.dryStandard || 0
    }));

    return {
      labels: materialAverages.map(m => m.material),
      datasets: [
        {
          label: 'Average Moisture Content',
          data: materialAverages.map(m => m.average),
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
        },
        {
          label: 'Guideline Value',
          data: materialAverages.map(m => m.guideline),
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
        }
      ]
    };
  }, [moistureReadings]);

  // Define pages configuration
  const pages: PageConfig[] = [
    {
      id: 'overview',
      title: 'Overview',
      description: 'Summary of moisture readings and trends',
      component: (
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Moisture Trends
                </Typography>
                <Line
                  data={timeSeriesChartData}
                  options={{
                    responsive: true,
                    scales: {
                      x: {
                        type: 'time',
                        time: {
                          unit: timeRange
                        }
                      }
                    }
                  }}
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Material Comparison
                </Typography>
                <Bar
                  data={materialComparisonData}
                  options={{
                    responsive: true,
                    scales: {
                      y: {
                        beginAtZero: true
                      }
                    }
                  }}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )
    },
    {
      id: 'detailed-analysis',
      title: 'Detailed Analysis',
      description: 'In-depth analysis of moisture patterns',
      component: (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Moisture Distribution
                </Typography>
                <Scatter
                  data={{
                    datasets: [{
                      label: 'Moisture Readings',
                      data: moistureReadings.map(reading => ({
                        x: new Date(reading.timestamp),
                        y: reading.value,
                        r: 5
                      })),
                      backgroundColor: 'rgba(75, 192, 192, 0.5)'
                    }]
                  }}
                  options={{
                    responsive: true,
                    scales: {
                      x: {
                        type: 'time',
                        time: {
                          unit: timeRange
                        }
                      }
                    }
                  }}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )
    },
    {
      id: 'reports',
      title: 'Reports',
      description: 'Generated reports and documentation',
      component: (
        <Grid container spacing={2}>
          {reports.map(report => (
            <Grid item xs={12} md={6} key={report.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {report.title}
                  </Typography>
                  <Typography color="text.secondary">
                    {new Date(report.timestamp).toLocaleDateString()}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                    <IconButton onClick={() => onExport('pdf')}>
                      <PdfIcon />
                    </IconButton>
                    <IconButton onClick={onPrint}>
                      <PrintIcon />
                    </IconButton>
                    <IconButton onClick={() => onShare(report.id)}>
                      <ShareIcon />
                    </IconButton>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )
    }
  ];

  return (
    <Paper sx={{ p: 2 }}>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6">Advanced Reporting</Typography>
        <Box sx={{ flexGrow: 1 }} />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            label="Time Range"
            onChange={(e) => setTimeRange(e.target.value as typeof timeRange)}
          >
            <MenuItem value="day">Daily</MenuItem>
            <MenuItem value="week">Weekly</MenuItem>
            <MenuItem value="month">Monthly</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Chart Type</InputLabel>
          <Select
            value={chartType}
            label="Chart Type"
            onChange={(e) => setChartType(e.target.value as typeof chartType)}
          >
            <MenuItem value="line">Line</MenuItem>
            <MenuItem value="bar">Bar</MenuItem>
            <MenuItem value="scatter">Scatter</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={() => onExport('pdf')}
        >
          Export
        </Button>
      </Stack>

      <Tabs
        value={selectedPage}
        onChange={(_, value) => setSelectedPage(value)}
        sx={{ mb: 2 }}
      >
        {pages.map((page, index) => (
          <Tab
            key={page.id}
            label={page.title}
            value={index}
          />
        ))}
      </Tabs>

      <Box sx={{ mt: 2 }}>
        {pages[selectedPage].component}
      </Box>
    </Paper>
  );
}
