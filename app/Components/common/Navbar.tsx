'use client';

import React from 'react';
import MaxWidthWrapper from './MaxWidthWrapper';
import { Sparkles } from 'lucide-react';
import Link from "next/link";
import { buttonVariants } from "../ui/button";
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

const Navbar = () => {
    const { data: session } = useSession();
    const pathname = usePathname();
    const router = useRouter();

    if (pathname === '/login' || pathname === '/signup') {
        return null;
    }

    const handleSignOut = async () => {
        try {
            // Sign out from NextAuth
            await signOut({
                redirect: false
            });

            // Clear any local storage or cookies if needed
            localStorage.clear();
            sessionStorage.clear();

            // Redirect to login page
            router.push('/login');

        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <header className="bg-white">
            <MaxWidthWrapper>
                <div className="flex justify-between items-center h-16">
                    <Link href="/" className="flex items-center space-x-2">
                        <Sparkles className="w-8 h-8 text=primary" />
                        <span className="text-xl font-bold text-primary">
                            TechQuest
                        </span>
                    </Link>

                    <nav className="hidden md:flex items-center space space-x-4">
                        {!session ? (
                            <>
                                <Link href="/login" className={buttonVariants({ variant: "secondary" })}>
                                    Login
                                </Link>
                                <Link href="/signup" className={buttonVariants()}>
                                    Sign up
                                </Link>
                            </>
                        ) : (
                            <div className="flex items-center gap-2">
                                <span>Welcome, {session.user.name}</span>
                                <Link href="/CommonDashboard" className={buttonVariants({ variant: "secondary" })}>
                                    Dashboard
                                </Link>
                                <button
                                    onClick={handleSignOut}
                                    className={buttonVariants({ variant: "ghost" })}
                                >
                                    Sign out
                                </button>
                            </div>
                        )}
                    </nav>
                </div>
            </MaxWidthWrapper>
        </header>
    );
};

export default Navbar;
