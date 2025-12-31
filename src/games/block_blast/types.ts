export type Cell = 0 | 1

export type Board = Cell[][]

export interface BlockShape {
    id: string
    shape: Cell[][]
    color: string
}

export interface Position {
    row: number
    col: number
}

export interface State {
    board: Board
    curBlocks: BlockShape[]
    score: number
    gameOver: boolean
}