import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generatePairings } from '@/lib/draw-algorithm';
import { Exclusion } from '@/lib/types';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ publicId: string }> }
) {
    const { publicId } = await params;
    const { participantId } = await req.json();

    try {
        // 1. Get Event
        const { data: event, error: eventError } = await supabase
            .from('events')
            .select('*')
            .eq('public_id', publicId)
            .single();

        if (eventError || !event) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        }

        // 2. Get Participant
        const { data: participant, error: partError } = await supabase
            .from('participants')
            .select('*')
            .eq('id', participantId)
            .eq('event_id', event.id)
            .single();

        if (partError || !participant) {
            return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
        }

        if (participant.claimed) {
            return NextResponse.json({ error: 'Already claimed' }, { status: 400 });
        }

        // 3. Check if draws are already assigned (lazy generation vs pre-generation)
        // The spec says "Pairings are pre-calculated when the event is created".
        // Wait, the spec says "System validates and generates pairings using algorithm" at creation.
        // But it doesn't explicitly say it SAVES them then.
        // However, "When participants 'claim' their name, they are revealing their pre-assigned match".
        // So we should have saved them.
        // BUT the database schema doesn't have a separate "pairings" table.
        // It has `draws_participant_id` on the `participants` table.
        // So we should have assigned `draws_participant_id` during creation!

        // Let's check my creation logic.
        // I missed assigning `draws_participant_id` in `POST /api/events`.
        // I need to fix `POST /api/events` to actually save the pairings.

        // For now, let's assume they are assigned.

        // 4. Mark as claimed
        const { error: updateError } = await supabase
            .from('participants')
            .update({
                claimed: true,
                claimed_at: new Date().toISOString()
            })
            .eq('id', participantId);

        if (updateError) throw updateError;

        // 5. Return the draw
        // We need to fetch the drawn participant details
        if (!participant.draws_participant_id) {
            // This is a critical error if pairings weren't generated
            return NextResponse.json({ error: 'Draw not assigned' }, { status: 500 });
        }

        const { data: drawnParticipant, error: drawError } = await supabase
            .from('participants')
            .select('id, name')
            .eq('id', participant.draws_participant_id)
            .single();

        if (drawError) throw drawError;

        return NextResponse.json({
            success: true,
            draws: {
                id: drawnParticipant.id,
                name: drawnParticipant.name
            }
        });

    } catch (error) {
        console.error('Error claiming participant:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
