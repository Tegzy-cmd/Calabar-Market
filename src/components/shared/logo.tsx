import { UtensilsCrossed } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className, href = "/" }: { className?: string, href?: string }) {
  return (
    <Link href={href} className={cn("flex items-center gap-3 text-xl font-headline font-bold text-primary", className)}>
      <div className="bg-primary text-primary-foreground p-2 rounded-lg transform -rotate-6 shadow-md">
        <UtensilsCrossed className="h-6 w-6" />
      </div>
      <span>Calabar Eats</span>
    </Link>
  );
}
