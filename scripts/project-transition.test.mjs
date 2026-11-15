import test from 'node:test';
import assert from 'node:assert/strict';
import { imageLanding, parseProjectRoute, rectClip, titleLanding } from '../app/project-transition-geometry.ts';
const origin='http://127.0.0.1:8001';
const slugs=['gkx','tax-cloud'];

test('client navigation preserves project URLs and legacy views',()=>{
 assert.deepEqual(parseProjectRoute('/portfolio/project/gkx/?from=portfolio&returnY=788#nsp-rules',origin,slugs),{url:'/portfolio/project/gkx/?from=portfolio&returnY=788#nsp-rules',projectSlug:'gkx',projectView:undefined});
 assert.equal(parseProjectRoute('/portfolio/project/gkx/systems/',origin,slugs).projectView,'systems');
 assert.equal(parseProjectRoute('/portfolio/#work',origin,slugs).projectSlug,undefined);
});

test('external, unknown and malformed destinations retain native navigation',()=>{
 for(const url of ['https://example.com/portfolio/project/gkx/','javascript:alert(1)','/portfolio/project/unknown/','/portfolio/project/%2Fgkx/','/portfolio/project/gkx/extra/path','/portfolio/project/%ZZ/','/portfolio/assets/demo.html']) assert.equal(parseProjectRoute(url,origin,slugs),null,url);
});

test('moving between differently shaped image frames preserves image proportions',()=>{
 for(const [a,b] of [
  [{left:10,top:20,width:520,height:560},{left:80,top:440,width:1200,height:338}],
  [{left:0,top:-120,width:360,height:480},{left:16,top:120,width:358,height:200}],
 ]){
  const geometry=imageLanding(a,b,1920,1080);
  assert.ok(Math.abs(geometry.sx*geometry.imageX-geometry.sy*geometry.imageY)<1e-9,'combined image scale must be uniform');
  const reverse=imageLanding(b,a,1920,1080);
  assert.ok(Math.abs(reverse.sx*reverse.imageX-reverse.sy*reverse.imageY)<1e-9);
 }
});

test('partially offscreen cards get valid viewport masks',()=>{
 assert.equal(rectClip({left:-20,top:-80,width:420,height:1100},390,843),'inset(0px 0px 0px 0px round 12px)');
 assert.equal(rectClip({left:80,top:100,width:1200,height:600},1354,727),'inset(100px 74px 27px 80px round 12px)');
});

test('project lettering changes size uniformly without horizontal stretching',()=>{
 assert.equal(titleLanding({left:60,top:120,width:400,height:64},{left:80,top:100,width:1200,height:76},48,64),'translate(20px, -20px) scale(1.3333333333333333)');
});
