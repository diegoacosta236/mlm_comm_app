"use client";

//Design Dependecies
import Link from "next/link";
import { FaRegUser } from "react-icons/fa6";
import { IoCheckmarkCircleOutline } from "react-icons/io5";
import { LuKeyRound } from "react-icons/lu";
import "./AuthForm.css";
import InputType from "./InputType";

// Form Dependecies
import * as z from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema } from "@/schemas";

interface Props {
  isRegister: boolean;
}

export default function AuthType({ isRegister }: Props) {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: z.infer<typeof LoginSchema>) => {
    console.log(data);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col justify-center items-center"
    >
      <div className="space-y-4">
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <InputType
              {...field}
              placeholder="Email"
              type="email"
              id="email"
              Icon={FaRegUser}
            />
          )}
        />
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <InputType
              {...field}
              placeholder="Password"
              type="password"
              id="password"
              Icon={LuKeyRound}
            />
          )}
        />
        {/* {isRegister && (
          <Controller
            name="confirmPassword"
            control={control}
            render={({ field }) => <InputType {...field} placeholder="Confirm Password" type="password" id="confirm-password" Icon={IoCheckmarkCircleOutline} />}
          />
        )} */}
      </div>

      {!isRegister && (
        <div className="flex justify-between items-center w-full mt-4">
          <div className="flex justify-center items-center">
            <input type="checkbox" id="remember" className="mr-1" />
            <label htmlFor="remember" className="text-sm text-gray-400">
              Remember me
            </label>
          </div>
          <a href="#" className="text-sm text-emerald-400">
            Forgot password?
          </a>
        </div>
      )}

      <button
        type="submit"
        className="w-[252px] h-10 bg-emerald-500 text-white text-lg font-medium rounded-md mt-4 "
      >
        {isRegister ? "Create Account" : "Login"}
      </button>

      <div className="flex justify-center items-center w-full my-4">
        <p className="text-sm italic text-gray-400 pr-1">
          {isRegister ? "Already" : "Dont"} have an account?
        </p>
        <Link
          href={isRegister ? "/signin" : "/register"}
          className="text-sm underline text-emerald-400 ml-1"
        >
          {isRegister ? "Login" : "Register"} Here
        </Link>
      </div>
    </form>
  );
}
