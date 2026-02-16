'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { login } from "@/app/actions/auth";
import { Loader2 } from "lucide-react";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700"
            disabled={pending}
        >
            {pending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                </>
            ) : (
                'Sign In'
            )}
        </Button>
    );
}

export default function LoginPage() {
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(formData: FormData) {
        setError(null);
        const result = await login(formData);
        if (result?.error) {
            setError(result.error);
        }
    }

    return (
        <Card className="border-slate-200 shadow-lg w-full max-w-md">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center">Sign in</CardTitle>
                <CardDescription className="text-center">
                    Enter your email and password to access your account
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form action={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" placeholder="m@example.com" required />
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Password</Label>
                            <Link href="#" className="text-sm text-indigo-600 hover:underline">
                                Forgot password?
                            </Link>
                        </div>
                        <Input id="password" name="password" type="password" required />
                    </div>
                    <SubmitButton />
                </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2 text-center text-sm text-slate-500">
                <div>
                    Don&apos;t have an account?{" "}
                    <Link href="/register" className="text-indigo-600 font-medium hover:underline">
                        Register
                    </Link>
                </div>
                <Link href="/" className="text-slate-400 hover:text-slate-600">
                    Back to Home
                </Link>
            </CardFooter>
        </Card>
    );
}
