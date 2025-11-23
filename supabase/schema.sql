-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Events Table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  public_id UUID DEFAULT uuid_generate_v4(),
  admin_id UUID DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  date DATE,
  place VARCHAR(255),
  budget VARCHAR(100),
  organizer_participating BOOLEAN DEFAULT false,
  organizer_participant_id UUID, -- FK added after participants table
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed'))
);

-- Participants Table
CREATE TABLE participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  claimed BOOLEAN DEFAULT false,
  claimed_at TIMESTAMP WITH TIME ZONE,
  draws_participant_id UUID REFERENCES participants(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add FK for organizer_participant_id to events
ALTER TABLE events 
ADD CONSTRAINT fk_organizer_participant 
FOREIGN KEY (organizer_participant_id) 
REFERENCES participants(id);

-- Exclusions Table
CREATE TABLE exclusions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  participant_a_name VARCHAR(255) NOT NULL,
  participant_b_name VARCHAR(255) NOT NULL,
  direction VARCHAR(50) DEFAULT 'a_to_b' CHECK (direction IN ('a_to_b', 'both'))
);

-- Exclusion Imports Table
CREATE TABLE exclusion_imports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  target_event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  source_event_id UUID REFERENCES events(id),
  imported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_events_public_id ON events(public_id);
CREATE INDEX idx_events_admin_id ON events(admin_id);
CREATE INDEX idx_participants_event_id ON participants(event_id);
CREATE INDEX idx_exclusions_event_id ON exclusions(event_id);
