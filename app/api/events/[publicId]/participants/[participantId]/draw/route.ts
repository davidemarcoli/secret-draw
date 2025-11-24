import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, limit, doc, getDoc } from 'firebase/firestore';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ publicId: string; participantId: string }> }
) {
    const { publicId, participantId } = await params;

    try {
        // Verify event exists
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

        const participantRef = doc(eventDoc.ref, 'participants', participantId);
        const participantDoc = await getDoc(participantRef);

        if (!participantDoc.exists()) {
            return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
        }

        const participant = participantDoc.data();

        if (!participant?.claimed) {
            return NextResponse.json({ claimed: false }, { status: 200 });
        }

        const drawnParticipantRef = doc(eventDoc.ref, 'participants', participant.draws_participant_id);
        const drawnParticipantDoc = await getDoc(drawnParticipantRef);

        if (!drawnParticipantDoc.exists()) {
            return NextResponse.json({ error: 'Drawn participant not found' }, { status: 500 });
        }

        const drawnParticipant = drawnParticipantDoc.data();

        return NextResponse.json({
            claimed: true,
            draws: {
                id: drawnParticipantDoc.id,
                name: drawnParticipant?.name
            }
        });

    } catch (error) {
        console.error('Error fetching draw:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
