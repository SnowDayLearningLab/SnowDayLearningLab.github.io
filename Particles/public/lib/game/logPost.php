<?php
echo var_dump($_POST);
$logJSON = $_POST['log'];
$logArr = json_decode(stripcslashes($logJSON));

$id = $logArr->playerID;
$path="logs/$id.xml";
//$imgPath="logs/$id.html";
//echo $path;

$timeStamp = $logArr->time;
$device = $logArr->device;

if (file_exists($path)){
	$xml = simplexml_load_file($path);
} else {
	$xml = new SimpleXMLElement('<xml/>');
}

// set variables
$type = 'block';
$blockID = $logArr->id;
$nbond = $logArr->nbond;
$sbond = $logArr->sbond;
$dbond = $logArr->dbond;
$tbond = $logArr->tbond;
$qbond = $logArr->qbond;
$bounce = $logArr->bounce;
$hardness = $logArr->hardness;
$slip = $logArr->slip;
$made = $logArr->made;
//$img = $logArr->img;
//$img = str_replace(' ','+',$img);

// write variables to xml
$block = $xml->addChild('block');
$block->addChild('time', $timeStamp);
$block->addChild('blockID', $blockID);
$block->addChild('nbond', $nbond);
$block->addChild('sbond', $sbond);
$block->addChild('dbond', $dbond);
$block->addChild('tbond', $tbond);
$block->addChild('qbond', $qbond);
$block->addChild('bounce', $bounce);
$block->addChild('hardness', $hardness);
$block->addChild('slip', $slip);
$block->addChild('made', $made);
$block->addChild('device', $device);

// open html file to post img data
//$data=fopen($imgPath,'a+');
//$toWrite = '<p>Time: <span id="timeStamp">'.$timeStamp.'</span> BlockID: <span id="blockID">'.$blockID.'</span></br><img src='.$img.'></p>';
//fwrite($data, $toWrite);
//fclose($data);

// open and format xml file
$dom = new DOMDocument('1.0');
$dom->preserveWhiteSpace = false;
$dom->formatOutput = true;
$dom->loadXML($xml->asXML());
$dom->save($path);

?>