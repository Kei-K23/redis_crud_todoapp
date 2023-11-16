"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { redis } from "@/lib/redis";
import { setSession } from "@/lib/session";
import { FormEvent, useState } from "react";

interface IUser {
  name: string;
  password: string;
  createdAt: Date;
}

interface LoginAndRegisterProps {
  setAuthUser: (name: string) => void;
}

const LoginAndRegister = ({ setAuthUser }: LoginAndRegisterProps) => {
  const [loginName, setLoginName] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [isLoginForm, setIsLoginForm] = useState("true");

  async function onLoginSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const success = await redis.hgetall<{
      name: string;
      password: string;
      createdAt: Date;
    }>(`todo:user-name-${loginName}`);
    if (!success) {
      toast({
        title: `could not find the user`,
      });
      return;
    }

    const isAuth = loginPassword === success?.password;

    if (!isAuth) {
      toast({
        title: `invalid password!`,
      });
      return;
    }

    toast({
      title: `successfully login`,
    });
    setSession({ name: "user_log", value: success });
    setAuthUser(success.name);
    setLoginName("");
    setLoginPassword("");
  }

  async function onRegisterSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const isExistingUser = await redis.hgetall<{
      name: string;
      password: string;
      createdAt: Date;
    }>(`todo:user-name-${registerName}`);

    if (isExistingUser) {
      toast({
        title: `could not register!`,
        description: `user already exist with name of ${registerName}! Name must be unique`,
      });
      return;
    }
    const registerUser = {
      name: registerName,
      password: registerPassword,
      createdAt: new Date(),
    };

    const success = await redis.hset(
      `todo:user-name-${registerName}`,
      registerUser
    );
    if (success === 0) {
      toast({
        title: `successfully register`,
      });

      setSession({ name: "user_log", value: registerUser });
      setAuthUser(registerName);
      setRegisterName("");
      setRegisterPassword("");
      return;
    } else {
      toast({
        title: `could not register user!`,
      });
      return;
    }
  }

  return (
    <>
      <div className="flex justify-center items-center gap-2">
        <Switch
          id="switch"
          onClick={(e) => {
            setIsLoginForm(e.currentTarget.ariaChecked as string);
          }}
        />
        <Label htmlFor="switch" className="text-xl">
          {isLoginForm === "true" ? "Login" : "Register"}
        </Label>
      </div>
      {isLoginForm === "true" ? (
        <form
          onSubmit={onLoginSubmit}
          className="flex flex-col justify-between items-center w-[30%] m-auto gap-4 mt-6"
        >
          <input
            required
            className="w-full text-lg  flex h-10 rounded-md border border-input bg-background px-3 py-2 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="e.g foo"
            type="text"
            value={loginName}
            onChange={(e) => setLoginName(e.target.value)}
          />
          <input
            required
            className="w-full text-lg  flex h-10 rounded-md border border-input bg-background px-3 py-2 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="e.g password123"
            type="password"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
          />
          <Button className="text-lg" size={"lg"} type="submit">
            Login
          </Button>
        </form>
      ) : (
        <form
          onSubmit={onRegisterSubmit}
          className="flex flex-col justify-between items-center w-[30%] m-auto gap-4 mt-6"
        >
          <input
            required
            className="w-full text-lg  flex h-10 rounded-md border border-input bg-background px-3 py-2 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="e.g foo"
            type="text"
            value={registerName}
            onChange={(e) => setRegisterName(e.target.value)}
          />
          <input
            required
            className="w-full text-lg  flex h-10 rounded-md border border-input bg-background px-3 py-2 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="e.g password123"
            type="password"
            value={registerPassword}
            onChange={(e) => setRegisterPassword(e.target.value)}
          />
          <Button className="text-lg" size={"lg"} type="submit">
            Register
          </Button>
        </form>
      )}
    </>
  );
};

export default LoginAndRegister;
