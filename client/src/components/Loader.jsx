export default function Loader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      {/* --- High-fidelity SVG recreation of your logo --- */}
      <svg
        className="h-28 w-28 animate-draw"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        stroke="white"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Mortarboard Cap Top */}
        <path id="cap-top" d="M50 10 L95 30 L50 50 L5 30 Z" />
        {/* Mortarboard Cap Top Border */}
        <path id="cap-border" d="M15 32.5 L50 47.5 L85 32.5" />
        {/* Mortarboard Cap Body */}
        <path id="cap-body" d="M22 48 h56 v15 H22z" />

        {/* Tassel */}
        <path id="tassel-string" d="M90 30 V 55" />
        <path
          id="tassel-end"
          d="M90 55 v5 a5 5 0 1 1 -10 0 v-5 c0-5 5-7.5 5-7.5s5 2.5 5 7.5z"
        />

        {/* Diploma */}
        <path
          id="diploma"
          d="M15 72 h70 a3 3 0 0 1 3 3 v4 a3 3 0 0 1 -3 3 H15 a3 3 0 0 1 -3 -3 v-4 a3 3 0 0 1 3 -3 z"
        />

        {/* Ribbon */}
        <path id="ribbon" d="M47 82 v10 l3 -3 l3 3 V82" />
      </svg>
    </div>
  );
}
