

import { getUsers } from "@/lib/data";
import type { User } from "@/lib/types";
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
import { UserActions } from "./_components/user-actions";

export default async function AdminUsersPage() {
  const allUsers = await getUsers();
  const users = allUsers.filter(user => user.role === 'user');

  return (
    <div className="space-y-8">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-headline font-bold">App Users</h1>
                <p className="text-muted-foreground">Manage all customers in the system.</p>
            </div>
            <UserActions />
        </div>
      
        <Card>
            <CardHeader>
                <CardTitle>All Users ({users.length})</CardTitle>
                <CardDescription>A list of all users with the 'user' role.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>
                            <span className="sr-only">Actions</span>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user: User) => (
                    <TableRow key={user.id}>
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                                    <AvatarFallback>{user.name ? user.name[0] : 'U'}</AvatarFallback>
                                </Avatar>
                                <div className="font-medium">
                                    <p>{user.name}</p>
                                </div>
                            </div>
                        </TableCell>
                        <TableCell>
                           {user.email}
                        </TableCell>
                        <TableCell>
                            <div className="flex justify-end">
                                <UserActions user={user} />
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
