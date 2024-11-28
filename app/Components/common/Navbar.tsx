'use client';

import React from 'react';
import MaxWidthWrapper from './MaxWidthWrapper';
import { Sparkles } from 'lucide-react';
import Link from "next/link";
import { buttonVariants } from "../ui/button";
import { usePathname } from 'next/navigation';

const Navbar = () => {
    const pathname = usePathname();
    
    // Don't render navbar on login or signup pages
    if (pathname === '/login' || pathname === '/signup') {
        return null;
    }

    const user = false;
    // const user = true; 

    return (
        <header className="bg-[#e6f7ff]">
            <MaxWidthWrapper>
                <div className="flex justify-between items-center h-16">

                    <Link href="/" className="flex items-center space-x-2">
                        <Sparkles className="w-8 h-8 text=primary" />
                        <span className="text-xl font-bold text-primary">
                            TechQuest
                        </span>
                    </Link>

                    <nav className="hidden md:flex items-center space space-x-4">
                            {
                                !user ? (
                                    <>
                                    <Link href={"/login"}
                                        className={
                                            buttonVariants({
                                                variant: "secondary",
                                            })
                                        }
                                    >Login</Link>
                                    <Link href={"/signup"}
                                        className={buttonVariants()}
                                    >Sign up</Link>
                                    </>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Link href={"/CommonDashboard"}
                                            className={
                                                buttonVariants({
                                                    variant: "secondary"
                                                })
                                            }
                                        >Dashboard</Link>
                                        <Link className={buttonVariants()} href={"/CreateQuiz"}>
                                            Create
                                        </Link>
                                        <Link href={"/Signout"}
                                            className={buttonVariants({
                                                variant: "ghost"
                                                })
                                            }
                                        >Sign out</Link>
                                    </div>
                                )
                            }
                        </nav>
                </div>
            </MaxWidthWrapper>
        </header>
    );
};

export default Navbar;
