import { EventView } from '@/components/event-view';
import { notFound } from 'next/navigation';

export default async function EventPage({ params }: { params: Promise<{ publicId: string }> }) {
    const { publicId } = await params;

    // We fetch data on the client or server?
    // The component `EventView` takes `event` as prop.
    // Let's fetch on server for SEO and speed.

    // We can reuse the API logic or call the API.
    // Since we are in the same app, we can call the DB directly or fetch the API URL.
    // Calling DB directly is better for server components.

    // However, for simplicity and consistency with API types, let's fetch the API if we have the URL.
    // Or just import the supabase client.

    // Let's use fetch to our own API for now to ensure logic consistency (like filtering active participants).
    // But we need the absolute URL.
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    try {
        const res = await fetch(`${appUrl}/api/events/${publicId}`, { cache: 'no-store' });
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
