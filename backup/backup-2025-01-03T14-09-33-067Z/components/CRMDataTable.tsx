"use client";

import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  TablePagination
} from '@mui/material';
import { Edit as EditIcon, Visibility as ViewIcon } from '@mui/icons-material';
import { fetchCRMData } from '../utils/crm';
import type { InspectionReport, CRMResponse } from '../types/inspection';

interface Column {
  field: keyof InspectionReport | 'actions';
  headerName: string;
  width?: number;
  renderCell?: (params: InspectionReport) => React.ReactNode;
}

interface CRMDataTableProps {
  onView?: (report: InspectionReport) => void;
  onEdit?: (report: InspectionReport) => void;
  className?: string;
}

const columns: Column[] = [
  { field: 'jobNumber', headerName: 'Job Number', width: 150 },
  { field: 'inspectionDate', headerName: 'Date', width: 150 },
  { field: 'inspector', headerName: 'Inspector', width: 150 },
  { field: 'location', headerName: 'Location', width: 200 },
  { field: 'status', headerName: 'Status', width: 120 },
  {
    field: 'actions',
    headerName: 'Actions',
    width: 120,
    renderCell: (params: InspectionReport) => (
      <div className="flex space-x-2">
        <Tooltip title="View Details">
          <IconButton size="small" color="primary">
            <ViewIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Edit Report">
          <IconButton size="small" color="primary">
            <EditIcon />
          </IconButton>
        </Tooltip>
      </div>
    ),
  },
];

const CRMDataTable: React.FC<CRMDataTableProps> = ({
  onView,
  onEdit,
  className = ""
}) => {
  const [data, setData] = useState<InspectionReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  const loadData = async (pageNumber: number, pageSize: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchCRMData(pageNumber + 1, pageSize);
      setData(response.data);
      setTotal(response.total);
    } catch (error) {
      console.error('Error loading CRM data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(page, rowsPerPage);
  }, [page, rowsPerPage]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading && data.length === 0) {
    return (
      <div className="flex justify-center items-center p-8">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <Alert severity="error" className="mb-4">
        {error}
      </Alert>
    );
  }

  return (
    <Paper className={className}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.field}
                  style={{ width: column.width }}
                >
                  {column.headerName}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.id}>
                {columns.map((column) => (
                  <TableCell key={column.field}>
                    {column.renderCell
                      ? column.renderCell(row)
                      : row[column.field as keyof InspectionReport]?.toString()}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={total}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default CRMDataTable;
