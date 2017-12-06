/*
 * grunt-version-imports
 * https://github.com/campbes/grunt-version-imports
 *
 * Copyright (c) 2017 campbes
 * Licensed under the MIT license.
 */

'use strict';

var md5 = require('md5-file');
var path = require('path');

module.exports = function(grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('version_imports', 'Automatically version (cache-bust) module imports', function() {

    var regex = /import.*from\W['|"](.*)['|"]/g;

    // Iterate over all specified file groups.
    this.files.forEach(function(f) {

      var src = f.src;

      if(src.length === 0) {
        grunt.log.error('No source files supplied');
        return;
      } else if (src.length > 1) {
        grunt.log.error('Multiple source files cannot be specified');
        return;
      }

      var content = src.filter(function(filepath) {
        // Warn on and remove invalid source files (if nonull was set).
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file "' + filepath + '" not found.');
          return false;
        } else {
          return true;
        }
      }).map(function(filepath) {
        // Read file source.
        return grunt.file.read(filepath);
      }).join();

      src = src.join();

      var match;
      var ref;
      var base = src.replace(src.split('/').pop(),'');

      while (match !== null) {
        match = regex.exec(content);
        if(match) {
          ref = match[1].replace(/'/g,'').replace(/""/g,'');
          // ignore absolute paths - not possible to check
          if(ref.substr(0,1) !== '/') {
            try {
              content = content.replace(ref,ref+'?v='+md5.sync(path.resolve(base + ref)));
            } catch(e) {
              grunt.log.warn(e);
            }
          }
        }
      }

      // Write the destination file.
      grunt.file.write(f.dest, content);

      // Print a success message.
      grunt.log.writeln('File "' + f.dest + '" created.');
    });
  });

};
