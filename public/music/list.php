<?php
$dirlist = array();
if ($handle = opendir('.')) {
	while (false !== ($entry = readdir($handle))) {
		
		if(!is_dir($entry) && $entry != "." && $entry != ".." && $entry != "list.php"){
			array_push($dirlist, $entry);

		}
	}

	closedir($handle);
}

header('Content-Type: application/json');
echo json_encode($dirlist);