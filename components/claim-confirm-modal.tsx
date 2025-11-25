'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface Participant {
    id: string;
    name: string;
    claimed: boolean;
}

interface ClaimConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    participant: Participant | null;
    publicId: string;
}

export function ClaimConfirmModal({ isOpen, onClose, participant, publicId }: ClaimConfirmModalProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    if (!participant) return null;

    const handleClaim = async () => {
        if (participant.claimed) {
            router.push(`/event/${publicId}/reveal/${participant.id}`);
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`/api/events/${publicId}/claim`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ participantId: participant.id }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to claim');
            }

            router.push(`/event/${publicId}/reveal/${participant.id}`);

        } catch (error: any) {
            toast.error(error.message);
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Are you {participant.name}?</DialogTitle>
                    <DialogDescription>
                        {participant.claimed
                            ? "You have already claimed this spot. View your draw again?"
                            : "Once you claim this name, it cannot be undone. Please ensure you are selecting your own name."}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
                    <Button onClick={handleClaim} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {participant.claimed ? "View Draw" : "Yes, that's me"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
