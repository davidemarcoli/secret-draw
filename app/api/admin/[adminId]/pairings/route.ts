import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ adminId: string }> }
) {
    const { adminId } = await params;

    try {
        const { data: event, error: eventError } = await supabase
            .from('events')
            .select('*')
            .eq('admin_id', adminId)
            .single();

        if (eventError || !event) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        }

        if (event.organizer_participating) {
            return NextResponse.json({
                allowed: false,
                reason: 'Organizer is participating'
            }, { status: 403 });
        }

        const { data: participants, error: partError } = await supabase
            .from('participants')
            .select('id, name, draws_participant_id')
            .eq('event_id', event.id);

        if (partError) {
            return NextResponse.json({ error: 'Failed to fetch participants' }, { status: 500 });
        }

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
