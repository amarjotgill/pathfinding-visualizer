// A* Search Algorithm
export function astar(grid, startNode, finishNode) {
  startNode.g = 0;
  startNode.h = heuristic(startNode, finishNode);
  startNode.f = startNode.g + startNode.h;

  const openList = [startNode];
  const closedList = [];

  while (openList.length > 0) {
    // Sort openList to get the node with the lowest f value
    openList.sort((nodeA, nodeB) => nodeA.f - nodeB.f);

    const currentNode = openList.shift();
    closedList.push(currentNode);

    if (currentNode === finishNode) {
      const shortestPath = getNodesInShortestPathOrderAstar(finishNode);
      return { visitedNodes: closedList, shortestPath };
    }

    const neighbors = getNeighbors(currentNode, grid);

    for (const neighbor of neighbors) {
      if (closedList.includes(neighbor) || neighbor.isWall) {
        continue;
      }

      const tentativeGScore = currentNode.g + 1; // Assuming cost between adjacent nodes is 1

      if (tentativeGScore < neighbor.g || !openList.includes(neighbor)) {
        neighbor.previousNode = currentNode;
        neighbor.g = tentativeGScore;
        neighbor.h = heuristic(neighbor, finishNode);
        neighbor.f = neighbor.g + neighbor.h;

        if (!openList.includes(neighbor)) {
          openList.push(neighbor);
        }
      }
    }
  }

  // No path found
  return { visitedNodes: closedList, shortestPath: [] };
}

function heuristic(nodeA, nodeB) {
  // Manhattan distance
  return Math.abs(nodeA.row - nodeB.row) + Math.abs(nodeA.col - nodeB.col);
}

function getNeighbors(node, grid) {
  const neighbors = [];
  const { col, row } = node;

  // Up
  if (row > 0) neighbors.push(grid[row - 1][col]);
  // Down
  if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
  // Left
  if (col > 0) neighbors.push(grid[row][col - 1]);
  // Right
  if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);

  return neighbors.filter(neighbor => !neighbor.isVisited); // A* uses closedList, isVisited might be redundant or for UI
}

export function getNodesInShortestPathOrderAstar(finishNode) {
  const nodesInShortestPathOrder = [];
  let currentNode = finishNode;
  while (currentNode !== null) {
    nodesInShortestPathOrder.unshift(currentNode);
    currentNode = currentNode.previousNode;
  }
  return nodesInShortestPathOrder;
}
