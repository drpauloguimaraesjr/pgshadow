import { Skeleton } from "@/components/ui/skeleton";

export function DashboardLayoutSkeleton() {
    return (
        <div className="flex h-screen w-full">
            <div className="w-64 border-r p-4 space-y-4">
                <Skeleton className="h-8 w-full" />
                <div className="space-y-2">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                </div>
            </div>
            <div className="flex-1 p-8 space-y-4">
                <Skeleton className="h-12 w-1/3" />
                <div className="grid grid-cols-3 gap-4">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                </div>
            </div>
        </div>
    );
}
