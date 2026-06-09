'use client';

import { ProgramsPage } from '@/page-components/ProgramsPage';

export default function Programs() {
  return (
    <div>
      <div className="bg-amber-900/20 border border-amber-400/30 p-3 mb-4 rounded text-sm">
        Note: Education pillar has moved to the new <a href="/learn" className="underline">/learn</a> route as part of the Super Bundle vision (free core + premium). 
        This page is legacy — see <a href="/bundle" className="underline">Super Bundle</a> and <a href="/vision" className="underline">vision.md</a> for the full free-for-all + holistic model.
      </div>
      <ProgramsPage />
    </div>
  );
}
