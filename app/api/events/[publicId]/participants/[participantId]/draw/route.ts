import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ publicId: string; participantId: string }> }
) {
    const { publicId, participantId } = await params;

    try {
        // Verify event exists (optional but good for security)
        const { data: event, error: eventError } = await supabase
            .from('events')
            .select('id')
            .eq('public_id', publicId)
            .single();

        if (eventError || !event) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        }

        const { data: participant, error: partError } = await supabase
            .from('participants')
            .select('claimed, draws_participant_id')
            .eq('id', participantId)
            .eq('event_id', event.id)
            .single();

        if (partError || !participant) {
            return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
        }

        if (!participant.claimed) {
            return NextResponse.json({ claimed: false }, { status: 200 });
        }

        const { data: drawnParticipant, error: drawError } = await supabase
            .from('participants')
            .select('id, name')
            .eq('id', participant.draws_participant_id)
            .single();

        if (drawError) throw drawError;

        return NextResponse.json({
            claimed: true,
            draws: {
                id: drawnParticipant.id,
                name: drawnParticipant.name
            }
        });

    } catch (error) {
        console.error('Error fetching draw:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
