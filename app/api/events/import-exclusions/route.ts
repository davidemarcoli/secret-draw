import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
    try {
        const { adminId } = await req.json();

        if (!adminId) {
            return NextResponse.json({ error: 'Admin ID required' }, { status: 400 });
        }

        // 1. Find the source event
        const { data: sourceEvent, error: eventError } = await supabase
            .from('events')
            .select('id')
            .eq('admin_id', adminId)
            .single();

        if (eventError || !sourceEvent) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        }

        // 2. Get pairings from source event
        // We need to find who drew whom.
        const { data: participants, error: partError } = await supabase
            .from('participants')
            .select('id, name, draws_participant_id')
            .eq('event_id', sourceEvent.id);

        if (partError) {
            return NextResponse.json({ error: 'Failed to fetch participants' }, { status: 500 });
        }

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
