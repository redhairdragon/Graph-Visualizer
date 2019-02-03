adjacencyMatrix = null;
nodeNames = null;
start_node = "0";
end_node = "0"

$(document).ready(function() {
  document.getElementById('txtFileUpload').addEventListener('change', (evt)=>{
    upload(evt)
    document.getElementById("txtFileUpload").blur();
  }
  , false);
});

function upload(evt) {
  if (!browserSupportFileUpload()) {
    alert('The File APIs are not fully supported in this browser!');
  } else {
    adjacencyMatrix = null;
    nodes = null;
    links = null;
    start_node = "0";
    end_node = "0";

    var file = evt.target.files[0];
    var reader = new FileReader();
    reader.readAsText(file);

    reader.onload = function(event) {
      setTimeout(()=>{
        var csvData = event.target.result;
        adjacencyMatrix = $.csv.toArrays(csvData);
        if (adjacencyMatrix && adjacencyMatrix.length > 0) {
          alert('Imported -' + adjacencyMatrix.length + '- rows successfully!');
        } else {
          alert('No data to import!');
        }
        fixAdjacencyMatrix()
        generateTable(adjacencyMatrix);
        adjacencyMatrix = extractAdjcencyMatrixFromHTML()
        //       shen_trick.set_colors()
        nodeNames = extractNodeName()
        updateNodesLinks(adjacencyMatrix)
      }
      , 100)
    }
    ;
    reader.onerror = function() {
      alert('Unable to read ' + file.fileName);
    }
    ;
  }
}

function browserSupportFileUpload() {
  var isCompatible = false;
  if (window.File && window.FileReader && window.FileList && window.Blob) {
    isCompatible = true;
  }
  return isCompatible;
}
function getCoordinates(Matrix) {
  return [Vec.of(0, 0, 0), Vec.of(10, 10, 0), Vec.of(10, -10, 0), Vec.of(20, 10, 0), Vec.of(20, -10, 0)]
}

function generateTable(data, names=null) {

  let old_table = document.getElementById("matrix-table");
  !old_table || old_table.parentNode.removeChild(old_table)

  let row = data.length;
  let col = data[0].length;

  if (names === null) {

    names = []
    for (let i = 0; i < col; i++)
      names.push(i)

  }

  let box = document.getElementById("matrix-input");
  let table = document.createElement("table");
  table.id = "matrix-table"
  table.style.borderStyle = "groove"
  box.appendChild(table)
  //generate title
  let first_row = document.createElement("tr");
  table.appendChild(first_row);
  let row_num_th = document.createElement("th")
  row_num_th.innerHTML = "Node Name";

  first_row.appendChild(row_num_th);
  for (let i = 0; i < col; i++) {
    let x = document.createElement("th")
    let input = document.createElement("input")
    input.setAttribute("type", "text")
    input.setAttribute("node-number", i)
    input.setAttribute("value", names[i])
    x.appendChild(input)
    first_row.appendChild(x);
  }
  for (let i = 0; i < row; i++) {
    let r = document.createElement("tr");
    let row_num_td = document.createElement("td")
    row_num_td.innerHTML = names[i];
    row_num_td.setAttribute("row", i);
    row_num_td.setAttribute("class", "name-cell");
    r.appendChild(row_num_td);
    for (let j = 0; j < col; j++) {
      let cell = document.createElement("td");
      let input = document.createElement("input");
      input.setAttribute("type", "number")
      input.setAttribute("row", i)
      input.setAttribute("col", j)
      input.setAttribute("value", data[i][j])
      input.setAttribute("class", "matrix-cell");
      if (i >= j) {
        input.disabled = true;
        input.style.background = "#dddddd"
      }
      cell.appendChild(input)
      r.appendChild(cell)
    }
    table.appendChild(r);
  }

  let path_div = document.getElementById("path-input");
  path_div.innerHTML = ""
  let start_input = document.createElement("input");
  let end_input = document.createElement("input");
  start_input.setAttribute("type", "text")
  end_input.setAttribute("type", "text")
  start_input.setAttribute("value", start_node)
  start_input.setAttribute("id", "start-input")
  end_input.setAttribute("value", end_node)
  end_input.setAttribute("id", "end-input")

  let path_name = document.createElement("p");
  path_name.innerHTML = "Path:";
  path_div.appendChild(path_name)
  path_div.appendChild(start_input)
  path_div.appendChild(end_input)

  start_input.addEventListener('change', (evt)=>{
    start_node = start_input.value;
    shen_trick.generatePath()
  }
  )
  end_input.addEventListener('change', (evt)=>{
    end_node = end_input.value;
    shen_trick.generatePath()
  }
  )
  Array.from(document.querySelectorAll("[node-number]")).map((x)=>{
    x.addEventListener('change', (evt)=>{
      nodeNames = extractNodeName();
      shen_trick.generatePath()
//       ************
      generateTable(adjacencyMatrix, nodeNames)
      console.log("Called")
    }
    , false)
  }
  )

  Array.from(document.querySelectorAll("[row][col]")).map((x)=>{
    x.addEventListener('change', (evt)=>{
      let r = (evt.target.getAttribute("row"))
      let c = (evt.target.getAttribute("col"))
      document.querySelector(`[row=\'${c}\'][col=\'${r}\']`).setAttribute("value", evt.target.value)
      adjacencyMatrix = extractAdjcencyMatrixFromHTML()
      shen_trick.generatePath()
      $.each($(".name-cell"), (i,v)=>{
        v.innerHTML = nodeNames[v.getAttribute("row")]
      }
      )
      updateNodesLinks(adjacencyMatrix);
      document.getElementById("matrix-input").blur();
    }
    , false);
  }
  )
}

function extractAdjcencyMatrixFromHTML() {
  let data = $(".matrix-cell")
  let row = Math.sqrt(data.length);
  let col = row;
  let ajm = [];
  for (let i = 0; i < row; i++) {
    let ajm_row = []
    for (let j = 0; j < col; j++) {
      let query = `input[row=\'${i}\'][col=\'${j}\']`
      let v = document.querySelectorAll(query)[0].value || 0;
      ajm_row.push(v)
    }
    ajm.push(ajm_row);
  }
  return ajm;
}
function extractNodeName() {
  let x = $("[node-number]");
  let names = []
  $.each(x, function(i, v) {
    names.push(v.value)
  })
  return names;
}

function fixAdjacencyMatrix() {
  for (let i = 0; i < adjacencyMatrix.length; i += 1) {
    for (let j = 0; j < adjacencyMatrix[i].length; j += 1) {
      if (i === j) {
        adjacencyMatrix[i][j] = "0";
      }
      if (j > i) {
        adjacencyMatrix[j][i] = adjacencyMatrix[i][j];
      }
    }
  }
}
