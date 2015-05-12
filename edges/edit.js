gEdges.initEditing = function () {
  gEdges.editedEdge = null;

  gBehaviors.addBehavior ("edges", "dblclick",
    function () {
      return true;
    }, gEdges.editEdge);

  d3.select (".edgeChars")
    .on ("keypress", function () {
      if (d3.event.keyCode == 13) {
        gModalMenu.submit ("edgeEntry");
      }
    });
};

gEdges.populateTMEdgeModal = function (edge) {
  d3.select (".tmEdgeEntry")
    .select (".modal-header")
    .text ("Edit Transition " + edge.source.name + " " + String.fromCharCode(0x2192) + " " + edge.target.name);
  gModalMenu.tmEdge.setTmEdgeStates (gEdges.editedEdge.transitions[0]);
};

gEdges.populateEdgeModal = function (edge) {
  var chars = edge.transitions[0].join ("");
  var epsilon = chars.length > 0 && chars[chars.length - 1] == gEpsilon;
  if (epsilon) {
    chars = chars.substring (0, chars.length - 1);
  }
  gModalMenu.setEdgeChars (chars);
  gModalMenu.setEpsilon (epsilon);
};

gEdges.editEdge = function (edge) {
  gEdges.editedEdge = edge;
  if (gGraph.mode == gGraph.TM) {
    gEdges.populateTMEdgeModal (edge);
    gModalMenu.open ("tmEdgeEntry");
  } else {
    gEdges.populateEdgeModal (edge);
    gModalMenu.open ("edgeEntry");
  }
  gModalMenu.open (gGraph.mode == gGraph.TM ? "tmEdgeEntry" : "edgeEntry");
  d3.event.stopPropagation ();
};

gEdges.editCancelled = function () {
  if (gEdges.tmPruneEmpty (gEdges.editedEdge.transitions[0]).length == 0) {
    gEdges.removeEdge (gEdges.editedEdge.source, gEdges.editedEdge.target);
  }
  gEdges.editedEdge = null;
  gModalMenu.close (gGraph.mode == gGraph.TM ? "tmEdgeEntry" : "edgeEntry");
  gGraph.draw ();
};

gEdges.deleteEditedEdge = function () {
  gEdges.removeEdge (gEdges.editedEdge.source, gEdges.editedEdge.target);
  gEdges.editedEdge = null;
  gModalMenu.close (gGraph.mode == gGraph.TM ? "tmEdgeEntry" : "edgeEntry");
  gGraph.draw ();
};

gEdges.tmPruneEmpty = function (transitions) {
  if (gGraph.mode == gGraph.TM) {
    for (var i = 0; i < transitions.length; i++) {
      if (transitions[i].to == "" && transitions[i].from == "") {
        transitions.splice (i--, 1);
        continue;
      }
    }
  }
  return transitions;
};

gEdges.tmEditComplete = function () {
  var states = gEdges.tmPruneEmpty (gModalMenu.tmEdge.getTmEdgeStates ());
  for (var i = 0; i < states.length; i++) {
    if (states[i].to == "" || states[i].from == "") {
      gErrorMenu.displayModalError ("tmEdgeEntry", "Character and Write must be non-empty");
      return;
    }
    if (intersection (states[i].to, gGraph.charSet).length != 1 ||
        intersection (states[i].from, gGraph.charSet).length != 1) {
      gErrorMenu.displayModalError ("tmEdgeEntry", "Please only use characters in the character set");
      return;
    }
  }
  if (states.length == 0) {
    gErrorMenu.displayModalError ("tmEdgeEntry", "You must define at least one transition");
    return;
  }
  for (var i = 0; i < gEdges.edges.length; i++) {
    var edge = gEdges.edges[i];
    if (edge.source.id == gEdges.editedEdge.source.id && edge.target.id != gEdges.editedEdge.target.id) {
      for (var k = 0; k < states.length; k++) {
        for (var j = 0; j < edge.transitions[0].length; j++) {
          if (states[k].from == edge.transitions[0][j].from) {
            edge.transitions[0].splice (j--, 1);
          }
        }
      }
      if (edge.transitions[0].length == 0) {
        gEdges.removeEdge (edge.source, edge.target);
      }
    }
  }
  gEdges.editedEdge.transitions[0] = states;
  gEdges.editedEdge = null;
  gModalMenu.close ("tmEdgeEntry");
  gGraph.draw ();
  gGraph.draw (); //Fixes rendering issue
};

gEdges.editComplete = function () {
  var chars = removeDuplicates (gModalMenu.getEdgeCharacters ().replace (/[\s,]/g, ""));
  var legal = intersection (gGraph.charSet, chars);
  var oldChars = chars;
  chars = legal;
  gModalMenu.setEdgeChars (legal);
  chars += (gModalMenu.getEpsilon () ? gEpsilon : "");

  if (legal.length != oldChars.length) {
    if (chars.length == 0) {
      gErrorMenu.displayModalError ("edgeEntry", "Ignoring characters that aren't in the alphabet.");
    } else {
      gErrorMenu.displayError ("Ignoring characters that aren't in the alphabet.");
    }
  } 
  if (chars.length == 0) {
    gErrorMenu.displayModalError ("edgeEntry", "Transitions must take at least one character");
    return;
  }

  var transitions = chars.split ("");
  transitions.sort ();
  for (var i = 0; i < transitions.length - 1; i++) {
    if (transitions[i] == transitions[i + 1]){
      transitions.splice (i--, 1);
    }
  }
  if (gGraph.mode == gGraph.DFA) {
    var removed = false;
    transitions.forEach (function (transition) {
      for (var i = 0; i < gEdges.edges.length; i++) {
        var edge = gEdges.edges[i];
        if (edge != gEdges.editedEdge && edge.source == gEdges.editedEdge.source) {
          var index = edge.transitions[0].indexOf (transition);
          if (index != -1) {
            edge.transitions[0].splice (index, 1);
            if (edge.transitions[0].length == 0) {
              gEdges.removeEdge (edge.source, edge.target);
              i--;
              removed = true;
            }
          }
        }
      }
    });
    if (removed) {
      gErrorMenu.displayError ("Removed duplicate transitions");
    }
  }

  gEdges.editedEdge.transitions[0] = transitions;
  gEdges.editedEdge = null;
  gModalMenu.close ("edgeEntry");
  gGraph.draw ();
};
