import {escapeXML as e} from './model.js';
export function stairArrowPoints(a){
 const length=Math.hypot(a.x2-a.x1,a.y2-a.y1),ux=(a.x2-a.x1)/length,uy=(a.y2-a.y1)/length,nx=-uy,ny=ux;
 const point=(along,side)=>[a.x1+ux*along+nx*side,a.y1+uy*along+ny*side];
 return [point(0,-1.9),point(length-6,-1.9),point(length-6,-5),point(length,0),point(length-6,5),point(length-6,1.9),point(0,1.9)];
}
export function diagramDetailMarkup(a,p){
 if(a.kind==='stairArrow')return `<polygon data-stair-arrow="${e(a.id)}" points="${stairArrowPoints(a).map(q=>q.join(',')).join(' ')}" fill="${p.ink}" stroke="${p.paper}" stroke-width="${p.theme.lines.detail}" stroke-linejoin="round"/>`;
 return `<${a.closed?'polygon':'polyline'} points="${a.points.map(q=>q.join(',')).join(' ')}" fill="none" stroke="${p.ink}" stroke-width="${p.theme.lines[a.role]}" stroke-linecap="square" stroke-linejoin="miter"/>`;
}
