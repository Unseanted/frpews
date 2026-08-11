export default function Waterline() {
  return (
    <div className="relative my-2 overflow-hidden">
      <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-border to-transparent" />
      <svg
        className="relative w-full h-6 text-primary/30"
        viewBox="0 0 600 24"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0,16 C40,4 70,20 110,10 C150,0 180,18 220,12 C260,6 290,16 330,8
             C370,0 400,14 440,10 C480,6 510,16 550,8 C570,5 590,12 600,9"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
