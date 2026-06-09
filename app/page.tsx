"use client";

import { useState, useEffect } from "react";

type Todo = {
  id: number;
  text: string;
  done: boolean;
  dueDate: string | null;
};

type DailyCheck = {
  id: number;
  text: string;
  done: boolean;
};

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

function DueBadge({ dueDate }: { dueDate: string | null }) {
  if (!dueDate) return null;
  const today = new Date().toLocaleDateString("sv-SE");
  const isOverdue = dueDate < today;
  const isToday = dueDate === today;
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
        isOverdue
          ? "bg-red-900/50 text-red-400"
          : isToday
          ? "bg-amber-900/50 text-amber-400"
          : "bg-gray-800 text-gray-400"
      }`}
    >
      {isOverdue ? "⚠ " : ""}
      {dueDate}
    </span>
  );
}

export default function TodoPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [todoInput, setTodoInput] = useState("");
  const [todoDue, setTodoDue] = useState("");
  const [dailyChecks, setDailyChecks] = useState<DailyCheck[]>([]);
  const [dailyInput, setDailyInput] = useState("");
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    const load = async (url: string) => {
      const r = await fetch(url);
      const body = await r.json();
      if (!r.ok) throw new Error(`${url} → ${r.status}: ${body?.error ?? JSON.stringify(body)}`);
      return body;
    };
    load("/api/todos").then(setTodos).catch((e) => setApiError(String(e)));
    load("/api/daily").then(setDailyChecks).catch((e) => setApiError(String(e)));
  }, []);

  async function addTodo() {
    const text = todoInput.trim();
    if (!text) return;
    try {
      const r = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, dueDate: todoDue || null }),
      });
      if (!r.ok) throw new Error(`POST /api/todos → ${r.status}`);
      const todo = await r.json();
      setTodos((prev) => [...prev, todo]);
      setTodoInput("");
      setTodoDue("");
    } catch (e) {
      setApiError(String(e));
    }
  }

  async function toggleTodo(id: number, done: boolean) {
    const todo = await fetch(`/api/todos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: !done }),
    }).then((r) => r.json());
    setTodos((prev) => prev.map((t) => (t.id === id ? todo : t)));
  }

  async function deleteTodo(id: number) {
    await fetch(`/api/todos/${id}`, { method: "DELETE" });
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }

  async function addDaily() {
    const text = dailyInput.trim();
    if (!text) return;
    const item = await fetch("/api/daily", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    }).then((r) => r.json());
    setDailyChecks((prev) => [...prev, item]);
    setDailyInput("");
  }

  async function toggleDaily(id: number, done: boolean) {
    const item = await fetch(`/api/daily/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: !done }),
    }).then((r) => r.json());
    setDailyChecks((prev) => prev.map((c) => (c.id === id ? item : c)));
  }

  async function deleteDaily(id: number) {
    await fetch(`/api/daily/${id}`, { method: "DELETE" });
    setDailyChecks((prev) => prev.filter((c) => c.id !== id));
  }

  async function clearDoneTodos() {
    const doneTodos = todos.filter((t) => t.done);
    await Promise.all(
      doneTodos.map((t) => fetch(`/api/todos/${t.id}`, { method: "DELETE" }))
    );
    setTodos((prev) => prev.filter((t) => !t.done));
  }

  const todoRemaining = todos.filter((t) => !t.done).length;
  const dailyDone = dailyChecks.filter((c) => c.done).length;

  return (
    <main className="max-w-xl mx-auto px-6 py-14 space-y-16">

      {/* エラーバナー */}
      {apiError && (
        <div className="bg-red-900/40 border border-red-700 rounded px-4 py-3 text-xs text-red-300 flex justify-between items-start gap-3">
          <span>⚠ API エラー: {apiError}</span>
          <button onClick={() => setApiError(null)} className="text-red-400 hover:text-red-200 flex-shrink-0">×</button>
        </div>
      )}

      {/* ===== デイリーチェック ===== */}
      <section>
        <div className="mb-8">
          <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-teal-500 mb-2">
            Daily Check
          </h2>
          <p className="text-2xl font-light text-white tracking-tight">
            デイリーチェック
          </p>
          <p className="text-xs text-gray-400 mt-1">
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
            className="flex-1 bg-transparent border-b border-gray-600 focus:border-teal-600 px-1 py-2 text-sm text-white placeholder-gray-500 outline-none transition-colors"
          />
          <button
            onClick={addDaily}
            className="text-xs font-medium text-teal-500 hover:text-teal-300 border border-teal-800 hover:border-teal-600 rounded px-4 py-2 transition-colors"
          >
            追加
          </button>
        </div>

        {dailyChecks.length === 0 ? (
          <p className="text-xs text-gray-500 py-6 text-center">
            毎日確認したい項目を追加してください
          </p>
        ) : (
          <ul className="divide-y divide-gray-800/60">
            {dailyChecks.map((check) => (
              <li key={check.id} className="flex items-center gap-4 py-3 group">
                <button
                  onClick={() => toggleDaily(check.id, check.done)}
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
                    check.done ? "line-through text-gray-500" : "text-white"
                  }`}
                >
                  {check.text}
                </span>
                <button
                  onClick={() => deleteDaily(check.id)}
                  className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all text-base leading-none"
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
          <p className="text-2xl font-light text-white tracking-tight">
            やることリスト
          </p>
          <p className="text-xs text-gray-400 mt-1">
            残り {todoRemaining} 件 / 全 {todos.length} 件
          </p>
        </div>

        {/* 入力エリア */}
        <div className="space-y-2 mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={todoInput}
              onChange={(e) => setTodoInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTodo()}
              placeholder="やることを入力してください"
              className="flex-1 bg-transparent border-b border-gray-600 focus:border-indigo-600 px-1 py-2 text-sm text-white placeholder-gray-500 outline-none transition-colors"
            />
            <button
              onClick={addTodo}
              className="text-xs font-medium text-indigo-400 hover:text-indigo-200 border border-indigo-900 hover:border-indigo-700 rounded px-4 py-2 transition-colors"
            >
              追加
            </button>
          </div>
          {/* 期限入力（任意） */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 flex-shrink-0">期限（任意）</label>
            <input
              type="date"
              value={todoDue}
              onChange={(e) => setTodoDue(e.target.value)}
              className="bg-transparent border-b border-gray-700 focus:border-indigo-600 px-1 py-1 text-xs text-gray-300 outline-none transition-colors [color-scheme:dark]"
            />
            {todoDue && (
              <button
                onClick={() => setTodoDue("")}
                className="text-xs text-gray-500 hover:text-gray-300"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {todos.length === 0 ? (
          <p className="text-xs text-gray-500 py-6 text-center">
            やることを追加してみましょう
          </p>
        ) : (
          <>
            <ul className="divide-y divide-gray-800/60">
              {todos.map((todo) => (
                <li key={todo.id} className="flex items-center gap-3 py-3 group">
                  <button
                    onClick={() => toggleTodo(todo.id, todo.done)}
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
                      todo.done ? "line-through text-gray-500" : "text-white"
                    }`}
                  >
                    {todo.text}
                  </span>
                  {!todo.done && <DueBadge dueDate={todo.dueDate} />}
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all text-base leading-none"
                    aria-label={`「${todo.text}」を削除`}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>

            {todos.some((t) => t.done) && (
              <button
                onClick={clearDoneTodos}
                className="mt-6 w-full text-xs text-gray-400 hover:text-red-400 border border-gray-700 hover:border-red-800 rounded py-2 transition-colors"
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
