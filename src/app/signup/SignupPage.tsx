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
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/use-auth';
import type { User as AppUser } from '@/lib/types';
import { GoogleIcon } from '@/components/shared/icons';

export default function SignupPage({ redirectUrl }: { redirectUrl: string }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();
  const { syncUser } = useAuth();
  const { toast } = useToast();

  const handleRedirect = (user: AppUser | null) => {
    if (!user) {
      router.push('/browse');
      return;
    }

    if (redirectUrl) {
      router.push(redirectUrl);
      return;
    }

    switch (user.role) {
      case 'admin':
        router.push('/admin');
        break;
      case 'vendor':
        router.push('/vendor');
        break;
      case 'dispatcher':
        router.push('/dispatcher');
        break;
      default:
        router.push('/browse');
        break;
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const name = `${firstName} ${lastName}`.trim();
      await updateProfile(userCredential.user, { displayName: name });

      const appUser = await syncUser({ ...userCredential.user, displayName: name });

      toast({
        title: "Account created!",
        description: "You have successfully signed up.",
      });
      handleRedirect(appUser);
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
    setIsPending(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const appUser = await syncUser(result.user);
      toast({
        title: "Account created!",
        description: "You have successfully signed up.",
      });
      handleRedirect(appUser);
    } catch (error: any) {
      console.error("Error during Google sign-up:", error);
      if (error.code === 'auth/popup-closed-by-user') {
        toast({
          title: "Sign-up Canceled",
          description: "You closed the sign-up window before completing.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Uh oh! Something went wrong.",
          description: "There was a problem with your sign-up.",
          variant: "destructive",
        });
      }
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-secondary">
      <div className="absolute top-6 left-6">
        <Button variant="ghost" asChild>
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </Button>
      </div>
      <Card className="w-full max-w-md mx-auto shadow-2xl shadow-primary/10 border-t-4 border-primary">
        <CardHeader className="space-y-2 text-center pt-8">
          <Logo className="justify-center" />
          <CardTitle className="text-2xl font-headline">Create an account</CardTitle>
          <CardDescription>
            Enter your information to get started with Calabar Market.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
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
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            <Button variant="outline" className="w-full" onClick={handleGoogleSignUp} disabled={isPending}>
              {isPending ? 'Creating account...' : (
                <>
                  <GoogleIcon className="mr-2 h-5 w-5" />
                  Sign up with Google
                </>
              )}
            </Button>
          </div>
          <div className="mt-4 text-center text-sm space-y-2">
            <p>
              Already have an account?{" "}
              <Link href="/login" className="underline text-primary font-medium">
                Login
              </Link>
            </p>
            <p>
              Are you a vendor?{" "}
              <Link href="/vendor-signup" className="underline text-primary font-medium">
                Sign up here
              </Link>
            </p>
            <p>
              Are you a dispatcher?{" "}
              <Link href="/dispatcher-signup" className="underline text-primary font-medium">
                Sign up here
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
