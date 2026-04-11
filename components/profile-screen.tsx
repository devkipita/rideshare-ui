// app/(whatever)/profile/ProfileScreen.tsx
"use client";

import type { ComponentType, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  Phone,
  Mail,
  LogOut,
  Settings,
  ChevronRight,
  ShieldCheck,
  Lock,
  Pencil,
  X,
  User,
  Image as ImageIcon,
  Loader2,
  BadgeCheck,
  FileText,
  Cookie,
  CalendarDays,
  Trash2,
  Upload,
  Moon,
  Sun,
  Languages,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { StateFeedback } from "@/components/state-feedback";
import { useAuthDrawer } from "@/components/auth-drawer-provider";

interface ProfileScreenProps {
  userMode: "passenger" | "driver";
}

type AppRole = "passenger" | "driver" | "admin";

type ProfileData = {
  id?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  phone_verified?: boolean | null;
  role?: AppRole | null;
  provider?: string | null;
  created_at?: string | null;
  image?: string | null;
};

type DriverProfile = {
  id?: string | null;
  user_id?: string | null;
  national_id?: string | null;
  driving_license?: string | null;
  verified?: boolean | null;
  verified_at?: string | null;
  created_at?: string | null;
};

type DriverStats = {
  completed_rides: number;
};

const formatProvider = (provider?: string | null) => {
  if (!provider) return "Credentials";
  if (provider === "google") return "Google";
  return provider.charAt(0).toUpperCase() + provider.slice(1);
};

const formatDate = (iso?: string | null) => {
  if (!iso) return "New";
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return "New";
  return parsed.toLocaleDateString(undefined, {
    month: "short",
    year: "numeric",
  });
};

function GlassCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`glass-card ${className}`}>{children}</div>;
}

function Pill({
  tone,
  children,
}: {
  tone: "success" | "warn" | "neutral";
  children: ReactNode;
}) {
  const cls =
    tone === "success"
      ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
      : tone === "warn"
        ? "bg-amber-500/10 text-amber-700 border-amber-500/20"
        : "bg-muted/40 text-muted-foreground border-border";

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5",
        "rounded-full border px-2.5 py-1",
        "text-[11px] font-black leading-none",
        "max-w-full",
        cls,
      ].join(" ")}
    >
      {children}
    </span>
  );
}

function StatTile({
  title,
  value,
  helper,
  icon: Icon,
}: {
  title: string;
  value: ReactNode;
  helper: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <GlassCard className="soft-shadow p-3">
      <div className="grid grid-cols-1 gap-3 justify-center items-center">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-black tracking-widest text-muted-foreground">
            {title}
          </p>
          <div className="mt-2 min-w-0">
            <div className="min-w-0 text-[16px] leading-tight font-extrabold text-foreground break-words">
              {value}
            </div>
            <p className="mt-1 text-[11px] font-semibold leading-snug text-muted-foreground break-words">
              {helper}
            </p>
          </div>
        </div>

        <div className="shrink-0 h-9 w-9 rounded-2xl grid place-items-center bg-primary/10 border border-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </div>
    </GlassCard>
  );
}

export function OverviewStats({
  isDriver,
  driverVerified,
  completedRides,
  memberSince,
}: {
  isDriver: boolean;
  driverVerified: boolean;
  completedRides: number;
  memberSince: string;
}) {
  const statusValue = isDriver ? (
    <Pill tone={driverVerified ? "success" : "warn"}>
      <BadgeCheck className="h-4 w-4" />
      {driverVerified ? "Verified" : "Unverified"}
    </Pill>
  ) : (
    <Pill tone="neutral">
      <ShieldCheck className="h-4 w-4" />
      Passenger
    </Pill>
  );

  return (
    <section className="space-y-2">
      <div className="grid grid-cols-3 gap-3">
        <StatTile
          title="STATUS"
          value={statusValue}
          helper="Driver status"
          icon={BadgeCheck}
        />
        <StatTile
          title="RIDES"
          value={
            <span className="tabular-nums">{Math.max(0, completedRides)}</span>
          }
          helper="Completed rides"
          icon={ShieldCheck}
        />
        <StatTile
          title="MEMBER"
          value={<span className="break-words">{memberSince}</span>}
          helper="Member since"
          icon={CalendarDays}
        />
      </div>
    </section>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  right,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  right?: ReactNode;
}) {
  return (
    <GlassCard className="flex items-center gap-4 p-4 soft-shadow">
      <div className="h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 bg-primary/10 border border-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold text-muted-foreground">
          {label}
        </p>
        <p className="mt-0.5 text-sm font-semibold text-foreground break-all">
          {value}
        </p>
      </div>

      {right ? <div className="shrink-0">{right}</div> : null}
    </GlassCard>
  );
}

function ActionButton({
  icon: Icon,
  label,
  destructive = false,
  onClick,
  disabled = false,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  destructive?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-disabled={disabled}
      className={[
        "w-full h-14 rounded-2xl px-5 flex items-center justify-between",
        "transition-[transform,background-color,opacity,color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "active:scale-[0.985]",
        disabled ? "opacity-60 cursor-not-allowed" : "",
        destructive
          ? "text-destructive hover:bg-destructive/10"
          : "text-foreground hover:bg-accent/40",
      ].join(" ")}
    >
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5" />
        <span className="text-sm font-semibold">{label}</span>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}

function SettingsThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !isDark;
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
    setIsDark(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="w-full h-14 rounded-2xl px-5 flex items-center justify-between text-foreground hover:bg-accent/40 active:scale-[0.985] transition-all duration-300"
    >
      <div className="flex items-center gap-3">
        {isDark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        <span className="text-sm font-semibold">{isDark ? "Dark mode" : "Light mode"}</span>
      </div>
      <div className={`relative h-7 w-12 rounded-full transition-colors duration-200 ${isDark ? "bg-primary" : "bg-muted-foreground/30"}`}>
        <div className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform duration-200 ${isDark ? "translate-x-5" : "translate-x-0.5"}`} />
      </div>
    </button>
  );
}

function SettingsLanguageToggle() {
  const [lang, setLang] = useState("en");

  useEffect(() => {
    const saved = localStorage.getItem("kipita-lang");
    if (saved === "sw" || saved === "en") setLang(saved);
  }, []);

  const selectLang = (next: "en" | "sw") => {
    setLang(next);
    localStorage.setItem("kipita-lang", next);
    document.documentElement.lang = next;
    window.dispatchEvent(new StorageEvent("storage", { key: "kipita-lang", newValue: next }));
  };

  return (
    <div className="w-full h-14 rounded-2xl px-5 flex items-center justify-between text-foreground">
      <div className="flex items-center gap-3">
        <Languages className="h-5 w-5" />
        <span className="text-sm font-semibold">{lang === "en" ? "English" : "Kiswahili"}</span>
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => selectLang("en")}
          className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all duration-200 active:scale-[0.95] ${lang === "en" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-accent/40"}`}
        >
          EN
        </button>
        <button
          type="button"
          onClick={() => selectLang("sw")}
          className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all duration-200 active:scale-[0.95] ${lang === "sw" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-accent/40"}`}
        >
          SW
        </button>
      </div>
    </div>
  );
}

function Input({
  icon: Icon,
  label,
  value,
  onChange,
  placeholder,
  disabled,
  type = "text",
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  type?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-foreground">{label}</label>
      <div
        className={[
          "flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3",
          "focus-within:ring-2 focus-within:ring-ring/40 focus-within:border-ring/60",
          "transition-[border-color,box-shadow,background-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          disabled ? "opacity-70" : "",
        ].join(" ")}
      >
        <Icon className="h-4 w-4 text-muted-foreground" />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full bg-transparent text-sm font-semibold text-foreground outline-none"
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={[
        "animate-pulse rounded-xl bg-muted/70",
        "shadow-[0_8px_22px_-18px_rgba(0,0,0,0.25)]",
        className,
      ].join(" ")}
    />
  );
}

function ProfileSkeleton() {
  return (
    <div className="min-h-[100dvh] overflow-y-auto overscroll-contain">
      <div className="min-h-[100dvh]">
        <div className="mx-auto w-full max-w-md pb-44 pt-4 overflow-x-hidden">
          <div className="pb-[calc(6rem+env(safe-area-inset-bottom))] overflow-x-hidden space-y-5">
            <GlassCard className="relative overflow-hidden">
              <div className="p-5 text-center">
                <div className="mx-auto mb-3 grid place-items-center">
                  <div className="relative h-20 w-20 rounded-full overflow-hidden border border-border bg-muted">
                    <Skeleton className="h-full w-full rounded-full" />
                  </div>
                </div>

                <div className="mx-auto space-y-2">
                  <Skeleton className="h-5 w-44 mx-auto rounded-lg" />
                  <div className="flex items-center justify-center gap-2">
                    <Skeleton className="h-7 w-28 rounded-full" />
                    <Skeleton className="h-7 w-20 rounded-full" />
                  </div>
                </div>
              </div>
            </GlassCard>

            <div className="grid grid-cols-3 gap-3">
              <GlassCard className="px-3 py-3 text-center soft-shadow">
                <Skeleton className="h-5 w-16 mx-auto" />
                <Skeleton className="h-3 w-12 mx-auto mt-2" />
              </GlassCard>
              <GlassCard className="px-3 py-3 text-center soft-shadow">
                <Skeleton className="h-5 w-16 mx-auto" />
                <Skeleton className="h-3 w-16 mx-auto mt-2" />
              </GlassCard>
              <GlassCard className="px-3 py-3 text-center soft-shadow">
                <Skeleton className="h-5 w-16 mx-auto" />
                <Skeleton className="h-3 w-12 mx-auto mt-2" />
              </GlassCard>
            </div>

            <div className="space-y-3">
              <Skeleton className="h-3 w-24 ml-1 rounded-md" />
              <GlassCard className="flex items-center gap-4 p-4 soft-shadow">
                <Skeleton className="h-11 w-11 rounded-2xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-16 rounded-md" />
                  <Skeleton className="h-4 w-44 rounded-md" />
                </div>
              </GlassCard>
              <GlassCard className="flex items-center gap-4 p-4 soft-shadow">
                <Skeleton className="h-11 w-11 rounded-2xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-16 rounded-md" />
                  <Skeleton className="h-4 w-56 rounded-md" />
                </div>
              </GlassCard>
            </div>

            <div className="space-y-2">
              <Skeleton className="h-3 w-24 ml-1 rounded-md" />
              <GlassCard className="p-1">
                <div className="h-14 px-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-5 w-5 rounded-md" />
                    <Skeleton className="h-4 w-24 rounded-md" />
                  </div>
                  <Skeleton className="h-4 w-4 rounded-md" />
                </div>
                <div className="h-px bg-border mx-4" />
                <div className="h-14 px-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-5 w-5 rounded-md" />
                    <Skeleton className="h-4 w-20 rounded-md" />
                  </div>
                  <Skeleton className="h-4 w-4 rounded-md" />
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SheetDrawer({
  open,
  title,
  description,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  const ENTER_MS = 420;
  const EXIT_MS = 340;
  const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

  useEffect(() => {
    if (open) {
      setMounted(true);
      const raf = requestAnimationFrame(() => setVisible(true));

      const onKeyDown = (e: KeyboardEvent) => e.key === "Escape" && onClose();
      document.addEventListener("keydown", onKeyDown);

      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      return () => {
        cancelAnimationFrame(raf);
        document.removeEventListener("keydown", onKeyDown);
        document.body.style.overflow = prevOverflow;
      };
    }

    setVisible(false);
    const t = window.setTimeout(() => setMounted(false), EXIT_MS);
    return () => window.clearTimeout(t);
  }, [open, onClose]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0"
        style={{
          backgroundColor: visible ? "rgba(0,0,0,0.42)" : "rgba(0,0,0,0)",
          backdropFilter: visible ? "blur(2px)" : "blur(0px)",
          transition: `background-color ${visible ? ENTER_MS : EXIT_MS}ms ${EASE}, backdrop-filter ${
            visible ? ENTER_MS : EXIT_MS
          }ms ${EASE}, opacity ${visible ? ENTER_MS : EXIT_MS}ms ${EASE}`,
          opacity: visible ? 1 : 0,
        }}
      />

      <div className="absolute inset-x-0 bottom-0 w-full pb-[env(safe-area-inset-bottom)]">
        <div
          className="w-full rounded-t-3xl border border-border bg-card/95 backdrop-blur-xl shadow-2xl will-change-transform"
          style={{
            transform: visible ? "translateY(0px)" : "translateY(28px)",
            opacity: visible ? 1 : 0,
            transition: `transform ${visible ? ENTER_MS : EXIT_MS}ms ${EASE}, opacity ${
              visible ? ENTER_MS : EXIT_MS
            }ms ${EASE}`,
          }}
        >
          <div className="px-5 pt-4">
            <div className="mx-auto h-1.5 w-12 rounded-full bg-muted" />
          </div>

          <div className="flex items-start justify-between gap-3 px-5 pt-4">
            <div className="min-w-0">
              <h3 className="text-lg font-black text-foreground">{title}</h3>
              {description ? (
                <p className="mt-1 text-sm font-medium text-muted-foreground">
                  {description}
                </p>
              ) : null}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="grid h-10 w-10 place-items-center rounded-2xl border border-border bg-card text-muted-foreground hover:text-foreground"
              style={{
                transition: `transform 220ms ${EASE}, background-color 220ms ${EASE}, color 220ms ${EASE}`,
              }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="px-5 pb-6 pt-5 max-h-[calc(100dvh-7rem)] overflow-y-auto overscroll-contain">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function bytesToMb(n: number) {
  return Math.round((n / (1024 * 1024)) * 10) / 10;
}

export function ProfileScreen({ userMode }: ProfileScreenProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { openAuthDrawer } = useAuthDrawer();

  const [editOpen, setEditOpen] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [editName, setEditName] = useState("");
  const [editImage, setEditImage] = useState<string>("");

  const [avatarFailed, setAvatarFailed] = useState(false);

  const fileRef = useRef<HTMLInputElement | null>(null);
  const [pickedFile, setPickedFile] = useState<File | null>(null);
  const [pickedPreview, setPickedPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [phoneForVerify, setPhoneForVerify] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(0);

  const [driverProfile, setDriverProfile] = useState<DriverProfile | null>(
    null,
  );
  const [driverStats, setDriverStats] = useState<DriverStats | null>(null);
  const [driverSaveLoading, setDriverSaveLoading] = useState(false);
  const [driverSaveError, setDriverSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") openAuthDrawer({ selectedRole: userMode });
  }, [status]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = window.setInterval(
      () => setResendIn((s) => Math.max(0, s - 1)),
      1000,
    );
    return () => window.clearInterval(t);
  }, [resendIn]);

  useEffect(() => {
    if (status !== "authenticated") return;
    let mounted = true;

    (async () => {
      setIsLoading(true);
      setProfileError(null);
      try {
        const res = await fetch("/api/users/me", {
          method: "GET",
          cache: "no-store",
        });
        const json = await res.json().catch(() => null);
        if (!res.ok) throw new Error(json?.error ?? "Unable to load profile.");
        if (!mounted) return;
        setProfile(json?.user ?? null);
      } catch (e) {
        if (!mounted) return;
        setProfileError(
          e instanceof Error ? e.message : "Unable to load profile.",
        );
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [status]);

  const derived = useMemo(() => {
    const role: AppRole =
      (profile?.role as AppRole | null) ??
      ((session?.user as any)?.role as AppRole | undefined) ??
      (userMode === "driver" ? "driver" : "passenger");

    const name = profile?.name ?? session?.user?.name ?? "User";
    const email = profile?.email ?? session?.user?.email ?? "Not provided";
    const phone = profile?.phone ?? "Not provided";
    const memberSince = formatDate(profile?.created_at);
    const avatarUrl = profile?.image ?? session?.user?.image ?? null;

    const initialsSource = name || email || "U";
    const initials =
      initialsSource
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join("") || "U";

    return {
      role,
      name,
      email,
      phone,
      memberSince,
      avatarUrl,
      initials,
      phoneVerified: Boolean(profile?.phone_verified),
      providerLabel: formatProvider(
        profile?.provider ?? (session?.user as any)?.provider,
      ),
    };
  }, [profile, session?.user, userMode]);

  useEffect(() => {
    setAvatarFailed(false);
  }, [derived.avatarUrl]);

  useEffect(() => {
    if (status !== "authenticated") return;
    if (derived.role !== "driver") return;

    let mounted = true;
    (async () => {
      const res = await fetch("/api/drivers/me", { cache: "no-store" });
      const json = await res.json().catch(() => null);
      if (!mounted) return;
      if (res.ok) {
        setDriverProfile(json?.driver_profile ?? null);
        setDriverStats(json?.stats ?? { completed_rides: 0 });
      }
    })();

    return () => {
      mounted = false;
    };
  }, [status, derived.role]);

  useEffect(() => {
    if (!pickedFile) {
      setPickedPreview(null);
      return;
    }
    const url = URL.createObjectURL(pickedFile);
    setPickedPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [pickedFile]);

  const isDriver = derived.role === "driver";
  const driverVerified = Boolean(driverProfile?.verified);
  const completedRides = Number(driverStats?.completed_rides ?? 0);

  const openEdit = () => {
    setSaveError(null);
    setUploadError(null);
    setOtpError(null);

    setOtp("");
    setOtpSent(false);
    setResendIn(0);

    setEditName(profile?.name ?? session?.user?.name ?? "");
    setEditImage(profile?.image ?? session?.user?.image ?? "");
    setPhoneForVerify(profile?.phone ?? "");

    setPickedFile(null);
    setEditOpen(true);
  };

  const saveBasicProfile = async () => {
    setSaveError(null);
    setSaveLoading(true);
    try {
      const payload = {
        name: editName.trim() || null,
        image: editImage.trim() || null,
      };

      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error ?? "Failed to save profile.");
      setProfile(json?.user ?? null);
      setPickedFile(null);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Failed to save profile.");
    } finally {
      setSaveLoading(false);
    }
  };

  const pickAvatar = (file: File | null) => {
    setUploadError(null);
    if (!file) {
      setPickedFile(null);
      return;
    }
    if (!file.type.startsWith("image/")) {
      setUploadError("Please choose an image file.");
      return;
    }
    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      setUploadError(
        `Image is too large (${bytesToMb(file.size)}MB). Max is 5MB.`,
      );
      return;
    }
    setPickedFile(file);
  };

  const uploadAvatar = async () => {
    setUploadError(null);
    if (!pickedFile) {
      setUploadError("Choose an image first.");
      return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", pickedFile);

      const res = await fetch("/api/users/me/avatar", {
        method: "POST",
        body: form,
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error ?? "Failed to upload avatar.");

      const url = typeof json?.url === "string" ? json.url : "";
      if (!url) throw new Error("Upload succeeded but no URL returned.");

      setEditImage(url);
      setPickedFile(null);
    } catch (e) {
      setUploadError(
        e instanceof Error ? e.message : "Failed to upload avatar.",
      );
    } finally {
      setUploading(false);
    }
  };

  const startPhoneVerification = async () => {
    setOtpError(null);
    setOtpLoading(true);
    try {
      const phone = phoneForVerify.trim();
      if (!phone) throw new Error("Enter a phone number first.");
      if (resendIn > 0) return;

      const res = await fetch("/api/users/phone/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const json = await res.json().catch(() => null);

      if (res.status === 429) {
        const retry = Math.max(1, Number(json?.retry_after ?? 60));
        setResendIn(retry);
        setOtpSent(true);
        throw new Error(
          json?.error ?? "Please wait before requesting another code.",
        );
      }

      if (!res.ok) throw new Error(json?.error ?? "Failed to send code.");

      setOtp("");
      setOtpSent(true);
      setResendIn(60);
    } catch (e) {
      setOtpError(e instanceof Error ? e.message : "Failed to send code.");
    } finally {
      setOtpLoading(false);
    }
  };

  const verifyPhoneCode = async () => {
    setOtpError(null);
    setOtpLoading(true);
    try {
      const phone = phoneForVerify.trim();
      const code = otp.trim();
      if (!phone) throw new Error("Phone is required.");
      if (code.length !== 6) throw new Error("Enter the 6-digit code.");

      const res = await fetch("/api/users/phone/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code }),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error ?? "Verification failed.");

      setProfile(json?.user ?? null);
      setOtp("");
      setOtpSent(false);
      setResendIn(0);
    } catch (e) {
      setOtpError(e instanceof Error ? e.message : "Verification failed.");
    } finally {
      setOtpLoading(false);
    }
  };

  const saveDriverDetails = async () => {
    setDriverSaveError(null);
    setDriverSaveLoading(true);
    try {
      const res = await fetch("/api/drivers/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          national_id: (driverProfile?.national_id ?? "").trim() || null,
          driving_license:
            (driverProfile?.driving_license ?? "").trim() || null,
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok)
        throw new Error(json?.error ?? "Failed to save driver details.");
      setDriverProfile(json?.driver_profile ?? null);
    } catch (e) {
      setDriverSaveError(
        e instanceof Error ? e.message : "Failed to save driver details.",
      );
    } finally {
      setDriverSaveLoading(false);
    }
  };

  if (
    status === "loading" ||
    (status === "authenticated" && isLoading && !profile)
  )
    return <ProfileSkeleton />;

  if (status === "unauthenticated") {
    return (
      <div className="min-h-[100dvh] overflow-y-auto overscroll-contain">
        <div className="px-4 pb-24 space-y-4">
          <p className="text-sm font-medium text-foreground text-center m-0 py-1">
            Welcome to Your Account
          </p>
          <GlassCard className="p-6 text-center">
            <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/10">
              <Lock className="h-6 w-6 text-primary" />
            </div>

            <h2 className="text-xl font-black text-foreground">
              Sign in to view your profile
            </h2>
            <p className="mt-2 text-sm font-medium text-muted-foreground">
              Continue with sign in or create a new account.
            </p>

            <button
              type="button"
              onClick={() => openAuthDrawer({ selectedRole: userMode })}
              className="mt-4 w-full rounded-2xl bg-primary py-3 text-sm font-black uppercase tracking-wide text-primary-foreground transition-opacity duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:opacity-95"
            >
              Sign In / Sign Up
            </button>
          </GlassCard>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh]">
      <div className="mx-auto w-full max-w-md pb-24 pt-4">
        <div className="pb-[calc(6rem+env(safe-area-inset-bottom))] overflow-x-hidden space-y-5">
          {profileError ? (
            <StateFeedback
              state="error"
              title="Profile unavailable"
              message={profileError}
            />
          ) : null}

          <div className="relative">
            <div className="absolute inset-x-0 -top-5 h-20 rounded-[28px] bg-primary/12 blur-2xl" />
            <GlassCard className="relative overflow-hidden">
              <div className="p-5 text-center">
                <div className="mx-auto mb-3 grid place-items-center">
                  <div className="relative h-20 w-20 rounded-full overflow-hidden border border-border bg-muted">
                    {derived.avatarUrl && !avatarFailed ? (
                      <Image
                        src={derived.avatarUrl}
                        alt={`${derived.name} avatar`}
                        fill
                        sizes="80px"
                        className="object-cover"
                        priority
                        onError={() => setAvatarFailed(true)}
                      />
                    ) : (
                      <div className="h-full w-full grid place-items-center bg-primary/12">
                        <span className="text-2xl font-black text-primary">
                          {derived.initials}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <h2 className="text-[18px] sm:text-xl font-black text-foreground leading-tight">
                  {derived.name}
                </h2>

                <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                  <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[12px] font-semibold text-foreground">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <span>{isDriver ? "Driver" : "Passenger"}</span>
                  </div>

                  {isDriver ? (
                    <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[12px] font-bold text-foreground">
                      <BadgeCheck
                        className={`h-4 w-4 ${driverVerified ? "text-emerald-600" : "text-amber-600"}`}
                      />
                      <span>{driverVerified ? "Verified" : "Unverified"}</span>
                    </div>
                  ) : null}

                  <button
                    type="button"
                    onClick={openEdit}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[12px] font-bold text-foreground hover:bg-accent/40 transition-[transform,background-color,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98]"
                  >
                    <Pencil className="h-4 w-4 text-primary" />
                    Edit
                  </button>
                </div>
              </div>
            </GlassCard>
          </div>

          <OverviewStats
            isDriver={isDriver}
            driverVerified={driverVerified}
            completedRides={completedRides}
            memberSince={derived.memberSince}
          />

          <section className="space-y-3">
            <p className="px-1 text-[11px] font-black text-muted-foreground tracking-widest">
              CONTACT
            </p>

            <InfoRow
              icon={Phone}
              label="Phone"
              value={derived.phone || "Not provided"}
              right={
                <span
                  className={[
                    "inline-flex items-center rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-black",
                    derived.phoneVerified
                      ? "text-emerald-700"
                      : "text-amber-700",
                  ].join(" ")}
                >
                  {derived.phoneVerified ? "Verified" : "Unverified"}
                </span>
              }
            />

            <InfoRow
              icon={Mail}
              label="Email"
              value={derived.email || "Not provided"}
            />
          </section>

          <section className="space-y-2">
            <p className="px-1 text-[11px] font-black text-muted-foreground tracking-widest">
              LEGAL
            </p>
            <GlassCard className="p-1">
              <ActionButton
                icon={FileText}
                label="Terms & Conditions"
                onClick={() => router.push("/legal/terms")}
              />
              <div className="h-px bg-border mx-4" />
              <ActionButton
                icon={ShieldCheck}
                label="Privacy Policy"
                onClick={() => router.push("/legal/privacy")}
              />
              <div className="h-px bg-border mx-4" />
              <ActionButton
                icon={Cookie}
                label="Cookie Policy"
                onClick={() => router.push("/legal/cookies")}
              />
            </GlassCard>
          </section>

          <section className="space-y-2">
            <p className="px-1 text-[11px] font-black text-muted-foreground tracking-widest">
              SETTINGS
            </p>
            <GlassCard className="p-1">
              <SettingsThemeToggle />
              <div className="h-px bg-border mx-4" />
              <SettingsLanguageToggle />
            </GlassCard>
          </section>

          <section className="space-y-2">
            <p className="px-1 text-[11px] font-black text-muted-foreground tracking-widest">
              ACCOUNT
            </p>
            <GlassCard className="p-1">
              <ActionButton
                icon={LogOut}
                label="Log out"
                destructive
                onClick={() => signOut({ callbackUrl: "/" })}
              />
            </GlassCard>
          </section>
        </div>

        <SheetDrawer
          open={editOpen}
          title="Edit profile"
          description="Update your account details."
          onClose={() => setEditOpen(false)}
        >
          {saveError ? (
            <div className="mb-4 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive">
              {saveError}
            </div>
          ) : null}

          <div className="space-y-4">
            <div className="space-y-4 rounded-2xl border border-border bg-card p-4">
              <p className="text-sm font-black text-foreground">Basic</p>

              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 rounded-2xl overflow-hidden border border-border bg-muted shrink-0">
                    {pickedPreview ? (
                      <Image
                        src={pickedPreview}
                        alt="New avatar preview"
                        fill
                        className="object-cover"
                      />
                    ) : editImage ? (
                      <Image
                        src={editImage}
                        alt="Current avatar"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full grid place-items-center bg-primary/12">
                        <ImageIcon className="h-5 w-5 text-primary" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-black text-foreground">
                      Profile picture
                    </p>
                    <p className="mt-1 text-xs font-semibold text-muted-foreground">
                      PNG/JPG/WebP. Max 5MB.
                    </p>

                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => pickAvatar(e.target.files?.[0] ?? null)}
                    />

                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        disabled={uploading || saveLoading || otpLoading}
                        aria-label="Choose profile picture"
                        title="Choose"
                        className="h-10 w-10 rounded-2xl border border-border bg-card text-foreground hover:bg-accent/40 disabled:opacity-70 inline-flex items-center justify-center"
                      >
                        <Upload className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={uploadAvatar}
                        disabled={!pickedFile || uploading || saveLoading}
                        className="h-10 px-4 rounded-2xl bg-primary text-sm font-black text-primary-foreground hover:opacity-95 disabled:opacity-70 inline-flex items-center gap-2"
                      >
                        {uploading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : null}
                        Upload
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setPickedFile(null);
                          setEditImage("");
                        }}
                        disabled={uploading || saveLoading}
                        aria-label="Remove profile picture"
                        title="Remove"
                        className="h-10 w-10 rounded-2xl border border-border bg-card text-foreground hover:bg-accent/40 disabled:opacity-70 inline-flex items-center justify-center"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {uploadError ? (
                      <div className="mt-3 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive">
                        {uploadError}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              <Input
                icon={User}
                label="Full name"
                value={editName}
                onChange={setEditName}
                placeholder="e.g. Dennis Mwangi"
                disabled={saveLoading}
              />

              <button
                type="button"
                onClick={saveBasicProfile}
                disabled={saveLoading || uploading}
                className="h-12 w-full rounded-2xl bg-primary text-sm font-black text-primary-foreground hover:opacity-95 transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] disabled:opacity-70 inline-flex items-center justify-center gap-2 active:scale-[0.985]"
              >
                {saveLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                Save basic details
              </button>
            </div>

            <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
              <p className="text-sm font-black text-foreground">
                Phone verification
              </p>

              <p className="text-xs font-semibold text-muted-foreground">
                Status:{" "}
                <span
                  className={
                    derived.phoneVerified
                      ? "text-emerald-600"
                      : "text-amber-600"
                  }
                >
                  {derived.phoneVerified ? "Verified" : "Not verified"}
                </span>
              </p>

              <Input
                icon={Phone}
                label="Phone number"
                value={phoneForVerify}
                onChange={setPhoneForVerify}
                placeholder="e.g. +2547..."
                disabled={otpLoading}
              />

              {otpSent ? (
                <Input
                  icon={Lock}
                  label="6-digit code"
                  value={otp}
                  onChange={setOtp}
                  placeholder="123456"
                  disabled={otpLoading}
                  type="text"
                />
              ) : null}

              {otpError ? (
                <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive">
                  {otpError}
                </div>
              ) : null}

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={startPhoneVerification}
                  disabled={
                    otpLoading || !phoneForVerify.trim() || resendIn > 0
                  }
                  className="h-12 rounded-2xl border border-border bg-card text-sm font-black text-foreground hover:bg-accent/40 disabled:opacity-70"
                >
                  {resendIn > 0
                    ? `Resend in ${resendIn}s`
                    : otpSent
                      ? "Resend code"
                      : "Send code"}
                </button>

                <button
                  type="button"
                  onClick={verifyPhoneCode}
                  disabled={otpLoading || !otpSent || otp.trim().length !== 6}
                  className="h-12 rounded-2xl bg-primary text-sm font-black text-primary-foreground hover:opacity-95 disabled:opacity-70"
                >
                  {otpLoading && otpSent ? "Verifying..." : "Verify"}
                </button>
              </div>
            </div>

            {isDriver ? (
              <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-black text-foreground">
                    Driver verification
                  </p>
                  <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-black">
                    <BadgeCheck
                      className={`h-4 w-4 ${driverVerified ? "text-emerald-600" : "text-amber-600"}`}
                    />
                    {driverVerified ? "Verified" : "Unverified"}
                  </span>
                </div>

                {driverSaveError ? (
                  <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive">
                    {driverSaveError}
                  </div>
                ) : null}

                <Input
                  icon={User}
                  label="National ID"
                  value={String(driverProfile?.national_id ?? "")}
                  onChange={(v) =>
                    setDriverProfile((prev) => ({
                      ...(prev ?? {}),
                      national_id: v,
                    }))
                  }
                  placeholder="e.g. 12345678"
                  disabled={driverSaveLoading}
                />

                <Input
                  icon={Lock}
                  label="Driving license"
                  value={String(driverProfile?.driving_license ?? "")}
                  onChange={(v) =>
                    setDriverProfile((prev) => ({
                      ...(prev ?? {}),
                      driving_license: v,
                    }))
                  }
                  placeholder="e.g. DL-XXXXX"
                  disabled={driverSaveLoading}
                />

                <button
                  type="button"
                  onClick={saveDriverDetails}
                  disabled={driverSaveLoading}
                  className="h-12 w-full rounded-2xl border border-border bg-card text-sm font-black text-foreground hover:bg-accent/40 disabled:opacity-70 inline-flex items-center justify-center gap-2"
                >
                  {driverSaveLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  Save driver details
                </button>

                <p className="text-xs font-semibold text-muted-foreground">
                  Verification is completed after admin review.
                </p>
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => setEditOpen(false)}
              className="h-12 w-full rounded-2xl border border-border bg-card text-sm font-black text-foreground hover:bg-accent/40 transition-[transform,background-color,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.985]"
            >
              Done
            </button>
          </div>
        </SheetDrawer>

      </div>
    </div>
  );
}
