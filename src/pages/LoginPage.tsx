import { supabase } from '../lib/supabase';

export default function LoginPage() {
  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
  };

  return (
    <div className="flex items-center justify-center h-screen bg-slate-50">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10 flex flex-col items-center gap-6 w-80">
        <div className="text-4xl">🎤</div>
        <div className="text-center">
          <h1 className="text-xl font-semibold text-slate-800">Voice Memo</h1>
          <p className="text-sm text-slate-500 mt-1">ログインして続ける</p>
        </div>
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            className="w-5 h-5"
          />
          Google でログイン
        </button>
      </div>
    </div>
  );
}
