var xmlhttp;
var sv = "sv", en = "en";
var multipleColor = "#FFEDC7", missingColor = "#FF7777";

function $(id) { return document.getElementById(id); }
function getLanguageCode(element) { return element == document.getElementsByTagName("input")[0] ? sv : en; }
function getOppositeLanguageCode(element) { return getLanguageCode(element) == sv ? en : sv; }
function getTextfield(lang) { return document.getElementsByTagName("input")[lang == sv ? 0 : 1]; }
function getOtherTextfield(element) { return getLanguageCode(element) == sv ? getTextfield(en) : getTextfield(sv); }
function getExtendedField(lang) { return document.getElementsByTagName("ul")[lang == sv ? 0 : 1]; }
function getArrowImg() { return document.getElementsByTagName("img")[0]; }
function getLoadingImg() { return document.getElementsByTagName("img")[1]; }

function startTimer(event, element) {
	var ignoreKeys = [9, 13, 16, 17, 18, 33, 34, 35, 36, 37, 38, 39, 40, 91];
	if (ignoreKeys.indexOf(event.which) === -1) {
		showExtendedFields(false);
		showGotoArrows(false);
		setTextfieldColor();
	
		if (element.value != "") {
			translator(element);
			showLoadingIndicator(true);
		} else
			showLoadingIndicator(false);
	}
}
function showMultipleResults(other, results) {
	var lang = getLanguageCode(other);
	setTextfieldColor(lang, multipleColor);
	other.value = getLanguageCode(other) == en ? "Multiple..." : "Flera...";

	results = results.split(",");
	var listItems = new Array();
	for (var i=0; i<results.length; i++) {
		var uncertain = results[i].indexOf("§") != -1;
		results[i] = results[i].replace("§", "");
	
		listItems[i] = document.createElement("li");
		var href = document.createElement("a");
		href.setAttribute("href", "http://"+ lang +".wikipedia.org/wiki/"+ results[i]);
		href.setAttribute("target", "_BLANK");
		if (uncertain)
			href.setAttribute("class", "uncertain");
		href.innerHTML = results[i];
		listItems[i].appendChild(href);
		
	}
	showExtendedFields(true, getLanguageCode(other), listItems);
}
function translator(element) {
	var lang = getLanguageCode(element);
	if (xmlhttp != null)
		xmlhttp.abort();
	xmlhttp = new XMLHttpRequest();
	xmlhttp.open("GET", "translator.php?translate=true&lang="+ lang +"&opposite="+ getOppositeLanguageCode(element) +"&searchWord="+element.value, true);
	xmlhttp.onreadystatechange = function() { httpRequestListener(xmlhttp, lang, getOtherTextfield(element)); }
	xmlhttp.send();
}
function httpRequestListener(xmlhttp, lang, other) {
	if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
			var response = xmlhttp.responseText.replace(/_/g, " ");
			if (response == ":(" || response.trim().length == 0)
				setTextfieldColor(lang, missingColor);
			else if (response.indexOf(",") !== -1) {
				showGotoArrows(true, getLanguageCode(other));
				showMultipleResults(other, response);
			} else {
				showGotoArrows(true);
				other.value = response;
			}
			showLoadingIndicator(false);
		}
}

function showLoadingIndicator(visibility) {
	document.body.style.cursor = visibility ? "progress" : "default";
	getLoadingImg().style.visibility = visibility ? "visible" : "hidden";
	getArrowImg().style.visibility = !visibility ? "visible" : "hidden";
}
function showExtendedFields(visibility, lang, content) {
	var field = (lang == en || lang == null ? getExtendedField(en) : getExtendedField(sv));
	var other = (lang == en || lang == null ? getExtendedField(sv) : getExtendedField(en));
	if (visibility) {
		if (content != null)
			for (var i in content)
				field.appendChild(content[i]);
		field.style.visibility = "visible";
	} else {
		field.style.visibility = "hidden";
		other.style.visibility = "hidden";
		if (lang == null) {
			field.innerHTML = "";
			other.innerHTML = "";
		}
	}
}
function showGotoArrows(visibility, lang) {
	var a = [document.getElementsByTagName("section")[0].getElementsByTagName("img")[0], document.getElementsByTagName("section")[1].getElementsByTagName("img")[0]];
	if (visibility) {
		if (lang == null)
			a[lang == en ? 1 : 0].style.visibility = "visible";
		a[lang == en ? 0 : 1].style.visibility = "visible";
	} else {
		a[0].style.visibility = "hidden";
		a[1].style.visibility = "hidden";
	}
}
function setTextfieldColor(lang, color) {
	if (lang != null && color != null) 
		getTextfield(lang).style.background = color;
	else {
		getTextfield(sv).style.backgroundColor = "";
		getTextfield(en).style.backgroundColor = "";
	}
}

function onMouseOut(event, element) {
	var e = event.toElement || event.relatedTarget;
	if (e.parentNode.parentNode != element && e.parentNode != element && e != element)
		showExtendedFields(false, getLanguageCode(element));
}
function onMouseOver(element) {
	if (getExtendedField(getLanguageCode(element)).innerHTML.length > 0)
		showExtendedFields(true, getLanguageCode(element));
}
function onFocus(element, onclick) {
	if (element.style.background != "")
		element.value = "";
	else if (onclick)
		element.select();
	getArrowImg().style.webkitTransform = "rotateZ("+ (getLanguageCode(element) == sv ? "0" : "-180") +"deg)";
}

function onLoad() {
	getTextfield(sv).focus();
	getTextfield(sv).onkeyup = getTextfield(en).onkeyup = function() { startTimer(event, this); };
	getTextfield(sv).onclick = getTextfield(en).onclick = function() { onFocus(this, true); };
	getTextfield(sv).onfocus = getTextfield(en).onfocus = function() { onFocus(this, false); };
	getTextfield(sv).onmouseover = getTextfield(en).onmouseover = function() { onMouseOver(this); };
	document.getElementsByTagName("section")[0].getElementsByTagName("img")[0].onclick = function() { window.open("http://sv.wikipedia.org/wiki/"+ getTextfield(sv).value); };
	document.getElementsByTagName("section")[1].getElementsByTagName("img")[0].onclick = function() { window.open("http://en.wikipedia.org/wiki/"+ getTextfield(en).value); };
	getExtendedField(sv).onmouseout = getExtendedField(en).onmouseout = function() { onMouseOut(event, this); };
}