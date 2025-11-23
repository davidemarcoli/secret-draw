'use client';

import { useState } from 'react';
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
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface Exclusion {
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
    const [exclusions, setExclusions] = useState<Exclusion[]>([]);
    const [organizerParticipating, setOrganizerParticipating] = useState(true);
    const [organizerName, setOrganizerName] = useState('');

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

        setLoading(true);

        try {
            const res = await fetch('/api/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    description,
                    date,
                    place,
                    budget,
                    participants,
                    exclusions,
                    organizerParticipating,
                    organizerName: organizerParticipating ? organizerName : null
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to create event');
            }

            // Success! Redirect to success page or show links
            // For now, let's redirect to a success page or just the admin page?
            // The spec says "Shows success page with two links".
            // I'll redirect to the admin page, which should show the links.
            router.push(`/admin/${data.adminId}?new=true`);

        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
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
                            <Input id="budget" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="e.g. €20-30" />
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
                        exclusions={exclusions}
                        onChange={setExclusions}
                    />
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button size="lg" type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Event
                </Button>
            </div>
        </form>
    );
}
