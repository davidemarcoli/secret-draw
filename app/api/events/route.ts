import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generatePairings } from '@/lib/draw-algorithm';
import { Exclusion } from '@/lib/types';

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

        // 1. Create Event
        const { data: event, error: eventError } = await supabase
            .from('events')
            .insert({
                name,
                description,
                date,
                place,
                budget,
                organizer_participating: organizerParticipating
            })
            .select()
            .single();

        if (eventError) throw eventError;

        // 2. Create Participants
        const participantInserts = participants.map((pName: string) => ({
            event_id: event.id,
            name: pName,
            claimed: false
        }));

        const { data: createdParticipants, error: partError } = await supabase
            .from('participants')
            .insert(participantInserts)
            .select();

        if (partError) throw partError;

        // 3. Handle Organizer Participation
        if (organizerParticipating && organizerName) {
            const organizer = createdParticipants.find(p => p.name === organizerName);
            if (organizer) {
                await supabase
                    .from('events')
                    .update({ organizer_participant_id: organizer.id })
                    .eq('id', event.id);
            }
        }

        // 4. Create Exclusions
        if (exclusions && exclusions.length > 0) {
            const exclusionInserts = exclusions.map((ex: any) => ({
                event_id: event.id,
                participant_a_name: ex.from,
                participant_b_name: ex.to,
                direction: 'a_to_b'
            }));

            const { error: exError } = await supabase
                .from('exclusions')
                .insert(exclusionInserts);

            if (exError) throw exError;
        }

        // 5. Generate and Save Pairings
        // We need to use the real participants now
        // Map exclusions to the format expected by generatePairings
        const realExclusions: any[] = exclusions.map((ex: any) => ({
            participant_a_name: ex.from,
            participant_b_name: ex.to,
            direction: 'a_to_b'
        }));

        const pairings = generatePairings(createdParticipants, realExclusions);

        if (!pairings) {
            // This shouldn't happen if validation passed, unless race condition or non-deterministic shuffle led to failure (unlikely for valid inputs)
            // But we should handle it.
            throw new Error('Failed to generate pairings after creation');
        }

        // Update participants with their draws
        for (const [giverId, receiverId] of pairings.entries()) {
            const { error: updateError } = await supabase
                .from('participants')
                .update({ draws_participant_id: receiverId })
                .eq('id', giverId);

            if (updateError) throw updateError;
        }

        return NextResponse.json({
            success: true,
            publicId: event.public_id,
            adminId: event.admin_id
        });

    } catch (error) {
        console.error('Error creating event:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
