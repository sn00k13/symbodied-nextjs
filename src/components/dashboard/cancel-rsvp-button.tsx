"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { rsvpForEvent } from "@/app/actions/events";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function CancelRsvpButton({ eventId }: { eventId: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const handleCancel = () => {
    startTransition(async () => {
      const result = await rsvpForEvent(eventId);
      if (result?.error) {
        toast.error("Failed to cancel RSVP.");
      } else {
        toast.success("RSVP cancelled.");
        router.refresh();
      }
    });
  };

  return (
    <Button variant="secondary" size="sm" onClick={handleCancel} loading={pending}>
      Opt Out
    </Button>
  );
}
