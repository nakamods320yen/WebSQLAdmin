//hide structure
//localStorage
//uninstall
//sort
//err
(function(){
function g(id){
	return document.getElementById(id);
}
var wsa = {};
wsa.dbname = 'nakamods320yen@gmail.com';
wsa.init = function(){
	//init HTML
	wsa.initHTML(function(){
		if(!wsa.check){
			//show err mes
		}
		if(!wsa.dbname){
			g('dbnamediv').style.display = 'block';
			return;
		}
		g('dbname').value = wsa.dbname;
		var db = window.openDatabase(wsa.dbname, '', '', 1024*1024);
		wsa.db = db;

		wsa.db.compatibleReadTransaction = (typeof db.readTransaction=='function')
			? db.readTransaction
			: db.transaction;

		//show localStrage
		wsa.showLocalStorage();

		wsa.showTables();
	});

};
wsa.initHTML = function(success){
	var link=document.createElement('link');
	link.href='https://raw.github.com/nakamods320yen/WebSQLAdmin/master/WebSQLAdmin.css';
	link.rel='stylesheet';link.type='text/css';
	link.media='all';
	link.onload = function(){
		var str = '<div id="wsalayer">'
			+ '<header class="headerlogo">WebSQLAdmin</header>'
			+ '<div id="container">'
			+ '<div id="errMsg"></div>'
			+ '<div id="dbnamediv">'
				+ '<input id="dbname"><button onclick="wsa.setDBName();">set</button><br>'
				+ '<input type="checkbox" id="escape" checked><label for="htmlescape">escapeHTML</label>'
				+ '<input type="checkbox" id="parsejson" checked><label for="parsejson">parseJSON</label>'
			+ '</div>'
			+ '<div id="funcitons">'
				+ '<button onclick="if(confirm(\'do u wanna drop all tables?\')) wsa.dropAll();">drop all</button>'
			+ '</div>'
			+ '<div id="localStorage"></div>'
			+ '<div id="tables"></div>'
			+ '<textarea id="sql"></textarea><button onclick="wsa.execFreeSQL();">exec</button>'
			+ '<div id="sqltarget"></div>'
			+ '</div>' //#container
			+ '</div>'; //#wsalayer
		document.querySelector('body').innerHTML = str;
		
		if(typeof success == 'function') success();
	};
	document.head.appendChild(link);

};
wsa.showLocalStorage = function(){
	g('localStorage').innerHTML = '<h3>localStorage<span onclick="wsa.showLSRecords(this)">show</span></h3>'
		+ '<div id="localStorages"></div>';
};
wsa.showTables = function(){
	var db = wsa.db;
	var sql = "SELECT name, sql FROM sqlite_master WHERE type='table' ;";
	wsa.execSQL(sql, [], function(tx, rs){
		var l = rs.rows.length;
		if(l<1) return;

		for(var i=-1,line={},columns=[],tmp='',tables=[];++i<l;){
			line = rs.rows.item(i);
			if(line.name == '__WebKitDatabaseInfoTable__') continue;

			tables.push(line.name);
			tmp += '<h3>'+line.name;
			tmp += '<span onclick="wsa.showRecords(\''+line.name+'\', this);">show</span>';
			tmp += '</h3>';
			/*columns = line.sql.match(/^.*\((.*)\)$/)[1].split(',');
			for(var j=-1,cl=columns.length;++j<cl;){
				if(j==0) tmp += '<ul>';
				tmp += '<li>'+columns[j]+'</li>';
				if(j==cl-1) tmp += '</ul>';
			}*/
			//tmp += '</li>';
			tmp += '<div id="table'+line.name+'"></div>';
		}
		g('tables').innerHTML = ''+tmp+'';
		wsa.tables = tables;
	})
};
wsa.execSQL = function(sql, arr, successhandler){
	var db = wsa.db;
	//db.compatibleReadTransaction(function(tx){
	db.transaction(function(tx){
		if(sql instanceof Array){
			for(var i=-1,l=sql.length,line,handler;++i<l;){
				line = sql[i];
				if(i==l-1) handler = successhandler;
				else handler = function(){};
				tx.executeSql(line, arr, handler);
			}
		}else{
			tx.executeSql(sql, arr, successhandler);
		}
	}, function(err){
		wsa.showErrMsg('unable to exec this sql:'+sql+' <br>'+err.message);
	});
};
wsa.dropAll = function(){
	var tables = wsa.tables;
	var l = tables.length;
	if(l < 1){
		alert('u hav no table');
		return;
	}
	for(var i=-1,sqls=[];++i<l;){
		sqls.push('drop table if exists '+tables[i]);
	}
	wsa.execSQL(sqls, [], function(){
		alert('complete drop tables :)');
	});
};
wsa.clearLocalStorage = function(){
	window.localStorage.clear();
};
wsa.showErrMsg = function(msg){
	console.log(msg);
	g('errMsg').innerHTML = msg;
	g('errMsg').style.display = 'block';
};
wsa.check = function(){
	if(!window.openDatabase){
		wsa.err = 'you must change your browser';
		return false;
	}
};
wsa.setDBName = function(){
	var dbanme = g('dbname').value;
	if(!dbname) return;
	wsa.dbname = dbname;
	wsa.itit();
};
//you must set wsa.beforeTime before use showSQLData()
wsa.showSQLData = function(sqltarget, sql){
	return function(tx, rs){
		var execTime = Date.now() - wsa.beforeTime;
		var l = rs.rows.length;
		console.dir(rs);

		if(l<1) return;

		var sqlarea = '<p class="sqlarea">'+sql+'</p>';
		var p = '<span style="font-size: 85%;">実行時間' + execTime/1000 + "秒 " + l + "件</span>";
		var wherearea = '<form><input><input type="submit" value="Go"></form>';
		for(var i=-1,line={},tmp='';++i<l;){
			line = rs.rows.item(i);
			if(i===0) {
				tmp += "<tr><th>&nbsp;</th>";
				for(var j in line){
					tmp += "<th>"+j+"</th>";
				}
				tmp += "</tr>";
			}
			tmp += "<tr><td>"+(i+1).toString()+"</td>";
			for(var j in line){
				//var tmpString = wsa.htmlEscape(line[j]);
				var tmpString = wsa.JSON2str(line[j]);
				tmp += "<td>"+tmpString+"</td>";
			}
			tmp += "</tr>";
		}
		g(sqltarget).innerHTML = sqlarea + p+wherearea+'<table class="data">'+tmp+'</table>';
	}
};
wsa.showLSRecords = function(elm){
	var ls = window.localStorage;
	for(var i = -1, l = ls.length, tmp=''; ++i<l;){
		if(i===0){
			tmp += '<tr><th>&nbsp;</th><th>key</th><th>value</th></tr>';
		}
		tmp += '<tr id="lstr_'+ls.key(i)+'"><td onclick="wsa.deleteStorage(\''+ls.key(i)+'\')">削除</td><td>'+ls.key(i)+'</td><td>'+wsa.JSON2str(ls.getItem(ls.key(i)))+'</td></tr>';
	}
	g('localStorages').innerHTML = '<p class="sqlarea" id="localmsg">localStorage</p>' + '<table class="data">'+tmp+'</table>';
	g('localStorages').style.display = 'block';
	if(typeof elm == 'object'){
		elm.onclick = function(){
			g('localStorages').style.display = 'none';
			this.onclick = (function(){return function(){
				wsa.showLSRecords(this)
			}})();
			this.innerText = 'show';
		};
		elm.innerText = 'close';
	}
};
wsa.showRecords = function(tableName, elm){
	var sql = 'select * from '+tableName;
	var targetId = 'table'+tableName;
	wsa.beforeTime = Date.now();
	wsa.execSQL(sql, [], wsa.showSQLData(targetId, sql));
	g(targetId).style.display = 'block';
	if(typeof elm == 'object'){
		elm.onclick = function(){
			g(targetId).style.display = 'none';
			this.onclick = (function(_tableName){return function(){
				wsa.showRecords(_tableName, this)
			}})(tableName);
			this.innerText = 'show';
		};
		elm.innerText = 'close';
	}
};
wsa.deleteStorage = function(key){
	if(!confirm('"' + key + '"を削除しますか？')) return;

	g('lstr_'+key).style.display = 'none';

	window.localStorage.removeItem(key);
	g('localmsg').innerHTML = 'localStorage key: "' + key + '"を削除しました';
};
wsa.execFreeSQL = function(){
	var sql = g('sql').value;
	wsa.beforeTime = Date.now();
	wsa.execSQL(sql, [], wsa.showSQLData('sqltarget', sql));
};
wsa.JSON2str = function(str){
	if(!str || !g('parsejson').checked) return wsa.htmlEscape(str);
	var data;
	try{
		data = JSON.parse(str);
	}catch(e){
		return wsa.htmlEscape(str);
	}
	return wsa._array2str(data);
};
wsa._array2str = function(data){
	var returnStr = '';
	var type = data instanceof Array ? 'array': typeof data;

	if(type == 'array' || type == 'object'){
		returnStr += '<span class="jsonspan">'+type+(type=='array'?'['+data.length+']':'')+'</span>';
		returnStr += '<ul class="jsondata">';
		for(var i in data){
			var line = data[i];
			var ltype = line instanceof Array ? 'array': typeof line;
			returnStr += '<li>';
			//returnStr += '<span class="'+(type == 'array'?'numeric':'label')+'">'+i+'</span>: ';
			returnStr += '<span class="label">'+i+'</span><span>: <span>';
			if(ltype == 'object' || ltype == 'array'){
				returnStr += wsa._array2str(line);
			}else{
				returnStr += '<span class="'+ltype+'">'+(ltype=='string'?'"':'')+wsa._array2str(line)+(ltype=='string'?'"':'')+'</span>';
			}
			returnStr += '</li>';
		}
		returnStr += '</ul>';
		return returnStr;
	}
	return wsa.htmlEscape(data);
};
wsa.htmlEscape = (function(){
	var map = {"<":"&lt;", ">":"&gt;", "&":"&amp;", "'":"&#39;", "\"":"&quot;", " ":" &nbsp;", "　":"　"};
	var replaceStr = function(s){ return map[s]; };
	return function(str) {
		if(!g('escape').checked) return str;
		if(str || str==0)return str.toString().replace(/<|>|&|'|"|\s/g, replaceStr);
		return '';
	};
})();

//if(wsa.dbname) document.addEventListener('DOMContentLoaded', wsa.init, false);
window.wsa = wsa;
wsa.init();
})();