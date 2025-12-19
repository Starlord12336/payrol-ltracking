import { SystemRole } from "@/shared/types";
import { EmployeeProfile } from "../../hr/api/hrApi";
import { Shift } from "../types";

export const getEmployeeName = (employees: EmployeeProfile[], employeeId?: string) => {
    if (!employeeId) return "N/A";
    const employee = employees.find(emp => emp._id === employeeId);
    return employee ? `${employee.firstName} ${employee.lastName}` : "Employee";
};


export const getShiftName = (shifts: Shift[] | undefined, shiftId?: string) => {
    if (!shifts || !shiftId) return "N/A";
    const shift = shifts.find(shift => shift.id === shiftId);
    return shift ? shift.name : "Shift";
};