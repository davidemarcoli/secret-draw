import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ publicId: string }> }
) {
    const { publicId } = await params;

    try {
        const { data: event, error: eventError } = await supabase
            .from('events')
            .select('*')
            .eq('public_id', publicId)
            .single();

        if (eventError || !event) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        }

        const { data: participants, error: partError } = await supabase
            .from('participants')
            .select('id, name, claimed')
            .eq('event_id', event.id)
            .eq('is_active', true);

        if (partError) {
            return NextResponse.json({ error: 'Failed to fetch participants' }, { status: 500 });
        }

        return NextResponse.json({
            name: event.name,
            description: event.description,
            date: event.date,
            place: event.place,
            budget: event.budget,
            participants
        });

    } catch (error) {
        console.error('Error fetching event:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
