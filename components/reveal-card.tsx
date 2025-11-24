'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Confetti } from './confetti';
import { ArrowLeft, Gift, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface RevealCardProps {
    publicId: string;
    participantId: string;
}

export function RevealCard({ publicId, participantId }: RevealCardProps) {
    const router = useRouter();
    const [drawnName, setDrawnName] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        const fetchDraw = async () => {
            try {
                const res = await fetch(`/api/events/${publicId}/participants/${participantId}/draw`);

                if (!res.ok) {
                    throw new Error('Failed to load draw');
                }

                const data = await res.json();

                if (!data.claimed) {
                    router.push(`/event/${publicId}`);
                    return;
                }

                setDrawnName(data.draws.name);
                setShowConfetti(true);

                const timer = setTimeout(() => setShowConfetti(false), 5000);
                return () => clearTimeout(timer);
            } catch (err) {
                console.error('Error fetching draw:', err);
                toast.error('Failed to load your draw');
            } finally {
                setLoading(false);
            }
        };

        fetchDraw();
    }, [publicId, participantId, router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!drawnName) {
        return (
            <div className="p-20 text-center">
                <h1 className="text-2xl font-bold mb-4">Error loading draw</h1>
                <p className="text-muted-foreground">Please try again later.</p>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto text-center space-y-8 pt-10">
            {showConfetti && <Confetti />}

            <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tight">You are the Secret Santa for...</h1>
            </div>

            <Card className="border-2 border-primary/20 shadow-lg overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                <CardContent className="pt-12 pb-12 space-y-6">
                    <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto animate-bounce-slow">
                        <Gift className="h-12 w-12 text-primary" />
                    </div>
                    <div className="space-y-2">
                        <p className="text-muted-foreground text-lg">You are buying a gift for</p>
                        <h2 className="text-4xl font-extrabold text-primary break-words">{drawnName}</h2>
                    </div>
                </CardContent>
            </Card>

            <div className="pt-8">
                <Button asChild variant="outline" size="lg">
                    <Link href={`/event/${publicId}`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Event
                    </Link>
                </Button>
            </div>
        </div>
    );
}
