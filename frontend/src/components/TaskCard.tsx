import { useState, useRef } from 'react';
import { TaskItem, PriorityLevel } from '../types';
import { Calendar, Tag, Clock, CheckCircle2, Circle, Edit } from 'lucide-react';

interface TaskCardProps {
  task: TaskItem;
  onToggle: (taskId: string) => void;
  onEdit: (task: TaskItem) => void;
}

const priorityColors = {
  [PriorityLevel.Low]: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  [PriorityLevel.Medium]: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  [PriorityLevel.High]: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  [PriorityLevel.Critical]: 'bg-red-500/20 text-red-300 border-red-500/30',
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
    const currentX = e.clientX;
    const distance = currentX - startX;
    setDragDistance(Math.max(0, Math.min(distance, 80))); // Limit to 80px
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragDistance > 40) { // Threshold for completion
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
    const currentX = e.touches[0].clientX;
    const distance = currentX - startX;
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
      className={`group bg-white/5 backdrop-blur-sm border rounded-xl p-4 hover:bg-white/10 transition-all duration-200 ${task.isCompleted ? 'border-white/10 opacity-60' : 'border-white/20 hover:border-white/30'}`}
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
          onClick={() => onToggle(task.taskId)}
          className="mt-1 flex-shrink-0 transition-transform hover:scale-110"
        >
          {task.isCompleted ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          ) : (
            <Circle className="w-6 h-6 text-slate-400 hover:text-cyan-400 transition-colors" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3
              className={`font-semibold text-white transition-all ${
                task.isCompleted ? 'line-through text-slate-400' : ''
              }`}
            >
              {task.title}
            </h3>
            <button
              onClick={() => onEdit(task)}
              className="text-slate-400 hover:text-cyan-400 transition-colors p-1 rounded hover:bg-white/10"
              title="Edit task"
            >
              <Edit className="w-4 h-4" />
            </button>
          </div>

          {task.description && (
            <p className="text-sm text-slate-300 mb-3 line-clamp-2">{task.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {task.category && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded-md border border-cyan-500/30">
                <Tag className="w-3 h-3" />
                {task.category.name}
              </span>
            )}

            <span
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border ${
                priorityColors[task.priority]
              }`}
            >
              <Clock className="w-3 h-3" />
              {priorityLabels[task.priority]}
            </span>

            {task.dueDate && (
              <span
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border ${
                  isOverdue
                    ? 'bg-red-500/20 text-red-300 border-red-500/30'
                    : 'bg-slate-500/20 text-slate-300 border-slate-500/30'
                }`}
              >
                <Calendar className="w-3 h-3" />
                {formatDate(task.dueDate)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
