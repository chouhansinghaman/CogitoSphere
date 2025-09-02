export default function Loader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black z-50">
      <div className="animate-pulse">
        <img
          src="/logo.png"  // replace with your logo path
          alt="ScholarSphere Logo"
          className="w-24 h-24"
        />
      </div>
    </div>
  );
}
