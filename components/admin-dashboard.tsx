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

import { useTranslations, useLocale } from 'next-intl';

export function AdminDashboard({ adminId }: AdminDashboardProps) {
    const t = useTranslations('AdminDashboard');
    const locale = useLocale();
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
            toast.error(t('error'));
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
            if (!res.ok) throw new Error(json.error || t('pairings.error'));

            setPairings(json.pairings);
            setShowPairings(true);
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    if (loading) return <div className="text-center py-20">{t('loading')}</div>;
    if (!data) return <div className="text-center py-20">{t('notFound')}</div>;

    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{data.name}</h1>
                    <p className="text-muted-foreground">{t('title')}</p>
                </div>
                <Button variant="outline" onClick={fetchData}>
                    <RefreshCw className="mr-2 h-4 w-4" /> {t('refresh')}
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('share.title')}</CardTitle>
                        <CardDescription>{t('share.description')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-3 bg-secondary/50 rounded-md break-all text-sm font-mono">
                            {data.public_id ? `${window.location.origin}/${locale}/event/${data.public_id}` : t('share.loading')}
                        </div>
                        <CopyButton
                            text={data.public_id ? `${window.location.origin}/${locale}/event/${data.public_id}` : ''}
                            className="w-full"
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('status.title')}</CardTitle>
                        <CardDescription>{t('status.description')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">{t('status.participants')}</span>
                            <span className="font-medium">{data.participants.length}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">{t('status.claimed')}</span>
                            <span className="font-medium">{data.participants.filter((p: any) => p.claimed).length}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">{t('status.organizer')}</span>
                            <span className="font-medium">{data.organizerParticipating ? t('status.participating') : t('status.nonParticipating')}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('participants.title')}</CardTitle>
                    <CardDescription>{t('participants.description')}</CardDescription>
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
                        <CardTitle>{t('pairings.title')}</CardTitle>
                        <CardDescription>
                            {t('pairings.description')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {!showPairings ? (
                            <Button onClick={fetchPairings} variant="secondary">
                                <Eye className="mr-2 h-4 w-4" /> {t('pairings.reveal')}
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
                                    <EyeOff className="mr-2 h-4 w-4" /> {t('pairings.hide')}
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
