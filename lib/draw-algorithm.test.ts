import { generatePairings } from './draw-algorithm';
import { Exclusion } from './types';

describe('generatePairings', () => {
    const participants = [
        { id: '1', name: 'Alice', event_id: 'e1', claimed: false, claimed_at: null, draws_participant_id: null, is_active: true, created_at: '' },
        { id: '2', name: 'Bob', event_id: 'e1', claimed: false, claimed_at: null, draws_participant_id: null, is_active: true, created_at: '' },
        { id: '3', name: 'Carol', event_id: 'e1', claimed: false, claimed_at: null, draws_participant_id: null, is_active: true, created_at: '' },
    ];

    it('should generate valid pairings for 3 participants', () => {
        const pairings = generatePairings(participants, []);
        expect(pairings).not.toBeNull();
        expect(pairings!.size).toBe(3);

        // Check constraints
        const givers = new Set<string>();
        const receivers = new Set<string>();

        pairings!.forEach((receiverId, giverId) => {
            expect(giverId).not.toBe(receiverId); // No self-draw
            givers.add(giverId);
            receivers.add(receiverId);
        });

        expect(givers.size).toBe(3);
        expect(receivers.size).toBe(3);
    });

    it('should respect exclusions (A cannot draw B)', () => {
        const exclusions: Exclusion[] = [
            { id: 'ex1', event_id: 'e1', participant_a_name: 'Alice', participant_b_name: 'Bob', direction: 'a_to_b' }
        ];

        // Run multiple times to ensure it's not just luck
        for (let i = 0; i < 10; i++) {
            const pairings = generatePairings(participants, exclusions);
            expect(pairings).not.toBeNull();
            expect(pairings!.get('1')).not.toBe('2'); // Alice should not draw Bob
        }
    });

    it('should respect exclusions (Both directions)', () => {
        const participants4 = [
            ...participants,
            { id: '4', name: 'Dave', event_id: 'e1', claimed: false, claimed_at: null, draws_participant_id: null, is_active: true, created_at: '' }
        ];
        const exclusions: Exclusion[] = [
            { id: 'ex1', event_id: 'e1', participant_a_name: 'Alice', participant_b_name: 'Bob', direction: 'both' }
        ];

        for (let i = 0; i < 10; i++) {
            const pairings = generatePairings(participants4, exclusions);
            expect(pairings).not.toBeNull();
            expect(pairings!.get('1')).not.toBe('2'); // Alice != Bob
            expect(pairings!.get('2')).not.toBe('1'); // Bob != Alice
        }
    });

    it('should return null if no valid pairing exists', () => {
        // A->B, B->C, C->A is the only cycle for 3 people.
        // If we exclude A->B, and A->C (A can't draw anyone), it should fail.
        const exclusions: Exclusion[] = [
            { id: 'ex1', event_id: 'e1', participant_a_name: 'Alice', participant_b_name: 'Bob', direction: 'a_to_b' },
            { id: 'ex2', event_id: 'e1', participant_a_name: 'Alice', participant_b_name: 'Carol', direction: 'a_to_b' }
        ];

        const pairings = generatePairings(participants, exclusions);
        expect(pairings).toBeNull();
    });

    it('should throw error for less than 3 participants', () => {
        expect(() => generatePairings(participants.slice(0, 2), [])).toThrow();
    });
});
