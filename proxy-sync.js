var http =        require('http');
var fs =          require('fs');
var url =         require("url");
var querystring = require('querystring');



// Const
var _proxyPort = 8080;
var _pingURL = '/adfero_device_lab';



// Cache
var zcache = { 'index.html': '','client-script.js': ''};
zcache['client-script.js'] = quickMinify(fs.readFileSync('./client-script.js')); //  Cache index.html



// System fields
var systemConfiguration = {
  url: 'http://adfero.com'
};



// Util
function stringStartsWith(haystack,needle) {
  return haystack.indexOf(needle) == 0;
}

function quickMinify(js) {
  return js;//.toString().replace('\n','').replace('\t','');
}



// Setup the proxy
http.createServer(function(request, response) {
  var requrl = url.parse(request.url);
  if (requrl.pathname == _pingURL) {
    var params = querystring.parse(requrl.query);
    if (params.next) {
      systemConfiguration.url = params.next;
      console.log('Switching to: ' + systemConfiguration.url);
    }
    if (params.scrollTop) {
      systemConfiguration.scrollTop = params.scrollTop;
      console.log(params.scrollTop);
    }
    response.write(systemConfiguration.url);
    response.end();
  } else {
    var options = {
      port: 80,
      host: request.headers['host'],
      method: request.method,
      path: request.url.replace('http://'+request.headers['host'],''),
      headers: request.headers
    };
    
    http.get(options,function(hostresponse) {
      response.writeHead(hostresponse.statusCode, hostresponse.headers);
      var returnData = '';
      var isHTML = hostresponse.headers['content-type'] && stringStartsWith(hostresponse.headers['content-type'],'text/html');
      hostresponse.on('data',function(chunk) {
        if (isHTML) {
          returnData += chunk;
        } else {
          response.write(chunk,'binary');
        }
      });
      hostresponse.on('end',function() {
        if (isHTML) {
          var index = returnData.indexOf('</body>');
          if (index > 0) {
            var script = '<script type="text/javascript">var ADFERO_LABS_PING_URL="'+_pingURL+'";'+zcache['client-script.js']+'</script>';
            response.write(returnData.substring(0,index)+script+returnData.substr(index+"</body>".length));
          } else {
            response.write(returnData,'binary');
          }
        }
        response.end();
      });
    });
  }
}).listen(_proxyPort);