
'use client';

import { useState, useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { rateDispatcher } from '@/lib/actions';

interface DispatcherRatingProps {
  orderId: string;
  dispatcherId: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function DispatcherRating({ orderId, dispatcherId, isOpen, onOpenChange }: DispatcherRatingProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleSubmit = () => {
    if (rating === 0) {
      toast({
        title: 'Please select a rating',
        description: 'You need to select at least one star.',
        variant: 'destructive',
      });
      return;
    }

    startTransition(async () => {
      const result = await rateDispatcher(orderId, dispatcherId, rating);
      if (result.success) {
        toast({
          title: 'Rating Submitted!',
          description: 'Thank you for your feedback.',
        });
        onOpenChange(false);
      } else {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rate Your Dispatcher</DialogTitle>
          <DialogDescription>
            Your feedback helps us improve our service. Please rate your experience with the dispatcher.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center items-center gap-2 py-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={cn(
                'w-10 h-10 cursor-pointer transition-colors',
                (hoverRating >= star || rating >= star)
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300'
              )}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
            />
          ))}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isPending}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isPending || rating === 0}>
            {isPending ? 'Submitting...' : 'Submit Rating'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
