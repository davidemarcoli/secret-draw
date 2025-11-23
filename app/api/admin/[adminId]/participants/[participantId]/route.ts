import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ adminId: string; participantId: string }> }
) {
    const { adminId, participantId } = await params;
    const { isActive } = await req.json();

    try {
        // Verify admin access
        const { data: event, error: eventError } = await supabase
            .from('events')
            .select('id')
            .eq('admin_id', adminId)
            .single();

        if (eventError || !event) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        }

        // Update participant
        const { error: updateError } = await supabase
            .from('participants')
            .update({ is_active: isActive })
            .eq('id', participantId)
            .eq('event_id', event.id);

        if (updateError) {
            return NextResponse.json({ error: 'Failed to update participant' }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error updating participant:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
