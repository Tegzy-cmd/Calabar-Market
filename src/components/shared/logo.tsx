import { UtensilsCrossed } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className, href = "/" }: { className?: string, href?: string }) {
  return (
    <Link href={href} className={cn("flex items-center gap-2 text-lg font-headline font-semibold text-primary", className)}>
      <div className="bg-primary text-primary-foreground p-2 rounded-md">
        <UtensilsCrossed className="h-5 w-5" />
      </div>
      <span>Calabar Eats</span>
    </Link>
  );
}
