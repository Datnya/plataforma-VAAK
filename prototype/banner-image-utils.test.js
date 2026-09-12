const assert=require('node:assert/strict');
const banner=require('./banner-image-utils.js');

assert.deepEqual(banner.outputSize(banner.coverCrop(2880,720)),{width:2880,height:720});
assert.deepEqual(banner.outputSize(banner.coverCrop(1920,1080)),{width:1920,height:480});
assert.equal(banner.qualityFor(2880,720),'ideal');
assert.equal(banner.qualityFor(1920,480),'acceptable');
assert.equal(banner.qualityFor(1200,300),'low');
const left=banner.coverCrop(4000,1000,-100,0,1),right=banner.coverCrop(4000,1000,100,0,2);
assert.equal(left.x,0);
assert.ok(right.x>left.x);
assert.equal(Math.round(right.width/right.height),4);
assert.equal(banner.focusAfterDrag(0,250,1000),-50);
assert.equal(banner.focusAfterDrag(40,-600,1000),100);
assert.equal(banner.focusAfterDrag(-40,600,1000),-100);
assert.equal(banner.formatBytes(2*1024*1024),'2.0 MB');

console.log('banner-image-utils: all assertions passed');
