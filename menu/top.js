/* This handles everything related to the menu bar at the top, and
 * the text at the bottom of the svg. */

var gTopMenu =
  {
    MAX_DISPLAYED_STATES: 5,
    SELECTED_TEXT: "Selected states: "
  };

/* Adds a new node to the svg at the first open position. */
gTopMenu.addNode = function () {
  gNodes.addNode ();
  gGraph.draw ();
};

/* Sets whether or not the currently selected nodes accept and/or reject.
 * If @accept, all selected nodes are marked as accepting. If @reject,
 * all selected nodes are marked as rejecting. If both are false, all
 * selected nodes are marked as neither accepting or rejecting. Do not
 * call with both arguments set to true. Produces an error if there is no
 * selection. */
gTopMenu.setState = function (accepting, rejecting) {
  if (gNodes.selectionIsEmpty ()) {
    gErrorMenu.displayError ("No states are selected");
  }
  gNodes.setAccepting (accepting);
  gNodes.setRejecting (rejecting);
  gGraph.draw ();
};

/* Deletes all selected nodes and edges. Produces an error and deletes nothing
 * if there are no selected elements or the current node in a running simulation 
 * is deleted. */
gTopMenu.deleteSelected = function (ignoreBackup) {
  if (gNodes.selectionIsEmpty () && gEdges.selectionIsEmpty ()) {
    gErrorMenu.displayError ("No states or transitions are selected");
  }
  if (gNodes.removeNodes (ignoreBackup)) {
    gEdges.deleteSelected ();
    gGraph.draw ();
  }
};

/* Sets the currently selected node to be the initial node. 
 * Produces an error if there is not exactly one node selected. */
gTopMenu.setInitial = function () {
  if (gNodes.selectionIsEmpty ()) {
    gErrorMenu.displayError ("No states are selected");
  } else if (gNodes.selectionSize () > 1) {
    gErrorMenu.displayError ("Multiple states are selected. Using the first one.");
  }
  gNodes.setInitial ();
  gGraph.draw ();
};

/* Rearranges the nodes on the svg so that they're all
 * on points of a grid, while attempting to keep the layout
 * as close as possible to the original. */
gTopMenu.snapToGrid = function () {
  gNodes.snapToGrid ();
  gGraph.draw ();
};

/* Rearranges the nodes on the svg based on d3's internal
 * force directed layout algorithm. */
gTopMenu.forcedDirectedLayout = function () {
  gNodes.forcedDirectedLayout ();
  gGraph.draw ();
};

/* Opens the load modal. */
gTopMenu.loadFromServer = function () {
  gModalMenu.open ("load");
  gModalMenu.load.onOpen ();
};

/* Opens the tape-set modal. */
gTopMenu.editTapeSet = function () {
  gModalMenu.open ("tape-set");
};

/* Attempts to save the current automata. */
gTopMenu.save = function () {
  var BUTTON_TIMEOUT = 2000;
  var name = gServer.name;
  gTopMenu.setSaveButton ("Saving...");
  if (!gModalMenu.saveas.isInvalidName (name) && name) {
    // save
    gServer.save (name,
      function (err, data) {
        if (err) {
          gTopMenu.setSaveButton ("Failed");
          gErrorMenu.displayError ("Save failed: couldn't connect to server.");
        } else {
          gTopMenu.setSaveButton ("Saved!");
        }
        setTimeout (function () {
          gTopMenu.setSaveButton ("Save");
        }, BUTTON_TIMEOUT);
      });
  } else if (!name) {
    // name is null, hasn't been saved
    gTopMenu.saveas ();
    gTopMenu.setSaveButton ("Save");
  } else {
    // show error message
    gErrorMenu.displayError ("Saving to invalid name, use \"Save As\" to change name");
    gTopMenu.setSaveButton ("Save");
  }
};

/* Opens the saveas modal. */
gTopMenu.saveas = function () {
  gModalMenu.saveas.open ();
};

/* Opens the submit modal. */
gTopMenu.submit = function () {
  if (gGraph.pset != null) {
    gModalMenu.submitModal.setPsetNumber (gGraph.pset);
  }
  if (gGraph.problem != null) {
    gModalMenu.submitModal.setProblemNumber (gGraph.problem);
  }
  gModalMenu.open ("submit");
};

/* Returns the URL of the homepage for this installation. */
gTopMenu.homepage = function () {
  window.location.href = getURLParent () + "index.html";
};

/* Draws the information about selected states, and the text running along the bottom
 * of the svg. */
gTopMenu.draw = function () {
  var selectedText = "";
  var selected = gNodes.getSelected ();
  selected.sort ();
  for (var i = 0; i < gTopMenu.MAX_DISPLAYED_STATES && i < selected.length; i++) {
    selectedText += selected[i] + ", ";
  }

  if (selected.length == 0) {
    selectedText = "None";
  } else {
    selectedText = selectedText.substring (0, selectedText.length - 2);
  }

  if (selected.length > gTopMenu.MAX_DISPLAYED_STATES) {
    selectedText += "...";
  }
  var mode = gGraph.mode.toUpperCase ();
  if (mode == "TM") {
    mode = "Turing Machine";
  }
  var pset = gGraph.pset == null ? "" : psets[gGraph.pset].name + ", ";
  var problem = (gGraph.problem == null && gGraph.pset == null) ? "" : psets[gGraph.pset].problems[gGraph.problem].name + ", ";
  d3.select (".current-pset-problem")
    .text (pset + problem);
  d3.select (".current-mode").text (mode);
  d3.select (".current-alphabet").text (gGraph.charSet);
  if (gGraph.mode === "tm" && gGraph.tapeSet && 
    sortString (gGraph.tapeSet) !== sortString (gGraph.charSet)) 
  {
    d3.select (".current-tape-set")
      .style ("display", "inline");
    d3.select (".current-tape-set-inner").text (gGraph.tapeSet);
  }

  d3.select ("#selectedText").text (gTopMenu.SELECTED_TEXT + selectedText);

  d3.select(".acceptButton").classed("marked", gNodes.selectionIsAccepting ());
  d3.select(".rejectButton").classed("marked", gNodes.selectionIsRejecting ());
  d3.selectAll(".neitherButton").classed("marked", gNodes.selectionIsNeither ());
};

/* Sets the save button's text to the string @text. */
gTopMenu.setSaveButton = function (text) {
  d3.select (".saveTopButton").text (text);
};