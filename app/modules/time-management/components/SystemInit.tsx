'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import styles from './SystemInit.module.css';

interface SystemInitProps {
    shiftTypesCount: number;
    shiftsCount: number;
    latenessRulesCount: number;
    scheduleRulesCount?: number;
}

export default function SystemInit({
    shiftTypesCount,
    shiftsCount,
    latenessRulesCount,
    scheduleRulesCount = 0
}: SystemInitProps) {
    const router = useRouter();

    // Determine which step the user is on
    const getNextStep = () => {
        if (shiftTypesCount === 0) {
            return {
                step: 1,
                title: 'Create Shift Types',
                description: 'Define the types of shifts your organization uses (e.g., Morning, Evening, Night)',
                href: '/modules/time-management/shift-type',
                icon: '🧩'
            };
        }
        if (shiftsCount === 0) {
            return {
                step: 2,
                title: 'Create Shifts',
                description: 'Set up actual shift schedules with specific times and durations',
                href: '/modules/time-management/shifts',
                icon: '⏱'
            };
        }
        if (latenessRulesCount === 0) {
            return {
                step: 3,
                title: 'Configure Lateness Rules',
                description: 'Define policies for handling late arrivals and absences',
                href: '/modules/time-management/lateness',
                icon: '⚠️'
            };
        }
        return null;
    };

    const nextStep = getNextStep();

    // Don't show if everything is set up
    if (!nextStep) {
        return null;
    }

    const allSteps = [
        {
            number: 1,
            label: 'Shift Types',
            completed: shiftTypesCount > 0,
            icon: '🧩'
        },
        {
            number: 2,
            label: 'Shifts',
            completed: shiftsCount > 0,
            icon: '⏱'
        },
        {
            number: 3,
            label: 'Lateness Rules',
            completed: latenessRulesCount > 0,
            icon: '⚠️'
        }
    ];

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <div className={styles.iconWrapper}>
                        <span className={styles.headerIcon}>🚀</span>
                    </div>
                    <h2 className={styles.title}>System Initialization Required</h2>
                    <p className={styles.subtitle}>
                        Complete these essential steps to start using the Time Management system
                    </p>
                </div>

                <div className={styles.progressSection}>
                    <div className={styles.progressHeader}>
                        <span className={styles.progressLabel}>Setup Progress</span>
                        <span className={styles.progressCount}>
                            {allSteps.filter(s => s.completed).length} / {allSteps.length}
                        </span>
                    </div>
                    <div className={styles.progressBar}>
                        <div
                            className={styles.progressFill}
                            style={{
                                width: `${(allSteps.filter(s => s.completed).length / allSteps.length) * 100}%`
                            }}
                        />
                    </div>

                    <div className={styles.stepsContainer}>
                        {allSteps.map((step) => (
                            <div
                                key={step.number}
                                className={`${styles.stepItem} ${step.completed ? styles.stepCompleted : ''} ${step.number === nextStep.step ? styles.stepActive : ''}`}
                            >
                                <div className={styles.stepIcon}>
                                    {step.completed ? '✓' : step.icon}
                                </div>
                                <div className={styles.stepContent}>
                                    <span className={styles.stepLabel}>Step {step.number}</span>
                                    <span className={styles.stepName}>{step.label}</span>
                                </div>
                                {step.number === nextStep.step && (
                                    <span className={styles.currentBadge}>Current</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.nextStepSection}>
                    <div className={styles.nextStepHeader}>
                        <span className={styles.nextStepIcon}>{nextStep.icon}</span>
                        <h3 className={styles.nextStepTitle}>{nextStep.title}</h3>
                    </div>
                    <p className={styles.nextStepDescription}>{nextStep.description}</p>

                    <button
                        className={styles.actionButton}
                        onClick={() => router.push(nextStep.href)}
                    >
                        <span>Get Started</span>
                        <span className={styles.buttonIcon}>→</span>
                    </button>
                </div>

                <div className={styles.helpSection}>
                    <span className={styles.helpIcon}>💡</span>
                    <p className={styles.helpText}>
                        Need help? Each step includes detailed instructions and examples to guide you through the setup process.
                    </p>
                </div>
            </div>
        </div>
    );
}
