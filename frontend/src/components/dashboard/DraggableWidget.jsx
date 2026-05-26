import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, X } from 'lucide-react'

export default function DraggableWidget({ id, title, children, onRemove, fullWidth }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 'auto',
  }

  return (
    <div ref={setNodeRef} style={style} className={`card relative group${fullWidth ? ' lg:col-span-2' : ''}`}>
      {/* Widget header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            {...attributes}
            {...listeners}
            className="p-1.5 rounded-lg hover:bg-gray-100 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
            title="Déplacer"
          >
            <GripVertical size={14} />
          </button>
          {onRemove && (
            <button
              onClick={() => onRemove(id)}
              className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"
              title="Supprimer"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>
      {children}
    </div>
  )
}
