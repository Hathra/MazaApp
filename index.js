const { Engine, Render, Runner, World, Bodies } = Matter;

const cells = 3;
const width = 400;

const height = 400;

const engine = Engine.create();
const { world } = engine;
const render = Render.create({
	element: document.body,
	engine: engine,
	options: {
		wireframes: false,
		width,
		height
	}
});

Render.run(render);
Runner.run(Runner.create(), engine);

//Walls

const walls = [
	Bodies.rectangle(width / 2, 0, width, 40, { isStatic: true }),
	Bodies.rectangle(width / 2, height, width, 40, { isStatic: true }),
	Bodies.rectangle(0, height / 2, 40, height, { isStatic: true }),
	Bodies.rectangle(width, height / 2, 40, height, { isStatic: true })
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
