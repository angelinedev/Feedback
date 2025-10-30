"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface ChangePasswordDialogProps {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: z.string().min(6, "New password must be at least 6 characters long."),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export function ChangePasswordDialog({ children, open, onOpenChange }: ChangePasswordDialogProps) {
  const { user, changePassword } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof passwordSchema>) => {
    if (!user) return;
    setLoading(true);

    try {
        await changePassword(values.currentPassword, values.newPassword);
        toast({
          title: "Success",
          description: "Your password has been changed successfully.",
        });
        onOpenChange(false);
        form.reset();
    } catch(error: any) {
        toast({
            variant: "destructive",
            title: "Error",
            description: error.message || "An error occurred.",
        });
    } finally {
        setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
                Update your password here. Click save when you're done.
            </DialogDescription>
            </DialogHeader>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="currentPassword"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                            <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                            <Input type="password" {...field} />
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
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                            <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <DialogFooter>
                    <Button type="submit" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save changes
                    </Button>
                </DialogFooter>
            </form>
            </Form>
        </DialogContent>
    </Dialog>
  );
}
