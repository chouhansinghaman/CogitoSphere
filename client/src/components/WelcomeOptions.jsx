import { useAuth } from "../context/AuthContext"; // adjust path if needed

export default function WelcomeOptions({ nav }) {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    nav("/login"); // redirect user back to login after logout
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-white shadow rounded p-6 text-center space-y-4">
        <h2 className="text-2xl font-bold">Welcome 🎉</h2>
        <p className="text-gray-600">Choose where you want to go:</p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => nav("/questions")}
            className="w-full bg-blue-600 text-white rounded py-2 hover:bg-blue-700"
          >
            Go to Questions
          </button>
          <button
            onClick={() => nav("/quizzes")}
            className="w-full bg-green-600 text-white rounded py-2 hover:bg-green-700"
          >
            Go to Quizzes
          </button>
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 text-white rounded py-2 hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
