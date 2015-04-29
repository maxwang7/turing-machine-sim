<?php


/* 
/api/load.php
GET request
should contain the parameter "name"
*/


// ini_set('display_errors', 'On');
// error_reporting(E_ALL);
require_once("./db.php");

$db = new DB();

$user = $_ENV["WEBAUTH_USER"];
$automata_name = $_GET["name"];

$result = $db->getAutomataOfUser($user, $automata_name);
echo json_encode($result);