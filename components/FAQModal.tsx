"use client";

import React, { useState, useEffect } from "react";
import { X, HelpCircle, Sparkles } from "lucide-react";
import { FAQItem } from "@/lib/types";

interface FAQModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (faq: FAQItem) => void;
  faqToEdit?: FAQItem | null;
  nextOrder?: number;
}

export default function FAQModal({
  isOpen,
  onClose,
  onSave,
  faqToEdit,
  nextOrder = 1,
}: FAQModalProps) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [order, setOrder] = useState(nextOrder);

  useEffect(() => {
    if (faqToEdit) {
      setQuestion(faqToEdit.question || "");
      setAnswer(faqToEdit.answer || "");
      setOrder(faqToEdit.order ?? nextOrder);
    } else {
      setQuestion("");
      setAnswer("");
      setOrder(nextOrder);
    }
  }, [faqToEdit, nextOrder, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) return;

    const id = faqToEdit?.id || `faq-${Date.now()}`;

    const newFAQ: FAQItem = {
      id,
      question: question.trim(),
      answer: answer.trim(),
      order: Number(order) || nextOrder,
    };

    onSave(newFAQ);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {faqToEdit ? "Edit FAQ" : "Add New FAQ Question"}
              </h2>
              <p className="text-xs text-slate-500">
                Syncs directly to database & public travel guide
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-200/60 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Display Order (1 = Top)
            </label>
            <input
              type="number"
              min="1"
              max="99"
              value={order}
              onChange={(e) => setOrder(parseInt(e.target.value) || 1)}
              className="w-24 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Question Title *
            </label>
            <input
              type="text"
              required
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. Can hotels arrange airport transfers from Guwahati?"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Answer & Advice *
            </label>
            <textarea
              rows={4}
              required
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Provide a clear, reassuring answer for guests planning their trip..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white resize-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{faqToEdit ? "Save Changes" : "Create FAQ"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
