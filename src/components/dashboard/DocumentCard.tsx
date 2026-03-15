"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { FileText, Trash2, MoreVertical } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { PFDocument } from "@/lib/store/types";

// ─── Label map ────────────────────────────────────────────────────────────────

const TEMPLATE_LABELS: Record<PFDocument["template"], string> = {
  essay: "Essay",
  "lab-report": "Lab Report",
  blank: "Blank",
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface DocumentCardProps {
  document: PFDocument;
  onDelete: (id: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DocumentCard({ document, onDelete }: DocumentCardProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const updatedLabel = formatDistanceToNow(new Date(document.updatedAt), {
    addSuffix: true,
  });

  function handleCardClick() {
    router.push(`/document/${document.id}`);
  }

  function handleDeleteConfirm() {
    onDelete(document.id);
    setShowDeleteDialog(false);
  }

  return (
    <>
      <Card
        className="group cursor-pointer transition-shadow hover:shadow-md"
        onClick={handleCardClick}
        role="button"
        tabIndex={0}
        aria-label={`Open ${document.title}`}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleCardClick();
        }}
      >
        {/* ── Preview area ─────────────────────────────────────────────────── */}
        <div className="flex h-32 items-center justify-center rounded-t-xl bg-muted">
          <FileText className="h-10 w-10 text-muted-foreground/50" />
        </div>

        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="line-clamp-2 text-base leading-snug">
              {document.title}
            </CardTitle>

            {/* ── Kebab menu ───────────────────────────────────────────────── */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
                  aria-label="Document options"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteDialog(true);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="pb-2">
          <Badge variant="secondary" className="text-xs">
            {TEMPLATE_LABELS[document.template]}
          </Badge>
        </CardContent>

        <CardFooter className="pt-0">
          <p className="text-xs text-muted-foreground">
            Edited {updatedLabel}
          </p>
        </CardFooter>
      </Card>

      {/* ── Delete confirmation dialog ────────────────────────────────────────── */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete document?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{document.title}&rdquo; will be permanently deleted. This
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteConfirm}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
