// Draw a butterfly diagram of the given size in the given svg element.
function draw_butterfly_graph(svg, logn) {

  // Setup positioning of elements. Set up such that the image fills the existing
  // SVG dimensions, and to behave well when the SVG element is scaled.
  width = svg.attr("width");
  height = svg.attr("height");
  svg.attr("viewBox", "-10 -10 120 120");

  // A function to build a bit-reversed permutation using Elster's O(N) algorithm.
  // Used to draw the labels for the left-most nodes in the graph (e.g. the input values)
  function bit_reversal(t) {
    half_n = 1 << (t-1);
    result = new Array(1 << t);
    result[0] = 0;
    result[1] = half_n;
    for (n = 1; n < half_n; ++n) {
      index = n << 1;
      result[index] = result[n] >> 1;
      result[index+1] = result[index] + half_n;
    }
    return result;
  }

  // A function to build the butterfly graph data. This is equivalent to a butterfly
  // loop in an cooley-tukey FFT algorithm.
  function build_butterfly_graph(logN) {
    var input_indices = bit_reversal(logN);
    var result = {"nodes": []};
    var N = 1 << logN;
    for (var logn=0; logn <= logN; ++logn) {
      var n = 1 << logn;
      for (var a = 0; a < N / n; ++a) {
        for (var b = 0; b < n; ++b) {
          var even_index = (a * n) + (b % (n/2));
          var odd_index = even_index + (n/2);
          var i = (a * n) + b;
          var id = (logn * N) + i;
          var label = logn ? ("DFT(k=" + b + ")") : ("x(" + input_indices[i] + ")");
          var node = {"id": id, "logn": logn, "i": i, "parents": [], "text": label};
          if (logn) {
            node.parents.push(((logn - 1) * N) + even_index);
            node.parents.push(((logn - 1) * N) + odd_index);
          }
          result.nodes.push(node);
        }
      }
    }
    return result;
  }

  // Functions to compute the position of nodes in the resultant diagram.
  // Units returned are in percent.
  function node_x(node) {return 100 * (node.logn / logn);}
  function node_y(node) {return 100 * (node.i / ((1 << logn)-1));}
  function fmt_percent(fn) {return function(x) {return fn(x);};}

  // Event handler, called when the user hovers the cursor over a butterfly
  // diagram element.
  function on_mouseover(id) {
    svg.selectAll("circle.group" + id)
       .transition()
       .duration(500)
       .style("fill", "steelblue");
    svg.selectAll("path.group" + id)
       .raise()
       .transition()
       .duration(500)
       .style("stroke", "steelblue");
    svg.selectAll("text.group" + id)
       .transition()
       .duration(500)
       .style("fill", "steelblue");
  }

  // Event handler, called when the cursor exits a butterfly diagram element
  function on_mouseout(id) {
    svg.selectAll("circle.group" + id)
       .transition()
       .duration(300)
       .style("fill", "white");
    svg.selectAll("path.group" + id)
       .transition()
       .duration(300)
       .style("stroke", "#ccc");
    svg.selectAll("text.group" + id)
       .transition()
       .duration(500)
       .style("fill", "#ccc");
  }

  // A function to draw the paths between nodes in a butterfly diagram.
  function draw_paths(svg, data) {

    // Functions to gather and reduce the node connections down into a simple array of
    // pairs, representing the source and destination indices of each connection
    function gather_pairs(x) {return x.parents.map(function (y) {return [x.id, y];});}
    function reduce_pairs(x,y) {return x.concat(y);}

    // A function to draw a smooth line between two points.
    function smooth_path(d) {
      return "M" + d.source.x + "," + d.source.y
        + "C" + (d.source.x + d.target.x) / 2 + "," + d.source.y
        + " " + (d.source.x + d.target.x) / 2 + "," + d.target.y
        + " " + d.target.x + "," + d.target.y;
    }

    // Function to produce path point positions.
    function path_point(node) {return {"x": node_x(node), "y": node_y(node)};};

    // Draw the paths.
    svg.append("g").attr("id", "links").selectAll("path").data(
        data.nodes.map(gather_pairs).reduce(reduce_pairs, [])
    ).enter().append("path")
     .attr("class", function(link){return "node group" + link[0].toString();})
     .attr("d", function(link){return smooth_path({
         "source": path_point(data.nodes[link[0]]),
         "target": path_point(data.nodes[link[1]])
     });})
     .style("fill", "none")
     .style("stroke", "#ccc")
     .style("stroke-width", "2px")
     .style("cursor", "pointer")
     .on("mouseover", function(link){on_mouseover(link[0])})
     .on("mouseout", function(link){on_mouseout(link[0])});
  }

  // A function to draw each node in the butterfly diagram.
  function draw_nodes(svg, data) {
    svg.append("g").attr("id", "nodes").selectAll("circle").data(data.nodes).enter().append("circle")
       .attr("class", function(node) {return "node group" + node.id.toString();})
       .attr("cx", fmt_percent(node_x))
       .attr("cy", fmt_percent(node_y))
       .attr("r", "2%")
       .style("fill", "#fff")
       .style("stroke", "steelBlue")
       .style("stroke-width", "1px")
       .style("cursor", "pointer")
       .on("mouseover", function(node){on_mouseover(node.id)})
       .on("mouseout", function(node){on_mouseout(node.id)});
  }

  // A function to draw the labels for each node in the butterfly diagram.
  function draw_heading_labels(svg, data) {
    svg.append("g").selectAll("text").data(d3.range(0, logn+1)).enter().append("text")
       .attr("x", function(n) {return 100 * n / logn;})
       .attr("y", 0)
       .attr("text-anchor", "middle")
       .attr("alignment-baseline", "middle")
       .attr("dy", "-5%")
       .style("fill", "#000")
       .style("font-family", "Arial, Helvetica, sans-serif")
       .style("font-size", "2pt")
       .style("font-weight", "bold")
       .style("cursor", "pointer")
       .on("mouseover", function(node){on_mouseover(node.id)})
       .on("mouseout", function(node){on_mouseout(node.id)})
       .text(function (d) { return "N=" + (1 << d) } );
  }

  // A function to draw the labels for each node in the butterfly diagram.
  function draw_node_labels(svg, data) {
    svg.append("g").selectAll("text").data(data.nodes).enter().append("text")
       .attr("x", fmt_percent(node_x))
       .attr("y", fmt_percent(node_y))
       .attr("class", function(node) {return "node group" + node.id.toString();})
       .attr("text-anchor", "middle")
       .attr("alignment-baseline", "middle")
       .attr("dy", "5%")
       .style("fill", "#ccc")
       .style("font-family", "Arial, Helvetica, sans-serif")
       .style("font-size", "2pt")
       .style("font-weight", "bold")
       .style("cursor", "pointer")
       .on("mouseover", function(node){on_mouseover(node.id)})
       .on("mouseout", function(node){on_mouseout(node.id)})
       .text(function (d) { return d.text } );
  }

  // Execute!
  g = svg.append("g");
  data = build_butterfly_graph(logn);
  draw_paths(g, data);
  draw_nodes(g, data);
  draw_node_labels(g, data);
  draw_heading_labels(g, data);
}

