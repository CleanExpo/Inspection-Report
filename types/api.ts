import { InspectionType, InspectionStatus } from './inspection';

export interface PaginationResponse {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface APISuccessResponse<T> {
  success: true;
  data: T;
}

export interface APISuccessResponseWithPagination<T> extends APISuccessResponse<T> {
  pagination: PaginationResponse;
}

export interface APIErrorResponse {
  success: false;
  error: {
    message: string;
    details?: Record<string, unknown>;
  };
}

export type APIResponse<T> = APISuccessResponse<T> | APIErrorResponse;
export type APIPaginatedResponse<T> = APISuccessResponseWithPagination<T> | APIErrorResponse;

export interface InspectionListResponse {
  id: string;
  jobId: string;
  clientId: string;
  type: InspectionType;
  status: InspectionStatus;
  notes: string | null;
  findings: any;
  client: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
  };
  job: {
    id: string;
    jobNumber: string;
    title: string;
    status: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface GetInspectionsQuery {
  page?: string;
  limit?: string;
  status?: InspectionStatus;
  clientId?: string;
}

export interface CreateInspectionBody {
  jobId: string;
  clientId: string;
  type: InspectionType;
  status?: InspectionStatus;
  notes?: string | null;
  findings?: any;
}

export type GetInspectionsResponse = APISuccessResponseWithPagination<InspectionListResponse[]>;
export type CreateInspectionResponse = APISuccessResponse<InspectionListResponse>;
export type InspectionAPIResponse = GetInspectionsResponse | CreateInspectionResponse;
