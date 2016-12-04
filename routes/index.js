var express = require('express');
var router = express.Router();
var multer = require('multer')
var fs = require('fs');

var upload = multer({dest: './uploads/'});
var server = require('./server');

var chart = { x: "sad" };
router.get('/', function(req, res, next) {
  res.render('layout');
});

router.post('/', upload.single('fileInput'), function(req, res, next) {
  var text = fs.readFileSync(req.file.path).toString();
  var data = server(text);
  res.render('index', {data: data, chart2: data.chart2, chart3: data.chart3, 
    chart4: data.chart4, chart5: data.chart5, chart6: data.chart6});
});

module.exports = router;
