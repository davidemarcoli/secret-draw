import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';

export async function POST(req: NextRequest) {
    try {
        const { adminId } = await req.json();

        if (!adminId) {
            return NextResponse.json({ error: 'Admin ID required' }, { status: 400 });
        }

        // 1. Find the source event
        const eventsQuery = query(
            collection(db, 'events'),
            where('admin_id', '==', adminId),
            limit(1)
        );
        const eventsSnapshot = await getDocs(eventsQuery);

        if (eventsSnapshot.empty) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        }

        const sourceEventDoc = eventsSnapshot.docs[0];

        // 2. Get pairings from source event
        const participantsSnapshot = await getDocs(collection(sourceEventDoc.ref, 'participants'));
        const participants = participantsSnapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name,
            draws_participant_id: doc.data().draws_participant_id
        }));

        const idToName = new Map(participants.map(p => [p.id, p.name]));

        const exclusions = [];
        for (const p of participants) {
            if (p.draws_participant_id) {
                const receiverName = idToName.get(p.draws_participant_id);
                if (receiverName) {
                    exclusions.push({
                        from: p.name,
                        to: receiverName
                    });
                }
            }
        }

        return NextResponse.json({
            success: true,
            exclusions
        });

    } catch (error) {
        console.error('Error importing exclusions:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
