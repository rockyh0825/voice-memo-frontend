import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { extractTasks } from '../api/tasks';

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface ISpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => ISpeechRecognition;
    webkitSpeechRecognition: new () => ISpeechRecognition;
  }
}

export default function VoiceInputPage() {
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  function toggleRecording() {
    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SR) {
      setError('このブラウザは音声認識に対応していません');
      return;
    }

    if (recording) {
      recognitionRef.current?.stop();
      setRecording(false);
      return;
    }

    const recognition = new SR();
    recognition.lang = 'ja-JP';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (e: SpeechRecognitionEvent) => {
      const transcript = Array.from(e.results)
        .map((r) => (r as SpeechRecognitionResult)[0].transcript)
        .join('');
      setText((prev) => (prev ? `${prev}\n${transcript}` : transcript));
    };

    recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
      setError(`音声認識エラー: ${e.error}`);
      setRecording(false);
    };

    recognition.onend = () => setRecording(false);

    recognitionRef.current = recognition;
    recognition.start();
    setRecording(true);
    setError(null);
  }

  async function handleSubmit() {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await extractTasks(text.trim());
      navigate('/draft', { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : '送信に失敗しました');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="flex items-center gap-3 px-6 pt-12 pb-4">
        <button onClick={() => navigate(-1)} className="text-slate-400 text-xl p-1">
          ←
        </button>
        <h1 className="text-2xl font-bold text-slate-800">音声入力</h1>
      </header>

      <div className="flex-1 px-6 flex flex-col gap-6">
        {/* Mic button */}
        <div className="flex flex-col items-center py-8">
          <button
            onClick={toggleRecording}
            className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl shadow-lg transition-all ${
              recording
                ? 'bg-rose-500 scale-110 animate-pulse'
                : 'bg-indigo-500'
            }`}
          >
            🎤
          </button>
          <p className="mt-3 text-sm text-slate-400">
            {recording ? '録音中... タップで停止' : 'タップして録音開始'}
          </p>
        </div>

        {/* Text area */}
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-2">
            メモ内容
          </label>
          <textarea
            rows={6}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
            placeholder="ここに音声メモの内容を入力するか、録音してください"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        {error && (
          <p className="text-rose-500 text-sm">{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={!text.trim() || loading}
          className="w-full py-4 bg-indigo-500 text-white rounded-xl font-medium text-base disabled:opacity-40"
        >
          {loading ? 'タスクを抽出中...' : 'タスクを抽出する'}
        </button>
      </div>
    </div>
  );
}
