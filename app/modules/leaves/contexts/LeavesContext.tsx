'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { leavesApi, CreateLeaveTypeDto } from '../api/leavesApi';

// Types
export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';

export interface LeaveRequest {
    id: string;
    employeeId: string;
    employeeName: string;
    leaveTypeId: string;
    leaveTypeName: string;
    fromDate: string;
    toDate: string;
    days: number;
    justification: string;
    status: LeaveStatus;
    submittedAt: string;
}

export interface LeaveBalance {
    type: string;
    total: number;
    used: number;
    remaining: number;
}

export interface LeaveType {
    id: string;
    name: string;
    code: string;
    paid: boolean;
    // Backend additional fields
    categoryId?: string;
    description?: string;
}

export interface Entitlement {
    id: string;
    type: string;
    amount: number;
    interval: string;
}

interface LeavesContextType {
    requests: LeaveRequest[];
    balances: LeaveBalance[];
    leaveTypes: LeaveType[];
    entitlements: Entitlement[];
    holidays: any[]; // New
    pendingApprovals: LeaveRequest[]; // New
    addRequest: (request: Omit<LeaveRequest, 'id' | 'status' | 'submittedAt' | 'days'>) => void;
    updateRequestStatus: (id: string, status: LeaveStatus) => void;
    getBalances: () => LeaveBalance[];
    addLeaveType: (type: Partial<LeaveType>) => Promise<string | null>;
    deleteLeaveType: (id: string) => void;
    editRequest: (id: string, data: Partial<LeaveRequest>) => void;
    updateEntitlement: (id: string, amount: number) => void;
    addHoliday: (name: string, date: string) => void; // New
    fetchPendingApprovals: () => Promise<void>; // New
    adjustBalance: (employeeId: string, leaveTypeId: string, days: number, reason: string) => Promise<void>;
}

const LeavesContext = createContext<LeavesContextType | undefined>(undefined);

// Initial Empty Data (Fetch from API)
const INITIAL_REQUESTS: LeaveRequest[] = [];
const INITIAL_BALANCES: LeaveBalance[] = [];
const INITIAL_ENTITLEMENTS: Entitlement[] = [];

export function LeavesProvider({ children }: { children: React.ReactNode }) {
    const [requests, setRequests] = useState<LeaveRequest[]>(INITIAL_REQUESTS);
    const [balances, setBalances] = useState<LeaveBalance[]>(INITIAL_BALANCES);
    const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
    const [entitlements, setEntitlements] = useState<Entitlement[]>(INITIAL_ENTITLEMENTS);

    // Calendar State
    const [holidays, setHolidays] = useState<any[]>([]);

    // Pending Approvals State
    const [pendingApprovals, setPendingApprovals] = useState<LeaveRequest[]>([]);

    const fetchUserData = React.useCallback(async (currentTypes: LeaveType[]) => {
        try {
            // 3. Fetch My Requests
            const myRequests = await leavesApi.getMyLeaveRequests();
            setRequests(myRequests.map((r: any) => ({
                id: r._id,
                employeeId: r.employeeId?._id || r.employeeId?.id || r.employeeId,
                employeeName: 'Me',
                leaveTypeId: r.leaveTypeId?._id || r.leaveTypeId,
                leaveTypeName: r.leaveTypeId?.name || 'Leave Request',
                fromDate: r.dates.from,
                toDate: r.dates.to,
                days: r.durationDays || 0,
                justification: r.justification,
                status: (r.status && typeof r.status === 'string' ? (r.status.charAt(0).toUpperCase() + r.status.slice(1).toLowerCase()) : 'Pending') as LeaveStatus,
                submittedAt: r.createdAt || new Date().toISOString()


            })));

            // 4. Fetch My Balance
            const myBalances = await leavesApi.getMyBalance();

            // Merge Balances with Types (Show 0 if no entitlement)
            console.log('Context: Merging Balances. Types:', currentTypes, 'Balances:', myBalances);
            const mergedBalances = currentTypes.map(type => {
                const userBalance = myBalances.find((b: any) => {
                    const balId = b.leaveTypeId?._id || b.leaveTypeId?.id || b.leaveTypeId;
                    const typeId = type.id;
                    // Loose string comparison
                    return String(balId) === String(typeId);
                });

                if (userBalance) {
                    return {
                        type: type.name,
                        total: userBalance.yearlyEntitlement,
                        used: userBalance.taken,
                        remaining: userBalance.remaining
                    };
                }
                // Default view for types with no assigned entitlement
                return {
                    type: type.name,
                    total: 0,
                    used: 0,
                    remaining: 0
                };
            });

            setBalances(mergedBalances);

        } catch (error) {
            console.error('Failed to fetch user data:', error);
        }
    }, []);

    // Fetch Initial Data
    useEffect(() => {
        const fetchTypesAndHolidays = async () => {
            try {
                // 1. Fetch Types
                const types = await leavesApi.getAllLeaveTypes();
                const mappedTypes = types.map((t: any) => ({ ...t, id: t.id || t._id }));
                setLeaveTypes(mappedTypes);

                // 2. Fetch Holidays
                const currentYear = new Date().getFullYear();
                const fetchedHolidays = await leavesApi.getHolidays(currentYear);
                setHolidays(fetchedHolidays || []);

                return mappedTypes;
            } catch (error) {
                console.error('Failed to fetch types/holidays:', error);
                return [];
            }
        };

        const init = async () => {
            const types = await fetchTypesAndHolidays();
            if (types.length > 0) {
                await fetchUserData(types);
            }
        };

        init();
    }, [fetchUserData]);

    // Sync Entitlements with Leave Types (Admin View)
    useEffect(() => {
        if (leaveTypes.length > 0) {
            setEntitlements(prev => {
                const newEntitlements = leaveTypes.map(t => {
                    const existing = prev.find(e => e.id === t.id);
                    return existing || {
                        id: t.id,
                        type: t.name,
                        amount: 21, // Default Policy View
                        interval: 'Year'
                    };
                });
                return newEntitlements;
            });
        }
    }, [leaveTypes]);

    const addRequest = async (data: Omit<LeaveRequest, 'id' | 'status' | 'submittedAt' | 'days'>) => {
        try {
            const res = await leavesApi.submitLeaveRequest({
                leaveTypeId: data.leaveTypeId,
                fromDate: data.fromDate,
                toDate: data.toDate,
                justification: data.justification
            });

            // Add to local state
            const newReq: LeaveRequest = {
                id: res._id,
                employeeId: res.employeeId,
                employeeName: 'Me',
                leaveTypeId: data.leaveTypeId,
                leaveTypeName: data.leaveTypeName, // Optimistic
                fromDate: data.fromDate,
                toDate: data.toDate,
                days: res.durationDays,
                justification: data.justification,
                status: 'Pending',
                submittedAt: new Date().toISOString()
            };
            setRequests(prev => [newReq, ...prev]);

            // Refresh Balances purely to be safe
            const myBalances = await leavesApi.getMyBalance();
            setBalances(myBalances.map((b: any) => ({
                type: b.leaveTypeId?.name || b.leaveTypeId,
                total: b.yearlyEntitlement,
                used: b.taken,
                remaining: b.remaining
            })));

        } catch (error: any) {
            console.error('Failed to submit request:', error);

            // Extract and normalize error message
            let rawError = error?.response?.data?.message || error?.response?.data?.error || error?.message || 'Failed to submit request.';
            let errorMessage = typeof rawError === 'string' ? rawError : JSON.stringify(rawError);

            // Check for specific error types safely
            const lowerError = errorMessage.toLowerCase();
            if (lowerError.includes('insufficient') || lowerError.includes('balance')) {
                errorMessage = `Insufficient leave balance. ${errorMessage}`;
            } else if (lowerError.includes('overlapping') &&
                !lowerError.includes('already have a') &&
                !lowerError.includes('already have an')) {
                // Handle overlapping error - don't add prefix if already detailed
                errorMessage = `Overlapping leave request exists. ${errorMessage}`;
            }


            throw new Error(errorMessage);
        }
    };

    // ... editRequest (Mock local edit for now, backend edit is uncommon) ... 
    const editRequest = (id: string, data: Partial<LeaveRequest>) => {
        // Local Optimistic Update
        setRequests(prev => prev.map(req => {
            if (req.id === id) return { ...req, ...data };
            return req;
        }));
    };

    const addLeaveType = async (type: Partial<LeaveType>) => {
        try {
            // Mapped to DTO
            if (!type.name || !type.code) return false;
            const newType = await leavesApi.createLeaveType({
                name: type.name,
                code: type.code,
                isPaid: type.paid ?? true,
                categoryId: '60d0fe4f5311236168a109ca', // Fail-safe in backend now
            });
            // Map _id to id
            const mappedType = { ...newType, id: (newType as any)._id || newType.id };
            setLeaveTypes(prev => [...prev, mappedType]);
            return null; // Success
        } catch (error: any) {
            console.error('Failed to create leave type:', error);
            // Return backend error message if available
            return error.response?.data?.message || error.message || 'Unknown error';
        }
    };

    const deleteLeaveType = async (id: string) => {
        try {
            await leavesApi.deleteLeaveType(id);
            setLeaveTypes(prev => prev.filter(t => t.id !== id));
        } catch (error) {
            console.error('Failed to delete leave type:', error);
        }
    };

    const updateRequestStatus = async (id: string, status: LeaveStatus) => {
        try {
            if (status === 'Cancelled') {
                await leavesApi.cancelLeaveRequest(id);
            } else if (status === 'Approved' || status === 'Rejected') {
                await leavesApi.reviewLeaveRequest(id, {
                    status: status.toLowerCase() as any,
                    comments: '' // Optional comments field
                });
            }

            // Update local state optimistically
            setRequests(prev => prev.map(req =>
                String(req.id) === String(id) ? { ...req, status } : req
            ));

            // Sync with pendingApprovals if exists there
            setPendingApprovals(prev => prev.map(req =>
                String(req.id) === String(id) ? { ...req, status } : req
            ));

            // Refresh Balances to reflect changes
            const myBalances = await leavesApi.getMyBalance();
            setBalances(myBalances.map((b: any) => ({
                type: b.leaveTypeId?.name || b.leaveTypeId,
                total: b.yearlyEntitlement,
                used: b.taken,
                remaining: b.remaining
            })));

        } catch (error: any) {
            console.error('Failed to update status:', error);

            // Extract and throw error message for UI display
            const errorMessage = error?.response?.data?.message ||
                error?.response?.data?.error ||
                error?.message ||
                'Failed to update leave request status';

            throw new Error(errorMessage);
        }
    };

    const calculateDays = (start: string, end: string) => {
        const d1 = new Date(start);
        const d2 = new Date(end);
        let count = 0;
        const current = new Date(d1);
        while (current <= d2) {
            const dayOfWeek = current.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                count++;
            }
            current.setDate(current.getDate() + 1);
        }
        return count;
    };

    const addHoliday = async (name: string, date: string) => {
        try {
            const newHoliday = await leavesApi.addHoliday({ name, date });
            setHolidays(prev => [...prev, newHoliday]);
        } catch (error) {
            console.error('Failed to add holiday:', error);
        }
    };

    const fetchPendingApprovals = React.useCallback(async () => {
        try {
            console.log('Fetching pending approvals from API...');
            const fetchedApprovals = await leavesApi.getTeamRequests();
            console.log('Raw API response:', fetchedApprovals);
            const mappedApprovals = fetchedApprovals.map((r: any) => ({
                id: r._id || r.id,
                employeeId: r.employeeId?._id || r.employeeId,
                employeeName: r.employeeId?.fullName ||
                    (r.employeeId?.firstName && r.employeeId?.lastName ?
                        `${r.employeeId.firstName} ${r.employeeId.lastName}` :
                        (r.employeeId?.workEmail || 'Unknown Employee')),
                leaveTypeId: r.leaveTypeId?._id || r.leaveTypeId,
                leaveTypeName: r.leaveTypeId?.name ||
                    leaveTypes.find(t => String(t.id) === String(r.leaveTypeId?._id || r.leaveTypeId))?.name ||
                    'Unknown Type',
                fromDate: r.dates?.from || r.fromDate,
                toDate: r.dates?.to || r.toDate,
                days: r.durationDays || 0,
                justification: r.justification || '',
                status: (r.status && typeof r.status === 'string' ? (r.status.charAt(0).toUpperCase() + r.status.slice(1).toLowerCase()) : 'Pending') as LeaveStatus,
                submittedAt: r.createdAt || new Date().toISOString(),



            }));
            console.log('Mapped approvals:', mappedApprovals);
            setPendingApprovals(mappedApprovals);
        } catch (error) {
            console.error('Failed to fetch pending approvals:', error);
            throw error;
        }
    }, [leaveTypes]);

    const updateEntitlement = async (id: string, amount: number) => {
        // In the Admin View, "Entitlement" often refers to the "Standard Accrual Rule" (Policy)
        // We map this to configureLeaveType
        try {
            // Find type ID matching the entitlement ID (assuming 1:1 for simplicity in this view)
            // In reality, id might be the Entitlement ID or Type ID. 
            // We'll assume the UI passes the Type ID or we find it.
            const type = leaveTypes.find(t => t.id === id || t.name === id); // Heuristic match
            if (type) {
                await leavesApi.configureLeaveType(type.id, {
                    accrualRate: amount, // Total yearly days
                    accrualMethod: 'YEARLY'
                });
                // Update local state
                setEntitlements(prev => prev.map(e => e.id === id ? { ...e, amount } : e));
                // Refresh my balances
                await fetchUserData(leaveTypes);


            }
        } catch (error) {
            console.error('Failed to update policy:', error);
        }
    };

    const adjustBalance = async (employeeId: string, leaveTypeId: string, days: number, reason: string) => {
        try {
            await leavesApi.adjustBalance({
                employeeId,
                leaveTypeId,
                adjustmentDays: days,
                reason
            });
            // Ideally we would refresh balances if this was for "Me" or "Team", but as Admin usually irrelevant for immediate view unless we view that specific employee.
            // But we can trigger a refresh if we had a "view employee balance" state.
        } catch (error: any) {
            console.error('Failed to adjust balance:', error);
            throw new Error(error.response?.data?.message || error.message || 'Failed to adjust balance');
        }
    };

    return (
        <LeavesContext.Provider value={{
            requests,
            balances,
            leaveTypes,
            entitlements,
            holidays, // Expose holidays
            pendingApprovals, // Expose pending approvals
            addRequest,
            updateRequestStatus,
            getBalances: () => balances,
            addLeaveType,
            deleteLeaveType,
            editRequest,
            updateEntitlement,
            addHoliday, // Expose addHoliday
            fetchPendingApprovals, // Expose fetchPendingApprovals
            adjustBalance
        }}>
            {children}
        </LeavesContext.Provider>
    );
}

export function useLeaves() {
    const context = useContext(LeavesContext);
    if (context === undefined) {
        throw new Error('useLeaves must be used within a LeavesProvider');
    }
    return context;
}
