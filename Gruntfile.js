/*jshint node: true, strict: false */

module.exports = function( grunt ) {

  grunt.initConfig({

    jshint: {
      source: [ 'js/**/*.js'  ],
      options: grunt.file.readJSON('.jshintrc')
    },

    concat: {
      pkgd: {
        dest: 'dist/flickity.pkgd.js',
        src: [
          // dependencies
          'bower_components/get-style-property/get-style-property.js',
          'bower_components/get-size/get-size.js',
          'bower_components/matches-selector/matches-selector.js',
          'bower_components/eventEmitter/EventEmitter.js',
          'bower_components/eventie/eventie.js',
          'bower_components/doc-ready/doc-ready.js',
          'bower_components/classie/classie.js',
          // source
          'js/utils.js',
          'js/unipointer.js',
          'js/cell.js',
          'js/prev-next-button.js',
          'js/page-dots.js',
          'js/player.js',
          'js/drag.js',
          'js/animate.js',
          'js/cell-change.js',
          'js/flickity.js'
        ]
      } 
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');

  grunt.registerTask( 'default', [
    'jshint',
    'concat'
  ]);

};
