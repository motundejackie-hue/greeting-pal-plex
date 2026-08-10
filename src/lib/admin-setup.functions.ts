import { createServerFn } from "@tanstack/react-start";

const ADMIN_EMAIL = "erokmary@gmail.com";
const ADMIN_PASSWORD = "opencastadmin01";

/** One-off: makes sure the single admin account exists. Idempotent. */
export const ensureAdminUser = createServerFn({ method: "POST" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: list } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
  const existing = list?.users.find((u) => u.email?.toLowerCase() === ADMIN_EMAIL);
  if (existing) {
    await supabaseAdmin.auth.admin.updateUserById(existing.id, {
      password: ADMIN_PASSWORD,
      email_confirm: true,
    });
    return { ok: true, created: false };
  }
  const { error } = await supabaseAdmin.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
  });
  if (error) throw new Error(error.message);
  return { ok: true, created: true };
});
