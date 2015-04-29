﻿var gShiftKey = false;
var gEpsilon = "Ɛ";
var gGraph = 
  {
    HEIGHT_OFFSET: 5
  };
  
gGraph.init = function () {
  var svg = d3.select ("svg");
  gGraph.width = svg.node ().getBoundingClientRect ().width;
  gGraph.height = svg.node ().getBoundingClientRect ().height - gGraph.HEIGHT_OFFSET;
  svg.attr ("height", gGraph.height);
  
  var charSetParam = getURLParam ("charset");
  gGraph.problem = getURLParam ("problem");
  gGraph.pset = getURLParam ("pset");
  if (charSetParam == null) {
    var url = window.location.href;
    var loc = url.lastIndexOf ("/") + 1;
    if (loc <= 8) {
      url += "/";
    } else {
      url = url.substring (0, loc);
    }
    window.location = url + "index.html";
  }
  gGraph.charSet = sortString (charSetParam);
  gGraph.epsilonEnabled = true;
  
  gServer.getSunetid (function (sunetid) {
    gGraph.sunetid = sunetid;
  });
  
  gNodes.init ();
  gEdges.init ();
  gBrush.init ();
  gTape.init ();
  gTestMenu.init ();
  gModalMenu.initSubmit ();
  gGraph.initDelete ();
  
  gBehaviors.addBehavior ("page", "keydown", function () { return true; }, gGraph.keydown);
  gBehaviors.addBehavior ("page", "keyup", function () { return true; }, gGraph.keyup);
  gBehaviors.apply ("page", d3.select("body"));
  gBehaviors.apply ("background", d3.select("div.gui"));
  
  gNodes.addNode ();
  gNodes.addNode ();
  gGraph.draw ();
}

gGraph.keydown = function () {
  gShiftKey = d3.event.shiftKey || d3.event.metaKey;
};

gGraph.keyup = function () {
  gShiftKey = d3.event.shiftKey || d3.event.metaKey;
};

gGraph.save = function () {
  return {
      nodes: gNodes.save (),
      edges: gEdges.save ()
    };
};

gGraph.load = function (saveData) {
  gNodes.load (saveData.nodes);
  gEdges.load (saveData.edges);
};

gGraph.draw = function () {
  gNodes.draw ();
  gEdges.draw ();
  gTopMenu.draw ();
  gTableMenu.draw ();
  gTape.draw ();
}

// TODO: Make the resizing more useful
// TODO: Find a non-kludgey way for the svg to have 100% height
gGraph.resize = function () {
  var svg = d3.select ("svg");
  gGraph.width = svg.node ().getBoundingClientRect ().width;
  gGraph.height = svg.node ().getBoundingClientRect ().height;
  d3.select (".background").attr("width", gGraph.width);
  d3.select (".background").attr("height", gGraph.height);
};