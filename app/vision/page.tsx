export default function VisionPage() {
  // In production this would be better as MDX or static, but for now show key parts + link to file
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-4">Mission Winning Vision</h1>
      <p className="mb-6 text-white/70">The guiding document for the free global everything app for health. Core mission free for all. Super Bundle for synergy.</p>
      
      <div className="prose prose-invert max-w-none">
        <p><strong>The #1 Health "Everything App" for the World</strong></p>
        <p>Mission Winning exists to be the entrance to the path — the clear, evidence-based guide to the <em>right way</em> to build lifelong health, strength, resilience, and well-being for every human on Earth. It is the alternative to the path of destruction: average habits, excuses, short-term fixes, mediocrity, and the slow decline that comes from inconsistent or misguided approaches to the body and mind.</p>
        
        <p>We are building the everything app for health. Not another fragmented tool, but a unified, synergistic ecosystem where training, nutrition, mobility, mindfulness, activity tracking, and learning reinforce each other. One app. One mission. Accessible to <strong>everyone, everywhere</strong> — regardless of money, location, resources, or background.</p>

        <h2>Core Promise: Free Forever for the Mission</h2>
        <p>The fundamentals that make the world healthier must be available to all, with <strong>no money barrier</strong>.</p>
        <ul>
          <li>Workout tracking (the core mission) is 100% free, forever.</li>
          <li>Basic exercise library (bodyweight/minimal-equipment focused, global-friendly).</li>
          <li>Basic nutrition logging and accessible recipes.</li>
          <li>Basic assessments, streaks, challenges, and habit tools.</li>
          <li>Full PWA experience: installable, offline-first, low-data, works on any device/browser anywhere.</li>
        </ul>

        <p>"Those with no money should be able to utilize it to track workouts. The core mission should be available for everyone in the world."</p>

        <h2>The Super App Structure</h2>
        <p>Inspired by successful freemium + bundle models (notably Freeletics), Mission Winning is structured as modular "universes" or pillars. Each route/section is <strong>accessible</strong> (free entry points and basics for everyone) yet serves as a revenue stream through premium layers and the Super Bundle.</p>

        <p><strong>The Pillars:</strong> Train (free tracker + premium Coach), Fuel (nutrition), Move (mobility + yoga), Mind (mindfulness), Track (activity), Learn (education programs).</p>

        <h2>Super Bundle</h2>
        <p>The flagship offering. One subscription unlocks premium depth across multiple (or all) pillars — "X premium tools for the price of 1-2." Modeled directly on Freeletics: 50% off introductory pricing for first 6–12 months, annual discounts, "X apps for the price of 1".</p>

        <p className="mt-8 text-sm">Full details in <code>vision.md</code> in the project root. This page is a summary. The app exists to serve this vision.</p>
      </div>

      <div className="mt-8">
        <a href="/" className="text-emerald-400 underline">Back to app</a> • <a href="/bundle" className="text-emerald-400 underline">Super Bundle</a>
      </div>
    </div>
  );
}
