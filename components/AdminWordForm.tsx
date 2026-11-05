"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import {
  CommentIcon,
  RichNoteEditor,
} from "@/components/RichNoteEditor";
import { createWord, updateWord } from "@/lib/queries";
import type { AdminFilters } from "@/app/admin/page";
import type {
  AdminEntryType,
  GenkiWord,
  GenkiWordInsert,
  GrammarType,
  KanjiMode,
  StudyList,
} from "@/types/genki";

type LocalForm = {
  english: string;
  answers: string[];
  kanji: string;
  reading: string;
  kanjiMode: Exclude<KanjiMode, "all">;
  notes: string;
  grammarType: GrammarType | null;
};

type ChapterOption = {
  value: number;
  label: string;
};

const emptyForm: LocalForm = {
  english: "",
  answers: [""],
  kanji: "",
  reading: "",
  kanjiMode: "vocab",
  notes: "",
  grammarType: null,
};

const fieldClass = "h-12 px-4 py-2.5 text-sm";
const selectClass = "h-12 px-4 py-2.5 text-sm";

const grammarOptions: { value: GrammarType; label: string }[] = [
  { value: "ru", label: "Ru" },
  { value: "u", label: "U" },
  { value: "irr", label: "Irr" },
  { value: "i_adj", label: "い-adj" },
  { value: "na_adj", label: "な-adj" },
];

function chapterOptionsForBook(bookNumber: number): ChapterOption[] {
  if (bookNumber === 2) {
    return Array.from({ length: 11 }, (_, index) => {
      const databaseChapter = index + 1;

      return {
        value: databaseChapter,
        label: `Chapter ${databaseChapter + 12}`,
      };
    });
  }

  return [
    { value: -1, label: "Writing" },
    { value: 0, label: "Chapter 0" },
    ...Array.from({ length: 12 }, (_, index) => ({
      value: index + 1,
      label: `Chapter ${index + 1}`,
    })),
  ];
}

function safeChapterForBook(
  bookNumber: number,
  chapterNumber: number
) {
  if (bookNumber === 2) {
    return chapterNumber >= 1 && chapterNumber <= 11
      ? chapterNumber
      : 1;
  }

  return chapterNumber >= -1 && chapterNumber <= 12
    ? chapterNumber
    : 1;
}

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
    notes: "",
    grammarType: null,
  };
}

function entryTypeLabel(
  type: AdminEntryType,
  chapterNumber: number
) {
  if (chapterNumber === -1) {
    if (type === "vocab") return "Hiragana";
    if (type === "kanji") return "Katakana";
    return "Extra";
  }

  if (chapterNumber === 0) {
    if (type === "vocab") return "Phrases";
    if (type === "kanji") return "Numbers";
    return "Extra";
  }

  if (type === "vocab") return "Vocab";
  if (type === "extra") return "Extra";
  return "Kanji";
}

function questionPlaceholder(
  entryType: AdminEntryType,
  chapterNumber: number
) {
  if (chapterNumber === -1) {
    return entryType === "kanji"
      ? "Question, e.g. ka"
      : "Question, e.g. a";
  }

  if (chapterNumber === 0) {
    return entryType === "kanji"
      ? "Question, e.g. one"
      : "Question, e.g. good morning";
  }

  return entryType === "kanji"
    ? "Kanji, e.g. 先生"
    : "Question, e.g. teacher";
}

function answerPlaceholder(
  entryType: AdminEntryType,
  chapterNumber: number,
  index: number
) {
  if (index > 0) return "Another correct answer";

  if (chapterNumber === -1) {
    return entryType === "kanji"
      ? "Answer in katakana, e.g. カ"
      : "Answer in hiragana, e.g. あ";
  }

  if (chapterNumber === 0) {
    return entryType === "kanji"
      ? "Answer, e.g. いち"
      : "Answer, e.g. おはようございます";
  }

  return entryType === "kanji"
    ? "Answer in hiragana, e.g. せんせい"
    : "Answer, e.g. せんせい";
}

export function AdminWordForm({
  editing,
  filters,
  studyLists,
  listsLoading,
  onCreateStudyList,
  onFiltersChange,
  onDone,
}: {
  editing: GenkiWord | null;
  filters: AdminFilters;
  studyLists: StudyList[];
  listsLoading: boolean;
  onCreateStudyList: (name: string) => Promise<StudyList>;
  onFiltersChange: (filters: AdminFilters) => void;
  onDone: () => void;
}) {
  const [form, setForm] = useState<LocalForm>(emptyForm);
  const [newListName, setNewListName] = useState("");
  const [creatingList, setCreatingList] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showComment, setShowComment] = useState(false);
  const [editorReset, setEditorReset] = useState(0);

  const answers = form.answers || [""];
  const isSpecialChapter =
    filters.chapterNumber === -1 ||
    filters.chapterNumber === 0;

  const editorKey = [
    filters.bookNumber,
    filters.chapterNumber,
    filters.entryType,
    filters.kanjiMode,
    filters.studyListId || "main",
    editing?.id || "new",
    editorReset,
  ].join("-");

  useEffect(() => {
    if (!editing) {
      setForm(emptyFormKeepingMode(filters.kanjiMode));
      setShowComment(false);
      return;
    }

    setForm({
      english: editing.english,
      answers: splitStoredAnswers(editing.japanese),
      kanji: editing.kanji || "",
      reading: editing.reading || "",
      kanjiMode:
        editing.kanji_mode === "back"
          ? "back"
          : "vocab",
      notes: editing.notes || "",
      grammarType: editing.grammar_type || null,
    });

    setShowComment(Boolean(editing.notes?.trim()));
  }, [
    editing,
    filters.bookNumber,
    filters.chapterNumber,
    filters.entryType,
    filters.kanjiMode,
  ]);

  function update<K extends keyof LocalForm>(
    key: K,
    value: LocalForm[K]
  ) {
    setForm((old) => ({
      ...old,
      [key]: value,
    }));
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
        answers:
          currentAnswers.length > 0
            ? currentAnswers
            : [""],
      };
    });
  }

  function changeBook(nextBook: number) {
    const nextChapter = safeChapterForBook(
      nextBook,
      filters.chapterNumber
    );

    onFiltersChange({
      ...filters,
      bookNumber: nextBook,
      chapterNumber: nextChapter,
      entryType:
        filters.entryType === "extra"
          ? "vocab"
          : filters.entryType,
      studyListId: null,
    });
  }

  function changeEntryType(nextType: AdminEntryType) {
    onFiltersChange({
      ...filters,
      entryType: nextType,
      studyListId:
        nextType === "extra"
          ? filters.studyListId ||
            studyLists[0]?.id ||
            null
          : null,
    });
  }

  function changeKanjiMode(
    nextMode: Exclude<KanjiMode, "all">
  ) {
    update("kanjiMode", nextMode);

    onFiltersChange({
      ...filters,
      kanjiMode: nextMode,
    });
  }

  function changeChapter(nextChapter: number) {
    const nextEntryType =
      (nextChapter === -1 || nextChapter === 0) &&
      filters.entryType === "extra"
        ? "vocab"
        : filters.entryType;

    onFiltersChange({
      ...filters,
      chapterNumber: nextChapter,
      entryType: nextEntryType,
      studyListId: null,
    });
  }

  async function createList() {
    const cleanName = newListName.trim();

    if (!cleanName) return;

    setCreatingList(true);
    setError("");

    try {
      const list = await onCreateStudyList(cleanName);
      setNewListName("");

      onFiltersChange({
        ...filters,
        entryType: "extra",
        studyListId: list.id,
      });
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not create list."
      );
    } finally {
      setCreatingList(false);
    }
  }

  function toggleGrammarType(type: GrammarType) {
    setForm((current) => ({
      ...current,
      grammarType: current.grammarType === type ? null : type,
    }));
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setError("");

    const selectedKanjiMode = isSpecialChapter
      ? "vocab"
      : form.kanjiMode ||
        filters.kanjiMode ||
        "vocab";

    const joinedAnswers = joinAnswers(form.answers);
    const savedComment = form.notes.trim() || null;

    try {
      let payload: GenkiWordInsert;

      if (
        filters.entryType === "vocab" ||
        filters.entryType === "extra"
      ) {
        if (
          filters.entryType === "extra" &&
          !filters.studyListId
        ) {
          setError("Create or choose a list first.");
          setSaving(false);
          return;
        }

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
          notes: savedComment,
          grammar_type: form.grammarType,
          study_list_id:
            filters.entryType === "extra"
              ? filters.studyListId
              : null,
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
          reading:
            isSpecialChapter
              ? null
              : form.reading,
          notes: savedComment,
          grammar_type: form.grammarType,
          study_list_id: null,
        };
      }

      if (editing) {
        await updateWord(editing.id, payload);
      } else {
        await createWord(payload);
      }

      setForm(emptyFormKeepingMode(selectedKanjiMode));
      setShowComment(false);
      setEditorReset((old) => old + 1);
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
    <Card className="h-[535px] overflow-y-auto p-5">
      <h2 className="text-2xl font-black text-[#173763]">
        Add word
      </h2>

      <form
        onSubmit={save}
        className="mt-5 grid gap-3"
      >
        <div className="grid grid-cols-2 gap-3">
          <Select
            value={filters.bookNumber}
            className={selectClass}
            onChange={(event) =>
              changeBook(Number(event.target.value))
            }
          >
            <option value={1}>Genki 1</option>
            <option value={2}>Genki 2</option>
          </Select>

          <Select
            value={filters.chapterNumber}
            className={selectClass}
            onChange={(event) =>
              changeChapter(Number(event.target.value))
            }
          >
            {chapterOptionsForBook(
              filters.bookNumber
            ).map((chapter) => (
              <option
                key={chapter.value}
                value={chapter.value}
              >
                {chapter.label}
              </option>
            ))}
          </Select>
        </div>

        <Select
          value={filters.entryType}
          className={selectClass}
          onChange={(event) =>
            changeEntryType(
              event.target.value as AdminEntryType
            )
          }
        >
          <option value="vocab">
            {entryTypeLabel(
              "vocab",
              filters.chapterNumber
            )}
          </option>

          {!isSpecialChapter ? (
            <option value="extra">
              Extra
            </option>
          ) : null}

          <option value="kanji">
            {entryTypeLabel(
              "kanji",
              filters.chapterNumber
            )}
          </option>
        </Select>

        {filters.entryType === "extra" ? (
          <div className="grid gap-3 rounded-xl bg-blue-50/70 p-3">
            <Select
              value={filters.studyListId || ""}
              className={selectClass}
              disabled={
                listsLoading ||
                studyLists.length === 0
              }
              onChange={(event) =>
                onFiltersChange({
                  ...filters,
                  studyListId:
                    event.target.value || null,
                })
              }
            >
              {studyLists.length === 0 ? (
                <option value="">
                  No lists yet
                </option>
              ) : (
                studyLists.map((list) => (
                  <option
                    key={list.id}
                    value={list.id}
                  >
                    {list.name}
                  </option>
                ))
              )}
            </Select>

            <div className="flex gap-3">
              <Input
                className={fieldClass}
                placeholder="New list, e.g. Occupations"
                value={newListName}
                onChange={(event) =>
                  setNewListName(
                    event.target.value
                  )
                }
              />

              <button
                type="button"
                onClick={createList}
                disabled={creatingList}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#9bcc99] text-lg font-black text-white shadow-md shadow-green-200/70 transition hover:-translate-y-0.5 hover:brightness-105 disabled:opacity-60"
              >
                +
              </button>
            </div>
          </div>
        ) : null}

        {filters.entryType === "kanji" ? (
          <>
            {!isSpecialChapter ? (
              <Select
                value={form.kanjiMode}
                className={selectClass}
                onChange={(event) =>
                  changeKanjiMode(
                    event.target.value as
                      | "vocab"
                      | "back"
                  )
                }
              >
                <option value="vocab">
                  Kanji Vocab
                </option>
                <option value="back">
                  Kanji Back
                </option>
              </Select>
            ) : null}

            <Input
              className={fieldClass}
              placeholder={questionPlaceholder(
                filters.entryType,
                filters.chapterNumber
              )}
              value={form.kanji}
              onChange={(event) =>
                update(
                  "kanji",
                  event.target.value
                )
              }
              required
            />
          </>
        ) : (
          <Input
            className={fieldClass}
            placeholder={questionPlaceholder(
              filters.entryType,
              filters.chapterNumber
            )}
            value={form.english}
            onChange={(event) =>
              update(
                "english",
                event.target.value
              )
            }
            required
          />
        )}

        <div className="grid gap-3">
          {answers.map((answer, index) => (
            <div
              key={index}
              className="flex gap-3"
            >
              <Input
                className={fieldClass}
                placeholder={answerPlaceholder(
                  filters.entryType,
                  filters.chapterNumber,
                  index
                )}
                value={answer}
                onChange={(event) =>
                  updateAnswer(
                    index,
                    event.target.value
                  )
                }
                required={index === 0}
              />

              {index === 0 ? (
                <button
                  type="button"
                  onClick={addAnswerField}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#9bcc99] text-lg font-black text-white shadow-md shadow-green-200/70 transition hover:-translate-y-0.5 hover:brightness-105"
                >
                  +
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    removeAnswerField(index)
                  }
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-500 text-lg font-black text-white shadow-md shadow-rose-200/70 transition hover:-translate-y-0.5 hover:brightness-105"
                >
                  −
                </button>
              )}
            </div>
          ))}
        </div>

        {filters.entryType === "kanji" &&
        !isSpecialChapter ? (
          <Input
            className={fieldClass}
            placeholder="Reading / meaning for results"
            value={form.reading}
            onChange={(event) =>
              update(
                "reading",
                event.target.value
              )
            }
          />
        ) : null}

        {/* Optional grammar classification, independent from rich notes */}
        <div className="rounded-xl border border-blue-100 bg-blue-50/40 px-3 py-3">
          <p className="mb-2 text-xs font-black uppercase tracking-wider text-[#6d94d2]">
            Grammar type (optional)
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {grammarOptions.map((option) => (
              <label
                key={option.value}
                className="flex cursor-pointer items-center gap-1.5 text-sm font-bold text-[#173763]"
              >
                <input
                  type="checkbox"
                  checked={form.grammarType === option.value}
                  onChange={() => toggleGrammarType(option.value)}
                  className="h-4 w-4 cursor-pointer accent-[#78b978]"
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center">
          <button
            type="button"
            onClick={() =>
              setShowComment((old) => !old)
            }
            aria-expanded={showComment}
            title="Word comment"
            className={`relative flex h-10 items-center gap-2 rounded-xl border px-3 text-sm font-black transition ${
              showComment
                ? "border-blue-300 bg-blue-100 text-[#173763]"
                : "border-blue-100 bg-white text-[#6d94d2] hover:bg-blue-50"
            }`}
          >
            <CommentIcon className="h-5 w-5" />

            <span>
              {form.notes.trim()
                ? "Comment"
                : "Add comment"}
            </span>

            {form.notes.trim() ? (
              <span className="h-2 w-2 rounded-full bg-[#78b978]" />
            ) : null}
          </button>
        </div>

        <div
          className={
            showComment ? "" : "hidden"
          }
        >
          <RichNoteEditor
            key={editorKey}
            initialValue={
              editing?.notes || ""
            }
            onChange={(value) =>
              update("notes", value)
            }
          />

          <p className="mt-2 text-xs font-semibold text-slate-500">
            Select text to color or format it.
            Comments and grammar types appear in admin search,
            not in tests.
          </p>
        </div>

        {error ? (
          <div className="rounded-xl bg-rose-50 p-3 text-sm font-black text-rose-700">
            {error}
          </div>
        ) : null}

        <Button
          disabled={saving}
          variant="blue"
          className="mt-1 py-3 text-sm"
        >
          {saving
            ? "Saving..."
            : editing
              ? "Save"
              : "Add"}
        </Button>
      </form>
    </Card>
  );
}
