/**
 * Created by jyk00 on 2019/4/9.
 * 对mySql的封装
 */

//服务启动后只执行一次，就不计时了
var mysql  = require('mysql');
var cnString = require('../sqlConnection.json');
var time = require('./preciseTime');

//封装数据库操作，以及计时器
/*
* sql： 参数化的sql语句
* parmes：数组，存放数据
* traces：执行步骤的跟踪以及计时
* callback：执行完毕后的回调函数
* query
 */
exports.query = function (sql,parmes,traces,callback) {
    /*跟踪执行步骤和计时*/
    if (traces) {
        if (!traces.msg)
            traces.msg = '';

        traces.startTime = time();
        traces.endTime = 0;
        traces.items = [];
        traces.msg += 'sql:' + sql;
        traces.msg += '；values:' + parmes;

    }
    else {
        /*没有传递，自己设置一个*/
        traces = {
            title: '开始执行一个数据操作，这个家伙很懒没有设置trace',
            msg: '',
            startTime: time(),
            endTime: 0,
            useTime: 0,
            items: []
        }
    }

    /*发送请求*/
    var conn = mysql.createConnection(cnString);
    conn.connect();
    conn.query(sql, parmes, function (err, result) {

        traceStart.endTime = time();/*记录回调时间*/
        traceStart.useTime = time() - traceStart.startTime;/*计算执行时间*/

        if (err) {
            /*记录出错日志*/
            console.log('[ERROR ] - ', err.message);
            traceStart.title += '——执行出错：';
            traces.msg += JSON.stringify(err);
            callback(err, result);
            return;
        }
        traceStart.title += '——成功！';

        callback(err, result);

    });
    conn.end();

    /*请求发送完毕================*/
    traces.endTime = time();
    traces.useTime = time() - traces.startTime;

    //记录数据库开始执行的时间
    var traceStart = {
        title: '请求发送完毕，等待反馈',
        startTime: time(),
        endTime: 0,
        useTime: 0,
        items: []
    };
    traces.items.push(traceStart);

};


//拼接valuesParams
function createParams(colInfo,data){
    var valuesParams = [];
    //数据变成数组的形式
    var colName = "";
    for (var i=0 ;i<colInfo.column.length;i++) {
        colName = colInfo.column[i];
        valuesParams.push(data[colName]);
    }
    //console.log('createParams的valuesParams：' +JSON.stringify(valuesParams));

    return valuesParams;

}

//拼接sql
function createSql2(){
    //var  userAddSql = 'INSERT INTO node_user(id,name,age) VALUES(0,?,?)';
    //var  userAddSql_Params = ['张洒' , 55];

    sql = 'INSERT INTO ' + meta.tableName ;

    var cols = "(" + meta.primaryKey;
    var values = " VALUES(0";
    var valuesParams = [];

    //拼接字段名和参数
    for (var key in meta.cols) {
        cols += ',' + key;
        values += ',?';
        valuesParams.push(meta.cols[key]);
    }
    sql +=cols + ')' + values + ')';
    console.log(sql);

}

//module.exports = query ;
