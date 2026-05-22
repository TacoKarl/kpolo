"use client";
import { useRouter } from "next/navigation";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";

export default function AdminPage() {
    const router = useRouter();

    return (
        <div className="p-6">
            <h1 className="text-2xl font-semibold mb-4">Admin</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <h3 className="text-lg font-semibold mb-2">Klubber</h3>
                    <p className="text-sm text-zinc-600 mb-3">Administrer klubber: opret, rediger, inaktiver eller genopret klubber.</p>
                    <Button onClick={() => router.push('/admin/clubs')} variant={'primary'}>Gå til Klubber</Button>
                </Card>

                <Card>
                    <h3 className="text-lg font-semibold mb-2">Hold</h3>
                    <p className="text-sm text-zinc-600 mb-3">Administrer hold: opret hold, tildel spillere og administrer holdstatus.</p>
                    <Button onClick={() => router.push('/admin/teams')} variant={'primary'}>Gå til Hold</Button>
                </Card>

                <Card>
                    <h3 className="text-lg font-semibold mb-2">Turneringer</h3>
                    <p className="text-sm text-zinc-600 mb-3">Opret og rediger turneringer, divisioner og datoer.</p>
                    <Button onClick={() => router.push('/admin/tournaments')} variant={'primary'}>Gå til Turneringer</Button>
                </Card>
            </div>
        </div>
    );
}
