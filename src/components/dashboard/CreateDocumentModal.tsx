"use client";

import { useState } from "react";
import { FileText, FlaskConical, File } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { TemplateType } from "@/lib/store/types";

// ─── Template definitions ─────────────────────────────────────────────────────

interface TemplateOption {
  type: TemplateType;
  label: string;
  description: string;
  icon: React.ReactNode;
  defaultWordTarget?: number;
}

const TEMPLATES: TemplateOption[] = [
  {
    type: "essay",
    label: "Essay",
    description: "Title, introduction, body paragraphs, conclusion",
    icon: <FileText className="h-5 w-5" />,
    defaultWordTarget: 1000,
  },
  {
    type: "lab-report",
    label: "Lab Report",
    description: "Aim, hypothesis, method, results, discussion",
    icon: <FlaskConical className="h-5 w-5" />,
    defaultWordTarget: 800,
  },
  {
    type: "blank",
    label: "Blank",
    description: "Start with a clean page",
    icon: <File className="h-5 w-5" />,
  },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface CreateDocumentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (template: TemplateType, wordTarget?: number) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CreateDocumentModal({
  open,
  onOpenChange,
  onCreate,
}: CreateDocumentModalProps) {
  const [selected, setSelected] = useState<TemplateType>("essay");
  const [wordTargetInput, setWordTargetInput] = useState("1000");

  const selectedTemplate = TEMPLATES.find((t) => t.type === selected)!;

  function handleCreate() {
    const parsed = parseInt(wordTargetInput, 10);
    const wordTarget =
      selected !== "blank" && !isNaN(parsed) && parsed > 0 ? parsed : undefined;
    onCreate(selected, wordTarget);
    // Reset for next open
    setSelected("essay");
    setWordTargetInput("1000");
    onOpenChange(false);
  }

  function handleTemplateSelect(type: TemplateType) {
    setSelected(type);
    const tpl = TEMPLATES.find((t) => t.type === type);
    if (tpl?.defaultWordTarget) {
      setWordTargetInput(String(tpl.defaultWordTarget));
    } else {
      setWordTargetInput("");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New document</DialogTitle>
          <DialogDescription>
            Choose a template and set an optional word target to get started.
          </DialogDescription>
        </DialogHeader>

        {/* ── Template picker ────────────────────────────────────────────────── */}
        <div className="space-y-2">
          <Label>Template</Label>
          <div className="grid grid-cols-3 gap-2">
            {TEMPLATES.map((tpl) => (
              <button
                key={tpl.type}
                type="button"
                onClick={() => handleTemplateSelect(tpl.type)}
                className={`flex flex-col items-center gap-2 rounded-lg border p-4 text-center transition-colors ${
                  selected === tpl.type
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border bg-background hover:bg-muted"
                }`}
                aria-pressed={selected === tpl.type}
              >
                {tpl.icon}
                <span className="text-xs font-medium">{tpl.label}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {selectedTemplate.description}
          </p>
        </div>

        {/* ── Word target (hidden for blank) ────────────────────────────────── */}
        {selected !== "blank" && (
          <div className="space-y-2">
            <Label htmlFor="word-target">Word target</Label>
            <div className="relative">
              <Input
                id="word-target"
                type="number"
                min={1}
                value={wordTargetInput}
                onChange={(e) => setWordTargetInput(e.target.value)}
                placeholder="e.g. 1000"
                className="pr-14"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                words
              </span>
            </div>
          </div>
        )}

        {/* ── Actions ──────────────────────────────────────────────────────────── */}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate}>Create document</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
