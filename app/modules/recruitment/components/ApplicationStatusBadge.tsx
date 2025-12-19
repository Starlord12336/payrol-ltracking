import styles from './RecruitmentForms.module.css';

interface ApplicationStatusBadgeProps {
    status: 'active' | 'rejected' | 'hired' | 'withdrawn' | string; // Allow string for flexibility
}

export default function ApplicationStatusBadge({ status }: ApplicationStatusBadgeProps) {
    let className = styles.badge;

    switch (status.toLowerCase()) {
        case 'active':
        case 'interview':
        case 'screening':
            className = `${styles.badge} ${styles.badgeInfo}`;
            break;
        case 'rejected':
            className = `${styles.badge} ${styles.badgeError}`; // Assuming badgeError exists or using fallback
            break;
        case 'hired':
        case 'offer_accepted':
            className = `${styles.badge} ${styles.badgeSuccess}`;
            break;
        case 'withdrawn':
            className = `${styles.badge} ${styles.badgeNeutral}`;
            break;
        default:
            className = styles.badge;
    }

    return (
        <span className={className}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
}
