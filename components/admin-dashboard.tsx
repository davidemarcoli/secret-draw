'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CopyButton } from './copy-button';
import { ParticipantStatusTable } from './participant-status-table';
import { Eye, EyeOff, RefreshCw, TriangleAlert } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useSearchParams } from 'next/navigation';

interface AdminDashboardProps {
    adminId: string;
}

export function AdminDashboard({ adminId }: AdminDashboardProps) {
    const [data, setData] = useState<any>(null);
    const [pairings, setPairings] = useState<any[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [showPairings, setShowPairings] = useState(false);
    const searchParams = useSearchParams();
    const isNew = searchParams.get('new') === 'true';

    const fetchData = async () => {
        try {
            const res = await fetch(`/api/admin/${adminId}`);
            if (!res.ok) throw new Error('Failed to load event');
            const json = await res.json();
            setData(json);
        } catch (error) {
            toast.error('Failed to load dashboard');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [adminId]);

    const fetchPairings = async () => {
        if (showPairings) {
            setShowPairings(false);
            return;
        }

        try {
            const res = await fetch(`/api/admin/${adminId}/pairings`);
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || 'Failed to load pairings');

            setPairings(json.pairings);
            setShowPairings(true);
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    if (loading) return <div className="text-center py-20">Loading...</div>;
    if (!data) return <div className="text-center py-20">Event not found</div>;

    return (
        <div className="space-y-8 pb-20">
            {isNew && (
                <Alert variant="default" className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-900 text-yellow-800 dark:text-yellow-200">
                    <TriangleAlert className="h-4 w-4" />
                    <AlertTitle>Save this page!</AlertTitle>
                    <AlertDescription>
                        This is your private admin dashboard. <strong>You will not be able to recover it if you lose this link.</strong> Bookmark it now.
                    </AlertDescription>
                </Alert>
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{data.name}</h1>
                    <p className="text-muted-foreground">Admin Dashboard</p>
                </div>
                <Button variant="outline" onClick={fetchData}>
                    <RefreshCw className="mr-2 h-4 w-4" /> Refresh
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Share Event</CardTitle>
                        <CardDescription>Send this link to all participants.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-3 bg-secondary/50 rounded-md break-all text-sm font-mono">
                            {data.public_id ? `${window.location.origin}/event/${data.public_id}` : 'Loading link...'}
                        </div>
                        <CopyButton
                            text={data.public_id ? `${window.location.origin}/event/${data.public_id}` : ''}
                            className="w-full"
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Event Status</CardTitle>
                        <CardDescription>Overview of your event.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Participants</span>
                            <span className="font-medium">{data.participants.length}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Claimed</span>
                            <span className="font-medium">{data.participants.filter((p: any) => p.claimed).length}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Organizer</span>
                            <span className="font-medium">{data.organizerParticipating ? 'Participating' : 'Non-participating'}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Participants</CardTitle>
                    <CardDescription>Manage participants and view claim status.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ParticipantStatusTable
                        participants={data.participants}
                        adminId={adminId}
                        onUpdate={fetchData}
                    />
                </CardContent>
            </Card>

            {data.canViewPairings && (
                <Card>
                    <CardHeader>
                        <CardTitle>Pairings</CardTitle>
                        <CardDescription>
                            Since you are not participating, you can view the pairings.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {!showPairings ? (
                            <Button onClick={fetchPairings} variant="secondary">
                                <Eye className="mr-2 h-4 w-4" /> Reveal Pairings
                            </Button>
                        ) : (
                            <div className="space-y-4">
                                <div className="border rounded-md divide-y">
                                    {pairings?.map((pair, i) => (
                                        <div key={i} className="flex justify-between p-3 text-sm">
                                            <span className="font-medium">{pair.from}</span>
                                            <span className="text-muted-foreground">→</span>
                                            <span className="font-medium">{pair.to}</span>
                                        </div>
                                    ))}
                                </div>
                                <Button onClick={() => setShowPairings(false)} variant="ghost" size="sm">
                                    <EyeOff className="mr-2 h-4 w-4" /> Hide Pairings
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
