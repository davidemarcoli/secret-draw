'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface LoginDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

import { useTranslations } from 'next-intl';

export function LoginDialog({ open, onOpenChange, onSuccess }: LoginDialogProps) {
    const t = useTranslations('LoginDialog');
    const [isLoading, setIsLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (isSignUp) {
                await createUserWithEmailAndPassword(auth, email, password);
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
            toast.success(isSignUp ? t('signup.success') : t('login.success'));
            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleAuth = async () => {
        setIsLoading(true);
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            toast.success(t('login.success'));
            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isSignUp ? t('signup.title') : t('login.title')}</DialogTitle>
                    <DialogDescription>
                        {isSignUp
                            ? t('signup.description')
                            : t('login.description')}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Button variant="outline" onClick={handleGoogleAuth} disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {t('google')}
                    </Button>
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                {t('orEmail')}
                            </span>
                        </div>
                    </div>
                    <form onSubmit={handleEmailAuth} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">{t('emailLabel')}</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">{t('passwordLabel')}</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isSignUp ? t('signup.submit') : t('login.submit')}
                        </Button>
                    </form>
                    <div className="text-center text-sm">
                        <button
                            type="button"
                            className="underline"
                            onClick={() => setIsSignUp(!isSignUp)}
                        >
                            {isSignUp ? t('signup.switch') : t('login.switch')}
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
