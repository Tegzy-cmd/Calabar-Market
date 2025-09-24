
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
import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/use-auth';
import type { User as AppUser } from '@/lib/types';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { syncUser } = useAuth();
  const redirectUrl = searchParams.get('redirect') || '/browse';

  const handleRedirect = (user: AppUser | null) => {
    if (!user) {
      router.push('/browse');
      return;
    }

    if (redirectUrl && redirectUrl !== '/browse') {
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
      default:
        router.push('/browse');
        break;
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const appUser = await syncUser(userCredential.user);
      toast({
        title: "Logged in successfully!",
        description: "Welcome back.",
      });
      handleRedirect(appUser);
    } catch (error: any) {
      console.error("Error during email login:", error);
      toast({
        title: "Login Failed",
        description: error.message || "There was a problem with your login.",
        variant: "destructive",
      });
    } finally {
        setIsPending(false);
    }
  };


  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    setIsPending(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const appUser = await syncUser(result.user);
      toast({
        title: "Logged in successfully!",
        description: "Welcome back.",
      });
      handleRedirect(appUser);
    } catch (error: any) {
      console.error("Error during Google login:", error);
      if (error.code === 'auth/popup-closed-by-user') {
        toast({
          title: "Login Canceled",
          description: "You closed the sign-in window before completing the login.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Uh oh! Something went wrong.",
          description: "There was a problem with your login.",
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
                <ArrowLeft className="w-4 h-4"/>
                Back to Home
            </Link>
          </Button>
      </div>
      <Card className="w-full max-w-sm mx-auto shadow-2xl shadow-primary/10 border-t-4 border-primary">
        <CardHeader className="text-center space-y-4 pt-8">
          <Logo className="justify-center"/>
          <CardTitle className="text-2xl font-headline">Welcome Back!</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailLogin} className="grid gap-4">
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
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="#"
                  className="ml-auto inline-block text-sm text-primary hover:underline"
                >
                  Forgot your password?
                </Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isPending}
              />
            </div>
            <Button type="submit" className="w-full font-bold" disabled={isPending}>
              {isPending ? 'Logging in...' : 'Login'}
            </Button>
            </form>
            <Button variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={isPending}>
              {isPending ? 'Logging in...' : 'Login with Google'}
            </Button>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="underline text-primary font-medium">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
