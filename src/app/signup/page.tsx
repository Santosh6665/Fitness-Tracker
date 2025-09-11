
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/firebase/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { createUserProfile } from "@/services/userService";
import { Logo } from "@/components/icons/logo";

const formSchema = z
  .object({
    displayName: z.string().min(2, { message: "Name must be at least 2 characters." }),
    email: z.string().email({ message: "Please enter a valid email." }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export default function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const [configError, setConfigError] = useState(false);
  const [emailInUseError, setEmailInUseError] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setConfigError(false);
    setEmailInUseError(false);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
      
      const user = userCredential.user;
      
      await updateProfile(user, {
        displayName: values.displayName,
      });

      await createUserProfile(user.uid, {
        email: values.email,
        displayName: values.displayName,
      });
      
      router.push("/onboarding");
    } catch (error: any) {
      let errorMessage = "An unknown error occurred.";
      if (error.code === "auth/configuration-not-found") {
        setConfigError(true);
        errorMessage = "Firebase configuration is missing or incorrect. See details below.";
      } else if (error.code === "auth/email-already-in-use") {
        setEmailInUseError(true);
        errorMessage = "This email is already in use. Please login instead.";
      }
      toast({
        variant: "destructive",
        title: "Sign Up Failed",
        description: errorMessage,
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
           <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <h1 className="text-xl font-bold tracking-tight mb-2">AI Powered Fitness Tracker</h1>
          <CardTitle className="text-2xl font-headline">Sign Up</CardTitle>
          <CardDescription>
            Enter your information to create an account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {configError && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Action Required</AlertTitle>
              <AlertDescription>
                To fix this, you must enable Email/Password sign-in in the
                Firebase console for your project.
              </AlertDescription>
            </Alert>
          )}
           {emailInUseError && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Email Already Registered</AlertTitle>
              <AlertDescription>
                This email address is already in use. Please{' '}
                <Link href="/login" className="underline">
                  login
                </Link>{' '}
                instead.
              </AlertDescription>
            </Alert>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="user name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="s@gmail.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type={showPassword ? "text" : "password"} placeholder="password" {...field} />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff /> : <Eye />}
                          <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type={showConfirmPassword ? "text" : "password"} {...field} />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff /> : <Eye />}
                          <span className="sr-only">{showConfirmPassword ? "Hide password" : "Show password"}</span>
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign Up
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="text-center text-sm flex justify-center">
          <p>
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-primary hover:underline">
              Login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
