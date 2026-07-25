import { useState, useRef } from 'react';
import { TaskItem, PriorityLevel } from '../types';
import { Calendar, Tag, Clock, CheckCircle2, Circle, Edit } from 'lucide-react';

interface TaskCardProps {
  task: TaskItem;
  onToggle: (taskId: string) => void;
  onEdit: (task: TaskItem) => void;
}

const priorityColors = {
  [PriorityLevel.Low]: 'bg-zinc-100 text-zinc-700 border-zinc-200',
  [PriorityLevel.Medium]: 'bg-amber-50 text-amber-800 border-amber-200',
  [PriorityLevel.High]: 'bg-orange-50 text-orange-800 border-orange-200',
  [PriorityLevel.Critical]: 'bg-red-50 text-red-800 border-red-200',
};

const priorityLabels = {
  [PriorityLevel.Low]: 'Low',
  [PriorityLevel.Medium]: 'Medium',
  [PriorityLevel.High]: 'High',
  [PriorityLevel.Critical]: 'Critical',
};

export const TaskCard = ({ task, onToggle, onEdit }: TaskCardProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragDistance, setDragDistance] = useState(0);
  const [startX, setStartX] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const formatDate = (date?: Date) => {
    if (!date) return null;
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.isCompleted;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (task.isCompleted) return;
    setIsDragging(true);
    setStartX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const distance = e.clientX - startX;
    setDragDistance(Math.max(0, Math.min(distance, 80)));
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragDistance > 40) {
      onToggle(task.taskId);
    }
    setDragDistance(0);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (task.isCompleted) return;
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const distance = e.touches[0].clientX - startX;
    setDragDistance(Math.max(0, Math.min(distance, 80)));
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragDistance > 40) {
      onToggle(task.taskId);
    }
    setDragDistance(0);
  };

  return (
    <div
      ref={cardRef}
      className={`group rounded-xl border bg-white p-4 transition-shadow hover:shadow-sm ${
        task.isCompleted ? 'border-zinc-100 opacity-60' : 'border-zinc-200'
      }`}
      style={{
        transform: `translateX(${dragDistance}px)`,
        transition: isDragging ? 'none' : 'transform 0.2s ease-out',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => onToggle(task.taskId)}
          className="mt-1 flex-shrink-0 transition-transform hover:scale-110"
        >
          {task.isCompleted ? (
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          ) : (
            <Circle className="h-6 w-6 text-zinc-400 hover:text-zinc-900" />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center justify-between">
            <h3
              className={`font-semibold text-zinc-900 transition-all ${
                task.isCompleted ? 'text-zinc-400 line-through' : ''
              }`}
            >
              {task.title}
            </h3>
            <button
              type="button"
              onClick={() => onEdit(task)}
              className="rounded p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
              title="Edit task"
            >
              <Edit className="h-4 w-4" />
            </button>
          </div>

          {task.description && (
            <p className="mb-3 line-clamp-2 text-sm text-zinc-500">{task.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {task.category && (
              <span className="inline-flex items-center gap-1 rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-zinc-700">
                <Tag className="h-3 w-3" />
                {task.category.name}
              </span>
            )}

            <span
              className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 ${
                priorityColors[task.priority]
              }`}
            >
              <Clock className="h-3 w-3" />
              {priorityLabels[task.priority]}
            </span>

            {task.dueDate && (
              <span
                className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 ${
                  isOverdue
                    ? 'border-red-200 bg-red-50 text-red-700'
                    : 'border-zinc-200 bg-zinc-50 text-zinc-600'
                }`}
              >
                <Calendar className="h-3 w-3" />
                {formatDate(task.dueDate)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
