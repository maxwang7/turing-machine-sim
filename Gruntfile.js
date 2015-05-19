module.exports = function(grunt) {
  grunt.initConfig({
    uglify: {
      my_target : {
        options : {
          sourceMap : true,
          sourceMapName : 'sourceMap.map'
        },
        files : {
          'tm.min.js' : [
            '*.js',
            'brush/*.js',
            'graph/*.js',
            'edges/*.js',
            'nodes/*.js',
            'menu/*.js',
            'menu/modal/*.js',
            'simulation/*.js',
            'server/*.js'
          ],
          'select.min.js' : [
            'psets.js', 
            'util.js', 
            'server/server.js', 
            'server/mock.js'
          ]
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Default task(s).
  grunt.registerTask('default', ['uglify']);
};


