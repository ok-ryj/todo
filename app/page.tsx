"use client";

import { useState, useEffect } from "react";

type Todo = {
  id: number;
  text: string;
  done: boolean;
};

type DailyCheck = {
  id: number;
  text: string;
  done: boolean;
};

type DailyStorage = {
  date: string;
  checks: DailyCheck[];
};

function today(): string {
  return new Date().toLocaleDateString("sv-SE");
}

function CheckIcon() {
  return (
    <svg
      className="w-3 h-3 text-white"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="2,6 5,9 10,3" />
    </svg>
  );
}

export default function TodoPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [todoInput, setTodoInput] = useState("");
  const [dailyChecks, setDailyChecks] = useState<DailyCheck[]>([]);
  const [dailyInput, setDailyInput] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("todos");
    if (saved) setTodos(JSON.parse(saved));
  }, []);
  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    const raw = localStorage.getItem("dailyChecks");
    if (raw) {
      const stored: DailyStorage = JSON.parse(raw);
      const checks =
        stored.date === today()
          ? stored.checks
          : stored.checks.map((c) => ({ ...c, done: false }));
      setDailyChecks(checks);
    }
  }, []);
  useEffect(() => {
    localStorage.setItem(
      "dailyChecks",
      JSON.stringify({ date: today(), checks: dailyChecks })
    );
  }, [dailyChecks]);

  function addTodo() {
    const text = todoInput.trim();
    if (!text) return;
    setTodos((prev) => [...prev, { id: Date.now(), text, done: false }]);
    setTodoInput("");
  }
  function toggleTodo(id: number) {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  }
  function deleteTodo(id: number) {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }

  function addDaily() {
    const text = dailyInput.trim();
    if (!text) return;
    setDailyChecks((prev) => [...prev, { id: Date.now(), text, done: false }]);
    setDailyInput("");
  }
  function toggleDaily(id: number) {
    setDailyChecks((prev) =>
      prev.map((c) => (c.id === id ? { ...c, done: !c.done } : c))
    );
  }
  function deleteDaily(id: number) {
    setDailyChecks((prev) => prev.filter((c) => c.id !== id));
  }

  const todoRemaining = todos.filter((t) => !t.done).length;
  const dailyDone = dailyChecks.filter((c) => c.done).length;

  return (
    <main className="max-w-xl mx-auto px-6 py-14 space-y-16">

      {/* ===== デイリーチェック ===== */}
      <section>
        <div className="mb-8">
          <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-teal-500 mb-2">
            Daily Check
          </h2>
          <p className="text-2xl font-light text-gray-100 tracking-tight">
            デイリーチェック
          </p>
          <p className="text-xs text-gray-600 mt-1">
            {dailyDone} / {dailyChecks.length} 完了 · 毎朝 0 時に自動リセット
          </p>
        </div>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={dailyInput}
            onChange={(e) => setDailyInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addDaily()}
            placeholder="毎日やることを入力"
            className="flex-1 bg-transparent border-b border-gray-700 focus:border-teal-600 px-1 py-2 text-sm text-gray-300 placeholder-gray-600 outline-none transition-colors"
          />
          <button
            onClick={addDaily}
            className="text-xs font-medium text-teal-500 hover:text-teal-300 border border-teal-800 hover:border-teal-600 rounded px-4 py-2 transition-colors"
          >
            追加
          </button>
        </div>

        {dailyChecks.length === 0 ? (
          <p className="text-xs text-gray-700 py-6 text-center">
            毎日確認したい項目を追加してください
          </p>
        ) : (
          <ul className="divide-y divide-gray-800/60">
            {dailyChecks.map((check) => (
              <li key={check.id} className="flex items-center gap-4 py-3 group">
                <button
                  onClick={() => toggleDaily(check.id)}
                  aria-label={`「${check.text}」を完了にする`}
                  className={`w-5 h-5 flex-shrink-0 rounded-full border flex items-center justify-center transition-all ${
                    check.done
                      ? "bg-teal-600 border-teal-600"
                      : "border-gray-600 hover:border-teal-600"
                  }`}
                >
                  {check.done && <CheckIcon />}
                </button>
                <span
                  className={`flex-1 text-sm transition-colors ${
                    check.done ? "line-through text-gray-600" : "text-gray-300"
                  }`}
                >
                  {check.text}
                </span>
                <button
                  onClick={() => deleteDaily(check.id)}
                  className="opacity-0 group-hover:opacity-100 text-gray-700 hover:text-red-500 transition-all text-base leading-none"
                  aria-label={`「${check.text}」を削除`}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 区切り線 */}
      <hr className="border-gray-800" />

      {/* ===== やることリスト ===== */}
      <section>
        <div className="mb-8">
          <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-indigo-500 mb-2">
            Todo
          </h2>
          <p className="text-2xl font-light text-gray-100 tracking-tight">
            やることリスト
          </p>
          <p className="text-xs text-gray-600 mt-1">
            残り {todoRemaining} 件 / 全 {todos.length} 件
          </p>
        </div>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={todoInput}
            onChange={(e) => setTodoInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTodo()}
            placeholder="やることを入力してください"
            className="flex-1 bg-transparent border-b border-gray-700 focus:border-indigo-600 px-1 py-2 text-sm text-gray-300 placeholder-gray-600 outline-none transition-colors"
          />
          <button
            onClick={addTodo}
            className="text-xs font-medium text-indigo-400 hover:text-indigo-200 border border-indigo-900 hover:border-indigo-700 rounded px-4 py-2 transition-colors"
          >
            追加
          </button>
        </div>

        {todos.length === 0 ? (
          <p className="text-xs text-gray-700 py-6 text-center">
            やることを追加してみましょう
          </p>
        ) : (
          <>
            <ul className="divide-y divide-gray-800/60">
              {todos.map((todo) => (
                <li key={todo.id} className="flex items-center gap-4 py-3 group">
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    aria-label={`「${todo.text}」を完了にする`}
                    className={`w-5 h-5 flex-shrink-0 rounded-full border flex items-center justify-center transition-all ${
                      todo.done
                        ? "bg-indigo-600 border-indigo-600"
                        : "border-gray-600 hover:border-indigo-500"
                    }`}
                  >
                    {todo.done && <CheckIcon />}
                  </button>
                  <span
                    className={`flex-1 text-sm transition-colors ${
                      todo.done ? "line-through text-gray-600" : "text-gray-300"
                    }`}
                  >
                    {todo.text}
                  </span>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="opacity-0 group-hover:opacity-100 text-gray-700 hover:text-red-500 transition-all text-base leading-none"
                    aria-label={`「${todo.text}」を削除`}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>

            {todos.some((t) => t.done) && (
              <button
                onClick={() => setTodos((prev) => prev.filter((t) => !t.done))}
                className="mt-6 w-full text-xs text-gray-700 hover:text-red-500 border border-gray-800 hover:border-red-900 rounded py-2 transition-colors"
              >
                完了済みをすべて削除
              </button>
            )}
          </>
        )}
      </section>
    </main>
  );
}
