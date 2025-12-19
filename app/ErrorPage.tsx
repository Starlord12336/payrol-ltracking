'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import s from './page.module.css';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className={s.container}>
      <h1 className={s.header}>The compiler has reds there for a reason</h1>
      <p className={s.description}>have you tried turning it off and on again?</p>
      <p className={s.description}>Or just completely turn it off?</p>
      <p className={s.description}>Personally I feel like turning it off</p>
      </div>
  );
}