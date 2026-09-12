"use client";

import { Input, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import type { QuestionData } from "@/lib/activity-schema";

interface QuestionEditorProps {
  data: QuestionData;
  onChange: (next: QuestionData) => void;
  onRemove: () => void;
}

const labelClass = "mb-1 block text-xs font-semibold text-zumi-slate-500";
const rowClass = "mb-3";

/**
 * One adaptive editor for all 10 activity types (switches on `data.type`).
 * This is authoring UI, not the play experience — the activity engine's
 * "never hardcode a type into a page" rule governs ActivityRenderer, which
 * this feeds structured data into via the same activity-schema types.
 */
export function QuestionEditor({ data, onChange, onRemove }: QuestionEditorProps) {
  return (
    <div className="rounded-2xl border border-zumi-slate-200 p-4">
      {renderFields(data, onChange)}
      <button
        type="button"
        onClick={onRemove}
        className="mt-2 text-xs font-semibold text-zumi-coral-600"
      >
        Remove question
      </button>
    </div>
  );
}

function renderFields(data: QuestionData, onChange: (next: QuestionData) => void) {
  switch (data.type) {
    case "multiple_choice":
      return (
        <>
          <div className={rowClass}>
            <label className={labelClass}>Question</label>
            <Input
              value={data.prompt}
              onChange={(e) => onChange({ ...data, prompt: e.target.value })}
            />
          </div>
          <div className={rowClass}>
            <label className={labelClass}>Options</label>
            {data.options.map((opt, i) => (
              <Input
                key={i}
                className="mb-2"
                value={opt}
                onChange={(e) => {
                  const options = [...data.options];
                  options[i] = e.target.value;
                  onChange({ ...data, options });
                }}
              />
            ))}
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => onChange({ ...data, options: [...data.options, ""] })}
            >
              + Add option
            </Button>
          </div>
          <div className={rowClass}>
            <label className={labelClass}>Correct answer</label>
            <Select value={data.answer} onChange={(e) => onChange({ ...data, answer: e.target.value })}>
              <option value="">Select the correct option</option>
              {data.options
                .filter((o) => o.trim())
                .map((opt, i) => (
                  <option key={i} value={opt}>
                    {opt}
                  </option>
                ))}
            </Select>
          </div>
        </>
      );

    case "match_pairs":
      return (
        <div className={rowClass}>
          <label className={labelClass}>Pairs</label>
          {data.pairs.map((pair, i) => (
            <div key={i} className="mb-2 flex gap-2">
              <Input
                placeholder="Left"
                value={pair.left}
                onChange={(e) => {
                  const pairs = [...data.pairs];
                  pairs[i] = { ...pairs[i], left: e.target.value };
                  onChange({ ...data, pairs });
                }}
              />
              <Input
                placeholder="Right"
                value={pair.right}
                onChange={(e) => {
                  const pairs = [...data.pairs];
                  pairs[i] = { ...pairs[i], right: e.target.value };
                  onChange({ ...data, pairs });
                }}
              />
            </div>
          ))}
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={() => onChange({ ...data, pairs: [...data.pairs, { left: "", right: "" }] })}
          >
            + Add pair
          </Button>
        </div>
      );

    case "flash_cards":
      return (
        <>
          <div className={rowClass}>
            <label className={labelClass}>Front</label>
            <Input value={data.front} onChange={(e) => onChange({ ...data, front: e.target.value })} />
          </div>
          <div className={rowClass}>
            <label className={labelClass}>Back</label>
            <Input value={data.back} onChange={(e) => onChange({ ...data, back: e.target.value })} />
          </div>
        </>
      );

    case "fill_in_the_blank":
      return (
        <>
          <div className={rowClass}>
            <label className={labelClass}>Sentence (use ___ for the blank)</label>
            <Input
              value={data.sentence}
              onChange={(e) => onChange({ ...data, sentence: e.target.value })}
            />
          </div>
          <div className={rowClass}>
            <label className={labelClass}>Answer</label>
            <Input value={data.answer} onChange={(e) => onChange({ ...data, answer: e.target.value })} />
          </div>
        </>
      );

    case "spelling_input":
      return (
        <>
          <div className={rowClass}>
            <label className={labelClass}>Prompt (e.g. &quot;Spell the word for frog&quot;)</label>
            <Input value={data.prompt} onChange={(e) => onChange({ ...data, prompt: e.target.value })} />
          </div>
          <div className={rowClass}>
            <label className={labelClass}>Correct spelling</label>
            <Input value={data.answer} onChange={(e) => onChange({ ...data, answer: e.target.value })} />
          </div>
        </>
      );

    case "true_false":
      return (
        <>
          <div className={rowClass}>
            <label className={labelClass}>Statement</label>
            <Input
              value={data.statement}
              onChange={(e) => onChange({ ...data, statement: e.target.value })}
            />
          </div>
          <div className={rowClass}>
            <label className={labelClass}>Correct answer</label>
            <Select
              value={String(data.answer)}
              onChange={(e) => onChange({ ...data, answer: e.target.value === "true" })}
            >
              <option value="true">True</option>
              <option value="false">False</option>
            </Select>
          </div>
        </>
      );

    case "unscramble_word":
      return (
        <>
          <div className={rowClass}>
            <label className={labelClass}>Scrambled letters</label>
            <Input
              value={data.scrambled}
              onChange={(e) => onChange({ ...data, scrambled: e.target.value })}
            />
          </div>
          <div className={rowClass}>
            <label className={labelClass}>Answer</label>
            <Input value={data.answer} onChange={(e) => onChange({ ...data, answer: e.target.value })} />
          </div>
          <div className={rowClass}>
            <label className={labelClass}>Hint (optional)</label>
            <Input
              value={data.hint ?? ""}
              onChange={(e) => onChange({ ...data, hint: e.target.value })}
            />
          </div>
        </>
      );

    case "maths_answer":
      return (
        <>
          <div className={rowClass}>
            <label className={labelClass}>Question (e.g. &quot;7 x 8 = ?&quot;)</label>
            <Input
              value={data.question}
              onChange={(e) => onChange({ ...data, question: e.target.value })}
            />
          </div>
          <div className={rowClass}>
            <label className={labelClass}>Answer</label>
            <Input
              type="number"
              value={Number.isNaN(data.answer) ? "" : data.answer}
              onChange={(e) => onChange({ ...data, answer: Number(e.target.value) })}
            />
          </div>
        </>
      );

    case "translation":
      return (
        <>
          <div className={rowClass}>
            <label className={labelClass}>Word or phrase to translate</label>
            <Input
              value={data.sourceText}
              onChange={(e) => onChange({ ...data, sourceText: e.target.value })}
            />
          </div>
          <div className="mb-3 flex gap-2">
            <div className="flex-1">
              <label className={labelClass}>From language</label>
              <Input
                value={data.sourceLanguage}
                onChange={(e) => onChange({ ...data, sourceLanguage: e.target.value })}
              />
            </div>
            <div className="flex-1">
              <label className={labelClass}>To language</label>
              <Input
                value={data.targetLanguage}
                onChange={(e) => onChange({ ...data, targetLanguage: e.target.value })}
              />
            </div>
          </div>
          <div className={rowClass}>
            <label className={labelClass}>Correct translation</label>
            <Input value={data.answer} onChange={(e) => onChange({ ...data, answer: e.target.value })} />
          </div>
        </>
      );

    case "sentence_building":
      return (
        <div className={rowClass}>
          <label className={labelClass}>Words (in the correct order)</label>
          {data.answer.map((word, i) => (
            <Input
              key={i}
              className="mb-2"
              value={word}
              onChange={(e) => {
                const answer = [...data.answer];
                answer[i] = e.target.value;
                onChange({ ...data, answer, words: answer });
              }}
            />
          ))}
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={() =>
              onChange({ ...data, answer: [...data.answer, ""], words: [...data.words, ""] })
            }
          >
            + Add word
          </Button>
        </div>
      );
  }
}
