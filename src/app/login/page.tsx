
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from 'next/image';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Logo } from "@/components/icons/logo";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(1, { message: "Password cannot be empty." }),
});

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const [configError, setConfigError] = useState(false);
  const [credentialError, setCredentialError] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setConfigError(false);
    setCredentialError(false);
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      router.push("/");
    } catch (error: any) {
      let errorMessage = "An unknown error occurred.";
      if (error.code === "auth/configuration-not-found") {
        setConfigError(true);
        errorMessage = "Firebase configuration is missing or incorrect. See details below.";
      } else if (error.code === "auth/invalid-credential") {
         setCredentialError(true);
         errorMessage = "Invalid email or password. Please try again.";
      }

      toast({
        variant: "destructive",
        title: "Login Failed",
        description: errorMessage,
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
     <div className="w-full lg:grid lg:min-h-[100vh] lg:grid-cols-2 xl:min-h-[100vh]">
      <div className="flex items-center justify-center py-12 px-4">
        <Card className="mx-auto w-full max-w-sm grid gap-6 border-0 shadow-none sm:border sm:shadow-sm">
          <CardHeader className="text-center">
             <div className="flex justify-center mb-4">
              <Logo className="h-16 w-16" />
            </div>
            <h1 className="text-xl font-bold tracking-tight mb-2">AI Powered Fitness Tracker</h1>
            <CardTitle className="text-3xl font-bold font-headline">Login</CardTitle>
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
            {credentialError && (
               <Alert variant="destructive" className="mb-4">
                <AlertTitle>Login Failed</AlertTitle>
                <AlertDescription>
                  The email or password you entered is incorrect. Please try again.
                </AlertDescription>
              </Alert>
            )}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="m@example.com"
                          {...field}
                          disabled={isLoading}
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
                       <div className="flex items-center">
                        <FormLabel>Password</FormLabel>
                      </div>
                      <FormControl>
                        <Input type="password" {...field} disabled={isLoading}/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Login
                </Button>
              </form>
            </Form>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="underline">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
       <div className="hidden bg-muted lg:block">
        <Image
          src="https://picsum.photos/seed/fitness-login/1200/1800"
          alt="Woman doing yoga"
          data-ai-hint="woman yoga"
          width="1200"
          height="1800"
          className="h-full w-full object-cover dark:brightness-[0.3] dark:grayscale"
        />
      </div>
    </div>
  );
}
