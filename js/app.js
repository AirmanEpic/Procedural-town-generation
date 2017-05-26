var polygonBoolean = require('2d-polygon-boolean');
var Offset = require('polygon-offset');
var preprocessPolygon = require("point-in-big-polygon")

el=document.getElementById('canvas').getBoundingClientRect();
var cmp = { x: -1, y: -1 };
    $(document).mousemove(function(event) {
    	
        cmp.x = event.pageX-el.left;
        cmp.y = event.pageY-el.top;
    });
//var canvas = document.getElementById('canvas');

var width = 1000, height = 1000;
var data = {children: [{children: [ {value: 100}, {value: 100}, {value: 100}, {value: 100}, {value: 100}, {value: 100}, {value: 100}, {value: 100}, {value: 100}]}]};
var clip = Voronoi.Polygon.create(width, height, 8);
//console.log(JSON.stringify(clip))

var	links=[];
var districts=[]
var blocks=[]

var offset = new Offset();

var stage=0;

var rendermode=0;

var dragging=-1

var buildinglist=[]

var canvas = document.getElementById('canvas');
	if (canvas.getContext) 
	{
    	context = canvas.getContext('2d');

    	context.fillRect(0,0,700,700)

    	context = canvas.getContext('2d');
		context.fillStyle="white";
    	context.fillRect(0,0,700,700)

    	context.imageSmoothingEnabled= false

    	drawupdate()
    	checkclick();
    }

function process_buildings()
{
	d=buildinglist

	for (var i=0; i<buildinglist.length;i++)
	{
		drawbuilding(d[i]);
	}

}

function drawupdate(){
 	//drawdistricts(districts);
 	//drawpolygons(block)
	//drawing mouse position

	context = canvas.getContext('2d');
	context.fillStyle="white";
	context.fillRect(0,0,1000,1000)
	if (rendermode==0)
	{
		if (cmp.x>0 && cmp.y>0)
		{
			context.beginPath();
		 	context.arc(cmp.x,cmp.y,4,0,2*Math.PI);
		 	context.strokeStyle="gray"
		 	context.lineWidth="2"
		 	context.stroke();
		 }
	
		if (stage==0)
		{
			if (dragging>-.2)
			{
				clip[dragging].x=cmp.x;
				clip[dragging].y=cmp.y;
			}
	
			drawouterborder()
		}
	
		if (stage==1)
		{
			drawpolygons(polygons);
	
			if (dragging!=0)
			{	
				for (var i=0; i<polygons.length;i++)
				{
					for (var ii=0; ii<polygons[i].length;ii++)
					{
						if (polygons[i][ii].dragging==1)
						{
							polygons[i][ii].x=cmp.x
							polygons[i][ii].y=cmp.y
						}
					}
				}
			}
		}
	
		if (stage==2)
		{
			for (i=0;i<blocks.length;i++)
			{
				drawablock(blocks[i])
			}
		}
	
		if (stage==3)
		process_buildings();
	}

	if (rendermode==1)
	{
		context.fillRect(0,0,1000,1000)

		drawcitywalls();

	}

	if (rendermode==2)
	{
		rendermode=0
	}


  	requestAnimationFrame(drawupdate);
}

function drawouterborder()
{
	//console.log(JSON.stringify(clip))
	context.beginPath()
	context.moveTo(clip[0].x,clip[0].y)
	for (var i=0;i<clip.length;i++)
	{
		context.lineTo(clip[i].x,clip[i].y)
	}
	context.lineTo(clip[0].x,clip[0].y)
	context.strokeStyle="gray"
	context.stroke()

	for (var i=0;i<clip.length;i++)
	{
		drawselectpoint(clip[i].x,clip[i].y,20)
	}
}

function drawcitywalls()
{
	//console.log(JSON.stringify(clip))
	context.beginPath()
	context.moveTo(clip[0].x,clip[0].y)
	for (var i=0;i<clip.length;i++)
	{
		context.lineTo(clip[i].x,clip[i].y)
	}
	context.lineTo(clip[0].x,clip[0].y)
	context.lineWidth="4"
	context.strokeStyle="gray"
	context.stroke()


}

function checkclick()
{
	$('#canvas').mousedown(function(event) {
		if (stage==0)
		{
			for (var i=0;i<clip.length;i++)
			{
				if (point_distance(clip[i].x,clip[i].y,cmp.x,cmp.y)<20)
				{
					dragging=i
				}
			}
		}

		if (stage==1)
		{
			for (var i=0; i<polygons.length;i++)
			{
				for (var ii=0; ii<polygons[i].length;ii++)
				{
					if (point_distance(polygons[i][ii].x,polygons[i][ii].y,cmp.x,cmp.y)<10)
					{
						polygons[i][ii].dragging=1
						dragging=1
					}
					else
					{
						polygons[i][ii].dragging=0;
					}
				}
			}
		}

		if (stage==2)
		{
			for (i=0;i<blocks.length;i++)
			{
				deleteablock(blocks[i])
			}
		}
	});

	$('body').mouseup(function(event){
		dragging=-1;

		if (stage==1)
		{
			for (var i=0; i<polygons.length;i++)
			{
				for (var ii=0; ii<polygons[i].length;ii++)
				{
					polygons[i][ii].dragging=0
				}
			}
		}
	})

	$('.rdybut').click(function(event) {

		if (stage==2)
		{
			$('.savebut').show();
			stage=3
			success=0
			tries=0
			do
			{
				try
				{
					initstagethree();
					success=1
				}
				catch (e)
				{
					success=0
					tries+=1
				}
			}
			while (success==0 && tries<4)
		}

		if (stage==1)
		{
			stage=2
			success=1
			tries=0

			//do
			{
				try
				{
					initstagetwo();
					success=1
				}
				catch (e)
				{
					success=0
					tries+=1
				}
			}
			//while (success==0 || tries<2)
		}

		if (stage==0)
		{
			stage=1
			success=1
			do
			{
				try
				{
					initiate();
					success=1
				}
				catch (e)
				{
					success=0
				}
			}
			while (success==0)
		}

	});

	$('.savebut').click(function(event) {
		if (stage==3)
		{
			rendermode+=1;

			if (rendermode==1)
			{
				$('.savebut').html("Right click save image as. Click when done for districts.")
			}
		}
	});
}

function drawselectpoint(x,y,r)
{
	context.lineWidth="2"
	context.strokeStyle="black"
	if (point_distance(x,y,cmp.x,cmp.y)<r)
	{
		context.beginPath()
		context.arc(x,y,r,0,2*Math.PI);
		context.fillStyle="blue"
		context.fill()
	}

	context.beginPath();
	context.arc(x,y,r,0,2*Math.PI);
	context.stroke();
}


function moveallpoints(t,x,y)
{
	for (var i=0;i<t.length;i++)
	{
		t[i].x-=x;
		t[i].y-=y;
	}
	return t
}

function moveallpointsback(t,x,y)
{
	for (var i=0;i<t.length;i++)
	{
		for(var ii=0;ii<t[i].length;ii++)
		{
			t[i][ii].x+=x;
			t[i][ii].y+=y;
		}
	}
	return t
}

function find_boundingbox(p)
{
	var xmin=10000
	var ymin=10000
	var xmax=0
	var ymax=0

	for (var i=0;i<p.length;i++)
	{
		if (p[i].x<xmin)
		{xmin=p[i].x}
		if (p[i].y<ymin)
		{ymin=p[i].y}

		if (p[i].x>xmax)
		{xmax=p[i].x}
		if (p[i].y>ymax)
		{ymax=p[i].y}
	}

	//console.log('min: '+xmin+', '+ymin+' max: '+xmax+', '+ymax+' w/h:' +(xmax-xmin)+', '+(ymax-ymin))

	return {x:xmin,y:ymin,w:(xmax-xmin),h:(ymax-ymin)}
}

function simplifypolygons(p)
{
	var z=p
	for (var i=0; i<z.length;i++)
	{
		if (z[i].length>0)
		{
		for (var ii=0; ii<(z[i].length-1);ii++)
			{
				if (point_distance(z[i][ii].x,z[i][ii].y,z[i][ii+1].x,z[i][ii+1].y)<80)
				{
					z[i][ii+1].x=z[i][ii].x
					z[i][ii+1].y=z[i][ii].y
				}
			}
		}
	}
	return z
}

function variablechange_to_offset(p)
{
	var n=[];
	for (var i=0; i<p.length;i++)
	{
		n.push([p[i].x,p[i].y])
	}

	n.push([p[0].x,p[0].y])

	return n;
}

function variablechange_to_offset_minusone(p)
{
	var n=[];
	for (var i=0; i<p.length;i++)
	{
		n.push([p[i].x,p[i].y])
	}

	//n.push([p[0].x,p[0].y])

	return n;
}

function variablechange_to_voronoi(p)
{
	var n=[];
	for (var i=0;i<p.length-1;i++)
	{
		n.push({x:p[i][0],y:p[i][1]})
	}

	//n.push([p[0][0],p[0][1]])
	//console.log("from: "+JSON.stringify(p)+" TO: "+JSON.stringify(n))
	return n;
}


function subdividelinks(div)
{
var poly=polygons;
	for (var i=0; i<links.length;i++)
	{
		if (links[i].set.length>1)
		{
			var midpoint=lerp(links[i].x1,links[i].y1,links[i].x2,links[i].y2,.5)
		
			var dir=Math.random()*Math.PI*2;
			var dis=getRandomArbitrary(div/3,div)*(point_distance(links[i].x1,links[i].y1,links[i].x2,links[i].y2)/150)
	
			//console.log('pushing midpoint id '+i+" with values of dis:"+dis+",  dir:"+dir);
			var pushawayx=midpoint.x+(dis*Math.cos(dir))
			var pushawayy=midpoint.y+(dis*Math.sin(dir))
	
			var n=lerp(midpoint.x,midpoint.y,pushawayx,pushawayy,-0.5)
	
			midpoint.x=n.x;
			midpoint.y=n.y;
	
			//console.log('pushing midpoint id '+i+" to "+midpoint.x+", "+midpoint.y);
	
			for (var ii=0; ii<links[i].set.length;ii++)
			{
				poly[links[i].set[ii].l1].splice(links[i].set[ii].l2+1,0,{x:midpoint.x,y:midpoint.y})
				bumplinks(links[i].set[ii].l1,links[i].set[ii].l2)
			}
		}
	}

	return poly
}

function bumplinks(c1,c2)
{
	for (var i=0;i<links.length;i++)
	{
		for (var ii=0;ii<links[i].set.length;ii++)
		{
			if (links[i].set[ii].l1==c1)
			if (links[i].set[ii].l2>c2)
			{
				links[i].set[ii].l2+=1;
			}
		}
	}
}

function createlinks(p)
{
	z=p
	//note we ignore the first polygon.
	for (var i=1; i<z.length;i++)
	{
		if (z[i].length>0)
		{
		for (var ii=0; ii<(z[i].length-1);ii++)
			{
				checklinks(z,i,ii)
			}
		checkfinal(z,i,ii)
		}
	}


	return links
}

function checkfinal(p,l1,l2)
{
	x1=p[l1][p[l1].length-1].x
	y1=p[l1][p[l1].length-1].y
	x2=p[l1][0].x
	y2=p[l1][0].y

	//find a home for this line segment.
	findslot(x1,y1,x2,y2,l1,p[l1].length-1)
}

function checklinks(p,l1,l2)
{
	x1=p[l1][l2].x
	y1=p[l1][l2].y
	x2=p[l1][l2+1].x
	y2=p[l1][l2+1].y

	//find a home for this line segment.
	findslot(x1,y1,x2,y2,l1,l2)
}

function findslot(x1,y1,x2,y2,l1,l2)
{
//sample link (line segment): {x1, y1, x2, y2, set[]}
	found=0
	for (var i=0; i<links.length;i++)
	{
		if ((point_distance(x1,y1,links[i].x1,links[i].y1)<2 && point_distance(x2,y2,links[i].x2,links[i].y2)<2)||(point_distance(x2,y2,links[i].x1,links[i].y1)<2 && point_distance(x1,y1,links[i].x2,links[i].y2)<2))
		{
			found=1
			links[i].set.push({l1:l1,l2:l2})
			//console.log("Found matching link. Link "+i+" matches polygon "+l1+","+l2)
		}
	}

	if (found!=1)
	{
		links.push({x1:x1,y1:y1,x2:x2,y2:y2,set:[{l1:l1,l2:l2}]})

	}
}

function drawpolygons(p)
{
	//note we ignore the first polygon. This polygon is covered by the others, thank you very much.
	for (var i=1; i<p.length;i++)
	{
		if (p[i].length>0)
		{
		context.beginPath();
		context.lineWidth="5"
		context.strokeStyle="blue";
		context.moveTo(p[i][0].x,p[i][0].y)
		for (var ii=0; ii<(p[i].length);ii++)
			{
				context.lineTo(p[i][ii].x,p[i][ii].y)
			}
			context.lineTo(p[i][0].x,p[i][0].y)
			context.stroke();

			for (var ii=0; ii<(p[i].length);ii++)
			{
				drawselectpoint(p[i][ii].x,p[i][ii].y,10)
			}
		}


	}
}

function drawablock(p)
{
	for (var i=1; i<p.length;i++)
	{
		if (p[i].length>0)
		{

			var off=[variablechange_to_offset_minusone(p[i])];

			var classifyPoint=preprocessPolygon(off)

			var v=classifyPoint([Math.floor(cmp.x),Math.floor(cmp.y)])

			context.beginPath();
			context.lineWidth="3"
			context.strokeStyle="blue";
			context.moveTo(p[i][0].x,p[i][0].y)
			for (var ii=0; ii<(p[i].length);ii++)
			{
				//console.log('drawing point: '+p[i][ii].x+","+p[i][ii].y)
				context.lineTo(p[i][ii].x,p[i][ii].y)
			}
			context.lineTo(p[i][0].x,p[i][0].y)

			if (v<0)
			{
				context.fillStyle="blue"
				context.fill()
				//console.log('filling: '+v)
			}
			else
			{context.stroke();}

		}
	}
}

function deleteablock(p)
{
	for (var i=1; i<p.length;i++)
	{
		if (p[i].length>0)
		{

			var off=[variablechange_to_offset_minusone(p[i])];

			var classifyPoint=preprocessPolygon(off)

			var v=classifyPoint([Math.floor(cmp.x),Math.floor(cmp.y)])

			if (v<0)
			{
				p.splice(i,1)
			}
		}
	}
}

function drawasubblock(p)
{
	//note we ignore the first polygon. This polygon is covered by the others, thank you very much.
	for (var i=0; i<p.length;i++)
	{
		if (p[i].length>3)
		{
		for (var ii=0; ii<(p[i].length-1);ii++)
			{
				context.beginPath();
				context.lineWidth="2"
				context.strokeStyle="gray";
				//console.log('drawing point: '+p[i][ii].x+","+p[i][ii].y)
				context.moveTo(p[i][ii].x,p[i][ii].y)
				context.lineTo(p[i][ii+1].x,p[i][ii+1].y)
				context.stroke();
			}
			context.moveTo(p[i][p[i].length-1].x,p[i][p[i].length-1].y)
			context.lineTo(p[i][0].x,p[i][0].y)
			context.stroke();
		}
	}
}

function draw_this_voronoi(p)
{
	if (p.length>0)
	{
		context.beginPath();
		context.moveTo(p[0].x,p[0].y)
		for (var i=0; i<p.length;i++)
		{
				
				context.lineWidth="5"
				context.strokeStyle="black";
				//console.log('drawing point: '+p[i][ii].x+","+p[i][ii].y)
				
				context.lineTo(p[i].x,p[i].y)
		}
	
		context.lineTo(p[0].x,p[0].y)
		context.stroke();
	}
}

function drawdistricts(p)
{
	for (var i=0; i<p.length;i++)
	{
		if (p[i].length>0)
		{
			context.beginPath();
			context.lineWidth="5"
			context.strokeStyle="red";
			context.moveTo(p[i][0][0],p[i][0][1])
			for (var ii=0; ii<(p[i].length-1);ii++)
				{
					context.lineTo(p[i][ii][0],p[i][ii][1])
				}
			context.lineTo(p[i][0][0],p[i][0][1])
			context.stroke();
		}
	}
}

function drawbuilding(p)
{

	context.beginPath();
	context.lineWidth="1"
	context.strokeStyle="gray";
	context.moveTo(p.points[0][0],p.points[0][1])
	for (var ii=0; ii<(p.points.length-1);ii++)
		{
			context.lineTo(p.points[ii][0],p.points[ii][1])
		}
	context.lineTo(p.points[0][0],p.points[0][1])
	context.stroke();
}

function drawsubblock(p)
{
	if (p.length>0)
	{
		context.beginPath();
		context.lineWidth="2"
		context.strokeStyle="green";
		context.moveTo(p[0][0],p[0][1])
		for (var ii=0; ii<(p.length-1);ii++)
			{
				context.lineTo(p[ii][0],p[ii][1])
			}
		context.lineTo(p[0][0],p[0][1])
		context.stroke();
	}
}

function point_distance(x1,y1,x2,y2)
{
	return (Math.sqrt(Math.pow(x1-x2,2)+Math.pow(y1-y2,2)))
}

function point_direction(x1,y1,x2,y2)
{
	return (Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI);
}


function lerp(x1,y1,x2,y2,i){
	var xx=((x2-x1)*i)+x1
	var yy=((y2-y1)*i)+y1
	return {x:xx,y:yy}
}

function getRandomArbitrary(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function area(a) {
  var e0 = [0, 0];
  var e1 = [0, 0];

  var area = 0;
  var first = a[0];

  var l = a.length;
  for (var i=2; i<l; i++) {
    var p = a[i-1];
    var c = a[i];
    e0[0] = first[0] - c[0];
    e0[1] = first[1] - c[1];
    e1[0] = first[0] - p[0];
    e1[1] = first[1] - p[1];

    area += (e0[0] * e1[1]) - (e0[1] * e1[0]);
  }
  return area/2;
}

function initiate()
{
	var treemap = new Voronoi.Treemap(data, clip, width, height);

    	treemap.compute();
    	treemap.compute();
    	treemap.compute();

   		polygons = treemap.getPolygons();
   		//polygons=[[{x:100,y:150},{x:200,y:250},{x:300,y:250}]]
   		//createlinks(polygons);

   		//this shit is like this because I think the voronoi system won't work with convex shapes. 
		//polygons=subdividelinks(70);
		// links=[];
		// createlinks(polygons);
		// polygons=subdividelinks(20);

		// links=[];
		// createlinks(polygons);
		// polygons=subdividelinks(10);
		//We now have fully curved roads
}

function initstagetwo()
{

	//next up is some sweet offset. First we need to create subregions (using new variables.)

		for (var i=1; i<polygons.length;i++)
		{	//start on 1 to avoid messing with the border polygon
			if (polygons[i].length>0)
			{//there are some nasty 0 point polygons. skip them.

				districts.push(variablechange_to_offset(polygons[i]))
				//now we have properly formatted districts. 

				//time to use offset!
				districts[districts.length-1]=offset.data(districts[districts.length-1]).padding(5)[0]

				//now that the districts are set up, each must be divided into blocks. 

				//get this district's area to get the number of subdistricts
				this_blocks=Math.floor(area(districts[districts.length-1])/1000)+10

				this_data={children:[{children:[]}]}

				for (var ii=0; ii<this_blocks;ii++)
				{
					this_data.children[0].children.push({value:5})
				}

				//next step: convert district coords to voronoi coords

				var this_voronoi=variablechange_to_voronoi(districts[districts.length-1]).reverse();
				

				var bb=find_boundingbox(this_voronoi)

				this_voronoi=moveallpoints(this_voronoi,bb.x,bb.y)

				//then: come up with a good h and w.
				height=bb.h
				width=bb.w;
				
				//then generate blocks. 
				tm=[];
				var tm = new Voronoi.Treemap(this_data, this_voronoi, width, height);
				tm.compute();
				tm.compute();
				tm.compute();


				block=tm.getPolygons()

				block=moveallpointsback(block,bb.x,bb.y)

				blocks.push(block);
				//console.log(JSON.stringify(block))
				//block=block.reverse();
				

					//time to generate the sub-blocks.
				//normally the subblock gen goes here.
				//console.log(this_blocks)
			}
		}

		
}

function initstagethree()
{
	buildinglist=[];
	for (var i=0;i<blocks.length;i++)
	{
		if (blocks[i].length>0)
		{
			
			block=blocks[i];
			for (var ii=1;ii<block.length;ii++)
			{
				if (block[ii].length>3)
				{
					this_subblock=block[ii]
					this_offset=variablechange_to_offset(this_subblock)

					pad=Math.random()*2+2

					this_offset=offset.data(this_offset).padding(pad)[0]

					//drawsubblock(this_offset)

					this_count=Math.floor((area(this_offset)/100)*((Math.random()/2)+.5))

					this_data={children:[{children:[]}]}

					for (var iii=0; iii<this_count;iii++)
					{
						this_data.children[0].children.push({value:5})
					}

					var this_voronoi=variablechange_to_voronoi(this_offset).reverse();
				
					var bb=find_boundingbox(this_voronoi)

					this_voronoi=moveallpoints(this_voronoi,bb.x,bb.y)

					//then: come up with a good h and w.
					height=bb.h
					width=bb.w;

					//then generate subblocks. 
					tm=[];
					var tm = new Voronoi.Treemap(this_data, this_voronoi, width, height);
					tm.compute();
					tm.compute();
					tm.compute();

					subblock=tm.getPolygons()

					subblock=moveallpointsback(subblock,bb.x,bb.y)

					//drawasubblock(subblock);

					for (var iii=1; iii<subblock.length;iii++)
					{
						if (subblock[iii].length>0)
						{
							this_building=subblock[iii];
							this_boffset=variablechange_to_offset(this_building)
							this_barea=Math.abs(Math.floor(area(this_boffset)))

							//generate one of several building types. 
							//first if area is greater than 70, you can shrink slightly.

							if (this_barea>120 && (Math.random()<.1))
							{
								pad=(Math.random()*2)+.7;
								this_boffset=offset.data(this_boffset).padding(pad)[0]
							}

							bcomplete={points:this_boffset,area:this_barea}
							
							if (this_barea>30 && this_building.length>3)
							buildinglist.push(bcomplete)
						}
					}
				}
			}
		}
	}
	process_buildings()
}