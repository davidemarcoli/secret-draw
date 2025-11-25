import { AdminDashboard } from '@/components/admin-dashboard';

export default async function AdminPage({ params }: { params: Promise<{ adminId: string }> }) {
    const { adminId } = await params;

    return (
        <div className="p-10">
            <AdminDashboard adminId={adminId} />
        </div>
    );
}
