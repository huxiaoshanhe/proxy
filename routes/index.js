// 自己动手造
module.exports = function(app) {
	var url = require('url');
	var http = require('http');
	var request = require('request');

	var dpsBase = 'http://olap.epsnet.com.cn/';
	var loginBase = 'http://olap.epsnet.com.cn/';
	var codeBase='http://olap.epsnet.com.cn/';
	var cookieChange = {}; // 模拟浏览器Cookie
	
	//allow custom header and CORS
app.all('/platform/*',function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');

  if (req.method == 'OPTIONS') {
    res.send(200); 
  }
  else {
    next();
  }
});
	
	
    console.log('begin');
	app.get('/platform/*', function(req, res) {
		 var full_action = req.params[0];
		var action =full_action;
		console.log(action);
		var before = dpsBase; // 默认前缀
		var options = {json: true}; // 请求配置项

		switch(action) {
			case 'code.do':
			before=codeBase;
				var IMGS = new imageServer(http, url);
				// IMGS的请求会重新生成session
				IMGS.http(before + action, function(data) {
					res.writeHead(200, {'Content-Type': data.type});
					res.write(data.body, "binary");
					saveCookies(data.response);
					res.end();
				});
				return;
			default:
				break;
		}

		options.url = before + action + (req._parsedUrl.search || '');
		if (!options.headers) { options.headers = {}; }
		options.headers.Cookie = joinCookies();
	request.get(options, function(error, response, body) {
		    res.setHeader('Access-Control-Allow-Origin', '*');
			res.header('Access-Control-Allow-Origin', '*');
			res.statusCode = response.statusCode;
			res.json(body);
		});

	});

		app.post('/platform/*', function(req, res) {
			var full_action = req.params[0];
			var action = full_action;
			var before = dpsBase; // 默认前缀
			var options = {json: true}; // 请求配置项

			switch(action) {
				case 'login.do':
					before = loginBase;
					break;
				default:
					break;
			}

			options.url = before + action;
			options.form = req.body;
			if (!options.headers) { options.headers = {}; }
			options.headers.Cookie = joinCookies();
			request.post(options, function(error, response, body) {
				console.info(options.url);
				saveCookies(response);
				res.header('Access-Control-Allow-Origin', '*');
				res.json(body);
			});
		});

	// 对相应的cookie对象化,并保存
	function saveCookies(response) {
		if (response.headers['set-cookie']) {
			//console.info(response.headers['set-cookie']);
			var string = response.headers['set-cookie'][0];
			var sIndex = string.indexOf(';');
			string = string.substring(0, sIndex);
			var ary = string.split('=');
			cookieChange[ary[0]] = ary[1]; // 对象化储存
		}
	}

	// 合并cooke生成字符串
	function joinCookies () {
		var string = '';
		for (var key in cookieChange) {
			string += key + '=' + cookieChange[key] + ';';
		}
		if (string) { string = string.substring(0, string.length-1); }
		return string;
	}

	// 图片获取服务
	var imageServer = function(http, url) {
	  var _url = url;
	  var _http = http;

	  this.http = function(url, callback, method) {
	    method = method || 'GET';
	    callback = callback || function() {};
	    var urlData = _url.parse(url);
	    var request = _http.createClient('', urlData.host).
	      request(method, urlData.pathname, { "host": urlData.host });
	      request.end();

	    request.on('response', function(response) {
	      var type = response.headers["content-type"], body = "";
	      response.setEncoding('binary');
	      response.on('end', function() {
	        var data = {
	          type: type,
	          body: body,
	          response: response
	        };
	        callback(data);
	      });
	      response.on('data', function(chunk) {
	        if (response.statusCode == 200) body += chunk;
	      });
	    });
	  };
	};
};


