import { Exclusion } from './types';

interface Participant {
    id: string;
    name: string;
}

/**
 * Generates pairings for a Secret Santa draw.
 * 
 * Constraints:
 * 1. No one draws themselves.
 * 2. Exclusions are respected.
 * 3. Everyone draws exactly one person.
 * 4. Everyone is drawn by exactly one person.
 * 
 * @param participants List of participants
 * @param exclusions List of exclusions
 * @returns Map of pairings (giver ID -> receiver ID) or null if no valid pairing exists
 */
export function generatePairings(
    participants: Participant[],
    exclusions: Exclusion[]
): Map<string, string> | null {
    if (participants.length < 3) {
        throw new Error('At least 3 participants are required');
    }

    // Build adjacency list of valid draws for each participant
    const validDraws = new Map<string, string[]>();

    // Helper to check if A is excluded from drawing B
    const isExcluded = (giver: Participant, receiver: Participant) => {
        return exclusions.some(ex => {
            // Check if this exclusion applies to this pair
            const isA = ex.participant_a_name === giver.name;
            const isB = ex.participant_b_name === receiver.name;
            const isRevA = ex.participant_a_name === receiver.name;
            const isRevB = ex.participant_b_name === giver.name;

            if (ex.direction === 'a_to_b') {
                return isA && isB;
            } else { // 'both'
                return (isA && isB) || (isRevA && isRevB);
            }
        });
    };

    for (const giver of participants) {
        const validReceivers = participants.filter(receiver => {
            if (giver.id === receiver.id) return false; // Cannot draw self
            if (isExcluded(giver, receiver)) return false; // Excluded
            return true;
        }).map(p => p.id);

        // Optimization: Sort by fewest options first (heuristic)
        // But for randomization, we should shuffle. 
        // We'll shuffle in the backtracking step.
        validDraws.set(giver.id, validReceivers);
    }

    // Backtracking algorithm
    const assignment = new Map<string, string>();
    const drawnBy = new Set<string>();

    function backtrack(index: number): boolean {
        if (index === participants.length) {
            return true; // Valid complete assignment
        }

        const currentGiver = participants[index];
        const candidates = validDraws.get(currentGiver.id) || [];

        // Filter out already drawn candidates
        const availableCandidates = candidates.filter(c => !drawnBy.has(c));

        // Shuffle candidates to ensure randomness
        shuffleArray(availableCandidates);

        for (const candidateId of availableCandidates) {
            assignment.set(currentGiver.id, candidateId);
            drawnBy.add(candidateId);

            if (backtrack(index + 1)) {
                return true;
            }

            // Backtrack
            assignment.delete(currentGiver.id);
            drawnBy.delete(candidateId);
        }

        return false;
    }

    if (backtrack(0)) {
        return assignment;
    } else {
        return null; // No valid assignment found
    }
}

// Fisher-Yates shuffle
function shuffleArray<T>(array: T[]) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
