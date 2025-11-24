'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoginDialog } from './login-dialog';
import { Loader2, Calendar, Users, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export function MyEventsPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [showLogin, setShowLogin] = useState(false);
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                fetchEvents(currentUser.uid);
            } else {
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);

    const fetchEvents = async (userId: string) => {
        setLoading(true);
        try {
            const eventsQuery = query(
                collection(db, 'events'),
                where('created_by', '==', userId),
                orderBy('created_at', 'desc')
            );
            const eventsSnapshot = await getDocs(eventsQuery);

            const eventsData = await Promise.all(
                eventsSnapshot.docs.map(async (eventDoc) => {
                    const eventData = eventDoc.data();

                    // Get participants count
                    const participantsSnapshot = await getDocs(
                        collection(eventDoc.ref, 'participants')
                    );
                    const participants = participantsSnapshot.docs;
                    const claimedCount = participants.filter(p => p.data().claimed).length;

                    return {
                        id: eventDoc.id,
                        ...eventData,
                        participantCount: participants.length,
                        claimedCount
                    };
                })
            );

            setEvents(eventsData);
        } catch (error) {
            console.error('Error fetching events:', error);
            toast.error('Failed to load events');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="max-w-2xl mx-auto text-center py-20">
                <h2 className="text-2xl font-bold mb-4">Login Required</h2>
                <p className="text-muted-foreground mb-6">
                    Please login to view your events
                </p>
                <Button onClick={() => setShowLogin(true)}>
                    Login
                </Button>
                <LoginDialog
                    open={showLogin}
                    onOpenChange={setShowLogin}
                    onSuccess={() => {
                        if (auth.currentUser) {
                            fetchEvents(auth.currentUser.uid);
                        }
                    }}
                />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Events</h1>
                    <p className="text-muted-foreground">Manage your Secret Santa events</p>
                </div>
                <Button onClick={() => router.push('/create')}>
                    Create New Event
                </Button>
            </div>

            {events.length === 0 ? (
                <Card>
                    <CardContent className="py-20 text-center">
                        <p className="text-muted-foreground mb-4">
                            You haven't created any events yet
                        </p>
                        <Button onClick={() => router.push('/create')}>
                            Create Your First Event
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {events.map((event) => (
                        <Card key={event.id} className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle>{event.name}</CardTitle>
                                        <CardDescription>
                                            {event.description || 'No description'}
                                        </CardDescription>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => router.push(`/admin/${event.admin_id}`)}
                                    >
                                        <ExternalLink className="h-4 w-4 mr-2" />
                                        Open Dashboard
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    {event.date && (
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <span>{new Date(event.date).toLocaleDateString()}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                        <span>{event.participantCount} participants</span>
                                    </div>
                                    <div className="text-muted-foreground">
                                        Claimed: {event.claimedCount}/{event.participantCount}
                                    </div>
                                    {event.budget && (
                                        <div className="text-muted-foreground">
                                            Budget: {event.budget}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
