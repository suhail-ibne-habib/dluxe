"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  whatsapp: z.string().min(6, "Enter a WhatsApp number"),
  smtp_host: z.string().min(1, "SMTP host is required"),
  smtp_port: z.coerce.number().min(1, "Port is required"),
  smtp_secure: z.boolean(),
  smtp_user: z.string().min(3, "SMTP user is required"),
  smtp_pass: z.string().optional(),
  mail_from: z.string().min(3, "From address is required"),
});

export default function SettingsPage() {
  const [passSet, setPassSet] = useState(false);
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      whatsapp: "",
      smtp_host: "",
      smtp_port: 587,
      smtp_secure: false,
      smtp_user: "",
      smtp_pass: "",
      mail_from: "",
    },
  });

  useEffect(() => {
    api.get("/api/settings").then(({ data }) => {
      setPassSet(Boolean(data.smtp_pass_set));
      form.reset({
        whatsapp: data.whatsapp || data.whatsapp_number || "",
        smtp_host: data.smtp_host || "",
        smtp_port: Number(data.smtp_port || 587),
        smtp_secure: data.smtp_secure === true || data.smtp_secure === "true",
        smtp_user: data.smtp_user || "",
        smtp_pass: "",
        mail_from: data.mail_from || "",
      });
    }).catch((error) => {
      toast.error(error.response?.data?.message || "Could not load settings");
    });
  }, [form]);

  async function onSubmit(values) {
    const payload = {
      whatsapp: values.whatsapp,
      whatsapp_number: values.whatsapp,
      smtp_host: values.smtp_host,
      smtp_port: String(values.smtp_port),
      smtp_secure: values.smtp_secure ? "true" : "false",
      smtp_user: values.smtp_user,
      mail_from: values.mail_from,
    };
    if (values.smtp_pass) payload.smtp_pass = values.smtp_pass;
    try {
      await api.put("/api/settings", payload);
      toast.success("Settings saved");
      if (values.smtp_pass) setPassSet(true);
      form.setValue("smtp_pass", "");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not save settings");
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid max-w-2xl gap-4">
      <Card>
        <CardHeader>
          <CardTitle>WhatsApp</CardTitle>
          <CardDescription>Shown on the public site.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <Label>Number</Label>
            <Input {...form.register("whatsapp")} />
            {form.formState.errors.whatsapp && <p className="text-sm text-destructive">{form.formState.errors.whatsapp.message}</p>}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Mailer</CardTitle>
          <CardDescription>Used for welcome mail, lead mail, and password reset. A blank password keeps the one already saved.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1 sm:col-span-2">
            <Label>SMTP host</Label>
            <Input {...form.register("smtp_host")} placeholder="smtp.gmail.com" />
            {form.formState.errors.smtp_host && <p className="text-sm text-destructive">{form.formState.errors.smtp_host.message}</p>}
          </div>
          <div className="space-y-1">
            <Label>Port</Label>
            <Input type="number" {...form.register("smtp_port")} />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...form.register("smtp_secure")} /> Secure (SSL)</label>
          </div>
          <div className="space-y-1">
            <Label>SMTP user</Label>
            <Input {...form.register("smtp_user")} />
            {form.formState.errors.smtp_user && <p className="text-sm text-destructive">{form.formState.errors.smtp_user.message}</p>}
          </div>
          <div className="space-y-1">
            <Label>SMTP password</Label>
            <Input type="password" {...form.register("smtp_pass")} placeholder={passSet ? "Saved. Leave blank to keep it" : "App password"} />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label>From</Label>
            <Input {...form.register("mail_from")} placeholder={'D\'LUXE <you@gmail.com>'} />
            {form.formState.errors.mail_from && <p className="text-sm text-destructive">{form.formState.errors.mail_from.message}</p>}
          </div>
        </CardContent>
      </Card>
      <Button type="submit" disabled={form.formState.isSubmitting}>Save</Button>
    </form>
  );
}
