

import axios from 'axios';
import { Payslip } from '../types/payslip';
export const getCurrentPayslip = async (): Promise<Payslip> => {
  const res = await api.get('/payroll-tracking/employee/me/payslips/current');
  return res.data;
};
export const getPayslipList = async (): Promise<Payslip[]> => {
  const res = await api.get('/payroll-tracking/employee/me/payslips');
  return res.data;
};
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api',
  withCredentials: true, // for cookie-based auth
  headers: {
    'Content-Type': 'application/json',
  },
});