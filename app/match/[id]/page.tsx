'use client';

import { useParams, useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { TeamLogo } from '@/components/TeamLogo';
import type { BattingInnings, BowlingInnings, PlayingXITeam, CommentaryEntry } from '@/lib/types';

type TabId = 'info' | 'scorecard' | 'playingxi' | 'commentary';

function sr(runs: number, balls: number): string {
  if (!balls) return '-';
  return ((runs / balls) * 100).toFixed(1);
}

export default function MatchPage() {
  const params = useParams();
  const id = params?.id as string;
  const searchParams = useSearchParams();
  const encoded = searchParams.get('m');
  const [activeTab, setActiveTab] = useState<TabId>('info');

  const decodePayload = (value: string) => {
    try {
      const json = decodeURIComponent(escape(atob(decodeURIComponent(value))));
      return JSON.parse(json);
    } catch {
      return null;
    }
  };

  const payloadMatch = encoded ? decodePayload(encoded) : null;
  const shouldFetchInfo = !!id;

  const { data: matchInfo, error: infoError, isLoading: infoLoading, mutate: mutateInfo } = useSWR(
    shouldFetchInfo ? ['matchInfo', id] : null,
    () => api.getMatchInfo(id),
    { refreshInterval: 30000, revalidateOnFocus: false, revalidateOnReconnect: false }
  );

  if (!id) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <p className="text-slate-600">Invalid match.</p>
        <Link href="/" className="btn-primary mt-4 inline-block">Back to home</Link>
      </div>
    );
  }

  if (shouldFetchInfo && !payloadMatch && infoError) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <p className="text-red-600">Failed to load match.</p>
        <button onClick={() => mutateInfo()} className="btn-primary mt-4">Retry</button>
        <Link href="/" className="ml-2 inline-block text-sky-dark hover:underline">Home</Link>
      </div>
    );
  }

  const match =
    payloadMatch && matchInfo
      ? { ...payloadMatch, ...matchInfo }
      : (payloadMatch ?? matchInfo);
  const isLoadingMatch = shouldFetchInfo && !payloadMatch && infoLoading;

  const team1 = match?.teamInfo?.[0];
  const team2 = match?.teamInfo?.[1];
  const scores = Array.isArray(match?.score) ? match.score : [];
  const statusText = match?.status || '';
  const playingXI = (match?.playingXI || []) as PlayingXITeam[];
  const battingInnings = (match?.battingInnings || []) as BattingInnings[];
  const bowlingInnings = (match?.bowlingInnings || []) as BowlingInnings[];
  const commentary = (match?.commentary || []) as CommentaryEntry[];

  const tabs: { id: TabId; label: string }[] = [
    { id: 'info', label: 'MATCH INFO' },
    { id: 'scorecard', label: 'SCORECARD' },
    { id: 'playingxi', label: 'PLAYING XI' },
    { id: 'commentary', label: 'COMMENTARY' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-[var(--cricinfo-border)] bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2 text-slate-800 hover:opacity-90">
            <img src="/logo.svg" alt="" className="h-8 w-8 shrink-0 rounded-full" />
            <span className="text-lg font-bold">Live from the pitch</span>
          </Link>
          <Link
            href="/"
            className="text-sm text-[var(--cricinfo-link)] hover:underline"
          >
            ← Back to live scores
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        {isLoadingMatch ? (
          <div className="flex justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--cricinfo-red)] border-t-transparent" />
          </div>
        ) : match ? (
          <>
            {/* Match summary header */}
            <section className="card overflow-hidden border border-[var(--cricinfo-border)] p-0">
              <div className="border-b border-[var(--cricinfo-border)] bg-white px-4 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  {statusText && (
                    <span
                      className="rounded px-2 py-0.5 text-xs font-bold uppercase text-white"
                      style={{ backgroundColor: 'var(--cricinfo-red)' }}
                    >
                      {statusText}
                    </span>
                  )}
                  <span className="text-sm text-slate-500">
                    {match.name}
                    {match.venue && ` at ${match.venue}`}
                    {match.date && `, ${match.date}`}
                  </span>
                </div>
              </div>

              <div className="border-b border-[var(--cricinfo-border)] bg-[var(--cricinfo-header-bg)] px-4 py-4">
                <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
                  {team1 && (
                    <div className="flex items-center gap-2">
                      <TeamLogo src={team1.img} name={team1.name} shortname={team1.shortname} size="md" />
                      <span className="font-semibold text-slate-800">{team1.shortname || team1.name}</span>
                      <span className="text-slate-600">
                        {scores[0]
                          ? `${scores[0].r}${scores[0].w > 0 ? `/${scores[0].w}` : ''}${scores[0].o > 0 ? ` (${scores[0].o} ov)` : ''}`
                          : '–'}
                        {scores[2] != null ? ` & ${scores[2].r}/${scores[2].w} (${scores[2].o} ov)` : ''}
                      </span>
                    </div>
                  )}
                  {team2 && (
                    <div className="flex items-center gap-2">
                      <TeamLogo src={team2.img} name={team2.name} shortname={team2.shortname} size="md" />
                      <span className="font-semibold text-slate-800">{team2.shortname || team2.name}</span>
                      <span className="text-slate-600">
                        {scores[1]
                          ? `${scores[1].r}${scores[1].w > 0 ? `/${scores[1].w}` : ''}${scores[1].o > 0 ? ` (${scores[1].o} ov)` : ''}`
                          : '–'}
                        {scores[3] != null ? ` & ${scores[3].r}/${scores[3].w} (${scores[3].o} ov)` : ''}
                      </span>
                    </div>
                  )}
                </div>
                {match.matchWinner && (
                  <p className="mt-2 text-sm font-medium" style={{ color: 'var(--cricinfo-red)' }}>
                    {match.matchWinner} won the match
                  </p>
                )}
              </div>

              <div className="flex flex-wrap border-b border-[var(--cricinfo-border)] bg-white">
                {tabs.map(({ id: tab, label }) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`border-b-2 px-4 py-3 text-sm font-semibold transition ${
                      activeTab === tab
                        ? 'border-[var(--cricinfo-link)] text-[var(--cricinfo-link)]'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </section>

            {activeTab === 'info' && (
              <section className="card mt-6 border border-[var(--cricinfo-border)] p-6">
                <h2 className="mb-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Match details
                </h2>
                <div className="space-y-0">
                  {match.venue && (
                    <div className="match-detail-row">
                      <span className="match-detail-label">Venue</span>
                      <span className="match-detail-value font-semibold">{match.venue}</span>
                    </div>
                  )}
                  {(match.tossWinner || match.tossChoice) && (
                    <div className="match-detail-row">
                      <span className="match-detail-label">Toss</span>
                      <span className="match-detail-value">
                        {match.tossWinner}
                        {match.tossChoice && `, elected to ${match.tossChoice} first`}
                      </span>
                    </div>
                  )}
                  {match.date && (
                    <div className="match-detail-row">
                      <span className="match-detail-label">Match days</span>
                      <span className="match-detail-value">{match.date}</span>
                    </div>
                  )}
                  {match.matchType && (
                    <div className="match-detail-row">
                      <span className="match-detail-label">Format</span>
                      <span className="match-detail-value uppercase">{match.matchType}</span>
                    </div>
                  )}
                  {match.matchWinner && (
                    <div className="match-detail-row">
                      <span className="match-detail-label">Result</span>
                      <span className="match-detail-value font-semibold">{match.matchWinner} won</span>
                    </div>
                  )}
                </div>
              </section>
            )}

            {activeTab === 'scorecard' && (
              <section className="card mt-6 overflow-hidden border border-[var(--cricinfo-border)] p-0">
                {battingInnings.length > 0 || bowlingInnings.length > 0 ? (
                  <>
                    {battingInnings.map((inn, idx) => {
                      const bowl = bowlingInnings[idx];
                      return (
                        <div
                          key={idx}
                          className="border-b border-[var(--cricinfo-border)] last:border-b-0"
                        >
                          <div className="bg-[var(--cricinfo-header-bg)] px-4 py-2 text-sm font-semibold text-slate-700">
                            {inn.teamName} {inn.total && ` ${inn.total}`}
                            {inn.extras && ` ${inn.extras}`}
                          </div>
                          <table className="scorecard-table">
                            <thead>
                              <tr>
                                <th>Batting</th>
                                <th className="text-center">R</th>
                                <th className="text-center">B</th>
                                <th className="text-center">4s</th>
                                <th className="text-center">6s</th>
                                <th className="text-center">SR</th>
                              </tr>
                            </thead>
                            <tbody>
                              {inn.playerDetails.map((p, i) => {
                                const r = typeof p.runs === 'string' ? parseInt(p.runs, 10) || 0 : p.runs;
                                const b = typeof p.ballsFaced === 'string' ? parseInt(p.ballsFaced, 10) || 0 : (p.ballsFaced as number) || 0;
                                const fours = p.fours ?? '-';
                                const sixes = p.sixes ?? '-';
                                return (
                                  <tr key={i}>
                                    <td>
                                      <span className="font-medium text-[var(--cricinfo-link)]">{p.playerName}</span>
                                      {p.dismissal && (
                                        <span className="text-slate-500">
                                          {' '}
                                          {p.dismissal === 'not out' ? 'not out' : `(${p.dismissal})`}
                                        </span>
                                      )}
                                    </td>
                                    <td className="text-center">{p.runs !== '' && p.runs !== undefined ? p.runs : '–'}</td>
                                    <td className="text-center">{b ? b : '–'}</td>
                                    <td className="text-center">{fours}</td>
                                    <td className="text-center">{sixes}</td>
                                    <td className="text-center">{b ? sr(r, b) : '–'}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                          {inn.extras && (
                            <div className="border-t border-[var(--cricinfo-border)] px-4 py-2 text-sm text-slate-600">
                              Extras: {inn.extras}
                            </div>
                          )}
                          {inn.total && (
                            <div className="border-t border-[var(--cricinfo-border)] bg-slate-50 px-4 py-2 text-sm font-semibold">
                              Total: {inn.total}
                            </div>
                          )}
                          {bowl && bowl.playerDetails.length > 0 && (
                            <>
                              <div className="border-t-2 border-[var(--cricinfo-border)] bg-[var(--cricinfo-header-bg)] px-4 py-2 text-sm font-semibold text-slate-700">
                                Bowling – {bowl.teamName}
                              </div>
                              <table className="scorecard-table">
                                <thead>
                                  <tr>
                                    <th>Bowler</th>
                                    <th className="text-center">O</th>
                                    <th className="text-center">M</th>
                                    <th className="text-center">R</th>
                                    <th className="text-center">W</th>
                                    <th className="text-center">ECON</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {bowl.playerDetails.map((p, i) => (
                                    <tr key={i}>
                                      <td className="font-medium text-[var(--cricinfo-link)]">{p.playerName}</td>
                                      <td className="text-center">{p.overs ?? '–'}</td>
                                      <td className="text-center">{p.maidens ?? '–'}</td>
                                      <td className="text-center">{p.conceded ?? '–'}</td>
                                      <td className="text-center">{p.wickets ?? '–'}</td>
                                      <td className="text-center">{p.economyRate ?? '–'}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </>
                          )}
                        </div>
                      );
                    })}
                    {battingInnings.length === 0 && bowlingInnings.length > 0 && (
                      bowlingInnings.map((bowl, idx) => (
                        <div key={idx} className="border-b border-[var(--cricinfo-border)]">
                          <div className="bg-[var(--cricinfo-header-bg)] px-4 py-2 text-sm font-semibold text-slate-700">
                            Bowling – {bowl.teamName}
                          </div>
                          <table className="scorecard-table">
                            <thead>
                              <tr>
                                <th>Bowler</th>
                                <th className="text-center">O</th>
                                <th className="text-center">M</th>
                                <th className="text-center">R</th>
                                <th className="text-center">W</th>
                                <th className="text-center">ECON</th>
                              </tr>
                            </thead>
                            <tbody>
                              {bowl.playerDetails.map((p, i) => (
                                <tr key={i}>
                                  <td className="font-medium text-[var(--cricinfo-link)]">{p.playerName}</td>
                                  <td className="text-center">{p.overs ?? '–'}</td>
                                  <td className="text-center">{p.maidens ?? '–'}</td>
                                  <td className="text-center">{p.conceded ?? '–'}</td>
                                  <td className="text-center">{p.wickets ?? '–'}</td>
                                  <td className="text-center">{p.economyRate ?? '–'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ))
                    )}
                    {battingInnings.length === 0 && bowlingInnings.length === 0 && scores.length > 0 && (
                      <div className="p-6">
                        {scores.map((s: { inning: string; r: number; w: number; o: number }, i: number) => (
                          <div key={i} className="mb-4">
                            <div className="bg-[var(--cricinfo-header-bg)] px-4 py-2 text-sm font-semibold text-slate-700">
                              {s.inning} {s.r}{s.w > 0 ? `/${s.w}` : ''} {s.o > 0 ? `(${s.o} Ov)` : ''}
                            </div>
                            <p className="px-4 py-2 text-slate-600">Innings total: {s.r}/{s.w} ({s.o} overs)</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : scores.length > 0 ? (
                  <div className="p-6">
                    {scores.map((s: { inning: string; r: number; w: number; o: number }, i: number) => (
                      <div key={i} className="mb-4">
                        <div className="bg-[var(--cricinfo-header-bg)] px-4 py-2 text-sm font-semibold text-slate-700">
                          {s.inning} {s.r}{s.w > 0 ? `/${s.w}` : ''} {s.o > 0 ? `(${s.o} Ov)` : ''}
                        </div>
                        <p className="px-4 py-2 text-slate-600">Innings total: {s.r}/{s.w} ({s.o} overs)</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-6 py-8 text-center text-slate-500">
                    No scorecard available for this match.
                  </div>
                )}
              </section>
            )}

            {activeTab === 'playingxi' && (
              <section className="card mt-6 overflow-hidden border border-[var(--cricinfo-border)] p-0">
                {playingXI.length > 0 ? (
                  playingXI.map((team, tIdx) => (
                    <div
                      key={tIdx}
                      className={`border-[var(--cricinfo-border)] ${tIdx > 0 ? 'border-t-2' : ''}`}
                    >
                      <div className="bg-[var(--cricinfo-header-bg)] px-4 py-3 text-sm font-semibold text-slate-700">
                        {team.teamName} – Playing XI
                      </div>
                      <table className="scorecard-table">
                        <thead>
                          <tr>
                            <th className="w-10">#</th>
                            <th>Player</th>
                            <th>Batting</th>
                            <th>Bowling</th>
                            <th className="w-16">Captain</th>
                          </tr>
                        </thead>
                        <tbody>
                          {team.players.map((p, i) => (
                            <tr key={i}>
                              <td className="text-center">{i + 1}</td>
                              <td>
                                <span className="font-medium text-[var(--cricinfo-link)]">
                                  {p.displayName}
                                  {p.captain && ' (c)'}
                                </span>
                              </td>
                              <td className="text-slate-600">{p.battingStyle || '–'}</td>
                              <td className="text-slate-600">{p.bowlingStyle || '–'}</td>
                              <td className="text-center">{p.captain ? 'Yes' : '–'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))
                ) : (
                  <div className="px-6 py-8 text-center text-slate-500">
                    Playing XI not available for this match.
                  </div>
                )}
              </section>
            )}

            {activeTab === 'commentary' && (
              <section className="card mt-6 overflow-hidden border border-[var(--cricinfo-border)] p-0">
                <div className="border-b border-[var(--cricinfo-border)] bg-[var(--cricinfo-header-bg)] px-4 py-3 text-sm font-semibold text-slate-700">
                  Match commentary
                </div>
                {commentary.length > 0 ? (
                  <ul className="divide-y divide-[var(--cricinfo-border)]">
                    {commentary.map((entry, i) => (
                      <li key={i} className="px-4 py-3 text-sm text-slate-700">
                        {entry.dayNumber && (
                          <span className="mr-2 font-medium text-slate-500">Day {entry.dayNumber}:</span>
                        )}
                        {entry.text}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="px-6 py-8 text-center text-slate-500">
                    No commentary available for this match.
                  </div>
                )}
              </section>
            )}
          </>
        ) : (
          <p className="text-center text-slate-600">Match not found.</p>
        )}
      </main>
    </div>
  );
}
