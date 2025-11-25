import { RevealCard } from '@/components/reveal-card';

export default async function RevealPage({
    params
}: {
    params: Promise<{ publicId: string; participantId: string }>
}) {
    const { publicId, participantId } = await params;

    return (
        <div className="p-10 min-h-[80vh] flex flex-col justify-center">
            <RevealCard publicId={publicId} participantId={participantId} />
        </div>
    );
}
