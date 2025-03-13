
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "../ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/OutsetaAuthContext";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Domain name must be at least 2 characters long",
  }).max(50, {
    message: "Domain name must be less than 50 characters",
  }),
});

type NewDomainFormValues = z.infer<typeof formSchema>;

interface NewDomainDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDomainCreated: (domain: { id: string; name: string }) => void;
}

const NewDomainDialog: React.FC<NewDomainDialogProps> = ({
  open,
  onOpenChange,
  onDomainCreated,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const form = useForm<NewDomainFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (values: NewDomainFormValues) => {
    if (!user) {
      toast.error("You must be logged in to create a domain");
      return;
    }

    setIsLoading(true);
    try {
      // First, try to find if a custom domain with this name already exists
      const { data: existingDomains } = await supabase
        .from("custom_domains")
        .select("*")
        .eq("user_id", user.id)
        .eq("name", values.name)
        .limit(1);

      if (existingDomains && existingDomains.length > 0) {
        toast.error("A domain with this name already exists");
        setIsLoading(false);
        return;
      }

      // Create the new domain
      const { data, error } = await supabase
        .from("custom_domains")
        .insert([
          {
            name: values.name,
            user_id: user.id,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Error creating domain:", error);
        toast.error("Failed to create domain");
        return;
      }

      toast.success(`Domain "${values.name}" created successfully`);
      onDomainCreated(data);
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("Error creating domain:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Domain</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Domain Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter a name for your new domain..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Domain"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default NewDomainDialog;
