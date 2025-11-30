"use client";

import { useState } from "react";
import { Loader2, Send, X } from "lucide-react";

interface JoinRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (note: string) => void;
  isPending: boolean;
}

export default function JoinRequestModal({ isOpen, onClose, onSubmit, isPending }: JoinRequestModalProps) {
  const [note, setNote] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#111633] border border-white/10 w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X size={20} />
        </button>

        <h3 className="text-xl font-bold text-white mb-2">Request to Join</h3>
        <p className="text-sm text-gray-400 mb-4">
          This is a private event. Share a brief intro for the host to review.
        </p>

        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="e.g. Alice (Dev at Zama), Twitter: @alice_eth"
          className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-[#CFFF04] min-h-[120px] mb-6 resize-none"
        />

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(note)}
            disabled={!note.trim() || isPending}
            className="flex-1 py-3 rounded-xl bg-[#CFFF04] hover:bg-[#bce600] text-black font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isPending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
            Send Request
          </button>
        </div>
      </div>
    </div>
  );
}
