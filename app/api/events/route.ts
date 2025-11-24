import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { generatePairings } from '@/lib/draw-algorithm';
import { Exclusion } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import { collection, doc, writeBatch, setDoc, updateDoc } from 'firebase/firestore';


export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            name,
            description,
            date,
            place,
            budget,
            participants,
            organizerParticipating,
            organizerName,
            exclusions
        } = body;

        // Validation
        if (!name || !participants || participants.length < 3) {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
        }

        // Check if pairing is possible before creating event
        // We need to map the participant names to temporary IDs for the algorithm
        const tempParticipants = participants.map((p: string, i: number) => ({
            id: i.toString(),
            name: p
        }));

        // Map exclusions to match the temp structure
        // The algorithm expects Exclusion objects, but we only have names here.
        // We need to construct Exclusion-like objects.
        const tempExclusions: any[] = exclusions.map((ex: any) => ({
            participant_a_name: ex.from,
            participant_b_name: ex.to,
            direction: 'a_to_b' // Defaulting to one-way for now as per spec example, but could be 'both'
        }));

        try {
            const result = generatePairings(tempParticipants, tempExclusions);
            if (!result) {
                return NextResponse.json({ error: 'No valid pairing possible with these exclusions' }, { status: 400 });
            }
        } catch (e) {
            return NextResponse.json({ error: 'Failed to validate pairings' }, { status: 400 });
        }

        // 1. Prepare Batch
        const batch = writeBatch(db);

        // Generate IDs
        const eventId = doc(collection(db, 'events')).id;
        const publicId = uuidv4();
        const adminId = uuidv4();
        const eventRef = doc(db, 'events', eventId);

        // Create Event
        batch.set(eventRef, {
            id: eventId,
            public_id: publicId,
            admin_id: adminId,
            name,
            description: description || null,
            date: date || null,
            place: place || null,
            budget: budget || null,
            organizer_participating: organizerParticipating || false,
            organizer_participant_id: null, // Will update if needed
            created_at: new Date().toISOString(),
            status: 'active'
        });

        // 2. Create Participants
        const participantRefs: { [name: string]: any } = {};
        const participantsData: any[] = [];

        participants.forEach((pName: string) => {
            const pRef = doc(collection(eventRef, 'participants'));
            participantRefs[pName] = pRef;

            const pData = {
                id: pRef.id,
                event_id: eventId,
                name: pName,
                claimed: false,
                claimed_at: null,
                draws_participant_id: null,
                is_active: true,
                created_at: new Date().toISOString()
            };

            participantsData.push(pData);
            batch.set(pRef, pData);
        });

        // 3. Handle Organizer Participation
        if (organizerParticipating && organizerName) {
            const organizerRef = participantRefs[organizerName];
            if (organizerRef) {
                batch.update(eventRef, { organizer_participant_id: organizerRef.id });
            }
        }

        // 4. Create Exclusions
        if (exclusions && exclusions.length > 0) {
            exclusions.forEach((ex: any) => {
                const exRef = doc(collection(eventRef, 'exclusions'));
                batch.set(exRef, {
                    id: exRef.id,
                    event_id: eventId,
                    participant_a_name: ex.from || null,
                    participant_b_name: ex.to || null,
                    direction: 'a_to_b'
                });
            });
        }

        // 5. Generate and Save Pairings
        // Map exclusions to the format expected by generatePairings
        const realExclusions: any[] = exclusions.map((ex: any) => ({
            participant_a_name: ex.from,
            participant_b_name: ex.to,
            direction: 'a_to_b'
        }));

        // We need the participant objects with IDs for the algorithm
        const createdParticipants = participantsData.map(p => ({
            id: p.id,
            name: p.name
        }));

        const pairings = generatePairings(createdParticipants, realExclusions);

        if (!pairings) {
            throw new Error('Failed to generate pairings after creation');
        }

        // Update participants with their draws
        for (const [giverId, receiverId] of pairings.entries()) {
            // Find the ref for the giver
            const giverData = participantsData.find(p => p.id === giverId);
            if (giverData) {
                const giverRef = participantRefs[giverData.name];
                batch.update(giverRef, { draws_participant_id: receiverId });
            }
        }

        // Commit Batch
        await batch.commit();

        return NextResponse.json({
            success: true,
            publicId: publicId,
            adminId: adminId
        });

    } catch (error) {
        console.error('Error creating event:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
