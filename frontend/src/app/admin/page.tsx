import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/Card";
import { getMe } from "@/app/lib/getMe";
import { getAccessibleAdminNavigation } from "@/app/lib/authorization";

export default async function AdminPage() {
    const user = await getMe();

    const navigationItems = getAccessibleAdminNavigation(user);

    if (navigationItems.length === 0) {
        notFound();
    }

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Admin</h1>
                <p className="text-sm text-zinc-600 mt-1">
                    Her finder du de administrative områder, du har adgang til.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-stretch">
                {navigationItems.map((item) => (
                    <Link key={item.href} href={item.href} className="flex h-full">
                        <Card className="h-full w-full">
                            <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                            <p className="text-sm text-zinc-600">{item.description}</p>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
