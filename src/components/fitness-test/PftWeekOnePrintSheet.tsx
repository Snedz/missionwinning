'use client';

import { PFT_WEEK_ONE_CHALLENGE } from '@/data/pftWeekOneChallenge';

type Props = {
  className: string;
  classCode: string;
};

/** Print-friendly Week 1 challenge — use window.print() from teacher dashboard. */
export function PftWeekOnePrintSheet({ className, classCode }: Props) {
  return (
    <div className="print-sheet hidden print:block text-black bg-white p-8 max-w-3xl mx-auto">
      <header className="border-b-2 border-black pb-4 mb-6">
        <h1 className="text-2xl font-bold">Week 1 Presidential Fitness Challenge</h1>
        <p className="text-sm mt-2">
          Class: <strong>{className}</strong> · Join code: <strong className="font-mono">{classCode}</strong>
        </p>
        <p className="text-xs mt-1 text-gray-600">
          Mission Winning — free educational fitness tool. Not an official U.S. government test.
        </p>
      </header>
      <ol className="space-y-4">
        {PFT_WEEK_ONE_CHALLENGE.map((day) => (
          <li key={day.day} className="break-inside-avoid">
            <h2 className="font-semibold">
              Day {day.day}: {day.title}{' '}
              <span className="text-sm font-normal text-gray-600">(~{day.minutes} min)</span>
            </h2>
            <p className="text-sm mt-1">
              <strong>Move:</strong> {day.move}
            </p>
            <p className="text-sm">
              <strong>Test prep:</strong> {day.testPrep}
            </p>
          </li>
        ))}
      </ol>
      <footer className="mt-8 pt-4 border-t text-xs text-gray-600">
        Students: join at missionwinning.com/join/class/{classCode} · Log tests at /fitness-test
      </footer>
    </div>
  );
}
