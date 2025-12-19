"use client";

import { useCallback, useEffect, useState } from "react";
import s from "../page.module.css";
import { deleteNotification, getAllNotification } from '../api/index';
import NotificationLogList from "../components/NotificationLogList";
import { NotificationLog } from "../types";
import CreateNotificationLogForm from "../components/CreateNotificationLogForm";
import { useAuth } from '@/shared/hooks/useAuth';
import { Button, Card } from '@/shared/components';
import { SystemRole } from '@/shared/types/auth';
import { ROUTES } from '@/shared/constants';
import { useRouter } from 'next/navigation';
import { hrApi } from '@/app/modules/hr/api/hrApi';
import { profileApi } from '@/app/modules/employee-profile/api/profileApi';
import Error from "@/app/ErrorPage";
import ErrorPage from "@/app/ErrorPage";
import Unauthorized from "@/app/Unauthorized";

interface StatCard {
  title: string;
  count: number;
  icon: string;
  route: string;
  color: 'primary' | 'accent' | 'success' | 'warning';
}

export default function NotificationPage() {
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<StatCard[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  const fetchDashboardStats = useCallback(async () => {
    if (!user) return;

    setLoadingStats(true);
    const userRoles = user.roles || [];
    const userType = user.userType;
    const newStats: StatCard[] = [];

    try {
      const isHrUser =
        userRoles.includes(SystemRole.HR_MANAGER) ||
        userRoles.includes(SystemRole.HR_EMPLOYEE) ||
        userRoles.includes(SystemRole.HR_ADMIN) ||
        userRoles.includes(SystemRole.SYSTEM_ADMIN);

      if (isHrUser) {
        try {
          const pendingRequests = await hrApi.getPendingChangeRequests();
          newStats.push({
            title: 'Pending Change Requests',
            count: pendingRequests.length,
            icon: '📝',
            route: ROUTES.HR_CHANGE_REQUESTS,
            color: 'warning',
          });
        } catch (error) {
          console.error('Error fetching pending change requests:', error);
        }
      }

      if (userType === 'employee') {
        try {
          const myRequests = await profileApi.getMyChangeRequests();
          const pendingCount = myRequests.filter(r => r.status === 'PENDING').length;
          if (pendingCount > 0) {
            newStats.push({
              title: 'My Pending Requests',
              count: pendingCount,
              icon: '📋',
              route: `${ROUTES.EMPLOYEE_PROFILE}#change-requests`,
              color: 'primary',
            });
          }
        } catch (error) {
          console.error('Error fetching my change requests:', error);
        }
      }

      // Managers: Pending leave requests (placeholder - API may not exist yet)
      const isManager =
        userRoles.includes(SystemRole.DEPARTMENT_HEAD) ||
        userRoles.includes(SystemRole.HR_MANAGER) ||
        userRoles.includes(SystemRole.HR_ADMIN);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoadingStats(false);
      setStats(newStats);
    }
  }, [user]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getAllNotification();
      setNotifications(data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string) => {
    await deleteNotification(id);
    load();
  };

  // Define isHrUser and isManager correctly
  const userRoles = user?.roles || [];
  const isHrUser =
    userRoles.includes(SystemRole.HR_MANAGER) ||
    userRoles.includes(SystemRole.HR_EMPLOYEE) ||
    userRoles.includes(SystemRole.HR_ADMIN) ||
    userRoles.includes(SystemRole.SYSTEM_ADMIN);

  const isManager =
    userRoles.includes(SystemRole.DEPARTMENT_HEAD) ||
    userRoles.includes(SystemRole.HR_MANAGER) ||
    userRoles.includes(SystemRole.HR_ADMIN);

  return (
    <div className={s.container}>
      <h1 className={s.header}>Notifications</h1>
      {isAuthenticated || (!isHrUser && !isManager) ? (
        <>
          <CreateNotificationLogForm onCreated={load} />
        </>
      ) : <></>}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <NotificationLogList notifications={notifications} onDelete={handleDelete} />
        </>
      )
      }
    </div >
  );
}
