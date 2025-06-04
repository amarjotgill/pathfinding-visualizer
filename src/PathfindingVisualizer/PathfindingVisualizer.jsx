import React, {Component} from 'react';
import Node from './Node/Node';
import {dijkstra, getNodesInShortestPathOrder} from '../algorithms/dijkstra';
import {depthFirst} from '../algorithms/dfs';
import {astar, getNodesInShortestPathOrderAstar} from '../algorithms/astar';

import './PathfindingVisualizer.css';


const START_NODE_ROW = 10;
 const START_NODE_COL = 15;
 const FINISH_NODE_ROW = 10;
 const FINISH_NODE_COL = 35;


export default class PathfindingVisualizer extends Component {
  constructor() {
    super();
    this.state = {
      grid: [],
      mouseIsPressed: false,
      visitedNodes: [],
      shortestPath: [],
      runningAlgo: false,
      startRow: START_NODE_ROW,
      startCol: START_NODE_COL,
      finishRow: FINISH_NODE_ROW,
      finishCol: FINISH_NODE_COL
    };
  }

  componentDidMount() {
    const grid = getInitialGrid();
    this.setState({grid});
  }

  handleMouseDown(row, col) {
    const newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
    this.setState({grid: newGrid, mouseIsPressed: true});
  }

  handleMouseEnter(row, col) {
    if (!this.state.mouseIsPressed) return;
    const newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
    this.setState({grid: newGrid});
  }

  handleMouseUp() {
    this.setState({mouseIsPressed: false});
  }

  animateAlgorithm(visitedNodesInOrder, nodesInShortestPathOrder) {
    for (let i = 0; i <= visitedNodesInOrder.length; i++) {
      if (i === visitedNodesInOrder.length) {
        setTimeout(() => {
          this.animateShortestPath(nodesInShortestPathOrder);
        }, 10 * i);
        return;
      }
      setTimeout(() => {
        const node = visitedNodesInOrder[i];
        document.getElementById(`node-${node.row}-${node.col}`).className =
          'node node-visited';
      }, 10 * i);
    }
  }

  animateShortestPath(nodesInShortestPathOrder) {
    for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
      setTimeout(() => {
        const node = nodesInShortestPathOrder[i];
        document.getElementById(`node-${node.row}-${node.col}`).className =
          'node node-shortest-path';
      }, 45 * i);
    }
  }

  visualizeDijkstra() {
    const grid = resetNodeProperties(this.state.grid); // Reset node states
    const startNode = grid[START_NODE_ROW][START_NODE_COL];
    const finishNode = grid[FINISH_NODE_ROW][FINISH_NODE_COL];
    let visitedNodesInOrder = dijkstra(grid, startNode, finishNode);
    let nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode);
    this.setState({visitedNodes: visitedNodesInOrder, shortestPath: nodesInShortestPathOrder}); // Keep track for clearing
    this.animateAlgorithm(visitedNodesInOrder, nodesInShortestPathOrder);
  }

  visualizeAstar() {
    const grid = resetNodeProperties(this.state.grid); // Reset node states before running
    const startNode = grid[this.state.startRow][this.state.startCol];
    const finishNode = grid[this.state.finishRow][this.state.finishCol];
    const { visitedNodes, shortestPath } = astar(grid, startNode, finishNode);
    this.setState({visitedNodes: visitedNodes, shortestPath: shortestPath}); // Keep track for clearing
    this.animateAlgorithm(visitedNodes, shortestPath);
  }

  visualizeDfs(){
    const grid = resetNodeProperties(this.state.grid); // Reset node states
    const startNode = grid[this.state.startRow][this.state.startCol];
    const finishNode = grid[this.state.finishRow][this.state.finishCol];
    // DFS in the original code doesn't seem to use getNodesInShortestPathOrder, adjust if needed
    let dfsVisitedNodes = depthFirst(grid, startNode, finishNode, this.state.startRow, this.state.startCol);
    this.setState({visitedNodes: dfsVisitedNodes, shortestPath: [] }); // Keep track for clearing
    this.animateAlgorithm(dfsVisitedNodes, []);
  }

  clearBoard() {
    const newGrid = this.state.grid.map(row =>
      row.map(node => {
        // Retain wall status, start/finish status
        const isStart = node.row === this.state.startRow && node.col === this.state.startCol;
        const isFinish = node.row === this.state.finishRow && node.col === this.state.finishCol;

        // Reset visual state by changing class name
        if (isStart) {
          document.getElementById(`node-${node.row}-${node.col}`).className = 'node node-start';
        } else if (isFinish) {
          document.getElementById(`node-${node.row}-${node.col}`).className = 'node node-finish';
        } else if (node.isWall) { // Keep walls visually
           document.getElementById(`node-${node.row}-${node.col}`).className = 'node node-wall';
        }
         else {
          document.getElementById(`node-${node.row}-${node.col}`).className = 'node';
        }

        // Return a new node object with properties reset, keeping essential static ones
        return {
          ...createNode(node.col, node.row), // Gets initial f,g,h, distance, etc.
          isWall: node.isWall, // Preserve wall state
          // isStart and isFinish will be correctly set by createNode based on START_NODE_ROW/COL
        };
      })
    );
    this.setState({ grid: newGrid, visitedNodes: [], shortestPath: [] });
  }

  // unVisitNodes is effectively replaced by clearBoard / resetNodeProperties logic
  // Keeping it if other functionalities depend on it, but for algorithm runs, resetNodeProperties is better.
  // For now, let's assume clearBoard handles the primary reset.
  // If fine-grained unVisit (only visual) is needed, it can be kept or refactored.

  render() {
    const {grid, mouseIsPressed} = this.state;
    return (
      <React.Fragment>
              <div className="options">
              <button onClick={() => this.visualizeDijkstra()}>
                  Visualize Dijkstra's Algorithm
              </button>
              <button onClick={() => this.visualizeAstar()}>
                  Visualize A* Algorithm
              </button>
              <button onClick={() => this.visualizeDfs()}>
                  Visualize Depth's First Search
              </button>
              <button onClick={() => this.clearBoard()}>
                    Clear Board
              </button>
            </div>
        
        <div className="grid">
          {grid.map((row, rowIdx) => {
            return (
              <div key={rowIdx}>
                {row.map((node, nodeIdx) => {
                  const {row, col, isFinish, isStart, isWall} = node;
                  return (
                    <Node
                      key={nodeIdx}
                      col={col}
                      isFinish={isFinish}
                      isStart={isStart}
                      isWall={isWall}
                      mouseIsPressed={mouseIsPressed}
                      onMouseDown={(row, col) => this.handleMouseDown(row, col)}
                      onMouseEnter={(row, col) =>
                        this.handleMouseEnter(row, col)
                      }
                      onMouseUp={() => this.handleMouseUp()}
                      row={row}></Node>
                  );
                })}
              </div>
            );
          })}
        </div>
        
      </React.Fragment>
    );
  }
}

const getInitialGrid = () => {
  const grid = [];
  for (let row = 0; row < 20; row++) {
    const currentRow = [];
    for (let col = 0; col < 50; col++) {
      currentRow.push(createNode(col, row));
    }
    grid.push(currentRow);
  }
  return grid;
};

// Helper function to reset relevant node properties before an algorithm run
const resetNodeProperties = (grid) => {
  const newGrid = grid.slice();
  for (let row = 0; row < newGrid.length; row++) {
    for (let col = 0; col < newGrid[0].length; col++) {
      const node = newGrid[row][col];
      const newNode = {
        ...node,
        distance: Infinity,
        isVisited: false,
        previousNode: null,
        f: Infinity,
        g: Infinity,
        h: 0, // h might be recalculated by heuristic, but good to reset
      };
      newGrid[row][col] = newNode;
    }
  }
  return newGrid;
};

const createNode = (col, row) => {
  return {
    col: col,
    row: row,
    isStart: row === START_NODE_ROW && col === START_NODE_COL,
    isFinish: row === FINISH_NODE_ROW && col === FINISH_NODE_COL,
    distance: Infinity,
    isVisited: false,
    isWall: false,
    previousNode: null,
    f: Infinity,
    g: Infinity,
    h: 0,
  };
};

const getNewGridWithWallToggled = (grid, row, col) => {
  const newGrid = grid.slice();
  const node = newGrid[row][col];
  const newNode = {
    ...node,
    isWall: !node.isWall,
  };
  newGrid[row][col] = newNode;
  return newGrid;
};

// getNewGridWithNoVisit might be redundant if clearBoard and resetNodeProperties handle things well.
// If it was used for a specific UI purpose of "unvisiting" without a full clear, it might need review.
// For now, assuming its role is covered.
const getNewGridWithNoVisit = (grid,row,col) =>{
  const newGrid = grid.slice();
  const node = newGrid[row][col];
  const newNode = {
    ...node,
    isVisited: false, // Only resets isVisited, other algo properties might persist
  };
  newGrid[row][col] = newNode;
  return newGrid;
};