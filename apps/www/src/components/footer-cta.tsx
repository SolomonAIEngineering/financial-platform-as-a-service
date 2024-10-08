"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@midday/ui/button";

export function FooterCTA() {
  const pathname = usePathname();

  if (pathname.includes("pitch")) {
    return null;
  }

  return (
    <div className="mb-32 mt-24 md:py-40" />
    // <div className="rounded-2xl border border-border md:container text-center px-10 py-14 mx-4 md:mx-auto md:px-24 md:py-20 mb-32 mt-24 flex items-center flex-col bg-[#121212]">
    //   <span className="text-6xl	md:text-8xl font-medium text-white">
    //     Proactive stress testing for your practice
    //   </span>
    //   <p className="text-[#878787] mt-6">
    //     Solomon AI equips your practice
    //     <br />
    //     with a platform designed to conduct thorough financial stress tests.
    //   </p>

    //   <div className="mt-10 md:mb-8">
    //     <div className="flex items-center space-x-4">
    //       <Link href="/talk-to-us">
    //         <Button
    //           variant="outline"
    //           className="rounded-2xl order border-primary h-12 px-6 border-white text-white hidden md:block"
    //         >
    //           Talk to us
    //         </Button>
    //       </Link>

    //       <a href="https://app-business.solomon-ai.app">
    //         <Button className="rounded-2xl h-12 px-5 bg-white text-black hover:bg-white/80">
    //           Get Early Access
    //         </Button>
    //       </a>
    //     </div>
    //   </div>
    // </div>
  );
}
