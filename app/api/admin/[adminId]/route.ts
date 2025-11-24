import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ adminId: string }> }
) {
    const { adminId } = await params;

    try {
        const eventsQuery = query(
            collection(db, 'events'),
            where('admin_id', '==', adminId),
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
            orderBy('name')
        );
        const participantsSnapshot = await getDocs(participantsQuery);

        const participants = participantsSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name,
                claimed: data.claimed,
                claimedAt: data.claimed_at,
                isActive: data.is_active
            };
        });

        return NextResponse.json({
            public_id: event.public_id,
            name: event.name,
            description: event.description,
            date: event.date,
            place: event.place,
            budget: event.budget,
            organizerParticipating: event.organizer_participating,
            participants,
            canViewPairings: !event.organizer_participating
        });

    } catch (error) {
        console.error('Error fetching admin event:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
