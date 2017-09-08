<?php
//echo var_dump($_POST);
$id = $_POST['player'];
$path="logs/$id.xml";

if (file_exists($path)){
	$xml = simplexml_load_file($path);
} else {
	return null;
}

$block = $xml->type[0]->block[1]->bondEncode;
echo $block;

?>