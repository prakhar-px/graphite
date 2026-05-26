"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, Command, Menu, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { companies, getPlanWithStatuses } from "@/lib/data";
import { buildProblemRevisionIndex } from "@/engines/revision/selectors";
import { cn } from "@/lib/utils";
import {
  getComputedNotifications,
  useAppStore,
  useUserSnapshot,
} from "@/store/app-store";
import { Sidebar } from "./sidebar";

interface NavbarProps {
  title?: string;
  subtitle?: string;
}

export function Navbar({
  title = "Mission Control",
  subtitle = "FAANG / Microsoft DSA Prep",
}: NavbarProps) {
  const router = useRouter();
  const headerRef = useRef<HTMLElement>(null);
  const [query, setQuery] = useState("");

  const snapshot = useUserSnapshot();
  const dayStatuses = snapshot.dayStatuses;
  const setCommandOpen = useAppStore((s) => s.setCommandOpen);
  const setSearchOpen = useAppStore((s) => s.setSearchOpen);
  const setNotificationOpen = useAppStore((s) => s.setNotificationOpen);
  const commandOpen = useAppStore((s) => s.commandOpen);
  const searchOpen = useAppStore((s) => s.searchOpen);
  const notificationOpen = useAppStore((s) => s.notificationOpen);
  const readNotifications = useAppStore((s) => s.readNotifications);
  const markNotificationRead = useAppStore((s) => s.markNotificationRead);
  const markAllNotificationsRead = useAppStore((s) => s.markAllNotificationsRead);
  const toggleFocusMode = useAppStore((s) => s.toggleFocusMode);
  const setPlannerSelectedDay = useAppStore((s) => s.setPlannerSelectedDay);

  const notifications = getComputedNotifications(snapshot);
  const unreadCount = notifications.filter(
    (item) => !readNotifications.includes(item.id)
  ).length;

  const plan = getPlanWithStatuses(dayStatuses);

  const closeAll = () => {
    setCommandOpen(false);
    setSearchOpen(false);
    setNotificationOpen(false);
  };

  const openPanel = (panel: "search" | "command" | "notifications") => {
    setSearchOpen(panel === "search");
    setCommandOpen(panel === "command");
    setNotificationOpen(panel === "notifications");
  };

  const togglePanel = (panel: "search" | "command" | "notifications") => {
    const isOpen =
      panel === "search"
        ? searchOpen
        : panel === "command"
          ? commandOpen
          : notificationOpen;
    if (isOpen) closeAll();
    else openPanel(panel);
  };

  const results = useMemo(() => {
    if (!query.trim()) return [];

    const q = query.toLowerCase();

    const topicMatches = plan
      .filter((item) =>
        [
          item.topic,
          item.subtopic,
          item.learningGoal,
          ...(item.suggestedQuestions ?? []),
        ]
          .join(" ")
          .toLowerCase()
          .includes(q)
      )
      .slice(0, 4)
      .map((item) => ({
        id: `plan-${item.day}`,
        label: `Day ${item.day}: ${item.subtopic}`,
        detail: item.topic,
        type: "Planner",
        onSelect: () => {
          setPlannerSelectedDay(item.day);
          router.push("/planner");
        },
      }));

    const companyMatches = companies
      .filter((item) =>
        [item.company, item.focusAreas].join(" ").toLowerCase().includes(q)
      )
      .slice(0, 4)
      .map((item) => ({
        id: `company-${item.company}`,
        label: item.company,
        detail: item.focusAreas,
        type: "Company",
        onSelect: () => router.push("/companies"),
      }));

    const revisionMatches = buildProblemRevisionIndex(snapshot.solvedProblems)
      .filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.parentTopic.toLowerCase().includes(q)
      )
      .slice(0, 4)
      .map((item) => ({
        id: `revision-${item.identityKey}`,
        label: item.title,
        detail: `${item.parentTopic} · ${item.revisionCount} revision${item.revisionCount === 1 ? "" : "s"}`,
        type: "Revision",
        onSelect: () => router.push("/revision"),
      }));

    return [...topicMatches, ...companyMatches, ...revisionMatches].slice(0, 8);
  }, [query, plan, router, setPlannerSelectedDay, snapshot]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isMetaK =
        (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k";
      if (isMetaK) {
        event.preventDefault();
        setSearchOpen(false);
        setNotificationOpen(false);
        setCommandOpen(true);
      }
      if (event.key === "Escape") {
        setCommandOpen(false);
        setSearchOpen(false);
        setNotificationOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setCommandOpen, setNotificationOpen, setSearchOpen]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) {
        setSearchOpen(false);
        setNotificationOpen(false);
        setCommandOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [setCommandOpen, setNotificationOpen, setSearchOpen]);

  const commandActions = [
    {
      id: "route-dashboard",
      label: "Go to Dashboard",
      run: () => router.push("/dashboard"),
    },
    { id: "route-topics", label: "Go to Topics", run: () => router.push("/topics") },
    {
      id: "route-planner",
      label: "Go to Planner",
      run: () => router.push("/planner"),
    },
    {
      id: "route-revision",
      label: "Go to Revision",
      run: () => router.push("/revision"),
    },
    {
      id: "jump-today",
      label: "Jump to active day (Planner)",
      run: () => {
        const day =
          plan.find((item) => item.status.toLowerCase().includes("progress"))
            ?.day ?? 1;
        setPlannerSelectedDay(day);
        router.push("/planner");
      },
    },
    { id: "toggle-focus", label: "Toggle Focus Mode", run: () => toggleFocusMode() },
    {
      id: "open-notifications",
      label: "Open Notifications",
      run: () => openPanel("notifications"),
    },
  ];

  return (
    <header
      ref={headerRef}
      className="relative z-30 flex h-16 shrink-0 items-center justify-between border-b border-zinc-800/80 bg-[#09090B]/80 px-4 backdrop-blur-md lg:px-8"
    >
      <div className="flex items-center gap-3">
        <Sheet>
          <SheetTrigger
            className="lg:hidden inline-flex size-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
          >
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-64 border-zinc-800 bg-[#111113] p-0"
          >
            <Sidebar className="flex h-full border-0" />
          </SheetContent>
        </Sheet>
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-zinc-100">
            {title}
          </h1>
          <p className="text-xs text-zinc-500">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative hidden md:block">
          <div
            className={cn(
              "flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/50 px-3 py-1.5",
              searchOpen && "ring-1 ring-violet-500/40"
            )}
          >
            <Search className="h-4 w-4 shrink-0 text-zinc-500" />
            <input
              value={query}
              onFocus={() => openPanel("search")}
              onChange={(event) => {
                setQuery(event.target.value);
                openPanel("search");
              }}
              placeholder="Search topics..."
              className="w-44 bg-transparent text-sm text-zinc-200 outline-none placeholder:text-zinc-500 lg:w-52"
            />
            {query ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setSearchOpen(false);
                }}
                className="text-zinc-500 hover:text-zinc-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : (
              <kbd
                className="cursor-pointer rounded bg-zinc-800 px-1.5 text-[10px] text-zinc-500"
                onClick={() => openPanel("command")}
              >
                ⌘K
              </kbd>
            )}
          </div>
          {searchOpen && results.length > 0 ? (
            <div className="absolute right-0 top-[calc(100%+6px)] z-50 w-80 rounded-xl border border-zinc-800 bg-zinc-950 p-2 shadow-2xl">
              {results.map((result) => (
                <button
                  key={result.id}
                  type="button"
                  onClick={() => {
                    result.onSelect();
                    setQuery("");
                    closeAll();
                  }}
                  className="flex w-full items-start justify-between rounded-lg px-2 py-2 text-left hover:bg-zinc-900"
                >
                  <div>
                    <div className="text-sm text-zinc-100">{result.label}</div>
                    <div className="text-xs text-zinc-500">{result.detail}</div>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-zinc-500">
                    {result.type}
                  </span>
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="hidden text-zinc-400 hover:text-zinc-200 md:inline-flex"
          onClick={() => togglePanel("command")}
          aria-label="Command palette"
        >
          <Command className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="relative text-zinc-400 hover:text-zinc-200"
          onClick={() => togglePanel("notifications")}
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-violet-600 px-1 text-[10px] text-white">
              {Math.min(9, unreadCount)}
            </span>
          ) : null}
        </Button>
      </div>

      {commandOpen ? (
        <div className="absolute inset-x-4 top-[calc(100%+8px)] z-50 mx-auto max-w-md rounded-xl border border-zinc-800 bg-zinc-950 p-2 shadow-2xl md:inset-x-auto md:right-28 md:left-auto">
          <p className="px-2 py-1 text-[10px] uppercase tracking-wider text-zinc-500">
            Commands
          </p>
          {commandActions.map((action) => (
            <button
              key={action.id}
              type="button"
              onClick={() => {
                action.run();
                closeAll();
              }}
              className="w-full rounded-lg px-3 py-2 text-left text-sm text-zinc-200 hover:bg-zinc-900"
            >
              {action.label}
            </button>
          ))}
        </div>
      ) : null}

      {notificationOpen ? (
        <div className="absolute right-4 top-[calc(100%+8px)] z-50 w-[min(360px,calc(100vw-2rem))] rounded-xl border border-zinc-800 bg-zinc-950 p-3 shadow-2xl lg:right-8">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-medium text-zinc-100">Notifications</div>
            <button
              type="button"
              onClick={() =>
                markAllNotificationsRead(notifications.map((item) => item.id))
              }
              className="text-xs text-zinc-400 hover:text-zinc-200"
            >
              Mark all read
            </button>
          </div>
          <div className="graphite-scrollbar-inset max-h-80 space-y-2 overflow-y-auto pr-1">
            {notifications.length === 0 ? (
              <p className="px-2 py-4 text-center text-sm text-zinc-500">
                You&apos;re all caught up.
              </p>
            ) : (
              notifications.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => markNotificationRead(item.id)}
                  className={cn(
                    "w-full rounded-lg border px-3 py-2 text-left transition",
                    readNotifications.includes(item.id)
                      ? "border-zinc-800/80 bg-zinc-950/50 text-zinc-500"
                      : "border-zinc-700 bg-zinc-900 text-zinc-200"
                  )}
                >
                  <div className="text-sm">{item.title}</div>
                  <div className="mt-1 text-xs text-zinc-400">{item.detail}</div>
                </button>
              ))
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
