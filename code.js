
var N = 1600 // number of input samples
    var q = 200 // number var N = 1600 // number of input samples
    var M = 10// number of circles
    var q = 2000 // number of output samples
    var viewbox = {width: 1080};
    var setupDone = false;
    var follow = true;
    var DFT
    var l
    var P
    var K
    var t = 0;
    //Step function
    var first = false;
    function aabs([re, im]) {
        return Math.hypot(re, im);
    }
    function expim(im) {
    return [Math.cos(im), Math.sin(im)];
    }
    function add([rea, ima], [reb, imb]) {
        return [rea + reb, ima + imb];
    }
    function mul([rea, ima], [reb, imb]) {
        return [rea * reb - ima * imb, rea * imb + ima * reb];
    }
    let zoom;
    let speed;
    async function setup(){
        let svg = await fetch("https://raw.githubusercontent.com/dleiferives/FourierPhysical/master/face.svg")
            .then(response => response.text())
            .then(text => (new DOMParser).parseFromString(text, "image/svg+xml"))
            .then(svg => svg.documentElement);
        createCanvas(1080, 720);
        zoom = createSlider(1,50,10);
        speed = createSlider(0,10,0);
        viewbox = svg.viewBox.baseVal
        let path2 = svg.querySelector("path")
        l = path2.getTotalLength()
        P = Array.from({length: N}, (_, i) => {
            const {x, y} = path2.getPointAtLength(i / N * l);
            return [x - viewbox.width / 2, y - viewbox.height / 2];
        })
        //console.log(P)
        K = Int16Array.from({length: M}, (_, i) => (1 + i >> 1) * (i & 1 ? -1 : 1))
        //console.log(K);
        DFT = Array.from(K, k => {
            let x = [0, 0];
            for (let i = 0, N = P.length; i < N; ++i) {
            x = add(x, mul(P[i], expim(k * i / N * 2 * -Math.PI)));
            }
            return [x[0] / N, x[1] / N];
        })
      
      /*for (let i =0; i<2 ; ++i)
      {
        
        for (let n = 0; i<2; ++n)
        {
          e1 = DFT[i]
          
          if (n==1)
          {
           e1[n] = x1;
          }
          
          if (n==2)
          {
           e1[n] = y1;
          }
          
          print ("circles.addByCenterRadius(adsk.core.Point3D.create(",x1,",", y1,",",z,"),", r,"))")
          
          
          
          
        }
        
      }*/
      for (let i =0; i<M ; ++i)
      {
      e1 = DFT[i];
      x1 = e1[0];
      y1 = e1[1];
      //console.log(y1);
        if (i>1){
          
      e2 =DFT[i-1];
      x2 = e2[0];
      y2 = e2[1];
          //console.log(x2);
        }
        else 
        {
        y2 =0
        x2 =0
        }
        
        d = ((((x1-x2)^(2))+((y1-y2)^(2)))^(1/2))
        
        if (d>0)
        {
          console.log("circle"+i+"= circles.addByCenterRadius(adsk.core.Point3D.create("+x1+", "+y1+",0 ), "+d+")")
        }
        
        else
        {
          r = d*-1
         console.log("circle"+i+"= circles.addByCenterRadius(adsk.core.Point3D.create("+x1+", "+y1+",0 ), "+r+")") 
        }
        
        
      }
      
      
      
       //console.log(DFT);
        setupDone = true
    }
    var width = 1080;
    const R = [];
    function draw() {
        background(0);
        //translate(600, 600);
        if(setupDone){
            const scale2 = zoom.value()/10 * width / viewbox.width;
            const a = t * 2 / q * Math.PI;
            // Calculate the current point.
            let p = [0, 0];
            for (let i = 0; i < M; ++i) {
            p = add(p, mul(DFT[i], expim(a * K[i])));
            }
            // Zoom.
            translate(width / 2, height / 2);
            scale(scale2);
            if(follow) translate(-p[0], -p[1]);
            // Draw circles.
            noFill();
            stroke(7600);
            for (let i = 0, p = [0, 0]; i < M; ++i) {
            const r = aabs(DFT[i]);
            ellipse(p[0], p[1],r*2);
              //console.log(p[0]);
              //console.log(p[1]);
             
            p = add(p, mul(DFT[i], expim(a * K[i])));
            }
            // Draw lines.
            /*
            context.beginPath();
            context.moveTo(0, 0);
            */
            stroke(125);
            for (let i = 0, p = [0, 0]; i < M; ++i) {
                prevP = p;
                p = add(p, mul(DFT[i], expim(a * K[i])))
                line(...prevP,...p);
            }
            // Draw the path.
            beginShape();
            noFill();
            stroke(255)
            if (R.length < q) R.push(p);
            for (let i = 1, n = R.length; i < n; ++i) {
                vertex(...R[i]);
            }
            endShape();
            t+=speed.value();
        }
    }
    function keyPressed(){
        if (key == "q"){
            follow = !follow;
        }
    }
function keyPressed(){
        if (key == "r"){
            for (let i = 0, p = [0, 0]; i < M; ++i) {
            const r = aabs(DFT[i]);
           
             
             
            p = add(p, mul(DFT[i], expim(K[i])));
              console.log(r);
        }
    }}

