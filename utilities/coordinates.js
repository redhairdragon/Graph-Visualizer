// node0={"id":"Shen",x:0.,y:0.,z:0.,fx:0.,fy:0.,fz:0.}
// node1={"id":"Gia",x:0,y:1,z:0}
// node2={"id":"Shia",x:0,y:2,z:1}
// node3={"id":"Edward",x:1,y:3,z:1}

// nodes=[node0,node1,node2,node3]

// love={"source":"Shen","target":"Gia"}
// parent1={"source":"Shen","target":"Shia"}
// parent2={"source":"Gia","target":"Shia"}
// friend={"source":"Shen","target":"Edward"}
// parent3={"source":"Edward", "target":"Shen"}
// links=[love,parent1,parent2,friend,parent3]

nodes = null;
links = null;


var simulation = d3.forceSimulation()
function deleteLinks(index) {
  links.splice(index, 1);
  console.log(links);
  //update Adjacency Matrix
}
function deleteNode(index) {
    //   remove from nodes
    //   remove from links
    //   remove from nodeName
    //   remove from adjacency matrix

    /* Remove from links */
    indices_in_links_to_remove = [];
    console.log(links);
    for (iindex = 0; iindex < links.length; iindex++) {
        /* Find which elements to remove */
        if (links[iindex].source.index === index || links[iindex].target.index === index) {
            indices_in_links_to_remove.push(iindex)
        }

        //         console.log(links[iindex].target.index);
    }

    indices_in_links_to_remove.sort(function(a, b) {
        return a - b
    });
    console.log(indices_in_links_to_remove);

    for (iindex = indices_in_links_to_remove.length - 1; iindex >= 0; iindex--) {
        /* Remove link */
        //         console.log("removing node" + (indices_in_links_to_remove[iindex]))
        links.splice(indices_in_links_to_remove[iindex], 1);
    }
    for (iindex = 0; iindex < links.length; iindex++) {
        /* Re-order links index */
        links[iindex].index = iindex;
    }

    /* Remove from nodes */
    for (iindex = index + 1; iindex < nodes.length; iindex++) {
        /* correct the indices */
        nodes[iindex].index = iindex - 1;
    }
    nodes.splice(index, 1);

    /* Remove from nodeName */
    nodeNames.splice(index, 1);

    /* Remove from adjacency matrix */
    for (iindex = 0; iindex < adjacencyMatrix.length; iindex++) {
        adjacencyMatrix[iindex].splice(index, 1);
    }
    adjacencyMatrix.splice(index, 1);

}
function nodesAndLinksfromMatrix(twoDmatrix) {
  if (twoDmatrix === null)
    return [null, null];
  retNodes = [];
  retLinks = [];
  for (index = 0; index < twoDmatrix.length; index++) {
    if (index % 3 == 0) {
      node = {
        "id": index.toString(),
        x: index,
        y: 0,
        z: 0
      }
      retNodes.push(node)
    } else if (index % 3 == 1) {
      node = {
        "id": index.toString(),
        x: 0,
        y: index,
        z: 0
      }
      retNodes.push(node)
    } else {
      node = {
        "id": index.toString(),
        x: 0,
        y: 0,
        z: index
      }
      retNodes.push(node)
    }
    for (index2 = 0; index2 < twoDmatrix.length; index2++) {
      if (index < index2 && twoDmatrix[index][index2] != 0) {
        link = {
          "source": index.toString(),
          "target": index2.toString()
        }
        retLinks.push(link)
      }
    }
  }
  return [retNodes, retLinks]
}

function updateNodesLinks(twoDmatrix) {
  nodes=null
  links=null
  nodes = nodesAndLinksfromMatrix(twoDmatrix)[0];
  links = nodesAndLinksfromMatrix(twoDmatrix)[1];
  
  if (nodes !== null) {
    simulation = d3.forceSimulation()
    .numDimensions(3)
    .nodes(nodes)
    .force("link", d3.forceLink(links).id(function(d) {return d.id;}).distance(5))
    .force("manybody", d3.forceManyBody())
    .force("center", d3.forceCenter())
  }

}


function deleteLinks(index) {
  sourceindex = links[index].source.index;
  targetindex = links[index].target.index;
  adjacencyMatrix[sourceindex][targetindex] = "0";
  adjacencyMatrix[targetindex][sourceindex] = "0";
  links.splice(index, 1);
  for (let iindex = 0; iindex < links.length; iindex++) {
      links[iindex].index = iindex;
  }
}

function deleteNode(index) {

    /* Remove from links */
    indices_in_links_to_remove = [];
//     console.log(links);
    for (iindex = 0; iindex < links.length; iindex++) {
        /* Find which elements to remove */
        if (links[iindex].source.index === index || links[iindex].target.index === index) {
            indices_in_links_to_remove.push(iindex)
        }
    }

    indices_in_links_to_remove.sort(function(a, b) {
        return a - b
    });
//     console.log(indices_in_links_to_remove);

    for (iindex = indices_in_links_to_remove.length - 1; iindex >= 0; iindex--) {
        /* Remove link */
        links.splice(indices_in_links_to_remove[iindex], 1);
    }
    for (iindex = 0; iindex < links.length; iindex++) {
        /* Re-order links index */
        links[iindex].index = iindex;
    }

    /* Remove from nodes */
    for (iindex = index + 1; iindex < nodes.length; iindex++) {
        /* correct the indices */
        nodes[iindex].index = iindex - 1;
    }
    nodes.splice(index, 1);

    /* Remove from nodeName */
    nodeNames.splice(index, 1);

    /* Remove from adjacency matrix */
    for (iindex = 0; iindex < adjacencyMatrix.length; iindex++) {
        adjacencyMatrix[iindex].splice(index, 1);
    }
    adjacencyMatrix.splice(index, 1);

}


INT_MAX = 1000000.0;

/* End user no need to call minDistance. Just a helper function */
function minDistance(dist, sptSet) {
    // Initialize min value 
    min = INT_MAX
    min_index = undefined;

    for (v = 0; v < adjacencyMatrix.length; v++) {
        if (sptSet[v] === false && dist[v] <= min) {
            min = dist[v];
            min_index = v;
        }
    }
    return min_index;
}

function dijkstra(src, dst) {
    if(src===dst)
      return []
    if(src<0||dst<0)
      return []
    if(src>adjacencyMatrix.length-1||dst>adjacencyMatrix.length-1)
      return []
    // console.log(adjacencyMatrix.length)
    prevArray = new Array(adjacencyMatrix.length)

    // The output array.  dist[i] will hold the shortest 
    dist = new Array(adjacencyMatrix.length)
    // distance from src to i 

    sptSet = new Array(adjacencyMatrix.length)
    // sptSet[i] will be true if vertex i is included in shortest 
    // path tree or shortest distance from src to i is finalized 

    // Initialize all distances as INFINITE and stpSet[] as false 
    for (i = 0; i < adjacencyMatrix.length; i++) {
        dist[i] = INT_MAX;
        sptSet[i] = false;
    }

    // Distance of source vertex from itself is always 0 
    dist[src] = 0;

    // Find shortest path for all vertices 
    for (count = 0; count < (adjacencyMatrix.length) - 1; count++) {
        // Pick the minimum distance vertex from the set of vertices not 
        // yet processed. u is always equal to src in the first iteration. 
        u = minDistance(dist, sptSet);
        
        // Mark the picked vertex as processed 
        sptSet[u] = true;

        // Update dist value of the adjacent vertices of the picked vertex. 
        for (v = 0; v < adjacencyMatrix.length; v++) {

            // Update dist[v] only if is not in sptSet, there is an edge from  
            // u to v, and total weight of path from src to  v through u is  
            // smaller than current value of dist[v] 
            if (!sptSet[v] && parseInt(adjacencyMatrix[u][v]) != 0 && dist[u] != INT_MAX && dist[u] + parseInt(adjacencyMatrix[u][v]) < dist[v]) {
                dist[v] = dist[u] + parseInt(adjacencyMatrix[u][v]);
                prevArray[v] = u;
            }
        }
    }
    if ( dist[dst] == INT_MAX ) {
      return [];
    }

 
    

    
    returnArray = [];
    currentNode = dst;
    while (true) {
        returnArray.push(currentNode)
        currentNode = prevArray[currentNode]
        if (currentNode === src) {
            returnArray.push(src);
            break;
        }
    }
    return returnArray.reverse();
}