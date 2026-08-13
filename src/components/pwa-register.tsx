"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { registerServiceWorker, requestNotificationPermission, subscribeToPush } from "@/lib/pwa";

export function PwaRegister() {
  const { data: session } = useSession();

  useEffect(() => {
    async function setup() {
      const registration = await registerServiceWorker();
      if (!registration || !session?.user) return;

      const granted = await requestNotificationPermission();
      if (!granted) return;

      const subscription = await subscribeToPush(registration);
      if (!subscription) return;

      const subJson = subscription.toJSON();
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: subJson.endpoint,
          keys: subJson.keys,
        }),
      });
    }

    if (session?.user) {
      setup();
    }
  }, [session]);

  return null;
}
