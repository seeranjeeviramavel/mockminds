"use client";
import Logo from "@/components/ui/logo";
import { UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect } from "react";

const Header = () => {
  return (
    <header className="w-full">
      <div>
        <div className="relative  flex h-14 items-center justify-between gap-3 rounded-2xl bg-white/90 px-10 shadow-lg shadow-black/[0.03] backdrop-blur-sm before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:border before:border-transparent before:[background:linear-gradient(theme(colors.gray.100),theme(colors.gray.200))_border-box] before:[mask-composite:exclude_!important] before:[mask:linear-gradient(white_0_0)_padding-box,_linear-gradient(white_0_0)]">
          <Link className="flex flex-1 items-center" href="/dashboard">
            <Logo />
            <h2 className="mx-3 text-base sm:text-lg md:text-xl font-bold text-blue-500">
              Mock Minds
            </h2>
          </Link>
          <ul className="flex flex-1 items-center justify-end gap-3">
            <UserButton />
          </ul>
        </div>
      </div>
    </header>
  );
};

export default Header;
