"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { createWord, updateWord } from "@/lib/queries";
import type { AdminFilters } from "@/app/admin/page";
import type {
  GenkiWord,
  GenkiWordInsert,
  KanjiMode,
  WordType,
} from "@/types/genki";

type LocalForm = {
  english: string;
  answers: string[];
  kanji: string;
  reading: string;
  kanjiMode: Exclude<KanjiMode, "all">;
};

const emptyForm: LocalForm = {
  english: "",
  answers: [""],
  kanji: "",
  reading: "",
  kanjiMode: "vocab",
};

function splitStoredAnswers(value: string | null | undefined) {
  if (!value) return [""];

  const answers = value
    .split(/[;|,、／/]/)
    .map((item) => item.trim())
    .filter(Boolean);

  return answers.length > 0 ? answers : [""];
}

function joinAnswers(answers: string[] | undefined) {
  return (answers || [""])
    .map((answer) => answer.trim())
    .filter(Boolean)
    .join("; ");
}

function emptyFormKeepingMode(
  kanjiMode: Exclude<KanjiMode, "all"> | undefined
): LocalForm {
  return {
    english: "",
    answers: [""],
    kanji: "",
    reading: "",
    kanjiMode: kanjiMode || "vocab",
  };
}

export function AdminWordForm({
  editing,
  filters,
  onFiltersChange,
  onDone,
}: {
  editing: GenkiWord | null;
  filters: AdminFilters;
  onFiltersChange: (filters: AdminFilters) => void;
  onDone: () => void;
}) {
  const [form, setForm] = useState<LocalForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const answers = form.answers || [""];

  useEffect(() => {
    if (!editing) {
      setForm((old) => emptyFormKeepingMode(old.kanjiMode));
      return;
    }

    setForm({
      english: editing.english,
      answers: splitStoredAnswers(editing.japanese),
      kanji: editing.kanji || "",
      reading: editing.reading || "",
      kanjiMode: editing.kanji_mode === "back" ? "back" : "vocab",
    });
  }, [editing]);

  function update<K extends keyof LocalForm>(key: K, value: LocalForm[K]) {
    setForm((old) => ({ ...old, [key]: value }));
  }

  function updateAnswer(index: number, value: string) {
    setForm((old) => {
      const nextAnswers = [...(old.answers || [""])];
      nextAnswers[index] = value;

      return {
        ...old,
        answers: nextAnswers,
      };
    });
  }

  function addAnswerField() {
    setForm((old) => ({
      ...old,
      answers: [...(old.answers || [""]), ""],
    }));
  }

  function removeAnswerField(index: number) {
    setForm((old) => {
      const currentAnswers = [...(old.answers || [""])];

      if (currentAnswers.length <= 1) {
        return old;
      }

      currentAnswers.splice(index, 1);

      return {
        ...old,
        answers: currentAnswers.length > 0 ? currentAnswers : [""],
      };
    });
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();

    setSaving(true);
    setError("");

    const selectedKanjiMode = form.kanjiMode || "vocab";
    const joinedAnswers = joinAnswers(form.answers);

    try {
      let payload: GenkiWordInsert;

      if (filters.wordType === "vocab") {
        payload = {
          book_number: filters.bookNumber,
          chapter_number: filters.chapterNumber,
          word_type: "vocab",
          kanji_mode: null,
          english: form.english,
          japanese: joinedAnswers,
          hiragana: null,
          katakana: null,
          kanji: null,
          reading: null,
          notes: null,
        };
      } else {
        payload = {
          book_number: filters.bookNumber,
          chapter_number: filters.chapterNumber,
          word_type: "kanji",
          kanji_mode: selectedKanjiMode,
          english: form.kanji,
          japanese: joinedAnswers,
          hiragana: joinedAnswers,
          katakana: null,
          kanji: form.kanji,
          reading: form.reading,
          notes: null,
        };
      }

      if (editing) {
        await updateWord(editing.id, payload);
      } else {
        await createWord(payload);
      }

      setForm(emptyFormKeepingMode(selectedKanjiMode));
      onDone();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not save word."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="p-6 sm:p-8 2xl:p-10">
      <h2 className="text-3xl font-black text-[#173763] 2xl:text-4xl">
        {editing ? "Edit word" : "Add word"}
      </h2>

      <form onSubmit={save} className="mt-6 grid gap-4 2xl:gap-5">
        <div className="grid grid-cols-2 gap-3">
          <Select
            value={filters.bookNumber}
            onChange={(event) =>
              onFiltersChange({
                ...filters,
                bookNumber: Number(event.target.value),
              })
            }
          >
            <option value={1}>Genki 1</option>
            <option value={2}>Genki 2</option>
          </Select>

          <Select
            value={filters.chapterNumber}
            onChange={(event) =>
              onFiltersChange({
                ...filters,
                chapterNumber: Number(event.target.value),
              })
            }
          >
            {Array.from({ length: 12 }, (_, index) => index + 1).map(
              (chapter) => (
                <option key={chapter} value={chapter}>
                  Chapter {chapter}
                </option>
              )
            )}
          </Select>
        </div>

        <Select
          value={filters.wordType}
          onChange={(event) =>
            onFiltersChange({
              ...filters,
              wordType: event.target.value as WordType,
            })
          }
        >
          <option value="vocab">Vocab</option>
          <option value="kanji">Kanji</option>
        </Select>

        {filters.wordType === "vocab" ? (
          <>
            <Input
              placeholder="Question, e.g. teacher"
              value={form.english}
              onChange={(event) => update("english", event.target.value)}
              required
            />

            <div className="grid gap-3">
              {answers.map((answer, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={
                      index === 0
                        ? "Answer, e.g. せんせい"
                        : "Another correct answer"
                    }
                    value={answer}
                    onChange={(event) =>
                      updateAnswer(index, event.target.value)
                    }
                    required={index === 0}
                  />

                  {index === 0 ? (
                    <button
                      type="button"
                      onClick={addAnswerField}
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#9bcc99] text-2xl font-black text-white shadow-lg shadow-green-200/70 transition hover:-translate-y-0.5 hover:brightness-105"
                      aria-label="Add another answer"
                      title="Add another answer"
                    >
                      +
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => removeAnswerField(index)}
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-500 text-2xl font-black text-white shadow-lg shadow-rose-200/70 transition hover:-translate-y-0.5 hover:brightness-105"
                      aria-label="Remove answer"
                      title="Remove answer"
                    >
                      −
                    </button>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <Select
              value={form.kanjiMode}
              onChange={(event) =>
                update("kanjiMode", event.target.value as "vocab" | "back")
              }
            >
              <option value="vocab">Kanji Vocab</option>
              <option value="back">Kanji Back</option>
            </Select>

            <Input
              placeholder="Kanji, e.g. 先生"
              value={form.kanji}
              onChange={(event) => update("kanji", event.target.value)}
              required
            />

            <div className="grid gap-3">
              {answers.map((answer, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={
                      index === 0
                        ? "Answer in hiragana, e.g. せんせい"
                        : "Another correct answer"
                    }
                    value={answer}
                    onChange={(event) =>
                      updateAnswer(index, event.target.value)
                    }
                    required={index === 0}
                  />

                  {index === 0 ? (
                    <button
                      type="button"
                      onClick={addAnswerField}
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#9bcc99] text-2xl font-black text-white shadow-lg shadow-green-200/70 transition hover:-translate-y-0.5 hover:brightness-105"
                      aria-label="Add another answer"
                      title="Add another answer"
                    >
                      +
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => removeAnswerField(index)}
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-500 text-2xl font-black text-white shadow-lg shadow-rose-200/70 transition hover:-translate-y-0.5 hover:brightness-105"
                      aria-label="Remove answer"
                      title="Remove answer"
                    >
                      −
                    </button>
                  )}
                </div>
              ))}
            </div>

            <Input
              placeholder="Reading / meaning for results, e.g. teacher"
              value={form.reading}
              onChange={(event) => update("reading", event.target.value)}
            />
          </>
        )}

        {error ? (
          <div className="rounded-xl bg-rose-50 p-4 font-black text-rose-700">
            {error}
          </div>
        ) : null}

        <Button disabled={saving} variant="blue">
          {saving ? "Saving..." : editing ? "Save" : "Add"}
        </Button>
      </form>
    </Card>
  );
}