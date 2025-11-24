import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ publicId: string }> }
) {
    const { publicId } = await params;

    try {
        const eventsQuery = query(
            collection(db, 'events'),
            where('public_id', '==', publicId),
            limit(1)
        );
        const eventsSnapshot = await getDocs(eventsQuery);

        if (eventsSnapshot.empty) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        }

        const eventDoc = eventsSnapshot.docs[0];
        const event = eventDoc.data();

        const participantsQuery = query(
            collection(eventDoc.ref, 'participants'),
            where('is_active', '==', true)
        );
        const participantsSnapshot = await getDocs(participantsQuery);

        const participants = participantsSnapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name,
            claimed: doc.data().claimed
        }));

        return NextResponse.json({
            name: event.name,
            description: event.description,
            date: event.date,
            place: event.place,
            budget: event.budget,
            participants
        });

    } catch (error) {
        console.error('Error fetching event:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
