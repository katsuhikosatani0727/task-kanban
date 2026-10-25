"use client";

import NewTaskForm from "./new-task-form";
import TaskList from "./task-list";
import { useTaskBoard } from "./use-task-board";

export default function TaskBoard() {
  const board = useTaskBoard();

  return (
    <main className="flex min-h-full flex-1 justify-center bg-gradient-to-b from-zinc-100 to-zinc-200 px-4 py-12 sm:px-8 dark:from-black dark:to-zinc-900">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 h-1 w-12 rounded-full bg-amber-500" />
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            タスク管理
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            タスクの追加・編集・削除をその場で反映します
          </p>
        </div>

        <NewTaskForm
          title={board.newTitle}
          description={board.newDescription}
          isSubmitting={board.isAdding}
          error={board.addError}
          onTitleChange={board.setNewTitle}
          onDescriptionChange={board.setNewDescription}
          onSubmit={board.handleAddSubmit}
        />

        <TaskList
          isLoading={board.isLoading}
          fetchError={board.fetchError}
          tasks={board.tasks}
          editingTaskId={board.editingTaskId}
          editTitle={board.editTitle}
          editDescription={board.editDescription}
          editStatus={board.editStatus}
          isUpdating={board.isUpdating}
          updateError={board.updateError}
          onEditTitleChange={board.setEditTitle}
          onEditDescriptionChange={board.setEditDescription}
          onEditStatusChange={board.setEditStatus}
          onEditSubmit={board.handleEditSubmit}
          onStartEditing={board.startEditing}
          onCancelEditing={board.cancelEditing}
          confirmingDeleteId={board.confirmingDeleteId}
          isDeleting={board.isDeleting}
          deleteError={board.deleteError}
          onRequestDelete={board.requestDelete}
          onCancelDelete={board.cancelDelete}
          onConfirmDelete={board.confirmDelete}
        />
      </div>
    </main>
  );
}
