import { apiClient } from '@/shared/utils/api';
import { API_ENDPOINTS } from '@/shared/constants';
import { LeaveType, Entitlement } from '@/modules/leaves/contexts/LeavesContext';

// Define DTOs based on Backend Config
export interface CreateLeaveTypeDto {
    name: string;
    code: string;
    description?: string;
    categoryId: string; // Backend expects this
    isPaid: boolean;
}

export interface SubmitLeaveRequestDto {
    leaveTypeId: string;
    fromDate: string;
    toDate: string;
    justification?: string;
    attachmentId?: string;
}

export interface ReviewLeaveRequestDto {
    status: 'APPROVED' | 'REJECTED';
    comments?: string;
}

export interface AdjustBalanceDto {
    employeeId: string;
    leaveTypeId: string;
    adjustmentDays: number;
    reason: string;
}

export interface BulkProcessDto {
    requestIds: string[];
    action: 'approve' | 'reject';
    comments?: string;
}

export interface LeaveRequestDto {
    _id: string;
    employeeId: string; // Or object if populated
    leaveTypeId: { _id: string, name: string } | string;
    dates: { from: string, to: string };
    durationDays: number;
    status: string;
    justification: string;
}

export interface Holiday {
    id: string;
    name: string;
    date: string;
}

export const leavesApi = {
    // === LEAVE TYPES ===
    getAllLeaveTypes: async () => {
        const res = await apiClient.get<LeaveType[]>(`${API_ENDPOINTS.LEAVES}/types`);
        return res.data;
    },

    createLeaveType: async (data: CreateLeaveTypeDto) => {
        const res = await apiClient.post<LeaveType>(`${API_ENDPOINTS.LEAVES}/types`, data);
        return res.data;
    },

    deleteLeaveType: async (id: string) => {
        const res = await apiClient.delete(`${API_ENDPOINTS.LEAVES}/types/${id}`);
        return res.data;
    },

    // === REQUESTS ===
    submitLeaveRequest: async (data: SubmitLeaveRequestDto) => {
        const res = await apiClient.post<LeaveRequestDto>(`${API_ENDPOINTS.LEAVES}/requests`, data);
        return res.data;
    },

    getMyLeaveRequests: async (filters?: any) => {
        const query = filters ? `?${new URLSearchParams(filters).toString()}` : '';
        const res = await apiClient.get<LeaveRequestDto[]>(`${API_ENDPOINTS.LEAVES}/requests/my${query}`);
        return res.data;
    },

    cancelLeaveRequest: async (id: string) => {
        const res = await apiClient.patch(`${API_ENDPOINTS.LEAVES}/requests/${id}/cancel`);
        return res.data;
    },

    // === BALANCES ===
    getMyBalance: async () => {
        // Returns array of entitlements
        const res = await apiClient.get<any[]>(`${API_ENDPOINTS.LEAVES}/balance/my`);
        return res.data;
    },

    getTeamBalances: async () => {
        // Returns array of team members with their leave balances
        const res = await apiClient.get<any[]>(`${API_ENDPOINTS.LEAVES}/balance/team`);
        return res.data;
    },

    // === MANAGER ACTIONS ===
    getTeamRequests: async () => {
        const res = await apiClient.get<LeaveRequestDto[]>(`${API_ENDPOINTS.LEAVES}/requests/pending/approval`);
        return res.data;
    },

    adjustBalance: async (data: AdjustBalanceDto) => {
        const res = await apiClient.post(`${API_ENDPOINTS.LEAVES}/balance/adjust`, data);
        return res.data;
    },

    reviewLeaveRequest: async (id: string, data: ReviewLeaveRequestDto) => {
        const res = await apiClient.post(`${API_ENDPOINTS.LEAVES}/requests/${id}/review`, data);
        return res.data;
    },

    bulkProcessRequests: async (data: BulkProcessDto) => {
        const res = await apiClient.post(`${API_ENDPOINTS.LEAVES}/requests/bulk/process`, data);
        return res.data;
    },

    // === ENTITLEMENTS ===
    // Backend has assignEntitlement. We need to see if there is a 'getEntitlements' generic or per user.
    // Controller: getEmployeesLeaveBalance or getMyLeaveBalance.
    // For Config (Admin view), we might need a specific endpoint or just mock generic rules for now if backend doesn't support "Global Rule" vs "Individual Assignment".
    // REQ-003 says "Configure Leave Settings". Controller has `configureLeaveType`.
    configureLeaveType: async (id: string, config: any) => {
        const res = await apiClient.post(`${API_ENDPOINTS.LEAVES}/types/${id}/configure`, config);
        return res.data;
    },

    // === CALENDAR ===
    getHolidays: async (year: number) => {
        const res = await apiClient.get<Holiday[]>(`${API_ENDPOINTS.LEAVES}/calendar/holidays?year=${year}`);
        return res.data;
    },

    addHoliday: async (holiday: { name: string, date: string }) => {
        const res = await apiClient.post(`${API_ENDPOINTS.LEAVES}/calendar/holidays`, holiday);
        return res.data;
    }
};
