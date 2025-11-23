export type EventStatus = 'active' | 'completed';
export type ExclusionDirection = 'a_to_b' | 'both';

export interface Event {
  id: string;
  public_id: string;
  admin_id: string;
  name: string;
  description: string | null;
  date: string | null;
  place: string | null;
  budget: string | null;
  organizer_participating: boolean;
  organizer_participant_id: string | null;
  created_at: string;
  status: EventStatus;
}

export interface Participant {
  id: string;
  event_id: string;
  name: string;
  claimed: boolean;
  claimed_at: string | null;
  draws_participant_id: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Exclusion {
  id: string;
  event_id: string;
  participant_a_name: string;
  participant_b_name: string;
  direction: ExclusionDirection;
}

export interface ExclusionImport {
  id: string;
  target_event_id: string;
  source_event_id: string;
  imported_at: string;
}

// API Responses
export interface CreateEventResponse {
  success: boolean;
  publicId: string;
  adminId: string;
}

export interface PublicEventResponse {
  name: string;
  description: string | null;
  date: string | null;
  place: string | null;
  budget: string | null;
  participants: {
    id: string;
    name: string;
    claimed: boolean;
  }[];
}

export interface AdminEventResponse {
  name: string;
  description: string | null;
  date: string | null;
  place: string | null;
  budget: string | null;
  organizerParticipating: boolean;
  participants: {
    id: string;
    name: string;
    claimed: boolean;
    claimedAt: string | null;
    isActive: boolean;
  }[];
  canViewPairings: boolean;
}

export interface ClaimResponse {
  success: boolean;
  draws: {
    id: string;
    name: string;
  };
}

export interface DrawResponse {
  claimed: boolean;
  draws: {
    id: string;
    name: string;
  };
}

export interface PairingsResponse {
  allowed: boolean;
  pairings?: {
    from: string;
    to: string;
  }[];
  reason?: string;
}
