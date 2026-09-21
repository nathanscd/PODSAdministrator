export default function GrainEffect() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[9990] opacity-[0.04] mix-blend-normal">
      <svg className="absolute w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <filter id="noiseFilter">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)" />
      </svg>
    </div>
  );
}