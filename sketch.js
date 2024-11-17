const CANVAS_WIDTH = window.innerWidth * 0.8;
const CANVAS_HEIGHT = window.innerHeight * 0.8;

// state variables
let rotationAngle = 0;
let previousRotationAngle = 0;
let slider = null;
let treeDepth = 0;
let previousTreeDepth = 0;
let tree = [];
let jitter = false;
let randomness = false;

// Branch constructor function
function Branch(begin, end, depth) {
  this.begin = begin;
  this.end = end;
  this.depth = depth;
  this.finished = false;

  this.show = function () {
    const hue = map(this.depth, 0, treeDepth, 0, 360); // Map depth to hue value
    const saturation = map(this.depth, 0, treeDepth, 100, 255); // Map depth to saturation
    const brightness = map(this.depth, 0, treeDepth, 50, 200); // Map depth to brightness
    stroke(hue, saturation, brightness); // Set stroke color based on hue, saturation, and brightness
    strokeWeight(map(this.depth, 0, treeDepth, 10, 1)); // Set stroke weight based on depth
    line(this.begin.x, this.begin.y, this.end.x, this.end.y);
  };

  this.branch = function (randomness, shrinkFactor) {
    const dir = p5.Vector.sub(this.end, this.begin);

    if (dir.mag() < 1) {
      return [];
    }

    dir.mult(shrinkFactor);

    // Create the right branch
    const rightAngle = randomness
      ? rotationAngle + random(-PI / 8, PI / 8)
      : rotationAngle;
    const rightDir = dir.copy().rotate(rightAngle);
    const newEndRight = p5.Vector.add(this.end, rightDir);
    const right = new Branch(this.end, newEndRight, this.depth + 1);

    // Create the left branch
    const leftAngle = randomness
      ? -rotationAngle + random(-PI / 8, PI / 8)
      : -rotationAngle;
    const leftDir = dir.copy().rotate(leftAngle);
    const newEndLeft = p5.Vector.add(this.end, leftDir);
    const left = new Branch(this.end, newEndLeft, this.depth + 1);

    return [left, right];
  };

  this.jitter = function () {
    this.end.x += random(-1, 1);
    this.end.y += random(-1, 1);
  };
}

function generateTree() {
  tree = [];

  const begin = createVector(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
  const end = createVector(
    CANVAS_WIDTH / 2,
    CANVAS_HEIGHT - CANVAS_HEIGHT * 0.3
  );
  const root = new Branch(begin, end, 0);
  tree.push(root);

  // Expand branches
  for (let i = 0; i < treeDepth; i++) {
    // Limit the depth to avoid too many branches
    const newBranches = [];
    for (const branch of tree) {
      if (branch.finished) {
        continue;
      }
      branch.finished = true;
      newBranches.push(...branch.branch(randomness, 0.67));
    }
    tree.push(...newBranches);
  }
}

function setup() {
  // Create canvas
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT).id("fractal-canvas");

  // Create title
  createElement("h1", "FRACTAL TREE").addClass("title");

  // Create controls container
  const controlsContainer = createDiv().id("controls");

  // Create Rotation Angle label and slider
  createDiv("Rotation Angle").addClass("label").parent(controlsContainer);
  sliderAngle = createSlider(0, PI, PI / 4, 0.01)
    .addClass("slider")
    .parent(controlsContainer);

  // Create Tree Depth label and slider
  createDiv("Tree Depth").addClass("label").parent(controlsContainer);
  sliderDepth = createSlider(1, 12, 12, 1)
    .addClass("slider")
    .parent(controlsContainer);

  // Create Randomness button
  randomnessButton = createButton("Randomness")
    .addClass("button")
    .parent(controlsContainer);
  randomnessButton.mousePressed(() => {
    randomness = !randomness;
    if (randomness) {
      randomnessButton.addClass("active");
    } else {
      randomnessButton.removeClass("active");
    }
    generateTree();
    console.log("Randomness:", randomness);
  });

  // Create Jitter button
  jitterButton = createButton("Jitter")
    .addClass("button")
    .parent(controlsContainer);
  jitterButton.mousePressed(() => {
    jitter = !jitter;
    if (jitter) {
      jitterButton.addClass("active");
    } else {
      jitterButton.removeClass("active");
    }
    generateTree();
    console.log("Jitter:", jitter);
  });

  // generate the tree
  generateTree();
}

function draw() {
  // set the rotation angle to the value of the slider
  rotationAngle = sliderAngle.value();
  treeDepth = sliderDepth.value();

  // set the background color to black
  background(51);

  // set the stroke color to white
  stroke(255);

  // Regenerate the tree if angle changes
  if (rotationAngle !== previousRotationAngle) {
    generateTree();
    previousRotationAngle = rotationAngle;
  }

  // Regenerate the tree if angle changes
  if (treeDepth !== previousTreeDepth) {
    generateTree();
    previousTreeDepth = treeDepth;
  }

  // Draw all branches
  tree.forEach((branch) => {
    branch.show();
    if (jitter) {
      branch.jitter();
    }
  });
}
