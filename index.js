const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;

const cells = 5;
const width = 600;
const height = 600;
const unitLength = width / cells;

const engine = Engine.create();
engine.world.gravity.y = 0;
const { world } = engine;
const render = Render.create({
	element: document.body,
	engine: engine,
	options: {
		wireframes: true,
		width,
		height
	}
});

Render.run(render);
Runner.run(Runner.create(), engine);

//Walls

const walls = [
	Bodies.rectangle(width / 2, 0, width, 5, { isStatic: true }),
	Bodies.rectangle(width / 2, height, width, 5, { isStatic: true }),
	Bodies.rectangle(0, height / 2, 5, height, { isStatic: true }),
	Bodies.rectangle(width, height / 2, 5, height, { isStatic: true })
];

World.add(world, walls);

//Maze generation

const shuffle = (array) => {
	let counter = array.length;

	while (counter > 0) {
		const randomIndex = Math.floor(Math.random() * counter);

		counter--;

		const temp = array[counter];
		array[counter] = array[randomIndex];
		array[randomIndex] = temp;
	}

	return array;
};

const grid = Array(cells).fill(null).map(() => Array(cells).fill(false));
const verticals = Array(cells).fill(null).map(() => Array(cells - 1).fill(false));
const horizontals = Array(cells - 1).fill(null).map(() => Array(cells).fill(false));

const startRow = Math.floor(Math.random() * cells);
const startCol = Math.floor(Math.random() * cells);

//Function that goes through every cell
const iterateThroughCell = (row, col) => {
	//Return if the cell is visited
	if (grid[row][col]) {
		return;
	}
	//Mark cell as visited
	grid[row][col] = true;
	//Get a list of random neighbors
	const neighbors = shuffle([
		[ row - 1, col, 'up' ],
		[ row, col + 1, 'right' ],
		[ row + 1, col, 'down' ],
		[ row, col - 1, 'left' ]
	]);
	//Iterate through neighbors
	for (let neighbor of neighbors) {
		const [ nextRow, nextCol, direction ] = neighbor;
		//Bounds check
		if (nextRow < 0 || nextRow >= cells || nextCol < 0 || nextCol >= cells) {
			continue;
		}
		//If cell is visited
		if (grid[nextRow][nextCol]) {
			continue;
		}
		//Removing walls
		if (direction === 'left') {
			verticals[row][col - 1] = true;
		} else if (direction === 'right') {
			verticals[row][col] = true;
		} else if (direction === 'up') {
			horizontals[row - 1][col] = true;
		} else if (direction === 'down') {
			horizontals[row][col] = true;
		}

		iterateThroughCell(nextRow, nextCol);
	}
};

iterateThroughCell(startRow, startCol);

//Making horizontal walls
horizontals.forEach((row, rowIndex) => {
	row.forEach((open, columnIndex) => {
		if (open) {
			return;
		}

		const wall = Bodies.rectangle(
			columnIndex * unitLength + unitLength / 2,
			rowIndex * unitLength + unitLength,
			unitLength,
			5,
			{
				label: 'wall',
				isStatic: true
			}
		);

		World.add(world, wall);
	});
});

//Making vertical walls
verticals.forEach((row, rowIndex) => {
	row.forEach((open, columnIndex) => {
		if (open) {
			return;
		}

		const wall = Bodies.rectangle(
			columnIndex * unitLength + unitLength,
			rowIndex * unitLength + unitLength / 2,
			5,
			unitLength,
			{
				label: 'wall',
				isStatic: true
			}
		);

		World.add(world, wall);
	});
});

//Goal creation
const goal = Bodies.rectangle(width - unitLength / 2, height - unitLength / 2, unitLength * 0.7, unitLength * 0.7, {
	isStatic: true,
	label: 'goal'
});

World.add(world, goal);

//Ball creation
const ball = Bodies.circle(unitLength / 2, unitLength / 2, unitLength * 0.3, { label: 'ball' });
World.add(world, ball);

//Handling keypress
const { x, y } = ball.velocity;
document.addEventListener('keydown', (event) => {
	if (event.keyCode === 87) {
		Body.setVelocity(ball, { x, y: y - 5 });
	}
	if (event.keyCode === 68) {
		Body.setVelocity(ball, { x: x + 5, y });
	}
	if (event.keyCode === 83) {
		Body.setVelocity(ball, { x, y: y + 5 });
	}
	if (event.keyCode === 65) {
		Body.setVelocity(ball, { x: x - 5, y });
	}
});

//Win condition
Events.on(engine, 'collisionStart', (event) => {
	event.pairs.forEach((collision) => {
		const labels = [ 'ball', 'goal' ];

		if (labels.includes(collision.bodyA.label) && labels.includes(collision.bodyB.label)) {
			world.gravity.y = 1;
			world.bodies.forEach((body) => {
				if (body.label === 'wall') {
					Body.setStatic(body, false);
				}
			});
		}
	});
});
