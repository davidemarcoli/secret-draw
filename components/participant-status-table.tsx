'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useState } from 'react';

interface Participant {
    id: string;
    name: string;
    claimed: boolean;
    claimedAt: string | null;
    isActive: boolean;
}

interface ParticipantStatusTableProps {
    participants: Participant[];
    adminId: string;
    onUpdate: () => void;
}

export function ParticipantStatusTable({ participants, adminId, onUpdate }: ParticipantStatusTableProps) {
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const toggleActive = async (id: string, currentStatus: boolean) => {
        setLoadingId(id);
        try {
            const res = await fetch(`/api/admin/${adminId}/participants/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !currentStatus }),
            });

            if (!res.ok) throw new Error('Failed to update status');

            onUpdate();
            toast.success('Participant updated');
        } catch (error) {
            toast.error('Failed to update participant');
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <div className="border rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Claimed At</TableHead>
                        <TableHead className="text-right">Active</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {participants.map((p) => (
                        <TableRow key={p.id} className={!p.isActive ? 'opacity-50 bg-muted/50' : ''}>
                            <TableCell className="font-medium">{p.name}</TableCell>
                            <TableCell>
                                {p.claimed ? (
                                    <Badge variant="default" className="bg-green-600 hover:bg-green-700">Claimed</Badge>
                                ) : (
                                    <Badge variant="secondary">Pending</Badge>
                                )}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                                {p.claimedAt ? new Date(p.claimedAt).toLocaleString() : '-'}
                            </TableCell>
                            <TableCell className="text-right">
                                <Switch
                                    checked={p.isActive}
                                    onCheckedChange={() => toggleActive(p.id, p.isActive)}
                                    disabled={loadingId === p.id}
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
