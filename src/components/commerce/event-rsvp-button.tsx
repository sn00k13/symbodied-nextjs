"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { rsvpForEvent } from "@/app/actions/events";

interface EventRsvpButtonProps {
  eventId: string;
  hasRsvpd: boolean;
  isAuthenticated: boolean;
}

export function EventRsvpButton({ eventId, hasRsvpd: init, isAuthenticated }: EventRsvpButtonProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [rsvpd, setRsvpd] = useState(init);

  const handle = () => {
    if (!isAuthenticated) { router.push("/login"); return; }
    startTransition(async () => {
      const result = await rsvpForEvent(eventId);
      if (!result?.error) setRsvpd((v) => !v);
    });
  };

  return (
    <Button
      variant={rsvpd ? "secondary" : "primary"}
      size="sm"
      loading={pending}
      leadingIcon={rsvpd ? <Check size={13} /> : undefined}
      onClick={handle}
    >
      {rsvpd ? "RSVPd" : "RSVP"}
    </Button>
  );
}
