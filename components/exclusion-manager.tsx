'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus, Import } from 'lucide-react';
import { toast } from 'sonner';

interface Exclusion {
    from: string;
    to: string;
}

interface ExclusionManagerProps {
    participants: string[];
    exclusions: Exclusion[];
    onChange: (exclusions: Exclusion[]) => void;
}

export function ExclusionManager({ participants, exclusions, onChange }: ExclusionManagerProps) {
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [importId, setImportId] = useState('');
    const [isImporting, setIsImporting] = useState(false);

    const addExclusion = () => {
        if (!from || !to || from === to) return;

        // Check if already exists
        const exists = exclusions.some(e => e.from === from && e.to === to);
        if (exists) return;

        onChange([...exclusions, { from, to }]);
        setFrom('');
        setTo('');
    };

    const removeExclusion = (index: number) => {
        const newExclusions = [...exclusions];
        newExclusions.splice(index, 1);
        onChange(newExclusions);
    };

    const handleImport = async () => {
        if (!importId) return;
        setIsImporting(true);
        try {
            const res = await fetch('/api/events/import-exclusions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adminId: importId }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Import failed');

            // Filter exclusions to only include current participants
            const validExclusions = data.exclusions.filter((ex: Exclusion) =>
                participants.includes(ex.from) && participants.includes(ex.to)
            );

            // Merge with existing
            const merged = [...exclusions];
            validExclusions.forEach((ex: Exclusion) => {
                if (!merged.some(e => e.from === ex.from && e.to === ex.to)) {
                    merged.push(ex);
                }
            });

            onChange(merged);
            toast.success(`Imported ${validExclusions.length} valid exclusions`);
            setImportId('');
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <h3 className="text-sm font-medium">Add New Exclusion</h3>
                <div className="flex flex-col sm:flex-row gap-2 items-end">
                    <div className="w-full">
                        <label className="text-xs text-muted-foreground">Who...</label>
                        <Select value={from} onValueChange={setFrom}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select person" />
                            </SelectTrigger>
                            <SelectContent>
                                {participants.map(p => (
                                    <SelectItem key={`from-${p}`} value={p}>{p}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="pb-2 text-sm text-muted-foreground">cannot draw</div>
                    <div className="w-full">
                        <label className="text-xs text-muted-foreground">Whom...</label>
                        <Select value={to} onValueChange={setTo}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select person" />
                            </SelectTrigger>
                            <SelectContent>
                                {participants.map(p => (
                                    <SelectItem key={`to-${p}`} value={p}>{p}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button type="button" onClick={addExclusion} disabled={!from || !to || from === to}>
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="space-y-2">
                {exclusions.map((ex, index) => (
                    <div key={`${ex.from}-${ex.to}-${index}`} className="flex items-center justify-between p-3 bg-secondary/50 rounded-md text-sm">
                        <span>
                            <span className="font-medium">{ex.from}</span> cannot draw <span className="font-medium">{ex.to}</span>
                        </span>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => removeExclusion(index)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
                {exclusions.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-2">
                        No exclusions added.
                    </p>
                )}
            </div>

            <div className="pt-4 border-t">
                <h3 className="text-sm font-medium mb-2">Import from Past Event</h3>
                <div className="flex gap-2">
                    <input
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Paste Admin Link ID (UUID)"
                        value={importId}
                        onChange={(e) => setImportId(e.target.value)}
                    />
                    <Button type="button" variant="outline" onClick={handleImport} disabled={isImporting || !importId}>
                        {isImporting ? 'Importing...' : <><Import className="h-4 w-4 mr-2" /> Import</>}
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                    Enter the Admin ID from a previous event to import pairings as exclusions.
                </p>
            </div>
        </div>
    );
}
