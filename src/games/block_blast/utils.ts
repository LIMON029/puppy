import type { Board, BlockShape, Position } from './types'

// 빈 보드 생성
export const createEmptyBoard = (): Board => {
  return Array(8).fill(null).map(() => Array(8).fill(0))
}

// 블록 모양 정의
export const BLOCK_SHAPES: Omit<BlockShape, 'id'>[] = [
  // 1x1
  { shape: [[1]], color: '#FF6B6B' },
  
  // 2x2
  { shape: [[1, 1], [1, 1]], color: '#4ECDC4' },
  
  // 1x2 가로
  { shape: [[1, 1]], color: '#45B7D1' },
  
  // 2x1 세로
  { shape: [[1], [1]], color: '#96CEB4' },
  
  // 1x3 가로
  { shape: [[1, 1, 1]], color: '#FFEAA7' },
  
  // 3x1 세로
  { shape: [[1], [1], [1]], color: '#DFE6E9' },
  
  // L자 모양
  { shape: [[1, 0], [1, 0], [1, 1]], color: '#A29BFE' },
  
  // T자 모양
  { shape: [[1, 1, 1], [0, 1, 0]], color: '#FD79A8' },
  
  // 2x3
  { shape: [[1, 1, 1], [1, 1, 1]], color: '#FDCB6E' },
]

// 랜덤 블록 3개 생성
export const generate3Blocks = (): BlockShape[] => {
  return Array(3).fill(null).map((_, index) => {
    const randomShape = BLOCK_SHAPES[Math.floor(Math.random() * BLOCK_SHAPES.length)]
    return {
      ...randomShape,
      id: `block-${Date.now()}-${index}`
    }
  })
}

// 블록을 보드에 배치 가능한지 확인
export const canPlaceBlock = (
  board: Board,
  block: BlockShape,
  position: Position
): boolean => {
  const { row, col } = position
  const { shape } = block

  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c] === 1) {
        const boardRow = row + r
        const boardCol = col + c

        // 보드 범위 밖
        if (boardRow < 0 || boardRow >= 8 || boardCol < 0 || boardCol >= 8) {
          return false
        }

        // 이미 채워진 칸
        if (board[boardRow][boardCol] === 1) {
          return false
        }
      }
    }
  }

  return true
}

// 블록을 보드에 배치
export const placeBlock = (
  board: Board,
  block: BlockShape,
  position: Position
): Board => {
  const newBoard = board.map(row => [...row])
  const { row, col } = position
  const { shape } = block

  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c] === 1) {
        newBoard[row + r][col + c] = 1
      }
    }
  }

  return newBoard
}

// 완성된 줄 찾기 및 제거
export const clearLines = (board: Board): { newBoard: Board; linesCleared: number } => {
  let newBoard = board.map(row => [...row])
  let linesCleared = 0

  // 가로 줄 확인
  for (let r = 0; r < 8; r++) {
    if (newBoard[r].every(cell => cell === 1)) {
      newBoard[r] = Array(8).fill(0)
      linesCleared++
    }
  }

  // 세로 줄 확인
  for (let c = 0; c < 8; c++) {
    if (newBoard.every(row => row[c] === 1)) {
      newBoard.forEach(row => row[c] = 0)
      linesCleared++
    }
  }

  return { newBoard, linesCleared }
}

// 게임 오버 확인 (더 이상 블록을 놓을 수 없는지)
export const isGameOver = (board: Board, blocks: BlockShape[]): boolean => {
  for (const block of blocks) {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (canPlaceBlock(board, block, { row: r, col: c })) {
          return false
        }
      }
    }
  }
  return true
}

// 점수 계산
export const calculateScore = (linesCleared: number, blockSize: number): number => {
  const lineScore = linesCleared * 100
  const blockScore = blockSize * 10
  return lineScore + blockScore
}