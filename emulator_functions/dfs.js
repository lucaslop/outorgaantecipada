function isValidMove(grid, visited, row, col, prevX, prevY) {
    const numRows = grid.length;
    const numCols = grid[0].length;
    
    const isAdjacent = (Math.abs(row - prevX) === 1 && col === prevY) || (Math.abs(col - prevY) === 1 && row === prevX);

    return row >= 0 && row < numRows && col >= 0 && col < numCols &&
        grid[row][col] !== 2 && !visited[row][col] && isAdjacent;
}

function findPath(grid) {
    const numRows = grid.length;
    const numCols = grid[0].length;
    const visited = new Array(numRows).fill(0).map(() => new Array(numCols).fill(false));
    const path = [];

    // Encontrar a posição inicial do cortador de grama (valor 1 no grid)
    let startX = 0;
    let startY = 0;

    const directions = [[-1, 0, 'UP'], [1, 0, 'DOWN'], [0, -1, 'LEFT'], [0, 1, 'RIGHT']];
    const stack = [[startX, startY, '', path]];

    while (stack.length > 0) {
        const [x, y, direction, currentPath] = stack.pop();

        if (visited[x][y]) {
            continue;
        }

        visited[x][y] = true;
        currentPath.push({ x, y, direction });

        for (const [dx, dy, dir] of directions) {
            const newRow = x + dx;
            const newCol = y + dy;

            if (isValidMove(grid, visited, newRow, newCol, x, y)) {
                stack.push([newRow, newCol, dir, currentPath]);
            }
        }
    }

    return path;
}
