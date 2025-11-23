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

        const { data: participants, error: partError } = await supabase
            .from('participants')
            .select('id, name, claimed, claimed_at, is_active')
            .eq('event_id', event.id)
            .order('name');

        if (partError) {
            return NextResponse.json({ error: 'Failed to fetch participants' }, { status: 500 });
        }

        return NextResponse.json({
            public_id: event.public_id,
            name: event.name,
            description: event.description,
            date: event.date,
            place: event.place,
            budget: event.budget,
            organizerParticipating: event.organizer_participating,
            participants: participants.map(p => ({
                id: p.id,
                name: p.name,
                claimed: p.claimed,
                claimedAt: p.claimed_at,
                isActive: p.is_active
            })),
            canViewPairings: !event.organizer_participating
        });

    } catch (error) {
        console.error('Error fetching admin event:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
