'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, Loader } from 'lucide-react';
import { seedDatabase } from '@/lib/actions';

export default function SeedPage() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null);

  const handleSeed = () => {
    startTransition(async () => {
      const res = await seedDatabase();
      setResult(res);
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Seed Database</CardTitle>
          <CardDescription>
            Click the button below to populate your Firestore database with the initial mock data.
            This will create collections for vendors, products, users, riders, and orders.
            You should only need to do this once.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-6">
            <Button onClick={handleSeed} disabled={isPending} size="lg">
              {isPending ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Seeding...
                </>
              ) : (
                'Seed Database'
              )}
            </Button>
            {result && (
              <Alert variant={result.success ? 'default' : 'destructive'} className={result.success ? 'bg-green-50 border-green-200' : ''}>
                {result.success ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                <AlertTitle>{result.success ? 'Success!' : 'Error'}</AlertTitle>
                <AlertDescription>
                  {result.message || result.error}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
