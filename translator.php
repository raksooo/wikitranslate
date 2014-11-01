<?php
	$lang = $_GET["lang"];
	$opposite = $_GET["opposite"];
	$search = str_ireplace(" ", "_", $_GET["searchWord"]);
	$source_array = utf8_url_get_array("http://". $lang .".wikipedia.org/w/api.php?format=json&action=query&titles=". $search ."&prop=categories|langlinks|links|extracts&exlimit=20&pllimit=500&lllang=". $opposite);
	$page = $source_array["query"]["pages"][key($source_array["query"]["pages"])];
	echo translate();

	function /*String*/ utf8_convert($originalString) {
		$replacedString = preg_replace("/\\\\u([0-9abcdef]{4})/", "&#x$1;", $originalString);
		$unicodeString = mb_convert_encoding($replacedString, 'UTF-8', 'HTML-ENTITIES');
		return $unicodeString;
	}
	function /*Array*/ utf8_url_get_array($url) {
		$source = utf8_convert(file_get_contents($url));
		while (stristr($source, "Warning:"))
			$source = utf8_convert(file_get_contents($url));
		$array = json_decode($source, true);
		return $array;
	}

	function /*String*/ translate() {
		global $page;

		switch (getStatus()) {
			case 0: return ":(";
			case 1: return $page["langlinks"][0]["*"];
			case 2: return getMultipleTranslations();
		}
	}
	function /*int*/ getStatus() { // 0: missing, 1: working; 2: disambiguation
		global $page;
	
		$disambiguation = false;
		if (array_key_exists("categories", $page) && $page["categories"] !== null) {
			foreach ($page["categories"] as $v) {
				if (stristr($v["title"], "disambiguation") || stristr($v["title"], "förgrenings")) {
					$disambiguation = true;
                }
            }
        }
		return min((array_key_exists("langlinks", $page) && $page["langlinks"] !== null) + $disambiguation*2, 2);
	}
	function /*Array*/ getTranslationsForPages($pages) {
		global $lang, $opposite;

		$results = Array();
		$result = utf8_url_get_array("http://". $lang .".wikipedia.org/w/api.php?format=json&action=query&titles=". join("|", $pages) ."&prop=langlinks&lllang=". $opposite);
		$i = 0;
		foreach ($result["query"]["pages"] as $page) {
            if (array_key_exists("langlinks", $page)) {
                $results[$i] = $page["langlinks"][0]["*"];
                $i++;
            }
		}
		return $results;
	}
	function /*String*/ getMultipleTranslations() {
        global $page;
        
        $page["extract"] = substr($page["extract"], stripos($page["extract"], "<li>")+4);
        $extract = split("<li>", $page["extract"]);
        $pages = Array();
        foreach ($page["links"] as $v) {
            if (!stristr($v["title"], "Wikipedia:"))
                $pages[] = str_ireplace(" ", "_", $v["title"]);
        }
        $translations = getTranslationsForPages($pages);

        $finalResults = Array();
        $i = 0;
        foreach ($page["links"] as $v) {
            $uncertain = true;
            foreach ($extract as $v2)
                if (stristr($v2, $v["title"]) && !stripos($v2, $v["title"]))
                    $uncertain = false;

            if (array_key_exists($i, $translations) && $translations[$i] != "")
                $finalResults[] = ($uncertain ? "§" : "") . $translations[$i];
            $i++;
        }
        
        asort($finalResults);
        return join(",", $finalResults);
    }

?>
