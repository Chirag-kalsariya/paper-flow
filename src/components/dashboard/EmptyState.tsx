"use client";

import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onCreateClick: () => void;
}

export function EmptyState({ onCreateClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-6 rounded-full bg-muted p-6">
        <FileText className="h-12 w-12 text-muted-foreground" />
      </div>
      <h2 className="mb-2 text-2xl font-semibold tracking-tight">
        No documents yet
      </h2>
      <p className="mb-8 max-w-sm text-muted-foreground">
        Create your first document and start writing
      </p>
      <Button size="lg" onClick={onCreateClick}>
        Create your first document
      </Button>
    </div>
  );
}
