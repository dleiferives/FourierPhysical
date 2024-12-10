var N = 1600 // number of input samples
    var q = 200 // number var N = 1600 // number of input samples
    var M = 8// number of circles
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
        speed = createSlider(0.2,10,0);
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
      let writer = createWriter('Fusion360GearSketch_export.txt');

      writer.write("# Creating sketches\n\n\n")
      
      for (let i =0; i<M ; ++i)
      {
        
        writer.write("sketch"+i+" = sketches.add(xyPlane)\n")
        writer.write("sketchCircles"+i+" = sketch"+i+".sketchCurves.sketchCircles\n")

      }
      

      writer.write("# Defining cirlces\n\n\n")
      
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
        
        d = dist(x1,y1,x2,y2)
        //adds a new scetch for each circle

        
        

        
        //places circle on canvas
        
        if (d>0)
        {
          writer.write("circle"+i+"= sketchCircles"+i+".addByCenterRadius(adsk.core.Point3D.create("+x1+", "+y1+", "+i*5+"), "+d+")\n")
        }
        
        else
        {
          r = d*-1
         writer.write("circle"+i+"= sketchCircles"+i+".addByCenterRadius(adsk.core.Point3D.create("+x1+", "+y1+", "+i*5+"), "+r+")\n") 
        }
        
        

        
        
      }
      

      writer.write("# extruding and bodies\n\n\n")
      
      for (let i =0; i<M ; ++i){
        
        //defines circle to prof
        writer.write("prof"+i+" = sketch"+i+".profiles.item(0)\n")
        
        //sets circle to be extracted
        writer.write("extrude"+i+" = extrudes.addSimple(prof"+i+", distance, adsk.fusion.FeatureOperations.NewBodyFeatureOperation)\n")   
        
        //sets circle to component 
        writer.write("extInput"+i+" = extrudes.createInput(prof"+i+", adsk.fusion.FeatureOperations.NewComponentFeatureOperation)\n")
        
        //sets up extraction
        writer.write("extInput"+i+".setDistanceExtent(True, distance)\n")
        writer.write("extInput"+i+".isSolid = True\n")
        
        //extracts
        writer.write("ext"+i+" = extrudes.add(extInput"+i+")\n")
        
        
        //defines the body for the extraction
        //writer.write("body"+i+" = extrude"+i+".bodies.item(0)\n")
        
        //names body in viewer
        //writer.write("body"+i+".name = "+"'cirlce"+i+"'\n")

        
      }
      
      for (let i =0; i<M ; ++i){
        writer.write("sideFace"+i+" = ext"+i+".sideFaces.item(0)\n")
        
        //set face to joint
        writer.write("geoS"+i+" = adsk.fusion.JointGeometry.createByNonPlanarFace(sideFace"+i+", adsk.fusion.JointKeyPointTypes.StartKeyPoint)\n")
        writer.write("geoC"+i+" = adsk.fusion.JointGeometry.createByNonPlanarFace(sideFace"+i+", adsk.fusion.JointKeyPointTypes.CenterKeyPoint)\n")
        
      }
      
      
      
      for (let i =0; i<M ; ++i){
        j = i+1
       writer.write("# Creating joints\n\n\n")
        
        //get side face for each circle

        
        //start making joints
        writer.write("jointInput"+i+" = joints.createInput(geoS"+i+", geoC"+j+")\n")
        
        
        writer.write("# Set the joint input\n\n\n")
        writer.write("angle = adsk.core.ValueInput.createByString('90 deg')\n")
        writer.write("jointInput"+i+".angle = angle\n")
        writer.write("offset = adsk.core.ValueInput.createByString('1 cm')\n")
        writer.write("jointInput"+i+".offset = offset\n")
        writer.write("jointInput"+i+".isFlipped = True\n")
        writer.write("jointInput"+i+".setAsRevoluteJointMotion(adsk.fusion.JointDirections.ZAxisJointDirection)\n")
        
        
        writer.write("# Create the joint\n\n")
        writer.write("joint"+i+" = joints.add(jointInput"+i+")")
        writer.write("revoluteMotion = joint"+i+".jointMotion\n")
        writer.write("limits = revoluteMotion.rotationLimits\n")
        writer.write("limits.isMinimumValueEnabled = True\n")
        writer.write("limits.minimumValue = 3.14 / 3\n")
        writer.write("limits.isMaximumValueEnabled = True\n")
        writer.write("limits.maximumValue = 3.14 / 3 * 2\n")
        writer.write("\n")
        writer.write("\n")
        
        
       
        
        
        
        

        

        
        
        
      }
      
      
      writer.close();
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
