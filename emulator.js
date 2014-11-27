BLANK = "☐";

/*
 * Has two public functions, run(), which runs the TM until termination, 
 * and step(), which run the TM for one step. The getTransitions() function
 * collects all transitions from the specified node, and returns a JS object
 * with key as the “fromChar” and value as a JS object with “fromChar”, 
 * “direction” and “target” (node).
 */
function Emulator(graph, input, startingNode) {
  var machine = graph;
  var currentNode = startingNode; // TODO: How to get starting state?
  var tape = new Tape(input, 0);
  var terminated = false;
  
  // Collects all links for the node specified, returns a 
  // map with each key as a valid transition from the
  // node and each value as information about the transition.
  function getTransitions(node) { // returns the transitions with the node as the source
    var transitions = {};
    machine.links.forEach(function findTransitions(element, index, array) {
      if(element.source === node) {
        element.transitions.forEach(function addTransitions(elem, idx, arr) {
          var move = {
            character: elem.toChar,
            node: element.target,
            direction: elem.direction
          }
          transitions[elem.fromChar] = move;
        });
      }
    });
    return transitions;
  }

  function _step() {
    if (terminated) return false;

    var currentChar = tape.read();
    // console.log(currentChar);
    var transitions = getTransitions(currentNode.toString());
    // console.log(transitions);
    // console.log(machine);

    var move = transitions[currentChar];
    if(move === undefined) {
      terminated = true;
      return false; // transition for this character doesn't exist
    }
    
    // transition for this character exists
    tape.write(move.character);
    currentNode = move.node;
    move.direction === true ? tape.moveRight() : tape.moveLeft();
    return true;
  }

  return {
    run: function run() { // TODO: A limit should be set on the number of iterations
      while(_step()) {}
    },
    step: function step() { // returns false if the machine has terminated
      return _step();
    },
    getTape: function getTape() {
      return tape.toString();
    },
    getState: function getState() {
      return currentNode;
    }
  }
}