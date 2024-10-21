import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { object, string, z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useAuth from "@/context/auth/useAuth";
import { updateUser } from "@/services/auth.services";
import { InputWithLabel } from "@/components/forms/Input/InputWithLabel";
import revalidatePathAction from "@/app/actions/revalidatePath";
import { Loader2 } from "lucide-react";

export default function UpdateProfile({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const UpdateUserFormSchema = object({
    name: string().min(1, "Please provide a valid name."),
    email: string()
      .email("Please provide a valid email address.")
      .min(1, "Please provide a valid email address."),
    username: string().min(1, "Please provide a valid username."),
  });

  const form = useForm<z.infer<typeof UpdateUserFormSchema>>({
    resolver: zodResolver(UpdateUserFormSchema),
    defaultValues: {
      name: user?.display_name || "",
      email: user?.email || "",
      username: user?.username || "",
    },
    mode: "onTouched",
  });

  const onSubmit = async (data: z.infer<typeof UpdateUserFormSchema>) => {
    const { name, email, username } = data;
    setIsLoading(true);
    try {
      if (!name && !email && !username) {
        throw new Error("Please provide a fields");
      }

      if (
        name === user?.display_name &&
        email === user?.email &&
        username === user?.username
      ) {
        throw new Error("Please provide at least one change");
      }

      const updateName = name
        ? {
            display_name: name,
          }
        : {};

      const updateEmail = email
        ? {
            email,
          }
        : {};

      const updateUsername = username
        ? {
            username,
          }
        : {};

      await updateUser({
        ...updateName,
        ...updateEmail,
        ...updateUsername,
      });

      setOpen(false);

      revalidatePathAction("/settings/profile");
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="absolute right-0 rounded-full">
          {children}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Edit profile</DialogTitle>
              <DialogDescription>
                Make changes to your profile here. Click save when you&apos;re
                done.
              </DialogDescription>
            </DialogHeader>
            {/* <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  defaultValue={user?.display_name}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  E-mail
                </Label>
                <Input
                  id="email"
                  defaultValue={user?.email}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">
                  Username
                </Label>
                <Input
                  id="username"
                  defaultValue={`@${user?.username}`}
                  className="col-span-3"
                />
              </div>
            </div> */}

            <div className="mb-6 mt-4 flex flex-col gap-[10px]">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <InputWithLabel
                        label="Full Name"
                        type="text"
                        id="name"
                        placeholder="Ayeni Boluwatife"
                        {...field}
                      />
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <InputWithLabel
                        label="Email Address"
                        type="email"
                        id="email"
                        placeholder="AyeniBolu@gmail.com"
                        {...field}
                      />
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <InputWithLabel
                        label="User Name"
                        type="text"
                        id="username"
                        placeholder="@ayeni.bolu"
                        {...field}
                      />
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </div>

            <DialogFooter>
              {/* <DialogClose asChild> */}
              <Button className="w-full" type="submit">
                {isLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  "Save Changes"
                )}
              </Button>
              {/* </DialogClose> */}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
