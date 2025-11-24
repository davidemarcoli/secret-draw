import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, limit, doc, getDoc, updateDoc } from 'firebase/firestore';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ publicId: string }> }
) {
    const { publicId } = await params;
    const { participantId } = await req.json();

    try {
        // 1. Get Event
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

        // 2. Get Participant
        const participantRef = doc(eventDoc.ref, 'participants', participantId);
        const participantDoc = await getDoc(participantRef);

        if (!participantDoc.exists()) {
            return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
        }

        const participant = participantDoc.data();

        if (participant?.claimed) {
            return NextResponse.json({ error: 'Already claimed' }, { status: 400 });
        }

        // 4. Mark as claimed
        await updateDoc(participantRef, {
            claimed: true,
            claimed_at: new Date().toISOString()
        });

        // 5. Return the draw
        if (!participant?.draws_participant_id) {
            return NextResponse.json({ error: 'Draw not assigned' }, { status: 500 });
        }

        const drawnParticipantRef = doc(eventDoc.ref, 'participants', participant.draws_participant_id);
        const drawnParticipantDoc = await getDoc(drawnParticipantRef);

        if (!drawnParticipantDoc.exists()) {
            return NextResponse.json({ error: 'Drawn participant not found' }, { status: 500 });
        }

        const drawnParticipant = drawnParticipantDoc.data();

        return NextResponse.json({
            success: true,
            draws: {
                id: drawnParticipantDoc.id,
                name: drawnParticipant?.name
            }
        });

    } catch (error) {
        console.error('Error claiming participant:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
