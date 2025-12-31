import { useState, useRef } from 'react'
// useEffect
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import type {DragStartEvent, DragEndEvent} from '@dnd-kit/core'
import Board from './Board'
import BlockPiece from './BlockPiece'
import type { State, BlockShape, Position } from './types'
import {
  createEmptyBoard,
  generate3Blocks,
  canPlaceBlock,
  placeBlock,
  clearLines,
  isGameOver,
  calculateScore
} from './utils'
// import { useAuth } from '../../lib/AuthContext'
// import { supabase } from '../../lib/supabase'

export default function BlockBlast() {
  // const { user } = useAuth()/
  const [State, setState] = useState<State>({
    board: createEmptyBoard(),
    curBlocks: generate3Blocks(),
    score: 0,
    gameOver: false
  })
  const [draggedBlock, setDraggedBlock] = useState<BlockShape | null>(null)
  const [_, setDropPosition] = useState<Position | null>(null)
  const dropPositionRef = useRef<Position | null>(null) // 추가
  // const [highScore, setHighScore] = useState<number>(0)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  )
  /*
  useEffect(() => {
    if (user) {
      loadHighScore()
    }
  }, [user])

  const loadHighScore = async () => {
    if (!user) return

    const { data } = await supabase
      .from('scores')
      .select('score')
      .eq('game_name', 'block-blast')
      .eq('user_id', user.user_id)
      .order('score', { ascending: false })
      .limit(1)
      .single()

    if (data) {
      setHighScore(data.score)
    }
  }

  const saveScore = async (score: number) => {
    if (!user) return

    await supabase.from('scores').insert({
      game_name: 'block-blast',
      score: score,
      user_id: user.user_id
    })

    if (score > highScore) {
      setHighScore(score)
    }
  }
  */
  const handleDragStart = (event: DragStartEvent) => {
    const block = event.active.data.current as BlockShape
    setDraggedBlock(block)
  }

const handleDragEnd = (event: DragEndEvent) => {
  const block = draggedBlock
  setDraggedBlock(null)

  if (!block || !event.over || event.over.id !== 'board') {
    setDropPosition(null)
    dropPositionRef.current = null
    return
  }

  // 마우스 최종 위치에서 보드 셀 계산
  const boardElement = document.querySelector('[data-droppable-id="board"]')
  if (!boardElement) return

  const rect = boardElement.getBoundingClientRect()
  
  // delta를 사용해 현재 마우스 위치 계산
  const deltaX = event.delta.x
  const deltaY = event.delta.y
  
  // active의 초기 위치
  const initialRect = event.active.rect.current.initial
  if (!initialRect) return
  
  const finalX = initialRect.left + deltaX
  const finalY = initialRect.top + deltaY
  
  // 보드 기준 상대 좌표
  const relativeX = finalX - rect.left
  const relativeY = finalY - rect.top
  
  const cellSize = 40 + 4 // cell + gap
  const col = Math.floor((relativeX - 8) / cellSize) // padding 제외
  const row = Math.floor((relativeY - 8) / cellSize)

  const finalPosition = { row, col }
  
  if (!canPlaceBlock(State.board, block, finalPosition)) {
    console.log('Cannot place block')
    return
  }

  // 블록 배치
  let newBoard = placeBlock(State.board, block, finalPosition)
  
  const blockSize = block.shape.flat().filter(cell => cell === 1).length
  const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard)
  const points = calculateScore(linesCleared, blockSize)
  const newScore = State.score + points

  const remainingBlocks = State.curBlocks.filter(b => b.id !== block.id)
  const newBlocks = remainingBlocks.length === 0 ? generate3Blocks() : remainingBlocks
  const gameOver = isGameOver(clearedBoard, newBlocks)

  setState({
    board: clearedBoard,
    curBlocks: newBlocks,
    score: newScore,
    gameOver
  })

  setDropPosition(null)
  dropPositionRef.current = null
  /*
  if (gameOver && user) {
    saveScore(newScore)
  }
    */
}

  const resetGame = () => {
    setState({
      board: createEmptyBoard(),
      curBlocks: generate3Blocks(),
      score: 0,
      gameOver: false
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Block Blast</h1>
          <div className="flex justify-center gap-8 text-white">
            <div>
              <div className="text-sm opacity-70">점수</div>
              <div className="text-2xl font-bold">{State.score}</div>
            </div>
            {/*user && (
              <div>
                <div className="text-sm opacity-70">최고 점수</div>
                <div className="text-2xl font-bold">{highScore}</div>
              </div>
            )*/}
          </div>
        </div>

        <DndContext 
          sensors={sensors}
          onDragStart={handleDragStart} 
          onDragEnd={handleDragEnd}
        >
          <div className="flex justify-center mb-8">
            <Board
              board={State.board}
              hoveredBlock={draggedBlock}
              onPositionChange={(pos) => {
                setDropPosition(pos)
                dropPositionRef.current = pos
              }}
            />
          </div>

          <div className="flex justify-center gap-8 mb-8">
            {State.curBlocks.map(block => (
              <BlockPiece
                key={block.id}
                block={block}
                disabled={State.gameOver}
              />
            ))}
          </div>

          <DragOverlay>
            {draggedBlock && <BlockPiece block={draggedBlock} />}
          </DragOverlay>
        </DndContext>

        {State.gameOver && (
          <div className="text-center">
            <div className="bg-red-500 text-white px-6 py-3 rounded-lg inline-block mb-4">
              게임 오버!
            </div>
            <div>
              <button
                onClick={resetGame}
                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition"
              >
                다시 시작
              </button>
            </div>
          </div>
        )}

        <div className="text-center text-white opacity-70 text-sm mt-8">
          블록을 드래그해서 보드에 배치하세요!
        </div>
      </div>
    </div>
  )
}