import type { Metadata } from 'next';
import '../shared/styles/globals.css';
import { Navbar, NotificationContainer } from '@/shared/components';
import { NotificationProvider } from '@/shared/contexts/NotificationContext';
import { NotificationPosition } from '@/shared/types';

import s from "../shared/components/Navbar/Navbar.module.css"

export const metadata: Metadata = {
  title: 'HR Management System',
  description: 'Unified HR platform for managing employee lifecycle',
};

export default function RootLayout({ children }: { children: React.ReactNode }) { 
  return ( 
    <html lang="en"> 
      <body> 
        <NotificationProvider defaultDuration={5000} maxNotifications={5}> 
          <Navbar /> 
          <main className={s.appContent}> 
            {children} 
          </main> 
          <NotificationContainer position={NotificationPosition.TOP_RIGHT} maxNotifications={5} /> 
        </NotificationProvider> 
      </body> 
    </html> 
  ); 
}
