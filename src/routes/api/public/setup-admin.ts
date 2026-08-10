import { createFileRoute } from "@tanstack/react-router";
import { ensureAdminUser } from "@/lib/admin-setup.functions";

export const Route = createFileRoute("/api/public/setup-admin")({
  server: {
    handlers: {
      GET: async () => Response.json(await ensureAdminUser()),
    },
  },
});
