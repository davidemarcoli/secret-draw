import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Gift } from 'lucide-react';

export default function Home() {
  return (
    <div className="p-4 flex flex-col items-center justify-center min-h-[80vh] text-center space-y-8">
      <div className="space-y-4 max-w-2xl">
        <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce-slow">
          <Gift className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
          Secret Draw
        </h1>
        <p className="text-xl text-muted-foreground">
          The easiest way to organize your Secret Santa or Wichteln gift exchange.
          Free online generator - no registration, no emails, just share a link.
        </p>
      </div>

      <div className="flex gap-4">
        <Button asChild size="lg" className="text-lg px-8 py-6 h-auto">
          <Link href="/create">Create Event</Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="text-lg px-8 py-6 h-auto">
          <Link href="/events">View Existing Events</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-12 max-w-4xl text-left">
        <div className="space-y-2">
          <h3 className="font-bold text-lg">1. Create Event</h3>
          <p className="text-muted-foreground">Set up your event details and add participants.</p>
        </div>
        <div className="space-y-2">
          <h3 className="font-bold text-lg">2. Share Link</h3>
          <p className="text-muted-foreground">Send the unique link to your group chat.</p>
        </div>
        <div className="space-y-2">
          <h3 className="font-bold text-lg">3. Reveal</h3>
          <p className="text-muted-foreground">Everyone picks their name to see who they got!</p>
        </div>
      </div>
    </div>
  );
}
