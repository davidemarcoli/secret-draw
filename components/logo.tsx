import { Gift } from 'lucide-react';
import Link from 'next/link';

export function Logo() {
    return (
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
                <Gift className="h-5 w-5" />
            </div>
            <span className="font-bold text-xl tracking-tight">Secret Draw</span>
        </Link>
    );
}
