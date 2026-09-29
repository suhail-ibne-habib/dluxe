"use client";

import { useEffect, useState } from "react";

export const DEMO_CONTACT = {
  phone: "+1 (000) 000-0000",
  email: "reservations@example.com",
  whatsapp: "+1 (000) 000-0000",
};

function digits(value) {
  return String(value || "").replace(/[^\d]/g, "");
}

export function useContact() {
  const [settings, setSettings] = useState({});

  useEffect(() => {
    let active = true;
    fetch("/api/settings")
      .then((res) => (res.ok ? res.json() : {}))
      .then((data) => {
        if (active) setSettings(data || {});
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const whatsapp = settings.whatsapp || settings.whatsapp_number || "";
  const phone = settings.contact_phone || whatsapp;
  const email = settings.contact_email || "";

  return {
    phone: phone || DEMO_CONTACT.phone,
    phoneHref: phone ? `tel:+${digits(phone)}` : "#",
    email: email || DEMO_CONTACT.email,
    emailHref: email ? `mailto:${email}` : "#",
    whatsapp: whatsapp || DEMO_CONTACT.whatsapp,
    whatsappHref: whatsapp ? `https://wa.me/${digits(whatsapp)}` : "#",
  };
}
