
import { getRiders } from "@/lib/data";
import type { Rider } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { RiderActions } from "./_components/rider-actions";
import { cn } from "@/lib/utils";

const getStatusColor = (status: Rider['status']) => {
    switch (status) {
        case 'available':
            return 'bg-green-500 hover:bg-green-600';
        case 'on-delivery':
            return 'bg-orange-500 hover:bg-orange-600';
        case 'unavailable':
            return 'bg-gray-500 hover:bg-gray-600';
        default:
            return '';
    }
}

export default async function AdminRidersPage() {
  const riders = await getRiders();

  return (
    <div className="space-y-8">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-headline font-bold">Delivery Riders</h1>
                <p className="text-muted-foreground">Manage all delivery riders in the system.</p>
            </div>
            <RiderActions />
        </div>
      
        <Card>
            <CardHeader>
                <CardTitle>All Riders ({riders.length})</CardTitle>
                <CardDescription>A list of all registered delivery riders.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Rider</TableHead>
                        <TableHead>Vehicle</TableHead>
                        <TableHead>Current Location</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>
                            <span className="sr-only">Actions</span>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {riders.map((rider: Rider) => (
                    <TableRow key={rider.id}>
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src={rider.avatarUrl} alt={rider.name} />
                                    <AvatarFallback>{rider.name ? rider.name[0] : 'R'}</AvatarFallback>
                                </Avatar>
                                <div className="font-medium">
                                    <p>{rider.name}</p>
                                </div>
                            </div>
                        </TableCell>
                        <TableCell>
                           {rider.vehicle}
                        </TableCell>
                        <TableCell>
                           {rider.location}
                        </TableCell>
                        <TableCell>
                            <Badge className={cn("capitalize text-white", getStatusColor(rider.status))}>
                                {rider.status.replace('-', ' ')}
                            </Badge>
                        </TableCell>
                        <TableCell>
                            <div className="flex justify-end">
                                <RiderActions rider={rider} />
                            </div>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  );
}
