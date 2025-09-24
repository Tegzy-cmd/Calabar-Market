
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { ArrowLeft } from "lucide-react";
import { auth } from '@/lib/firebase';
import { GoogleAuthProvider, createUserWithEmailAndPassword, signInWithPopup, updateProfile } from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/use-auth';

export default function SignupPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { syncUser } = useAuth();
  const redirectUrl = searchParams.get('redirect') || '/browse';

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const name = `${firstName} ${lastName}`.trim();
      await updateProfile(userCredential.user, { displayName: name });
      
      // We need to pass the updated user object to syncUser
      await syncUser({ ...userCredential.user, displayName: name });

      toast({
        title: "Account created!",
        description: "You have successfully signed up.",
      });
      router.push(redirectUrl);
    } catch (error: any) {
      console.error("Error during email sign-up:", error);
      toast({
        title: "Sign-up Failed",
        description: error.message || "There was a problem with your sign-up.",
        variant: "destructive",
      });
    } finally {
        setIsPending(false);
    }
  };

  const handleGoogleSignUp = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      await syncUser(result.user);
      toast({
        title: "Account created!",
        description: "You have successfully signed up.",
      });
      router.push(redirectUrl);
    } catch (error) {
      console.error("Error during Google sign-up:", error);
      toast({
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with your sign-up.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-secondary">
       <div className="absolute top-6 left-6">
          <Button variant="ghost" asChild>
            <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-4 h-4"/>
                Back to Home
            </Link>
          </Button>
      </div>
      <Card className="w-full max-w-md mx-auto shadow-2xl shadow-primary/10 border-t-4 border-primary">
        <CardHeader className="space-y-2 text-center pt-8">
          <Logo className="justify-center"/>
          <CardTitle className="text-2xl font-headline">Create an account</CardTitle>
          <CardDescription>
            Enter your information to get started with Calabar Eats.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailSignUp} className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="first-name">First name</Label>
                <Input 
                    id="first-name" 
                    placeholder="Max" 
                    required 
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={isPending}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="last-name">Last name</Label>
                <Input 
                    id="last-name" 
                    placeholder="Robinson" 
                    required 
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={isPending}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isPending}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isPending}
                required
              />
            </div>
            <Button type="submit" className="w-full font-bold" disabled={isPending}>
              {isPending ? 'Creating account...' : 'Create an account'}
            </Button>
            </form>
             <Button variant="outline" className="w-full" onClick={handleGoogleSignUp}>
              Sign up with Google
            </Button>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="underline text-primary font-medium">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
