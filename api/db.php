<?php

/*
Handles all errors by exiting.
*/

require_once("stanford.app.php");

class DB
{
  private $db;

  public function __construct()
  {
    try {

      $app = new StanfordApp("/afs/ir.stanford.edu/class/cs103/db_config/prodconfig.yaml");
      $this->db = $app->db;
      $this->db->connect(); 

    } catch (Exception $e) {

      echo $e->getMessage();
      exit();

    }
  }

  public function fetchAll($result) 
  {
    $all = array();
    while ($row = $result->fetch_assoc()) {
      array_push($all, $row);
    }
    return $all;
  }

  public function checkUserExists($sunetid)
  {
    $db = $this->db;
    $sunetid = $db->real_escape_string($sunetid);
    $query_string = "select * from users where sunetid=\"$sunetid\"";
    $result = $db->query($query_string);
    return $result->num_rows > 0;
  }

  public function addUser($sunetid, $isTA)
  {
    $db = $this->db;
    $isTA = $isTA ? 1 : 0;
    $query_string = "insert into users (sunetid, isTA) values(\"$sunetid\",$isTA)";
    $result = $db->query($query_string);
    if ($result === False) exit(); 
  }

  public function addAutomata($sunetid, $automata, $name) {
    $db = $this->db;
    $automata = $db->real_escape_string($automata);
    $name = $db->real_escape_string($name);


    // TODO: test this line again
    $query_string = "insert into automatas (user_id, automata, name) values(\"$sunetid\", \"$automata\", \"$name\") on duplicate key update automata=\"$automata\";";
    $result = $db->query($query_string);
    if ($result === False) exit();
  }

  public function getAllAutomataOfUser($sunetid) {
    $db = $this->db;
    $sunetid = $db->real_escape_string($sunetid);

    $query_string = "select * from automatas where user_id = \"$sunetid\";";
    $result = $db->query($query_string);
    if ($result === False) exit();
    return $this->fetchAll($result);
  }

  public function getAutomataOfUser($sunetid, $automata_id) {
    $db = $this->db;
    $sunetid = $db->real_escape_string($sunetid);

    $query_string = "select * from automatas where id=$automata_id and user_id=\"$sunetid\";";
    $result = $db->query($query_string);
    if ($result === False) exit();
    if ($result->num_rows === 0) {
      echo "Something is wrong with your automata...";
      exit();
    }
    return $this->fetchAll($result); 
  }

  public function addSubmission($sunetid, $automata, $problem) {
    $db = $this->db;
    $sunetid = $db->real_escape_string($sunetid);
    $automata = $db->real_escape_string($automata);

    $query_string = "insert into submissions (user_id, problem_id, automata) values (\"$sunetid\", $problem, \"$automata\");";
    $result = $db->query($query_string);
    if ($result === False) exit();
  }
}
