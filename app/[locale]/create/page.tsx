import { CreateEventForm } from '@/components/create-event-form';

export default function CreateEventPage() {
    return (
        <div className="p-10">
            <div className="text-center mb-10 space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Create New Event</h1>
                <p className="text-muted-foreground">Set up your gift exchange in seconds.</p>
            </div>
            <CreateEventForm />
        </div>
    );
}
