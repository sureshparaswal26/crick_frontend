"use client";

import * as React from "react";
import useSWR from "swr";
import { motion } from "framer-motion";
import Link from "next/link";
import { api } from "@/lib/api";
import { TeamLogo } from "@/components/TeamLogo";
import type { MatchListItem, NewsItem } from "@/lib/types";

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
};

function LiveScores() {
  const {
    data: matches,
    error,
    isLoading,
    mutate,
  } = useSWR(
    "matches",
    () => api.getMatches(),
    // { refreshInterval: 30000 }
  );

  if (error) {
    return (
      <section className="card p-6">
        <p className="text-red-600">Failed to load matches.</p>
        <button onClick={() => mutate()} className="btn-primary mt-2">
          Retry
        </button>
      </section>
    );
  }

  return (
    <motion.section className="space-y-4" {...fadeIn}>
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0ea5e9] border-t-transparent" />
        </div>
      ) : matches?.length ? (
        <div className="scroll-sky flex gap-4 overflow-x-auto pb-2">
          {matches.map((m, i) => (
            <MatchCard key={m.id} match={m} index={i} />
          ))}
        </div>
      ) : (
        <div className="card p-8 text-center text-slate-500">
          No live matches at the moment.
        </div>
      )}
    </motion.section>
  );
}

function encodeMatchPayload(m: MatchListItem) {
  const payload = {
    id: m.id,
    name: m.name,
    venue: m.venue,
    status: m.status,
    matchType: m.matchType,
    teams: m.teams,
    teamInfo: m.teamInfo,
    score: m.score,
    scoreDetail: m.scoreDetail,
    isLive: m.isLive,
  };
  const json = JSON.stringify(payload);
  const base64 = btoa(unescape(encodeURIComponent(json)));
  return encodeURIComponent(base64);
}

function MatchCard({ match, index }: { match: MatchListItem; index: number }) {
  const statusLower = match.status?.toLowerCase() || '';
  const isLive =
    match.isLive === true ||
    statusLower.includes('live') ||
    statusLower.includes('started') ||
    statusLower.includes('stumps') ||
    statusLower.includes('day 1') ||
    statusLower.includes('day 2') ||
    statusLower.includes('day 3') ||
    statusLower.includes('in progress') ||
    statusLower === 'in';
  const teams =
    match.teams?.length >= 2
      ? match.teams
      : match.teamInfo?.map((t) => t.shortname || t.name) || ["TBC", "TBC"];
  const score1 = match.scoreDetail?.[0];
  const score2 = match.scoreDetail?.[1];
  const scoreStr =
    match.score ||
    (score1 && score2
      ? `${teams[0]} ${score1.r}/${score1.w} (${score1.o}) | ${teams[1]} ${score2.r}/${score2.w} (${score2.o})`
      : null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="shrink-0"
    >
      <Link
        href={`/match/${match.id}?m=${encodeMatchPayload(match)}`}
        className={`card relative block w-[280px] overflow-visible border-l-4 p-4 transition hover:shadow-lg active:scale-[0.99] ${
          isLive ? 'border-l-[#dc2626]' : 'border-l-[#0ea5e9] hover:border-l-[#0284c7]'
        }`}
      >
        {isLive && (
          <span
            className="absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-md"
            style={{ backgroundColor: '#dc2626' }}
          >
            <span
              className="inline-block h-2 w-2 flex-shrink-0 rounded-full bg-white"
              style={{ animation: 'live-pulse 1.5s ease-in-out infinite' }}
            />
            Live
          </span>
        )}
        <p className={`text-xs font-medium text-[#0369a1] line-clamp-1 ${isLive ? 'pt-8' : ''}`}>
          {match.name}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <span className="rounded bg-[#e0f2fe] px-2 py-0.5 text-xs font-semibold text-[#0284c7]">
            {match.matchType}
          </span>
        </div>
        <div className="mt-3 space-y-1 text-sm font-semibold text-slate-800">
          {score1 && (
            <p className="flex items-center gap-2">
              <TeamLogo
                src={match.teamInfo?.[0]?.img}
                name={match.teamInfo?.[0]?.name}
                shortname={match.teamInfo?.[0]?.shortname}
                size="sm"
              />
              {teams[0]} {score1.r}-{score1.w} ({score1.o})
            </p>
          )}
          {score2 && (
            <p className="flex items-center gap-2">
              <TeamLogo
                src={match.teamInfo?.[1]?.img}
                name={match.teamInfo?.[1]?.name}
                shortname={match.teamInfo?.[1]?.shortname}
                size="sm"
              />
              {teams[1]} {score2.r}-{score2.w} ({score2.o})
            </p>
          )}
        </div>
        {scoreStr && (
          <p className="mt-2 text-sm font-medium text-[#0284c7] line-clamp-2">
            {scoreStr}
          </p>
        )}
        <p className="mt-2 text-xs text-slate-500 line-clamp-1">
          {match.venue}
        </p>
      </Link>
    </motion.div>
  );
}

function MatchChips({ matches }: { matches: MatchListItem[] }) {
  return (
    <div className="scroll-sky flex gap-2 overflow-x-auto pb-1">
      {matches.slice(0, 8).map((m) => {
        const teams =
          m.teams?.length >= 2
            ? m.teams
            : m.teamInfo?.map((t) => t.shortname || t.name) || ["TBC", "TBC"];
        const short = `${teams[0]?.slice(0, 2) || ""} vs ${teams[1]?.slice(0, 2) || ""}`;
        return (
          <Link
            key={m.id}
            href={`/match/${m.id}?m=${encodeMatchPayload(m)}`}
            className="shrink-0 rounded-lg bg-white px-3 py-2 text-sm font-medium text-[#0284c7] shadow-sm ring-1 ring-[#0ea5e9]/40 transition hover:bg-[#e0f2fe] hover:ring-[#0ea5e9] active:scale-[0.98] active:bg-[#bae6fd]"
          >
            {short} {m.status?.includes("won") ? `- ${m.status}` : ""}
          </Link>
        );
      })}
    </div>
  );
}

function LatestNews() {
  const { data: news, error, isLoading } = useSWR("news", () => api.getNews());

  if (error) {
    return (
      <div className="card p-6">
        <p className="text-slate-500">Unable to load news.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="card flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0ea5e9] border-t-transparent" />
      </div>
    );
  }

  if (!news?.length) {
    return (
      <div className="card p-8 text-center text-slate-500">
        No news at the moment.
      </div>
    );
  }

  return (
    <motion.section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" {...fadeIn}>
      {news.map((item: NewsItem, i: number) => (
        <motion.a
          key={item.id}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="card block p-4 transition hover:border-[#0ea5e9] hover:shadow-md active:scale-[0.99]"
        >
          <h3 className="font-display font-semibold text-slate-800 line-clamp-2">
            {item.title}
          </h3>
          <p className="mt-2 text-sm text-slate-600 line-clamp-2">
            {item.summary}
          </p>
          <p className="mt-2 text-xs text-slate-400">
            {item.source}
            {item.publishedAt && (
              <span className="ml-2">
                · {new Date(item.publishedAt).toLocaleDateString()}
              </span>
            )}
          </p>
        </motion.a>
      ))}
    </motion.section>
  );
}

export default function HomePage() {
  const { data: matches } = useSWR("matches", () => api.getMatches(), {
    // refreshInterval: 30000,
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky header - sky theme */}
      <div className="sticky top-0 z-50 shadow-md">
        <header className="bg-[#0284c7]">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3">
            <Link
              href="/"
              className="flex items-center gap-3 touch-highlight rounded-md active:scale-[0.98]"
            >
              <img
                src="/logo.svg"
                alt=""
                className="h-9 w-9 shrink-0 rounded-full"
              />
              <span className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                Live from the pitch
              </span>
            </Link>
            <nav className="flex flex-wrap items-center gap-1 text-sm text-white/95">
              <Link
                href="/"
                className="rounded-lg px-3 py-2 font-medium hover:bg-white/20 active:bg-white/30 active:scale-[0.98]"
              >
                Live Scores
              </Link>
            </nav>
          </div>
        </header>

        {/* MATCHES strip - sticky below main nav */}
        <div className="border-b border-sky-200/80 bg-[#e0f2fe]">
          <div className="mx-auto max-w-7xl px-4 py-3">
            <div className="flex items-center gap-4">
              <span className="shrink-0 text-xs font-bold uppercase tracking-wider text-[#0369a1]">
                Matches
              </span>
              {matches?.length ? (
                <MatchChips matches={matches} />
              ) : (
                <span className="text-sm text-slate-500">Loading…</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-6">
        {/* Live score cards - horizontal scroll */}
        <section>
          <h2 className="mb-3 font-display text-lg font-bold text-[#0369a1]">
            Live Scores
          </h2>
          <LiveScores />
        </section>

        {/* Latest News */}
        {/* <section className="mt-10">
          <h2 className="mb-3 font-display text-lg font-bold text-[#0369a1]">
            Latest News
          </h2>
          <LatestNews />
        </section> */}
      </main>
    </div>
  );
}
