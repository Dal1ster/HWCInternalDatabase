module.exports = {
    apps : [{
        name   : "hwc",
        script : "./index.js",
        interpreter: "node@20.17.0" // temporary bypass for the regression in latest node version
    }]
}
  