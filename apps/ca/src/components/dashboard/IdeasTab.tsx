"use client";

import { useState } from "react";
import { addData } from "@repo/firebase";
import { useStore } from "@repo/store";
import toast from "react-hot-toast";

type IdeaCategory = "PROMOTION" | "OUTREACH" | "EVENT" | "SOCIAL_MEDIA" | "OTHER";

const CATEGORIES: { value: IdeaCategory; label: string }[] = [
  { value: "PROMOTION", label: "Promotion" },
  { value: "OUTREACH", label: "Outreach" },
  { value: "EVENT", label: "Event Idea" },
  { value: "SOCIAL_MEDIA", label: "Social Media" },
  { value: "OTHER", label: "Other" },
];

export function IdeasTab() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<IdeaCategory>("PROMOTION");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (title.trim().length < 5) e.title = "Please enter a more descriptive title.";
    // [SECURITY] Enforce maximum lengths to prevent storage abuse
    if (title.trim().length > 100) e.title = "Title must be under 100 characters.";
    if (description.trim().length < 20) e.description = "Please elaborate — at least 20 characters.";
    if (description.trim().length > 2000) e.description = "Description must be under 2000 characters.";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const { user } = useStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);

    try {
      const categoryLabel = CATEGORIES.find(c => c.value === category)?.label || category;
      const formattedIdea = `Category: ${categoryLabel}\nTitle: ${title}\nDescription: ${description}`;
      
      const data = {
        id: user?.details.id,
        name: user?.details.name,
        email: user?.details.email,
        phone: user?.details.phone,
        idea: formattedIdea,
        college: user?.details.college,
        collegeCity: user?.details.collegeCity,
      };
      
      await addData("CAsIdeas26", data);
      toast.success("Idea Submitted!");
      setSubmitted(true);
    } catch (error) {
      // [SECURITY] Do not expose raw error to user
      console.error("Idea submission error:", error);
      toast.error("Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setTitle("");
    setDescription("");
    setCategory("PROMOTION");
    setErrors({});
    setSubmitted(false);
  };

  // ── Success State ────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="w-full border border-white/10 bg-white/[0.02] backdrop-blur-md rounded-xl flex flex-col items-center justify-center py-20 px-8 text-center gap-6">
        <div className="w-12 h-12 rounded-full border border-emerald-400/30 bg-emerald-400/[0.06] flex items-center justify-center">
          <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <div className="flex flex-col gap-2">
          <p className="font-serif text-[22px] md:text-[28px] text-white uppercase tracking-tight leading-none">
            Idea Submitted
          </p>
          <p className="text-[12px] font-sans text-white/40 tracking-widest uppercase">
            Thank you — we&apos;ll review it shortly
          </p>
        </div>
        <button
          onClick={handleReset}
          className="mt-2 text-[10px] font-sans font-semibold uppercase tracking-[0.2em] text-accent hover:text-white transition-colors duration-200 border-b border-accent/30 hover:border-white/30 pb-px"
        >
          Submit another idea
        </button>
      </div>
    );
  }

  // ── Form ─────────────────────────────────────────────────────────────
  return (
    <div className="w-full border border-white/10 bg-white/[0.02] backdrop-blur-md rounded-xl overflow-hidden">

      {/* Header */}
      <div className="px-8 md:px-10 pt-8 pb-6 border-b border-white/5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-sans font-semibold tracking-[0.25em] text-accent uppercase mb-2">
              IDEAS
            </p>
            <h2 className="font-serif text-[28px] md:text-[36px] uppercase text-white leading-none tracking-tight">
              Share Your Vision
            </h2>
          </div>
          <p className="hidden md:block text-[11px] font-sans text-white/30 tracking-wide leading-relaxed text-right max-w-[260px] pb-1">
            Got a creative idea for promoting Antaragni&apos;26?<br />We want to hear it.
          </p>
        </div>
      </div>

      {/* Form Body */}
      <form onSubmit={handleSubmit} className="px-8 md:px-10 py-8 flex flex-col gap-8">

        {/* Category Chips */}
        <div className="flex flex-col gap-3">
          <label className="text-[10px] font-sans font-semibold tracking-[0.22em] text-white/30 uppercase">
            Category
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setCategory(value)}
                className={`px-4 py-1.5 rounded-full text-[10px] font-sans font-semibold tracking-[0.15em] uppercase transition-all duration-200 border ${category === value
                  ? "bg-accent border-accent text-white shadow-lg shadow-accent/20"
                  : "bg-transparent border-white/10 text-white/40 hover:border-white/25 hover:text-white/70"
                  }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div className="flex flex-col gap-3">
          <label
            htmlFor="idea-title"
            className="text-[10px] font-sans font-semibold tracking-[0.22em] text-white/30 uppercase"
          >
            Title
          </label>
          <input
            id="idea-title"
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) setErrors((p) => ({ ...p, title: undefined }));
            }}
            placeholder="Give your idea a short, punchy name"
            className={`w-full bg-transparent border-b ${errors.title ? "border-red-400/60" : "border-white/10 focus:border-accent/60"
              } py-3 text-[15px] md:text-[16px] font-sans text-white placeholder-white/25 focus:outline-none transition-colors duration-200`}
          />
          {errors.title && (
            <p className="text-[11px] font-sans text-red-400/70 tracking-wide">{errors.title}</p>
          )}
        </div>

        {/* Description */}
        <div className="flex flex-col gap-3">
          <div className="flex items-end justify-between">
            <label
              htmlFor="idea-description"
              className="text-[10px] font-sans font-semibold tracking-[0.22em] text-white/30 uppercase"
            >
              Description
            </label>
            <span className={`text-[10px] font-sans tabular-nums transition-colors duration-200 ${description.length > 19 ? "text-white/30" : "text-white/15"
              }`}>
              {description.length}
            </span>
          </div>
          <textarea
            id="idea-description"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (errors.description) setErrors((p) => ({ ...p, description: undefined }));
            }}
            placeholder="Describe your idea — what it is, how it works, and why it will drive awareness for Antaragni…"
            rows={5}
            className={`w-full bg-transparent border-b ${errors.description ? "border-red-400/60" : "border-white/10 focus:border-accent/60"
              } py-3 text-[14px] md:text-[15px] font-sans text-white placeholder-white/25 focus:outline-none transition-colors duration-200 resize-none leading-relaxed`}
          />
          {errors.description && (
            <p className="text-[11px] font-sans text-red-400/70 tracking-wide">{errors.description}</p>
          )}
        </div>

        {/* Submit Row */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <p className="text-[15px] font-sans text-white/20 tracking-wide">
            All ideas are reviewed by the core team
          </p>
          <button
            id="idea-submit-btn"
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-3 px-7 py-3 bg-accent hover:bg-red-600 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed text-[10px] font-sans font-bold uppercase tracking-[0.22em] text-white rounded-lg transition-all duration-200 shadow-lg shadow-accent/15"
          >
            {isSubmitting ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Submitting
              </>
            ) : (
              <>
                Submit
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
