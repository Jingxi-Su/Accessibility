module.exports = {
  "plugins": [
    "@babel/plugin-proposal-object-rest-spread",
    "@babel/plugin-proposal-class-properties",
    "@babel/plugin-transform-runtime"
  ],
  "presets": [
    [
      "@babel/preset-env",
      {
        "modules": false,
      }
    ]
  ]
}
