import React, {Component} from 'react';
import Node from './Node/Node';
import {dijkstra, getNodesInShortestPathOrder} from '/Users/amarjotgill/Documents/pathfinding_visualizer/pathfinding-visualizer/src/algorithms/dijkstra.js';
import {depthFirst} from '/Users/amarjotgill/Documents/pathfinding_visualizer/pathfinding-visualizer/src/algorithms/dfs.js';

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
    const {grid} = this.state;
    const startNode = this.state.grid[START_NODE_ROW][START_NODE_COL];
    const finishNode = this.state.grid[FINISH_NODE_ROW][FINISH_NODE_COL];
    let visitedNodesInOrder = dijkstra(grid, startNode, finishNode);
    this.setState({visitedNodes: visitedNodesInOrder});
    let nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode);
    this.setState({shortestPath: nodesInShortestPathOrder});
    this.animateAlgorithm(visitedNodesInOrder, nodesInShortestPathOrder);
  }


  visualizeDfs(){
    let {grid} = this.state;
    const startNode = grid[START_NODE_ROW][START_NODE_COL];
    const finishNode = grid[FINISH_NODE_ROW][FINISH_NODE_COL];
    let dfsNodes = depthFirst(grid,startNode,finishNode,START_NODE_ROW,START_NODE_COL);
    this.setState({visitedNodes: dfsNodes});
    this.animateAlgorithm(dfsNodes, []);
  }

  clearBoard(){
      for (let i = 0; i <= this.state.visitedNodes.length; i++) {
        const node = this.state.visitedNodes[i];
        if(node === undefined){
            return;
        }else if(node.isStart){
          document.getElementById(`node-${node.row}-${node.col}`).className =
          'node node-start';
        }else if(node.isFinish){
          document.getElementById(`node-${node.row}-${node.col}`).className =
          'node node-finish';
        }else{
          document.getElementById(`node-${node.row}-${node.col}`).className =
          'node node-remove';
        }
    }
  }

  unVisitNodes(){
    for(let i = 0; i<= this.state.visitedNodes.length; i++){
      const current = this.state.visitedNodes[i];
      if (current === undefined){
        return;
      }
      const UnVisitGrid = getNewGridWithNoVisit(this.state.grid,current.row,current.col);
      this.setState({grid: UnVisitGrid});
    }
    this.setState({visitedNodes: []});
  }
  
  render() {
    const {grid, mouseIsPressed} = this.state;
    return (
      <React.Fragment>
              <div className="options">
              <button onClick={() => this.visualizeDijkstra()}>
                  Visualize Dijkstra's Algorithm
              </button>
              <button onClick={() => this.visualizeDfs()}>
                  Visualize Depth's First Search
              </button>
              <button onClick={() => {
                this.clearBoard()
                this.unVisitNodes()
                      }}>
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

const getNewGridWithNoVisit = (grid,row,col) =>{
  const newGrid = grid.slice();
  const node = newGrid[row][col];
  const newNode = {
    ...node,
    isVisited: false,
  };
  newGrid[row][col] = newNode;
  return newGrid;
};