import { useDraggable } from "@dnd-kit/core"
import type { BlockShape } from "./types"

interface BlockPieceProps {
    block : BlockShape,
    disabled ?: boolean
}

export default function BlockPiece({block, disabled}: BlockPieceProps) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: block.id,
        data: block,
        disabled: disabled
    })

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
    } : undefined

    const cellSize = 30
    return (
    <div
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        className={`inline-block cursor-grab active:cursor-grabbing ${disabled ? 'opacity-30' : ''}`}
    >
        <div className="grid gap-1" style={{
        gridTemplateColumns: `repeat(${block.shape[0].length}, ${cellSize}px)`
        }}>
        {block.shape.map((row, r) =>
            row.map((cell, c) => (
            <div
                key={`${r}-${c}`}
                className="rounded"
                style={{
                width: cellSize,
                height: cellSize,
                backgroundColor: cell === 1 ? block.color : 'transparent'
                }}
            />
            ))
        )}
        </div>
    </div>
    )
}