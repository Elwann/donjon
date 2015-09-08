<?php
//$dirlist = array();
$dirlist = crawlMusicList('Music', '.');

function crawlMusicList($title, $path)
{
	$list = array();

	if ($handle = opendir($path))
	{
		while (false !== ($entry = readdir($handle)))
		{
			if ($entry != "." && $entry != ".." && $entry != "list.php")
			{
				$url;
				if($path != '.'){
					$url = $path.'/'.$entry;
				} else {
					$url = $entry;
				}

				if (!is_dir($url))
				{
					array_push($list, array("title" => str_replace('.mp3', '', $entry), "type" => "song", "url" => $url));
				}
				else
				{
					//var_dump($entry);
					array_push($list, crawlMusicList($entry, $url));
				}
			}
		}

		closedir($handle);
	}

	return array("title" => $title, "type" => "playlist", "songs" => $list);
}

header('Content-Type: application/json');
echo json_encode($dirlist);