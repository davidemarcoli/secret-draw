'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ClaimConfirmModal } from './claim-confirm-modal';
import { Calendar, MapPin, Wallet, Gift, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

interface Participant {
    id: string;
    name: string;
    claimed: boolean;
}

interface EventData {
    name: string;
    description: string | null;
    date: string | null;
    place: string | null;
    budget: string | null;
    participants: Participant[];
}

interface EventViewProps {
    publicId: string;
}

export function EventView({ publicId }: EventViewProps) {
    const t = useTranslations('EventView');
    const [event, setEvent] = useState<EventData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const res = await fetch(`/api/events/${publicId}`);
                if (!res.ok) {
                    throw new Error('Event not found');
                }
                const data = await res.json();
                setEvent(data);
            } catch (err) {
                console.error('Error fetching event:', err);
                setError(true);
                toast.error(t('notFound.error'));
            } finally {
                setLoading(false);
            }
        };

        fetchEvent();
    }, [publicId, t]);

    const handleParticipantClick = (participant: Participant) => {
        setSelectedParticipant(participant);
        setIsModalOpen(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="p-20 text-center">
                <h1 className="text-2xl font-bold mb-4">{t('notFound.title')}</h1>
                <p className="text-muted-foreground">{t('notFound.description')}</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-md mx-auto pb-20">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">{event.name}</h1>
                {event.description && <p className="text-muted-foreground">{event.description}</p>}
            </div>

            <Card>
                <CardContent className="pt-6 space-y-4">
                    {event.date && (
                        <div className="flex items-center gap-3 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{new Date(event.date).toLocaleDateString()}</span>
                        </div>
                    )}
                    {event.place && (
                        <div className="flex items-center gap-3 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{event.place}</span>
                        </div>
                    )}
                    {event.budget && (
                        <div className="flex items-center gap-3 text-sm">
                            <Wallet className="h-4 w-4 text-muted-foreground" />
                            <span>{t('budget')}: {event.budget}</span>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-center">{t('whoAreYou')}</h2>
                <div className="grid gap-3">
                    {event.participants.map((p) => (
                        <Button
                            key={p.id}
                            variant={p.claimed ? "secondary" : "outline"}
                            className={`h-14 justify-between px-6 text-lg ${p.claimed ? 'opacity-50' : 'hover:border-primary hover:bg-primary/5'}`}
                            onClick={() => handleParticipantClick(p)}
                        >
                            <span className={p.claimed ? 'line-through text-muted-foreground' : ''}>{p.name}</span>
                            {p.claimed ? (
                                <Badge variant="secondary" className="ml-2">{t('claimed')}</Badge>
                            ) : (
                                <Gift className="h-5 w-5 text-primary" />
                            )}
                        </Button>
                    ))}
                </div>
            </div>

            <ClaimConfirmModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                participant={selectedParticipant}
                publicId={publicId}
            />
        </div>
    );
}
