'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Plus } from 'lucide-react';

interface ParticipantListManagerProps {
    participants: string[];
    onChange: (participants: string[]) => void;
    error?: string;
}

export function ParticipantListManager({ participants, onChange, error }: ParticipantListManagerProps) {
    const [newName, setNewName] = useState('');

    const addParticipant = () => {
        const trimmed = newName.trim();
        if (!trimmed) return;
        if (participants.includes(trimmed)) {
            // Could show error here
            return;
        }
        onChange([...participants, trimmed]);
        setNewName('');
    };

    const removeParticipant = (index: number) => {
        const newParticipants = [...participants];
        newParticipants.splice(index, 1);
        onChange(newParticipants);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addParticipant();
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                <Input
                    placeholder="Enter name (e.g. Alice)"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <Button type="button" onClick={addParticipant} size="icon">
                    <Plus className="h-4 w-4" />
                </Button>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="space-y-2">
                {participants.map((name, index) => (
                    <div key={`${name}-${index}`} className="flex items-center justify-between p-3 bg-secondary/50 rounded-md">
                        <span className="font-medium">{name}</span>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => removeParticipant(index)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
                {participants.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                        No participants added yet.
                    </p>
                )}
            </div>
        </div>
    );
}
