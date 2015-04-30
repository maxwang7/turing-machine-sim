<?php

/*
/api/submit.php
POST request
{
  "automata": <String>,
  "problem": <Integer, problem number>
  "pset": <Integer, pset>
}

Sample client-side code:

var url_prefix = "/class/cs103/cgi-bin/restricted";
var submit_url = "/api/submit.php";

var automata = JSON.stringify (gGraph.save ());
var pset = 1;
var problem = 1;

var pack = {
  automata: automata,
  pset: pset,
  problem: problem
};

console.log(pack);

d3.xhr (url_prefix + submit_url)
  .header ("Content-Type", "application/json")
  .post (
    JSON.stringify (pack),
    function (err, rawData) {
      if (err) {
        console.log(err);
      } else { 
        console.log(rawData);
      }
    });

*/

require_once("./db.php");

$db = new DB();

$data = json_decode(file_get_contents('php://input'));

$automata = $data->automata;
$pset = intval($data->pset);
$problem = intval($data->problem);
$user = $_ENV['WEBAUTH_USER'];

echo $pset;
echo $problem;

if (!$db->checkUserExists($user)) {
  $db->addUser($user);
}

$db->addSubmission($user, $automata, $pset, $problem);