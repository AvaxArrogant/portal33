"use client";
import Link from 'next/link';
import { HomeIcon, QuestionMarkCircleIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { supabaseClient } from '@/lib/supabase/client';

const BottomNav = () => {
  const [me, setMe] = useState<{ role: string } | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const sb = supabaseClient();
      const { data: { user } } = await sb.auth.getUser();
      if (user) {
        const { data: profile } = await sb.from("profiles").select("role").eq("id", user.id).single();
        if (profile) {
          setMe(profile);
        }
      }
    };
    fetchUser();
  }, []);

  const homeUrl = () => {
    if (!me) return "/login";
    if (me.role === "admin" || me.role === "subadmin") {
      return "/admin";
    }
    return "/policies";
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-lg z-50">
      <div className="flex justify-around max-w-screen-sm mx-auto">
        <Link href={homeUrl()} className="flex flex-col items-center justify-center p-2 text-yellow-500 bg-yellow-100 rounded-lg m-2 w-20 h-16">
          <HomeIcon className="h-6 w-6" />
          <span className="text-xs">Home</span>
        </Link>
        <Link href="/faq" className="flex flex-col items-center justify-center p-2 text-gray-500 w-20 h-16">
          <QuestionMarkCircleIcon className="h-6 w-6" />
          <span className="text-xs">FAQ</span>
        </Link>
        {me && (
          <Link href="/api/auth/logout" className="flex flex-col items-center justify-center p-2 text-red-500 w-20 h-16">
            <ArrowRightOnRectangleIcon className="h-6 w-6" />
            <span className="text-xs">Logout</span>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default BottomNav;