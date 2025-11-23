# Secret Draw - Technical Specification

## Overview

Secret Draw is a web application for organizing Secret Santa-style gift exchanges. An organizer creates an event with a list of participants, shares a link, and participants claim their name to reveal who they need to buy a gift for.

**Key Principle:** Pairings are pre-calculated when the event is created. When participants "claim" their name, they are revealing their pre-assigned match — not drawing randomly. This prevents the "last person draws themselves" problem.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14+ (App Router) |
| Database | Supabase (PostgreSQL) |
| Styling | Tailwind CSS + shadcn/ui |
| Deployment | Vercel (app) + Supabase (database) |
| Language | TypeScript |

---

## Database Schema

### Tables

#### `events`
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Primary key |
| `public_id` | UUID | Participant-facing link ID |
| `admin_id` | UUID | Admin-facing link ID |
| `name` | VARCHAR(255) | Event name |
| `description` | TEXT | Event description (optional) |
| `date` | DATE | Event date (optional) |
| `place` | VARCHAR(255) | Event location (optional) |
| `budget` | VARCHAR(100) | Budget suggestion (optional, e.g., "€20-30") |
| `organizer_participating` | BOOLEAN | Whether organizer is also a participant |
| `organizer_participant_id` | UUID (FK) | References participant if organizer is participating |
| `created_at` | TIMESTAMP | Creation timestamp |
| `status` | ENUM | 'active', 'completed' |

#### `participants`
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Primary key |
| `event_id` | UUID (FK) | References events.id |
| `name` | VARCHAR(255) | Participant display name |
| `claimed` | BOOLEAN | Whether participant has claimed their spot |
| `claimed_at` | TIMESTAMP | When they claimed (nullable) |
| `draws_participant_id` | UUID (FK) | Who this participant draws (references participants.id) |
| `is_active` | BOOLEAN | Whether participant is still active (default: true) |
| `created_at` | TIMESTAMP | Creation timestamp |

#### `exclusions`
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Primary key |
| `event_id` | UUID (FK) | References events.id |
| `participant_a_name` | VARCHAR(255) | First person in exclusion pair |
| `participant_b_name` | VARCHAR(255) | Second person in exclusion pair |
| `direction` | ENUM | 'a_to_b' (A cannot draw B) or 'both' |

*Note: Exclusions use names rather than participant IDs so they can be set before participants are finalized and imported across events.*

#### `exclusion_imports`
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Primary key |
| `target_event_id` | UUID (FK) | Event receiving exclusions |
| `source_event_id` | UUID (FK) | Event providing exclusions |
| `imported_at` | TIMESTAMP | When import occurred |

---

## User Flows

### Flow 1: Organizer Creates Event

1. Organizer visits homepage → clicks "Create Event"
2. Fills in event details:
   - Event name (required)
   - Description (optional)
   - Date (optional)
   - Place (optional)
   - Budget suggestion (optional)
3. Adds participant names (minimum 3)
4. Optionally marks themselves as participating (selects which name is theirs)
5. Optionally adds exclusions:
   - Manual: Select two names → "A cannot draw B"
   - Import: Select a past event → imports all pairings as exclusions
6. Clicks "Create Event"
7. System validates and generates pairings using algorithm
8. If valid: Shows success page with two links:
   - **Participant link:** `secret-draw.com/event/{public_id}`
   - **Admin link:** `secret-draw.com/admin/{admin_id}`
9. If invalid (no valid pairing possible due to exclusions): Shows error, asks to adjust exclusions

### Flow 2: Participant Claims & Reveals

1. Participant receives link from organizer
2. Opens `secret-draw.com/event/{public_id}`
3. Sees event info (name, description, date, place, budget)
4. Sees list of participant names with status:
   - ✓ Claimed (grayed out)
   - Available (clickable)
5. Clicks their own name
6. Confirmation modal: "Are you {name}? This cannot be undone."
7. Confirms → Reveal screen with confetti animation:
   - "You're buying a gift for: **{drawn_name}**"
   - Shows event details (date, place, budget)
8. Can return anytime to `secret-draw.com/event/{public_id}` and click their name to see their draw again (no re-confirmation needed once claimed)

### Flow 3: Organizer Views Admin Dashboard

1. Organizer opens `secret-draw.com/admin/{admin_id}`
2. Sees event details
3. Sees participant list with claim status:
   - Name | Status | Claimed At
   - Alice | ✓ Claimed | Dec 1, 2024
   - Bob | Pending | -
   - Carol | ✓ Claimed | Dec 2, 2024
4. **If organizer is NOT participating:** Can optionally reveal all pairings
5. **If organizer IS participating:** Cannot see any pairings (to keep it fair)
6. Can mark participants as inactive (for drop-outs)
7. Can copy participant link to share again
8. Can mark event as "completed" when done

### Flow 4: Import Exclusions from Past Event

1. During event creation, organizer clicks "Import from past event"
2. Enters admin link of a past event they organized
3. System fetches all pairings from that event:
   - Alice → Bob becomes exclusion "Alice cannot draw Bob"
   - Carol → Dave becomes exclusion "Carol cannot draw Dave"
   - etc.
4. Exclusions appear in list, organizer can edit/remove before creating event
5. Organizer can also manually add additional exclusions

---

## Pages & Routes

### Public Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Landing page with "Create Event" CTA |
| `/create` | Create Event | Multi-step event creation form |
| `/event/[publicId]` | Participant View | Claim name & reveal draw |
| `/event/[publicId]/reveal/[participantId]` | Reveal Page | Shows who participant drew (after claiming) |

### Admin Routes

| Route | Page | Description |
|-------|------|-------------|
| `/admin/[adminId]` | Admin Dashboard | View event status, participant claims |

---

## Component Breakdown

### Layout Components
- `Header` - Logo, minimal navigation
- `Footer` - Links, credits
- `Container` - Max-width wrapper

### Page Components
- `HomePage` - Hero, feature highlights, CTA
- `CreateEventForm` - Multi-step form with validation
- `ParticipantListManager` - Add/remove/reorder participants
- `ExclusionManager` - Add manual exclusions, import from past event
- `EventView` - Participant-facing event page
- `ClaimConfirmModal` - "Are you {name}?" confirmation
- `RevealCard` - Animated reveal of drawn name (with confetti)
- `AdminDashboard` - Event overview, participant status table
- `ParticipantStatusTable` - List with claim status

### UI Components (shadcn/ui)
- `Button`
- `Input`
- `Card`
- `Dialog` (for modals)
- `Badge` (for status indicators)
- `Table`
- `Toast` (for notifications)

### Utility Components
- `Confetti` - Celebration animation on reveal
- `CopyButton` - Copy link to clipboard
- `LoadingSpinner`

---

## Draw Algorithm

The algorithm must generate valid pairings where:
1. No one draws themselves
2. All exclusion rules are respected
3. Everyone draws exactly one person
4. Everyone is drawn by exactly one person

### Implementation Approach

```
function generatePairings(participants, exclusions):
    // Build adjacency list of valid draws
    validDraws = {}
    for each participant A:
        validDraws[A] = participants.filter(B => 
            B != A && 
            !exclusions.has(A, B)
        )
    
    // Use backtracking algorithm to find valid assignment
    // This is essentially finding a valid permutation/derangement
    // with additional constraints
    
    assignment = {}
    drawnBy = new Set()
    
    function backtrack(index):
        if index == participants.length:
            return true  // Valid complete assignment
        
        currentPerson = participants[index]
        candidates = validDraws[currentPerson].filter(c => !drawnBy.has(c))
        shuffle(candidates)  // Randomize for variety
        
        for each candidate in candidates:
            assignment[currentPerson] = candidate
            drawnBy.add(candidate)
            
            if backtrack(index + 1):
                return true
            
            // Backtrack
            delete assignment[currentPerson]
            drawnBy.delete(candidate)
        
        return false  // No valid assignment from this state
    
    if backtrack(0):
        return assignment
    else:
        throw Error("No valid pairing possible with current exclusions")
```

### Edge Cases
- **Too many exclusions:** Algorithm fails, show clear error message
- **Minimum participants:** Require at least 3 participants
- **Validation before creation:** Run algorithm before saving to ensure it's possible

---

## API Endpoints

### Events

#### `POST /api/events`
Create new event with participants and exclusions.

**Request:**
```json
{
  "name": "Christmas 2024",
  "description": "Family gift exchange",
  "date": "2024-12-25",
  "place": "Grandma's house",
  "budget": "€20-30",
  "participants": ["Alice", "Bob", "Carol", "Dave"],
  "organizerParticipating": true,
  "organizerName": "Alice",
  "exclusions": [
    { "from": "Alice", "to": "Bob" },
    { "from": "Carol", "to": "Dave" }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "publicId": "uuid-for-participants",
  "adminId": "uuid-for-admin"
}
```

#### `GET /api/events/[publicId]`
Get event details for participant view.

**Response:**
```json
{
  "name": "Christmas 2024",
  "description": "Family gift exchange",
  "date": "2024-12-25",
  "place": "Grandma's house",
  "budget": "€20-30",
  "participants": [
    { "id": "uuid", "name": "Alice", "claimed": true },
    { "id": "uuid", "name": "Bob", "claimed": false }
  ]
}
```

#### `GET /api/admin/[adminId]`
Get full event details for admin view.

**Response:**
```json
{
  "name": "Christmas 2024",
  "description": "...",
  "date": "2024-12-25",
  "place": "Grandma's house",
  "budget": "€20-30",
  "organizerParticipating": true,
  "participants": [
    { "id": "uuid", "name": "Alice", "claimed": true, "claimedAt": "2024-12-01T10:00:00Z", "isActive": true },
    { "id": "uuid", "name": "Bob", "claimed": false, "claimedAt": null, "isActive": true }
  ],
  "canViewPairings": false
}
```

### Participants

#### `POST /api/events/[publicId]/claim`
Claim a participant spot.

**Request:**
```json
{
  "participantId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "draws": {
    "id": "uuid",
    "name": "Bob"
  }
}
```

#### `GET /api/events/[publicId]/participants/[participantId]/draw`
Get draw for already-claimed participant.

**Response:**
```json
{
  "claimed": true,
  "draws": {
    "id": "uuid",
    "name": "Bob"
  }
}
```

### Admin Actions

#### `PATCH /api/admin/[adminId]/participants/[participantId]`
Update participant (e.g., mark inactive).

**Request:**
```json
{
  "isActive": false
}
```

#### `GET /api/admin/[adminId]/pairings`
Get all pairings (only if organizer is not participating).

**Response:**
```json
{
  "allowed": true,
  "pairings": [
    { "from": "Alice", "to": "Bob" },
    { "from": "Bob", "to": "Carol" }
  ]
}
```
or
```json
{
  "allowed": false,
  "reason": "Organizer is participating"
}
```

### Import

#### `POST /api/events/import-exclusions`
Import exclusions from past event.

**Request:**
```json
{
  "adminId": "past-event-admin-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "exclusions": [
    { "from": "Alice", "to": "Bob" },
    { "from": "Carol", "to": "Dave" }
  ]
}
```

---

## Edge Cases & Error Handling

| Scenario | Handling |
|----------|----------|
| Invalid pairing due to exclusions | Show error during creation, suggest removing exclusions |
| Participant drops out after draws | Mark as inactive; whoever drew them sees "(inactive)" note |
| Same name entered twice | Prevent during creation with validation |
| Organizer loses admin link | No recovery (by design for simplicity); must create new event |
| Participant claims wrong name | Cannot be undone; must create new event |
| Very large groups (50+) | Algorithm should handle; may add loading state |
| Browser back button after claim | Show reveal page again (idempotent) |
| Participant visits before event created | 404 page |
| Mobile link sharing | Ensure URLs are not too long; use short UUIDs if needed |

---

## Security Considerations

1. **UUIDs are unguessable:** Use crypto-random UUIDs for both public and admin links
2. **No authentication required:** Simplicity over security (appropriate for casual use)
3. **Admin link = full access:** Organizer must keep it private
4. **Participant claims are irreversible:** Prevents gaming the system
5. **Rate limiting:** Implement on claim endpoint to prevent brute-force name guessing
6. **No PII stored:** Only display names, no emails or sensitive data

---

## UI/UX Notes

### Mobile-First Design
- Large tap targets (minimum 44px)
- Single-column layouts
- Bottom-sheet modals on mobile
- Swipe-friendly interactions

### Visual Design
- Clean, minimal aesthetic (shadcn defaults)
- Festive but not overwhelming
- Confetti animation on reveal (subtle, short duration ~2 seconds)
- Clear visual hierarchy
- High contrast for accessibility

### Micro-interactions
- Button hover/active states
- Loading states for all async actions
- Success/error toasts
- Smooth page transitions

### Copy & Tone
- Friendly, casual language
- Clear calls-to-action
- Helpful error messages (not technical jargon)

---

## Future Enhancements (Out of Scope for V1)

- Email notifications
- Wishlist feature
- Multiple draw rounds
- Password-protected events
- Custom themes/branding
- Event reminders
- Budget tracking
- Anonymous chat between draw pairs
- Export participant list
- Event templates

---

## File Structure

```
secret-draw/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    # Home
│   ├── create/
│   │   └── page.tsx                # Create event
│   ├── event/
│   │   └── [publicId]/
│   │       ├── page.tsx            # Participant view
│   │       └── reveal/
│   │           └── [participantId]/
│   │               └── page.tsx    # Reveal page
│   ├── admin/
│   │   └── [adminId]/
│   │       └── page.tsx            # Admin dashboard
│   └── api/
│       ├── events/
│       │   ├── route.ts            # POST create event
│       │   ├── [publicId]/
│       │   │   ├── route.ts        # GET event details
│       │   │   └── claim/
│       │   │       └── route.ts    # POST claim
│       │   └── import-exclusions/
│       │       └── route.ts        # POST import
│       └── admin/
│           └── [adminId]/
│               ├── route.ts        # GET admin view
│               ├── pairings/
│               │   └── route.ts    # GET pairings
│               └── participants/
│                   └── [participantId]/
│                       └── route.ts # PATCH participant
├── components/
│   ├── ui/                         # shadcn components
│   ├── create-event-form.tsx
│   ├── participant-list-manager.tsx
│   ├── exclusion-manager.tsx
│   ├── claim-confirm-modal.tsx
│   ├── reveal-card.tsx
│   ├── confetti.tsx
│   ├── participant-status-table.tsx
│   └── copy-button.tsx
├── lib/
│   ├── supabase.ts                 # Supabase client
│   ├── draw-algorithm.ts           # Pairing algorithm
│   ├── utils.ts                    # Utility functions
│   └── types.ts                    # TypeScript types
├── public/
│   └── ...
├── .env.local                      # Environment variables
└── ...config files
```

---

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=https://secret-draw.com
```

---

## Getting Started (For Agent)

1. Set up Supabase project and create tables per schema above
2. Install dependencies: `bun install @supabase/supabase-js`
3. Add shadcn/ui: `bunx shadcn-ui@latest init`
4. Add required shadcn components: `bunx shadcn-ui@latest add button input card dialog badge table toast`
5. Implement draw algorithm in `lib/draw-algorithm.ts`
6. Build API routes
7. Build pages following the user flows
8. Add confetti library: `bun install canvas-confetti`
9. Test edge cases
10. Deploy to Vercel

---

## Success Criteria

- [ ] Organizer can create event with participants and exclusions
- [ ] System generates valid pairings
- [ ] Participants can claim and see their draw
- [ ] Admin can view claim status
- [ ] Admin cannot see pairings if participating
- [ ] Exclusion import works from past events
- [ ] Mobile-friendly responsive design
- [ ] Confetti animation on reveal
- [ ] All error states handled gracefully