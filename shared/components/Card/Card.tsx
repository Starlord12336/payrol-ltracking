import React from 'react';
import styles from './Card.module.css';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'warm';
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  shadow = 'md',
  hover = false,
}) => {
  const cardClasses = [
    styles.card,
    styles[`card--padding-${padding}`],
    shadow !== 'none' && styles[`card--shadow-${shadow}`],
    hover && styles['card--hover'],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <div className={cardClasses}>{children}</div>;
};

