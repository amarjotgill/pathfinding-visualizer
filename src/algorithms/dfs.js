const visitedNodesInOrder = [];
const ROW_BOUNDS = 19;
const COL_BOUNDS = 50;

export function depthFirst(grid,startNode,finishNode,x,y){
    visitedNodesInOrder.push(grid[x][y]);

    if(x === finishNode.row && y === finishNode.col) return visitedNodesInOrder;
    
    if(grid[x][y] === finishNode) return visitedNodesInOrder;
    
    if(isValidMove(x-1,y,grid)){
        setVisited(x-1,y,grid);
        depthFirst(grid,startNode,finishNode,x-1,y);

    } else if(isValidMove(x,y + 1,grid)){
        setVisited(x,y + 1,grid);
        depthFirst(grid,startNode,finishNode,x,y + 1);

    } else if(isValidMove(x+1,y,grid)){
        setVisited(x + 1,y,grid);
        depthFirst(grid,startNode,finishNode,x + 1,y);

    } else if(isValidMove(x,y-1,grid)){
        setVisited(x,y - 1,grid);
        depthFirst(grid,startNode,finishNode,x ,y - 1); 
    }
    return visitedNodesInOrder;
}


function isValidMove(x,y,grid){
    if(x < 0 || x > ROW_BOUNDS || y < 0 || y > COL_BOUNDS){
        return false;
    }else if(grid[x][y] === undefined){
        return false;
    }else if(grid[x][y].isWall === true){
        return false;
    }
   else{
        if(grid[x][y].isVisited === true){
            return false;
        }
        return true;
    }
}

function setVisited(x,y,grid){
    const node = grid[x][y];
  const newNode = {
    ...node,
    isVisited: !node.isVisited,
  };
    grid[x][y] = newNode;
}