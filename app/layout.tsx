import type { Metadata } from 'next';
import '../shared/styles/globals.css';

export const metadata: Metadata = {
  title: 'HR Management System',
  description: 'Unified HR platform for managing employee lifecycle',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

