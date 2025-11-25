import { EventView } from '@/components/event-view';

export default async function EventPage({ params }: { params: Promise<{ publicId: string }> }) {
    const { publicId } = await params;

    return (
        <div className="p-10">
            <EventView publicId={publicId} />
        </div>
    );
}
