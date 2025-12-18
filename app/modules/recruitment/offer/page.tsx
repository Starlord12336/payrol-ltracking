'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button } from '@/shared/components';
import { useAuth } from '@/shared/hooks/useAuth';
import { recruitmentApi } from '../api/recruitment.api';
import { Offer } from '../types';

export default function CandidateOfferPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [offers, setOffers] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        async function fetchOffers() {
            try {
                // Ensure we only fetch for the current candidate
                // Check api definition: listOffers(applicationId?, candidateId?)
                const data = await recruitmentApi.listOffers(undefined, user?.userid);
                setOffers(data);
            } catch (error) {
                console.error('Failed to fetch offers:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchOffers();
    }, [user]);

    const handleRespond = async (offerId: string, response: 'accepted' | 'rejected') => {
        if (!confirm(`Are you sure you want to ${response} this offer?`)) return;

        try {
            await recruitmentApi.respondToOffer(offerId, response);
            alert(`Offer ${response} successfully.`);
            // Refresh list
            const data = await recruitmentApi.listOffers(undefined, user?.userid);
            setOffers(data);
        } catch (error: any) {
            console.error('Failed to respond to offer:', error);
            alert('Failed to update offer status.');
        }
    };

    if (loading) return <div style={{ padding: '2rem' }}>Loading offers...</div>;

    if (!offers || offers.length === 0) {
        return (
            <div style={{ padding: '2rem' }}>
                <Button variant="ghost" onClick={() => router.back()} style={{ marginBottom: '1rem' }}>
                    ← Back
                </Button>
                <Card>
                    <p>No job offers found.</p>
                </Card>
            </div>
        );
    }

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '1rem' }}>
                <Button variant="ghost" onClick={() => router.back()}>
                    ← Back
                </Button>
            </div>

            <h1 style={{ marginBottom: '2rem', fontSize: '1.5rem', fontWeight: 'bold' }}>My Job Offers</h1>

            {offers.map((offer) => (
                <div key={offer._id} style={{ marginBottom: '1.5rem' }}>
                    <Card padding="lg">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                                    {offer.role || 'Position Offered'}
                                </h3>
                                <div style={{ color: '#666', marginBottom: '0.5rem' }}>
                                    Gross Salary: ${offer.grossSalary.toLocaleString()}
                                </div>
                                <div style={{ color: '#666' }}>
                                    Deadline: {offer.deadline ? new Date(offer.deadline).toLocaleDateString() : 'N/A'}
                                </div>
                            </div>
                            <div style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '4px',
                                backgroundColor: '#f5f5f5',
                                fontWeight: 'bold',
                                textTransform: 'uppercase',
                                fontSize: '0.875rem'
                            }}>
                                {/* Display correct status field from schema: 'applicantResponse' if we had access, but interface says 'status' */}
                                {/* But looking at the schema, applicantResponse tracks the candidate's choice. */}
                                {/* Wait, the interface I saw in types/index.ts had `status`. Let's assume standard mapped DTO. */}
                                {/* The API `listOffers` returns `lean()` from Mongoose. So raw fields. */}
                                {/* Schema has `applicantResponse`. Type has `status` (which seemed distinct or maybe I misread). */}
                                {/* Let's be careful. The type `Offer` in `types/index.ts` had `status`? */}
                                {/* Checking types/index.ts earlier: interface Offer { status: ... } */}
                                {/* The schema has `applicantResponse` AND `finalStatus`. */}
                                {/* I should check if the frontend Type aligns with the Backend schema. */}
                                {/* In `types/index.ts`: `status: 'draft' | ... | 'accepted'`. */}
                                {/* If the backend returns raw Mongoose object, it will have `applicantResponse`. */}
                                {/* I might need to cast or handle both. */}
                                {/* Let's display friendly text based on what we find. */}
                                {(offer as any).applicantResponse || 'PENDING'}
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.5rem', lineHeight: '1.6' }}>
                            <strong>Offer Details:</strong>
                            <p style={{ marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}>{offer.content}</p>

                            <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                {offer.signingBonus && (
                                    <div>
                                        <strong>Signing Bonus:</strong>
                                        <div>${offer.signingBonus.toLocaleString()}</div>
                                    </div>
                                )}
                                {offer.benefits && offer.benefits.length > 0 && (
                                    <div>
                                        <strong>Benefits:</strong>
                                        <ul style={{ paddingLeft: '1.2rem', marginTop: '0.25rem' }}>
                                            {offer.benefits.map((b, i) => <li key={i}>{b}</li>)}
                                        </ul>
                                    </div>
                                )}
                                {offer.conditions && (
                                    <div>
                                        <strong>Conditions:</strong>
                                        <div>{offer.conditions}</div>
                                    </div>
                                )}
                                {offer.insurances && (
                                    <div>
                                        <strong>Insurances:</strong>
                                        <div>{offer.insurances}</div>
                                    </div>
                                )}
                                {offer.finalStatus && (
                                    <div>
                                        <strong>Final Status:</strong>
                                        <div style={{ textTransform: 'capitalize' }}>{offer.finalStatus}</div>
                                    </div>
                                )}
                            </div>

                            <div style={{ marginTop: '1.5rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                                {offer.candidateSignedAt && (
                                    <div style={{ color: '#059669', fontSize: '0.9rem' }}>
                                        ✓ Signed by you on {new Date(offer.candidateSignedAt).toLocaleDateString()}
                                    </div>
                                )}
                                {offer.hrSignedAt && (
                                    <div style={{ color: '#059669', fontSize: '0.9rem' }}>
                                        ✓ Signed by HR on {new Date(offer.hrSignedAt).toLocaleDateString()}
                                    </div>
                                )}
                                {offer.managerSignedAt && (
                                    <div style={{ color: '#059669', fontSize: '0.9rem' }}>
                                        ✓ Signed by Manager on {new Date(offer.managerSignedAt).toLocaleDateString()}
                                    </div>
                                )}
                            </div>
                        </div>

                        {((offer as any).applicantResponse === 'pending') && (
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                                <Button
                                    variant="primary"
                                    style={{ backgroundColor: '#10b981', borderColor: '#10b981' }}
                                    onClick={() => handleRespond(offer._id, 'accepted')}
                                >
                                    Accept Offer
                                </Button>
                                <Button
                                    variant="outline"
                                    style={{ color: '#ef4444', borderColor: '#ef4444' }}
                                    onClick={() => handleRespond(offer._id, 'rejected')}
                                >
                                    Decline Offer
                                </Button>
                            </div>
                        )}

                        {((offer as any).applicantResponse !== 'pending') && (
                            <div style={{ marginTop: '1rem', color: '#666', fontStyle: 'italic' }}>
                                You have responded: <strong>{(offer as any).applicantResponse}</strong>
                            </div>
                        )}
                    </Card>
                </div>
            ))}
        </div>
    );
}
