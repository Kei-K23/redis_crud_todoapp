"use client";

import { Toaster } from "@/components/ui/toaster";
import { TaskForm } from "./_components/TaskForm";
import LoginAndRegister from "./_components/LoginAndRegister";
import { useState } from "react";
import { getSession } from "@/lib/session";

export default function Home() {
  const user = getSession({ name: "user_log" });

  const [authUser, setAuthUser] = useState(
    `${user.length ? user[0].name : ""}`
  );

  return (
    <>
      <main className="h-screen">
        <h1 className="text-center text-2xl md:text-3xl lg:text-4xl mt-10 mb-7">
          Welcome from Redis + Next.js Todo App 📝✍🏻
        </h1>

        {authUser ? (
          <h1>
            <TaskForm setAuthUser={setAuthUser} authUser={authUser} />
          </h1>
        ) : (
          <LoginAndRegister setAuthUser={setAuthUser} />
        )}
      </main>
      <Toaster />
    </>
  );
}
