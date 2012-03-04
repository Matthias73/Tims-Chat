#!/usr/bin/env php
<?php
/**
 * Builds the Chat
 *
 * @author 	Tim Düsterhus
 * @copyright	2010-2012 Tim Düsterhus
 * @license	Creative Commons Attribution-NonCommercial-ShareAlike <http://creativecommons.org/licenses/by-nc-sa/3.0/legalcode>
 * @package	timwolla.wcf.chat
 */
echo <<<EOT
Cleaning up
-----------

EOT;
	if (file_exists('file.tar')) unlink('file.tar');
	if (file_exists('template.tar')) unlink('template.tar');
	if (file_exists('acptemplate.tar')) unlink('acptemplate.tar');
	foreach (glob('file/js/*.js') as $jsFile) unlink($jsFile);
	foreach (glob('file/style/*.css') as $cssFile) unlink($cssFile);
	if (file_exists('timwolla.wcf.chat.tar')) unlink('timwolla.wcf.chat.tar');
echo <<<EOT

Building JavaScript
-------------------

EOT;
foreach (glob('file/js/*.coffee') as $coffeeFile) {
	echo $coffeeFile."\n";
	passthru('coffee -cb '.escapeshellarg($coffeeFile), $code);
	if ($code != 0) exit($code);
}
echo <<<EOT

Building CSS
------------

EOT;
foreach (glob('file/style/*.scss') as $sassFile) {
	echo $sassFile."\n";
	passthru('scss '.escapeshellarg($sassFile).' '.escapeshellarg(substr($sassFile, 0, -4).'css'), $code);
	if ($code != 0) exit($code);
}
echo <<<EOT

Building file.tar
-----------------

EOT;
	chdir('file');
	passthru('tar cvf ../file.tar * --exclude=*.coffee --exclude=*.scss', $code);
	if ($code != 0) exit($code);
echo <<<EOT

Building template.tar
---------------------

EOT;
	chdir('../template');
	passthru('tar cvf ../template.tar *', $code);
	if ($code != 0) exit($code);
echo <<<EOT

Building acptemplate.tar
---------------------

EOT;
	chdir('../acptemplate');
	passthru('tar cvf ../acptemplate.tar *', $code);
	if ($code != 0) exit($code);
echo <<<EOT

Building timwolla.wcf.chat.tar
------------------------------

EOT;
	chdir('..');
	file_put_contents('package.xml.bak', file_get_contents('package.xml'));
	file_put_contents('package.xml', str_replace('</version>', '.'.time().'</version>', file_get_contents('package.xml')));
	passthru('tar cvf timwolla.wcf.chat.tar * --exclude=*.bak --exclude=file --exclude=template --exclude=acptemplate --exclude=build.php', $code);
	file_put_contents('package.xml', file_get_contents('package.xml.bak'));
	if ($code != 0) exit($code);

if (file_exists('package.xml.bak')) unlink('package.xml.bak');
if (file_exists('file.tar')) unlink('file.tar');
if (file_exists('template.tar')) unlink('template.tar');
if (file_exists('acptemplate.tar')) unlink('acptemplate.tar');
foreach (glob('file/js/*.js') as $jsFile) unlink($jsFile);
foreach (glob('file/style/*.css') as $cssFile) unlink($cssFile);
