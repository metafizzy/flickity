/*jshint node: true, strict: false */

module.exports = function( grunt ) {

  var banner = ( function() {
    var src = grunt.file.read('js/flickity.js');
    var re = new RegExp('^\\s*(?:\\/\\*[\\s\\S]*?\\*\\/)\\s*');
    var matches = src.match( re );
    var banner = matches[0].replace( 'Flickity', 'Flickity PACKAGED' );
    return banner;
  })();

  grunt.initConfig({

    jshint: {
      source: {
        src: [ 'js/**/*.js'  ],
        options: grunt.file.readJSON('.jshintrc')
      },
      test: {
        src: [ 'test/unit/*.js'  ],
        options: grunt.file.readJSON('test/.jshintrc')
      }
    },

    requirejs: {
      pkgd: {
        options: {
          baseUrl: 'bower_components',
          include: [
            'jquery-bridget/jquery.bridget',
            'flickity/js/flickity'
          ],
          out: 'dist/flickity.pkgd.js',
          optimize: 'none',
          paths: {
            flickity: '../',
            jquery: 'empty:'
          },
          wrap: {
            start: banner
          }
        }
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-requirejs');

  grunt.registerTask( 'pkgd-edit', function() {
    var outFile = grunt.config.get('requirejs.pkgd.options.out');
    var contents = grunt.file.read( outFile );
    // get requireJS definition code
    var definitionRE = /define\(\s*'flickity\/js\/flickity',\s*\[[\'\/\w\.,\-\s]+\]/i;
    var definition = contents.match( definitionRE )[0];
    // remove name module
    var fixDefinition = definition.replace( "'flickity/js/flickity',", '' )
      // ./animate -> flickity/js/animate
      .replace( /'.\//g, "'flickity/js/" );
    contents = contents.replace( definition, fixDefinition );
    grunt.file.write( outFile, contents );
    grunt.log.writeln( 'Edited ' + outFile );
  });

  grunt.registerTask( 'default', [
    'jshint',
    'requirejs',
    'pkgd-edit'
  ]);

};
