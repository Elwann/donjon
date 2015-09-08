<?php
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
					if(preg_match('/.mp3/', $entry)){
						array_push($list, array("title" => str_replace('.mp3', '', $entry), "type" => "song", "url" => $url));
					}
				}
				else
				{
					array_push($list, crawlMusicList($entry, $url));
				}
			}
		}

		closedir($handle);
	}

	return array("title" => $title, "type" => "playlist", "songs" => $list);
}

header('Content-Type: application/json');
echo json_encode(crawlMusicList('Music', '.'));