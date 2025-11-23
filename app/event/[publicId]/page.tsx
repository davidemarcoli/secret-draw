import { EventView } from '@/components/event-view';
import { notFound } from 'next/navigation';

export default async function EventPage({ params }: { params: Promise<{ publicId: string }> }) {
    const { publicId } = await params;

    try {
        const res = await fetch(`/api/events/${publicId}`, { cache: 'no-store' });
        if (!res.ok) {
            if (res.status === 404) notFound();
            throw new Error('Failed to load event');
        }
        const event = await res.json();

        return (
            <div className="p-10">
                <EventView publicId={publicId} event={event} />
            </div>
        );
    } catch (error) {
        return (
            <div className="p-20 text-center">
                <h1 className="text-2xl font-bold mb-4">Event not found</h1>
                <p className="text-muted-foreground">This event may have been deleted or the link is incorrect.</p>
            </div>
        );
    }
}
