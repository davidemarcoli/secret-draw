'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ParticipantListManager } from './participant-list-manager';
import { ExclusionManager } from './exclusion-manager';
import { LoginDialog } from './login-dialog';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, doc, writeBatch } from 'firebase/firestore';
import { generatePairings } from '@/lib/draw-algorithm';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface LocalExclusion {
    from: string;
    to: string;
}


export function CreateEventForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [place, setPlace] = useState('');
    const [budget, setBudget] = useState('');
    const [participants, setParticipants] = useState<string[]>([]);
    const [exclusions, setExclusions] = useState<LocalExclusion[]>([]);
    const [organizerParticipating, setOrganizerParticipating] = useState(true);
    const [organizerName, setOrganizerName] = useState('');

    // Auth State
    const [user, setUser] = useState<User | null>(null);
    const [showLogin, setShowLogin] = useState(false);

    // Listen to auth state
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    const createEvent = async () => {
        if (!user) return;
        setLoading(true);

        try {
            // Client-side validation
            const tempParticipants = participants.map((p, i) => ({ id: i.toString(), name: p }));
            const tempExclusions = exclusions.map(ex => ({
                participant_a_name: ex.from,
                participant_b_name: ex.to,
                direction: 'a_to_b'
            }));

            const pairingResult = generatePairings(tempParticipants, tempExclusions as any);
            if (!pairingResult) {
                throw new Error('No valid pairing possible with these exclusions');
            }

            // Prepare Batch
            const batch = writeBatch(db);
            const eventId = doc(collection(db, 'events')).id;
            const publicId = uuidv4();
            const adminId = uuidv4();
            const eventRef = doc(db, 'events', eventId);

            // Create Event
            batch.set(eventRef, {
                id: eventId,
                public_id: publicId,
                admin_id: adminId,
                name,
                description: description || null,
                date: date || null,
                place: place || null,
                budget: budget || null,
                organizer_participating: organizerParticipating,
                organizer_participant_id: null,
                created_by: user.uid, // Track who created it
                created_at: new Date().toISOString(),
                status: 'active'
            });

            // Create Participants
            const participantRefs: { [name: string]: any } = {};
            const participantsData: any[] = [];

            participants.forEach((pName) => {
                const pRef = doc(collection(eventRef, 'participants'));
                participantRefs[pName] = pRef;
                const pData = {
                    id: pRef.id,
                    event_id: eventId,
                    name: pName,
                    claimed: false,
                    claimed_at: null,
                    draws_participant_id: null,
                    is_active: true,
                    created_at: new Date().toISOString()
                };
                participantsData.push(pData);
                batch.set(pRef, pData);
            });

            // Handle Organizer
            if (organizerParticipating && organizerName) {
                const organizerRef = participantRefs[organizerName];
                if (organizerRef) {
                    batch.update(eventRef, { organizer_participant_id: organizerRef.id });
                }
            }

            // Exclusions
            exclusions.forEach((ex) => {
                const exRef = doc(collection(eventRef, 'exclusions'));
                batch.set(exRef, {
                    id: exRef.id,
                    event_id: eventId,
                    participant_a_name: ex.from || null,
                    participant_b_name: ex.to || null,
                    direction: 'a_to_b'
                });
            });

            // Generate Pairings (Real IDs)
            const realExclusions = exclusions.map(ex => ({
                participant_a_name: ex.from,
                participant_b_name: ex.to,
                direction: 'a_to_b'
            }));
            const createdParticipants = participantsData.map(p => ({ id: p.id, name: p.name }));
            const pairings = generatePairings(createdParticipants, realExclusions as any);

            if (!pairings) throw new Error('Failed to generate pairings');

            for (const [giverId, receiverId] of pairings.entries()) {
                const giverData = participantsData.find(p => p.id === giverId);
                if (giverData) {
                    const giverRef = participantRefs[giverData.name];
                    batch.update(giverRef, { draws_participant_id: receiverId });
                }
            }

            await batch.commit();
            router.push(`/admin/${adminId}?new=true`);

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Failed to create event');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name) {
            toast.error('Event name is required');
            return;
        }
        if (participants.length < 3) {
            toast.error('At least 3 participants are required');
            return;
        }
        if (organizerParticipating && !organizerName) {
            toast.error('Please select your name');
            return;
        }

        if (!user) {
            setShowLogin(true);
            return;
        }

        await createEvent();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl mx-auto pb-20">
            <Card>
                <CardHeader>
                    <CardTitle>Event Details</CardTitle>
                    <CardDescription>Basic information about your gift exchange.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Event Name *</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Christmas 2024" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add a nice message..." />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="date">Date</Label>
                            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="budget">Budget</Label>
                            <Input id="budget" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="e.g. CHF 20-30" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="place">Location</Label>
                        <Input id="place" value={place} onChange={(e) => setPlace(e.target.value)} placeholder="Grandma's House" />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Participants</CardTitle>
                    <CardDescription>Add everyone who is joining. Minimum 3 people.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ParticipantListManager
                        participants={participants}
                        onChange={setParticipants}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Organizer</CardTitle>
                    <CardDescription>Are you participating in the exchange?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="organizer-participating"
                            checked={organizerParticipating}
                            onCheckedChange={setOrganizerParticipating}
                        />
                        <Label htmlFor="organizer-participating">I am participating</Label>
                    </div>

                    {organizerParticipating && (
                        <div className="space-y-2">
                            <Label>Who are you?</Label>
                            <Select value={organizerName} onValueChange={setOrganizerName}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select your name" />
                                </SelectTrigger>
                                <SelectContent>
                                    {participants.map(p => (
                                        <SelectItem key={`org-${p}`} value={p}>{p}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {participants.length === 0 && (
                                <p className="text-xs text-muted-foreground">Add participants above first.</p>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Exclusions (Optional)</CardTitle>
                    <CardDescription>Prevent specific pairs (e.g. couples) from drawing each other.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ExclusionManager
                        participants={participants}
                        exclusions={exclusions as any}
                        onChange={setExclusions as any}
                    />
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button size="lg" type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {user ? 'Create Event' : 'Login & Create Event'}
                </Button>
            </div>

            <LoginDialog
                open={showLogin}
                onOpenChange={setShowLogin}
                onSuccess={createEvent}
            />
        </form>
    );
}
