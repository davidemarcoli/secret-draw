import { RevealCard } from '@/components/reveal-card';
import { notFound, redirect } from 'next/navigation';

export default async function RevealPage({
    params
}: {
    params: Promise<{ publicId: string; participantId: string }>
}) {
    const { publicId, participantId } = await params;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    try {
        const res = await fetch(`${appUrl}/api/events/${publicId}/participants/${participantId}/draw`, { cache: 'no-store' });

        if (!res.ok) {
            if (res.status === 404) notFound();
            throw new Error('Failed to load draw');
        }

        const data = await res.json();

        if (!data.claimed) {
            // Not claimed yet, redirect back to event page
            redirect(`/event/${publicId}`);
        }

        return (
            <div className="p-10 min-h-[80vh] flex flex-col justify-center">
                <RevealCard drawnName={data.draws.name} publicId={publicId} />
            </div>
        );
    } catch (error) {
        if ((error as any).message === 'NEXT_REDIRECT') throw error;
        return (
            <div className="p-20 text-center">
                <h1 className="text-2xl font-bold mb-4">Error loading draw</h1>
                <p className="text-muted-foreground">Please try again later.</p>
            </div>
        );
    }
}
