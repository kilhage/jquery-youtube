<!DOCTYPE html> 
<html>
<head>
	<title>QUnit Test Suite</title>
	<link rel="stylesheet" href="https://github.com/jquery/qunit/raw/master/qunit/qunit.css" type="text/css" media="screen">
	<script type="text/javascript" src="https://github.com/jquery/qunit/raw/master/qunit/qunit.js"></script>
    <script src="http://code.jquery.com/jquery.js" type="text/javascript"></script>
    <script src="../jquery-youtube<?php echo isset($_GET["a"]) ? $_GET["a"] : "" ?>.js" type="text/javascript"></script>
    <script>
        var _m = "Source::";
    </script>
	<script type="text/javascript" src="test.js"></script>
</head>
<body>
	<h1 id="qunit-header">QUnit Test Suite - jQuery.youtube</h1>
	<h2 id="qunit-banner"></h2>
	<div id="qunit-testrunner-toolbar"></div>
	<h2 id="qunit-userAgent"></h2>
	<ol id="qunit-tests"></ol>
	<div id="qunit-fixture"></div>
    
    
    
    <!--- Dummie elements -->
    <div>
        <div class="flexibility-video">
            <a class="hasId" id="flexibility-video0" data-id="t_hR5KNdPEA" data-width="200" data-height="80"></a>
            <a href="t_hR5KNdPEA" data-width="200" data-height="80"></a>
            <a href="t_hR5KNdPEA" alt='{"width":"200","height":"80"}'></a>
            <a data-id="t_hR5KNdPEA" alt='{"width":"200","height":"80"}'></a>
            <a class="hasName" data-id="t_hR5KNdPEA" alt='{"height":"80"}' data-width="200" title="name"></a>
            <a class="hasName" data-id="t_hR5KNdPEA" alt='{"height":"80"}' data-width="200" data-name="name"></a>
            <a class="hasName" data-id="t_hR5KNdPEA" alt='{"width":"200"}' data-height="80" name="name"></a>
            <img src="t_hR5KNdPEA" width="200px" height="80px" />
            <img src="t_hR5KNdPEA" width="200" data-height="80" />
            <a src="t_hR5KNdPEA" data-width="200" data-height="80"></a>
            <img href="t_hR5KNdPEA" data-width="200" height="80" />
            <img href="t_hR5KNdPEA" width="200" data-height="80" />
            <img class="hasData" href="t_hR5KNdPEA" data-width="200" data-height="80" data-data="data" />
        </div>
    </div>
</body>
</html>
