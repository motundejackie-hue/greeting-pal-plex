import { useEffect, useSyncExternalStore } from "react";
import { Radio } from "lucide-react";
import { SERVERS } from "@/lib/servers";
import {
  getServerPref,
  loadServerPref,
  setServerPref,
  subscribeServerPref,
} from "@/lib/server-pref";

/** Small "Server" dropdown — picks which link source the player tries first. */
export function ServerPicker() {
  const current = useSyncExternalStore(subscribeServerPref, getServerPref, () => "auto");

  useEffect(() => {
    loadServerPref();
  }, []);

  const index = Math.max(0, SERVERS.findIndex((s) => s.id === current));

  return (
    <label className="ml-1 hidden shrink-0 items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1.5 text-[11px] text-muted-foreground sm:flex">
      <Radio className="h-3.5 w-3.5 text-primary" />
      <span className="hidden md:inline">Server {index === 0 ? "auto" : index}</span>
      <select
        aria-label="Stream server"
        value={current}
        onChange={(e) => setServerPref(e.target.value)}
        className="max-w-[8.5rem] truncate bg-transparent text-[11px] font-medium text-foreground outline-none"
      >
        {SERVERS.map((s, i) => (
          <option key={s.id} value={s.id} className="bg-popover text-foreground">
            {i === 0 ? s.label : `${i}. ${s.label}`}
          </option>
        ))}
      </select>
    </label>
  );
}
