import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';

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

        if (event.organizer_participating) {
            return NextResponse.json({
                allowed: false,
                reason: 'Organizer is participating'
            }, { status: 403 });
        }

        const participantsSnapshot = await getDocs(collection(eventDoc.ref, 'participants'));
        const participants = participantsSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name,
                draws_participant_id: data.draws_participant_id
            };
        });

        // Map IDs to names for better readability
        const nameMap = new Map(participants.map(p => [p.id, p.name]));

        const pairings = participants.map(p => ({
            from: p.name,
            to: p.draws_participant_id ? nameMap.get(p.draws_participant_id) : 'Unassigned'
        }));

        return NextResponse.json({
            allowed: true,
            pairings
        });

    } catch (error) {
        console.error('Error fetching pairings:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
