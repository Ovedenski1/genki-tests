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

const fieldClass = "h-10 px-3 py-2 text-sm";
const selectClass = "h-10 px-3 py-2 text-sm";

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

      if (currentAnswers.length <= 1) return old;

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
    <Card className="max-h-[460px] overflow-y-auto p-4">
      <h2 className="text-2xl font-black text-[#173763]">Add word</h2>

      <form onSubmit={save} className="mt-4 grid gap-2.5">
        <div className="grid grid-cols-2 gap-2.5">
          <Select
            value={filters.bookNumber}
            className={selectClass}
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
            className={selectClass}
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
          className={selectClass}
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
              className={fieldClass}
              placeholder="Question, e.g. teacher"
              value={form.english}
              onChange={(event) => update("english", event.target.value)}
              required
            />

            <div className="grid gap-2.5">
              {answers.map((answer, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    className={fieldClass}
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
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#9bcc99] text-lg font-black text-white shadow-md shadow-green-200/70 transition hover:-translate-y-0.5 hover:brightness-105"
                    >
                      +
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => removeAnswerField(index)}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500 text-lg font-black text-white shadow-md shadow-rose-200/70 transition hover:-translate-y-0.5 hover:brightness-105"
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
              className={selectClass}
              onChange={(event) =>
                update("kanjiMode", event.target.value as "vocab" | "back")
              }
            >
              <option value="vocab">Kanji Vocab</option>
              <option value="back">Kanji Back</option>
            </Select>

            <Input
              className={fieldClass}
              placeholder="Kanji, e.g. 先生"
              value={form.kanji}
              onChange={(event) => update("kanji", event.target.value)}
              required
            />

            <div className="grid gap-2.5">
              {answers.map((answer, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    className={fieldClass}
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
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#9bcc99] text-lg font-black text-white shadow-md shadow-green-200/70 transition hover:-translate-y-0.5 hover:brightness-105"
                    >
                      +
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => removeAnswerField(index)}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500 text-lg font-black text-white shadow-md shadow-rose-200/70 transition hover:-translate-y-0.5 hover:brightness-105"
                    >
                      −
                    </button>
                  )}
                </div>
              ))}
            </div>

            <Input
              className={fieldClass}
              placeholder="Reading / meaning for results"
              value={form.reading}
              onChange={(event) => update("reading", event.target.value)}
            />
          </>
        )}

        {error ? (
          <div className="rounded-xl bg-rose-50 p-2.5 text-sm font-black text-rose-700">
            {error}
          </div>
        ) : null}

        <Button disabled={saving} variant="blue" className="mt-0.5 py-2 text-sm">
          {saving ? "Saving..." : editing ? "Save" : "Add"}
        </Button>
      </form>
    </Card>
  );
}