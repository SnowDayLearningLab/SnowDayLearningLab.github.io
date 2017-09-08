<?php
//echo var_dump($_POST);
$logJSON = $_POST['log'];
$logArr = json_decode(stripcslashes($logJSON));

$levelJSON = $_POST['level'];
$levelArr = json_decode(stripcslashes($levelJSON));
//echo var_dump($logArr);

$id = $_POST['player'];
$path="logs/$id.xml";
//$imgPath="logs/$id.html";
//echo $path;

$device = $_POST['device'];
$status = $_POST['status'];
$age = $_POST['age'];

if (file_exists($path)){
	$xml = simplexml_load_file($path);
} else {
	$xml = new SimpleXMLElement('<xml/>');
}

//$data=fopen($imgPath,'a+');

$type = $xml->addChild('type');

foreach ($logArr as $logItem) {	
//if ($logArr->id != null){
	//$type = 'block';
	//$blockID = $logItem->id;
	//$timeStamp = $logItem->time;
	//$nbond = $logItem->nbond;
	//$sbond = $logItem->sbond;
	//$dbond = $logItem->dbond;
	//$tbond = $logItem->tbond;
	//$qbond = $logItem->qbond;
	//$bounce = $logItem->bounce;
	//$hardness = $logItem->hardness;
	//$slip = $logItem->slip;
	//$made = $logItem->made;

	
	$block = $type->addChild('block');
	$block->addChild('time', $logItem->time);
	$block->addChild('bondEncode', $logItem->bondEncode);
	$block->addChild('blockID', $logItem->id);
	$block->addChild('nbond', $logItem->nbond);
	$block->addChild('sbond', $logItem->sbond);
	$block->addChild('dbond', $logItem->dbond);
	$block->addChild('tbond', $logItem->tbond);
	$block->addChild('qbond', $logItem->qbond);
	$block->addChild('bounce', $logItem->bounce);
	$block->addChild('hardness', $logItem->hardness);
	$block->addChild('slip', $logItem->slip);
	$block->addChild('made', $logItem->made);
	$block->addChild('device', $device);
	
	//Write img data to html
	//$img = $logItem->img;
	//$img = str_replace(' ','+',$img);
	//$toWrite = '<p>Time: <span id="timeStamp">'.$logItem->time.'</span> BlockID: <span id="blockID">'.$logItem->id.'</span> Made: <span id="made">'.$logItem->made.'</br><img src='.$img.'></p>';
	//fwrite($data, $toWrite);
	
}

//fclose($data);

	$level = $type->addChild('level');
	$level->addChild('finishedLevel', $levelArr->finishedLevel);
	$level->addChild('time', $logItem->time);
	$level->addChild('tilesRemoved', $levelArr->tilesRemoved);
	$level->addChild('timeToFinish', $levelArr->timeToFinish);
	$level->addChild('status', $status);
	$level->addChild('age', $age);
	


$dom = new DOMDocument('1.0');
$dom->preserveWhiteSpace = false;
$dom->formatOutput = true;
$dom->loadXML($xml->asXML());
$dom->save($path);

?>