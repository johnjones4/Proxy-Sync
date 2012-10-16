(function() {
	var normalize = function(url) {
		url = url.toString();
		if (url.charAt(url.length-1) == '/')
			url = url.substring(0,url.length-1);
		if (url.indexOf('http://www') < 0) {
			url = url.replace('http://','http://www.');
		}
		return url;
	};

	var differentURL = function(url1,url2) {
		url1 = normalize(url1);
		url2 = normalize(url2);
		if (url1.length == url2.length) {
			for(var i=0;i<url1.length;i++) {
				if (url1.charAt(i) != url2.charAt(i)) {
					return true;
				}
			}
			return false;
		} else {
			return true;;
		}
	}

	var sendRequest = function(url,callback,async) {
		var xmlHttpReq = false;
	    if (window.XMLHttpRequest) {
	        xmlHttpReq = new XMLHttpRequest();
	    } else if (window.ActiveXObject) {
	        xmlHttpReq = new ActiveXObject("Microsoft.XMLHTTP");
	    }
	    xmlHttpReq.onreadystatechange = function() {
	        if (xmlHttpReq.readyState == 4) {
	            callback(xmlHttpReq.responseText);
	        }
	    }
	    xmlHttpReq.open('GET', url, async);
	    xmlHttpReq.send();
	}

	var listen = function(target,callback) {
		if (target.addEventListener) {
			target.addEventListener
		}
	}

	var interval;
	var startScanning = function() {
		interval = window.setInterval(function() {
			sendRequest(ADFERO_LABS_PING_URL+'?v='+(new Date().getTime()),function(newURL) {
				if (differentURL(newURL,window.location.href)) {
		        	window.clearInterval(interval);
		        	window.location.href=newURL;
		        }
			},true);
		},100);
	}

	document.body.onload = function(e) {
		sendRequest(ADFERO_LABS_PING_URL+'?v='+(new Date().getTime())+'&next='+encodeURIComponent(window.location.href),function(data){},false);
		startScanning();
	};
})();