import { useDroppable } from '@dnd-kit/core'
import type { Board as BoardType, BlockShape, Position } from './types'
import { canPlaceBlock } from './utils'
import { useState } from 'react'

interface BoardProps {
  board: BoardType
  hoveredBlock: BlockShape | null
  onPositionChange?: (position: Position | null) => void
}

export default function Board({ board, hoveredBlock, onPositionChange }: BoardProps) {
  const [hoverPosition, setHoverPosition] = useState<Position | null>(null)
  const { setNodeRef } = useDroppable({ id: 'board' })

  const cellSize = 40

  const handleCellHover = (row: number, col: number) => {
    const newPosition = { row, col }
    setHoverPosition(newPosition)
    if (onPositionChange) {
      onPositionChange(newPosition)
    }
  }

  const handleMouseLeave = () => {
    setHoverPosition(null)
  }

  const isPreviewCell = (row: number, col: number): boolean => {
    if (!hoveredBlock || !hoverPosition) return false

    const relativeRow = row - hoverPosition.row
    const relativeCol = col - hoverPosition.col

    if (
      relativeRow >= 0 &&
      relativeRow < hoveredBlock.shape.length &&
      relativeCol >= 0 &&
      relativeCol < hoveredBlock.shape[0].length
    ) {
      return hoveredBlock.shape[relativeRow][relativeCol] === 1
    }

    return false
  }

  const canPlace = hoveredBlock && hoverPosition
    ? canPlaceBlock(board, hoveredBlock, hoverPosition)
    : false

  return (
    <div
      ref={setNodeRef}
      data-droppable-id="board"
      className="inline-block bg-gray-800 p-2 rounded-lg"
      onMouseLeave={handleMouseLeave}
    >
      <div className="grid gap-1" style={{
        gridTemplateColumns: `repeat(8, ${cellSize}px)`
      }}>
        {board.map((row, r) =>
          row.map((cell, c) => {
            const isPreview = isPreviewCell(r, c)
            const isFilled = cell === 1

            return (
              <div
                key={`${r}-${c}`}
                className="rounded transition-colors"
                style={{
                  width: cellSize,
                  height: cellSize,
                  backgroundColor: isFilled
                    ? '#4ECDC4'
                    : isPreview
                    ? canPlace
                      ? 'rgba(78, 205, 196, 0.5)'
                      : 'rgba(255, 107, 107, 0.5)'
                    : '#2C3E50'
                }}
                onMouseEnter={() => handleCellHover(r, c)}
              />
            )
          })
        )}
      </div>
    </div>
  )
}