"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

export function SubmitButton({ defaultText, pendingText }: { defaultText: string; pendingText: string }) {
  const { pending } = useFormStatus();
  return (
    <Button className="w-full" type="submit" disabled={pending}>
      {pending ? pendingText : defaultText}
    </Button>
  );
}
