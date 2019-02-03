shen_trick = null;
window.Assignment_Three_Scene = window.classes.Assignment_Three_Scene = class Assignment_Three_Scene extends Scene_Component {
  constructor(context, control_box) // The scene begins by requesting the camera, shapes, and materials it will need.
  {
    super(context, control_box);
    shen_trick = this
    // First, include a secondary Scene that provides movement controls:
    if (!context.globals.has_controls)
      context.register_scene_component(new Movement_Controls(context,control_box.parentElement.insertCell()));

    context.globals.graphics_state.camera_transform = Mat4.look_at(Vec.of(0, 0, 5), Vec.of(0, 0, 0), Vec.of(0, 1, 0));

    const r = context.width / context.height;
    context.globals.graphics_state.projection_transform = Mat4.perspective(Math.PI / 4, r, .1, 1000);

    // TODO:  Create two cubes, including one with the default texture coordinates (from 0 to 1), and one with the modified
    //        texture coordinates as required for cube #2.  You can either do this by modifying the cube code or by modifying
    //        a cube instance's texture_coords after it is already created.
    const shapes = {
      Node: new Subdivision_Sphere(5),
      Particle: new (Cube.prototype.make_flat_shaded_version())(),
      Edge: new Cylindrical_Tube(1,10),
      text: new Text_Line(10)
    }

    this.submit_shapes(context, shapes);

    this.materials = {
      phong: context.get_instance(Phong_Shader).material(Color.of(0, 0, 1, 1), {
        ambient: 1
      }),
      phong1: context.get_instance(Phong_Shader).material(Color.of(1, 0, 0, 0.5), {
        ambient: 1
      }),
      particle: context.get_instance(Phong_Shader).material(Color.of(1, 1, 1, 1), {
        ambient: 1,
        diffusivity: 0,
        specularity: 0
      }),
      picking: context.get_instance(Phong_Shader).material(Color.of(1, 1, 0, 1), {
        ambient: 1,
        diffusivity: 0,
        specularity: 0,
      })
    }

    this.text_image = context.get_instance(Phong_Shader).material(Color.of(1, 1, 1, 1), {
      ambient: 1,
      diffusivity: 0,
      specularity: 0,
      texture: context.get_instance("/assets/text.png")
    });

    this.lights = [new Light(Vec.of(-5, 5, 5, 1),Color.of(0, 1, 1, 1),100000)];
    this.nolights = [new Light(Vec.of(-5, 5, 5, 1),Color.of(0, 0, 0, 1),100000)];

    this.show_label = true;
    this.show_particle = false;
    this.pickingNodeMode = false;
    this.pickingEdgeMode = false;
    this.particlesNodeManager = new ParticlesManager(200,"sphere");
    this.particlesLinkManager = new ParticlesManager(300,"cylinder");
    this.path = new Path([])
    var testclick = document.querySelector("canvas");
    testclick.addEventListener("click", (e)=>{
      if (this.pickingNodeMode) {
        this.colorClicked = uiUtils.mousedown(e, testclick, context.returnGL());
        this.colorClicked = Vec.of(this.colorClicked[0], this.colorClicked[1], this.colorClicked[2], this.colorClicked[3]);
        for (let i = 0; i < this.colors.length; i++) {
          let colorToCompare = this.colors[i];
          let rounded = Vec.of(Math.round(colorToCompare[0] * 255), Math.round(colorToCompare[1] * 255), Math.round(colorToCompare[2] * 255), 255);
          if (rounded.equals(this.colorClicked)) {
            /* Have a hit */
            console.log("In Picking Node Mode");
            console.log(i);
            deleteNode(i);
            generateTable(adjacencyMatrix, nodeNames);
            this.colors.splice(i, 1);
          }
        }
      } else if (this.pickingEdgeMode) {
        this.colorClicked = uiUtils.mousedown(e, testclick, context.returnGL());
        console.log(this.colorClicked);
        this.colorClicked = Vec.of(this.colorClicked[0], this.colorClicked[1], this.colorClicked[2], this.colorClicked[3]);
        for (let i = 0; i < this.edgeColors.length; i++) {
          let colorToCompare = this.edgeColors[i];
          let rounded = Vec.of(Math.round(colorToCompare[0] * 255), Math.round(colorToCompare[1] * 255), Math.round(colorToCompare[2] * 255), 255);

          console.log(rounded)
          if (rounded.equals(this.colorClicked)) {
            /* Have a hit */
            console.log("In Picking Edge Mode");
            console.log(i);
            deleteLinks(i);
            generateTable(adjacencyMatrix, nodeNames);
            this.edgeColors.splice(i, 1);
          }
        }
      } else {
        console.log("You should not click!!!!!");
      }
    }
    );
  }

  set_colors() {
    this.colors = []
    for (let i = 0; i < nodes.length; i++) {
      var firstcolor = Math.random();
      var secondcolor = Math.random();
      var thirdcolor = Math.random();
      while ((firstcolor === 0.0 || secondcolor === 0.0 || thirdcolor === 0.0) || this.colors.find((x)=>{
        x.equals(Vec.of(firstcolor, secondcolor, thirdcolor))
      }
      ) !== undefined) {
        firstcolor = Math.random();
        secondcolor = Math.random();
        thirdcolor = Math.random();
        console.log("we got black, red, blue, or green")
      }
      this.colors.push(Color.of(firstcolor, secondcolor, thirdcolor, 1))
    }
  }

  set_colors_Edges() {
    this.edgeColors = []
    for (let i = 0; i < links.length; i++) {
      var firstcolor = Math.random();
      var secondcolor = Math.random();
      var thirdcolor = Math.random();
      while ((firstcolor === 0.0 || secondcolor === 0.0 || thirdcolor === 0.0) || this.edgeColors.find((x)=>{
        x.equals(Vec.of(firstcolor, secondcolor, thirdcolor))
      }
      ) !== undefined) {
        firstcolor = Math.random();
        secondcolor = Math.random();
        thirdcolor = Math.random();
        console.log("we got black, red, blue, or green")
      }
      this.edgeColors.push(Color.of(firstcolor, secondcolor, thirdcolor, 1))
    }
  }

  calculateCoordinates(Coord, Coord1) {
    var CoordNormalized = Coord.normalized();
    var Coord1Normalized = Coord1.normalized();
    var rotation = Math.acos(CoordNormalized.dot(Coord1Normalized) / CoordNormalized.norm() / Coord1Normalized.norm());
    var axis = CoordNormalized.cross(Coord1Normalized);
    return [-rotation, axis];
  }
  calculateDistance(Coord, Coord1) {
    return Coord.minus(Coord1).norm();
  }

  make_control_panel() {
    this.key_triggered_button("Change Colors", ["c"], this.set_colors);
    this.key_triggered_button("Show Node Names", ["l"], ()=>{
      this.show_label = !this.show_label;
    }
    );
    this.key_triggered_button("Particle", ["x"], ()=>{
      if (this.pickingEdgeMode === true || this.pickingNodeMode === true) {
        console.log("Turn off other mode first")
        document.getElementById("notification").innerHTML = "Turn off other mode first"
      } else {
        this.show_particle = !this.show_particle;
        document.getElementById("notification").innerHTML = ""
        if (this.show_particle === true) {
          this.particlesNodeManager.generateParticles();
          this.particlesLinkManager.generateParticles();
          this.generatePath();

        }
      }
    }
    )
    this.key_triggered_button("Deleting Node Mode", ["n"], ()=>{
      if (this.pickingEdgeMode === false && this.show_particle === false) {
        this.pickingNodeMode = !this.pickingNodeMode
        document.getElementById("notification").innerHTML = ""
      } else {
        console.log("Turn off other Mode First");
        document.getElementById("notification").innerHTML = "Turn off other mode first"
      }

    }
    );
    this.key_triggered_button("Deleting Edge Mode", ["e"], ()=>{
      if (this.pickingNodeMode === false && this.show_particle === false) {
        document.getElementById("notification").innerHTML = ""
        this.pickingEdgeMode = !this.pickingEdgeMode;
        this.set_colors_Edges();
        console.log("off")
      } else{
        document.getElementById("notification").innerHTML = "Turn off other mode first"
        console.log("Turn off other Mode First");
      }
        
         

    }
    );
  }
  generatePath() {
    let start = nodeNames.findIndex((e)=>{
      return start_node === e
    }
    )
    let end = nodeNames.findIndex((e)=>{
      return end_node === e
    }
    )
    this.path = new Path(dijkstra(start, end))
  }
  display(graphics_state) {
    const t = graphics_state.animation_time / 1000
      , dt = graphics_state.animation_delta_time / 1000;

    if (nodes === null) {
      this.show_label = true;
      this.show_particle = false;
      this.colors = undefined;
      this.edgeColors = undefined;
      this.path = new Path([])
      this.pickingNodeMode = false;
      this.pickingEdgeMode = false;
    }

    if (nodes !== null) {
      if (this.pickingNodeMode === false && this.pickingEdgeMode === false)
        graphics_state.lights = this.lights;
      else
        graphics_state.lights = this.nolights;

      if (this.colors === undefined)
        this.set_colors();

      if (this.show_particle) {
        this.particlesNodeManager.oneTick(dt);
        this.particlesLinkManager.oneTick(dt);
      }

      //nodes loop
      for (let i = 0; i < nodes.length; i++) {
        let node_transform = Mat4.identity().times(Mat4.translation(Vec.of(nodes[i].x, nodes[i].y, nodes[i].z)))

        if (this.pickingNodeMode === false && this.pickingEdgeMode === false) {
          //draw particles
          if (this.show_particle === true && this.path.inPath(i) === true) {
            this.particlesNodeManager.drawParticles(this.shapes.Particle, graphics_state, this.materials.particle, node_transform);
          }
          //draw nodes
          if (this.show_particle === false || this.path.inPath(i) === false) {
            //             if (this.path.nodes.length !== 0) {
            this.shapes.Node.draw(graphics_state, node_transform, this.materials.phong.override({
              color: this.colors[i]
            }));
            //             }
          }
        }
        if (this.pickingEdgeMode === true)
          this.shapes.Node.draw(graphics_state, node_transform, this.materials.phong.override({
            diffusivity: 0,
            specularity: 0
          }));
        if (this.pickingNodeMode === true)
          this.shapes.Node.draw(graphics_state, node_transform, this.materials.picking.override({
            color: this.colors[i]
          }));
        //draw labels
        if (this.show_label === true && this.pickingNodeMode === false) {
          this.shapes.text.set_string(nodeNames[i]);
          let point = node_transform.times(Vec.of(0, 1.5, 0, 1))
          let m = Mat4.inverse(graphics_state.camera_transform).map((r,i)=>[...r.slice(0, 3), point[i]]).times(Mat4.scale([.5, .5, .5]));
          this.shapes.text.draw(graphics_state, m, this.text_image);
        }
      }

      for (let j = 0; j < links.length; j++) {
        var CoordX = undefined;
        var CoordY = undefined;
        for (let k = 0; k < nodes.length; k++) {
          if (links[j].source.id === nodes[k].id) {
            CoordX = Vec.of(nodes[k].x, nodes[k].y, nodes[k].z);
          }
          if (links[j].target.id === nodes[k].id) {
            CoordY = Vec.of(nodes[k].x, nodes[k].y, nodes[k].z);
          }
        }
        var rotationAxis = this.calculateCoordinates(CoordY.minus(CoordX), Vec.of(0, 1, 0));
        //rotationAxis stores the rotation angle in the 0 index and the vector of the axis in the 1 index
        var distance = this.calculateDistance(CoordX, CoordY);
        //store the distance between the two points
        let diff = CoordY.minus(CoordX).normalized();
        let link_transform = Mat4.identity().times(Mat4.translation(CoordX.plus(diff))).times(Mat4.rotation(rotationAxis[0], rotationAxis[1])).times(Mat4.scale(Vec.of(.25, distance - 2, .25))).times(Mat4.translation(Vec.of(0, .5, 0))).times(Mat4.rotation(-Math.PI / 2, Vec.of(1, 0, 0)))

        if (this.pickingEdgeMode === false) {
          if (this.show_particle === false || this.path.inPath(links[j]) === false) {
            if (this.show_particle == true)
              this.shapes.Edge.draw(graphics_state, link_transform, this.materials.phong1.override({
                color: Color.of(1, 1, 1, 1)
              }));
            else
              this.shapes.Edge.draw(graphics_state, link_transform, this.materials.phong1);
          }
          if (this.path.inPath(links[j]) === true && this.show_particle == true) {
            this.particlesLinkManager.drawParticles(this.shapes.Particle, graphics_state, this.materials.particle, link_transform);
          }
        }

        if (this.pickingEdgeMode === true)
          this.shapes.Edge.draw(graphics_state, Mat4.identity().times(Mat4.translation(CoordX)).times(Mat4.rotation(rotationAxis[0], rotationAxis[1])).times(Mat4.scale(Vec.of(.25, distance, .25))).times(Mat4.translation(Vec.of(0, .5, 0))).times(Mat4.rotation(-Math.PI / 2, Vec.of(1, 0, 0))), this.materials.phong1.override({
            color: this.edgeColors[j],
            specularity: 0,
            diffusivity: 0
          }));
      }
    }
  }
}

class ParticlesManager {
  constructor(N, shape) {
    this.amount = N;
    this.shape = shape
  }
  generateParticles() {
    this.particles = [];
    let i = 0
    while (i < this.amount) {
      i += 1;
      this.particles.push(new Particle(this.shape,0.3))
    }
  }

  oneTick(dt) {
    for (let i = 0; i < this.amount; i++) {
      this.particles[i].oneTick(dt);
    }
  }
  drawParticles(shape, graphics_state, material, transform) {
    if (this.shape === "sphere") {
      for (let i = 0; i < this.amount; i++) {
        shape.draw(graphics_state, (Mat4.translation(this.particles[i].positionVector())).times(transform).times(Mat4.scale([0.05, 0.05, 0.05])), material);
      }
    }
    if (this.shape === "cylinder") {
      for (let i = 0; i < this.amount; i++) {
        let t = transform.times(this.particles[i].positionVector().to4(1));
        let T = Mat4.translation(t.to3());
        shape.draw(graphics_state, (T).times(Mat4.scale([0.05, 0.05, 0.05])), material);
      }
    }
  }
}
class Particle {
  constructor(shape, speed_factor=1) {
    this.getInitial()
    this.shape = shape;
    this.speed_factor = speed_factor;
    this.vx = (Math.random() - 0.5) * speed_factor;
    this.vy = (Math.random() - 0.5) * speed_factor;
    this.vz = (Math.random() - 0.5) * speed_factor;
  }
  getInitial() {
    if (this.shape === "sphere") {
      let r = Math.random();
      let theta = Math.random() * 2 * Math.PI;
      let phi = Math.random() * Math.PI;
      this.x = r * Math.sin(phi) * Math.cos(theta)
      this.y = r * Math.sin(phi) * Math.sin(theta)
      this.z = r * Math.cos(phi)
    }
    if (this.shape === "cylinder") {
      let r = Math.random();
      let z = (Math.random() - 0.5);
      let theta = Math.random() * 2 * Math.PI;
      this.x = r * Math.cos(theta);
      this.y = r * Math.sin(theta);
      this.z = z;
    }
  }

  positionVector() {
    return Vec.of(this.x, this.y, this.z);
  }
  velocityVector() {
    return Vec.of(this.vx, this.vy, this.vz);
  }
  oneTick(dt) {
    this.changeSpeed(dt);
    this.x += (this.vx * dt);
    this.y += (this.vy * dt);
    this.z += (this.vz * dt);
  }

  calculateNextCoord(dt, step=1) {
    return Vec.of(this.x + step * this.vx * dt, this.y + step * this.vy * dt, this.z + step * this.vz * dt)
  }
  changeSpeed(dt) {
    let count = 0;
    if (this.checkBoundary() === true)
      return;
    while (this.checkBoundary(this.calculateNextCoord(4)) === false && count < 100) {
      this.setSpeed((Math.random() - 0.5) * this.speed_factor, (Math.random() - 0.5) * this.speed_factor, (Math.random() - 0.5) * this.speed_factor)
      count += 1
    }
    if (count === 100) {
      this.getInitial();
    }
  }
  setSpeed(vx, vy, vz) {
    this.vx = vx;
    this.vy = vy;
    this.vz = vz;
  }
  checkBoundary(position=null) {
    position = position || this.positionVector();
    if (this.shape === "sphere") {
      let diff = position.minus(Vec.of(0, 0, 0));
      let distance = diff.dot(diff)
      if (distance <= 1)
        return true
      return false
    }
    if (this.shape === "cylinder") {
      if (this.z > -.5 && this.z < 0.5 && Math.sqrt(this.x * this.x + this.y * this.y) < 1)
        return true;
      return false
    }
    return false;
  }
}

class Path {
  constructor(n) {
    this.nodes = n;
    this.links = []
    for (let i = 0; i < this.nodes.length - 1; i++) {
      this.links.push({
        source: {
          index: this.nodes[i]
        },
        target: {
          index: this.nodes[i + 1]
        }
      });
    }
  }
  inPath(i) {
    if (typeof i === "number")
      return this.nodes.includes(i);
    //    
    if (typeof i === "object")
      return (this.links.find((x)=>{
        return compareLinks(x, i)
      }
      ) !== undefined)
  }
  start() {
    return this.nodes[0];
  }
  end() {
    return this.nodes[this.nodes.length - 1];
  }

}
function compareLinks(l1, l2) {
  return (l1.source.index === l2.source.index && l1.target.index === l2.target.index) || (l1.source.index === l2.target.index && l1.target.index === l2.source.index)
}
