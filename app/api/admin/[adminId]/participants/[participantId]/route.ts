import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, limit, doc, getDoc, updateDoc } from 'firebase/firestore';

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ adminId: string; participantId: string }> }
) {
    const { adminId, participantId } = await params;
    const { isActive } = await req.json();

    try {
        // Verify admin access
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

        // Update participant
        const participantRef = doc(eventDoc.ref, 'participants', participantId);

        // Check if exists first
        const pDoc = await getDoc(participantRef);
        if (!pDoc.exists()) {
            return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
        }

        await updateDoc(participantRef, { is_active: isActive });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error updating participant:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
