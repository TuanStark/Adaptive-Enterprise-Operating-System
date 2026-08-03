"use client";

import { MessageSquare } from "lucide-react";
import { useComments, useAddComment } from "../hooks/useComments";
import { CommentItem } from "./CommentItem";
import { CommentInput } from "./CommentInput";

interface CommentSectionProps {
  taskId: string;
  tenantId: string;
}
export function CommentSection({ taskId, tenantId }: CommentSectionProps) {
  const { data: comments, isLoading, error } = useComments(taskId);
  const addComment = useAddComment(taskId);

  if (error) {
    return (
      <div className="p-4 text-center text-sm text-red-500">
        Failed to load comments
      </div>
    );
  }

  const handleSubmit = (content: string) => {
    addComment.mutate({ tenantId, content });
  };

  return (
    <div className="space-y-4">
      {/* Comments list */}
      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
        {isLoading ? (
          <div className="p-4 text-center text-sm text-gray-400">Loading comments...</div>
        ) : !comments || comments.length === 0 ? (
          <div className="p-6 text-center">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <MessageSquare className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">No comments yet</p>
            <p className="text-xs text-gray-400 mt-0.5">Be the first to comment</p>
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))
        )}
      </div>

      {/* Input */}
      <CommentInput onSubmit={handleSubmit} isSubmitting={addComment.isPending} />
    </div>
  );
}
