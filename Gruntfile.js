module.exports = function(grunt) {
  grunt.initConfig({
    'build-electron-app': {
      options: {
        platforms: ["linux32", "win32"]
      }
    }
  });
  grunt.loadNpmTasks('grunt-electron-app-builder');

  grunt.registerTask('default', ['build-electron-app']);
}
