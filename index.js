import axios from 'axios';
import readlineSync from 'readline-sync';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import { initPoolRank, printBanner } from './init.js';
import cliProgress from 'cli-progress';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Variables for colored display
const RED = chalk.red;
const YELLOW = chalk.yellow;
const GREEN = chalk.green;
const BOLD = chalk.bold;
const GRAY = chalk.gray;
const DEF = chalk.reset;

// Obtain script directory
const SCRIPT_DIR = __dirname;
const SETTINGS_FILE = path.join(SCRIPT_DIR, 'settings_pool_rank.json');

// Function to fetch users by pool
const fetchUsersByPool = async (poolMonth, poolYear, campusId, accessToken) => {
	let page = 1;
	let allPageUsers = [];

	while (true) {
		const response = await axios.get(`https://api.intra.42.fr/v2/campus/${campusId}/users`, {
			headers: { Authorization: `Bearer ${accessToken}` },
			params: {
				'filter[pool_month]': poolMonth,
				'filter[pool_year]': poolYear,
				'page[number]': page,
				'page[size]': 100,
			}
		});

		const pageUsers = response.data;

		if (pageUsers.length === 0) break;
		allPageUsers = allPageUsers.concat(pageUsers);
		page++;
	}

	if (allPageUsers.length === 0) return null;
	return allPageUsers;
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to handle rate limiting (429 error)
const handleRateLimit = async (error) => {
	if (error.response && error.response.status === 429) {
		const retryAfter = error.response.headers['retry-after'];
		const waitTime = retryAfter ? parseInt(retryAfter, 10) * 1000 : 5000;
		console.log(`Rate limit exceeded. Retrying after ${waitTime / 1000} seconds...`);
		await delay(waitTime);
	} else {
		throw error;
	}
};

// Function to fetch users data and handle rate limits
const fetchUsersData = async (allPageUsers, accessToken, prPath) => {
	const totalApiCall = allPageUsers.length;
	let nbApiCall = 0;

	const usersFilePath = path.join(prPath, 'users');
	const usersStream = fs.createWriteStream(usersFilePath, { flags: 'a' });

	const progressBar = new cliProgress.SingleBar({
		format: `Fetching data | ${GREEN('{bar}')} | {percentage}% | ${YELLOW('ETA: {eta_formatted}')} | ${GREEN('{value}/{total}')} requests`,
		barCompleteChar: '█',
		barIncompleteChar: '░',
		hideCursor: true
	}, cliProgress.Presets.shades_classic);

	console.log('\n');
	progressBar.start(totalApiCall, 0);

	for (const user of allPageUsers) {
		const login = user.login;

		try {
			const response = await axios.get(`https://api.intra.42.fr/v2/users/${login}`, {
				headers: { Authorization: `Bearer ${accessToken}` }
			});

			const userData = response.data;
			const cursusUser = userData.cursus_users.find(cursus => cursus.cursus_id === 9);
			const userLevel = cursusUser ? cursusUser.level.toFixed(2) : '0.00';
			usersStream.write(`${login}: ${userLevel}\n`);
		} catch (error) {
			await handleRateLimit(error);
			nbApiCall--;
			continue;
		}

		nbApiCall++;
		progressBar.update(nbApiCall);

		await delay(1000);
	}

	usersStream.end();
	progressBar.stop();
	console.log('\n');
};

// Main function
const main = async () => {
	console.clear();
	printBanner();

	if (!fs.existsSync(SETTINGS_FILE)) {
		await initPoolRank();
		return;
	}

	const settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));

	const { UID_42, SECRET_42, CAMPUS_ID, POOL_YEAR, POOL_MONTH, LOGIN } = settings;
	const prPath = SCRIPT_DIR;

	const tokenResponse = await axios.post('https://api.intra.42.fr/oauth/token', {
		grant_type: 'client_credentials',
		client_id: UID_42,
		client_secret: SECRET_42
	}, {
		headers: { 'Content-Type': 'application/json' }
	});

	const accessToken = tokenResponse.data.access_token;

	if (!accessToken) {
		console.error(RED(BOLD('Error: Failed to obtain access token (check UID and SECRET)')));
		process.exit(1);
	}

	if (!CAMPUS_ID || !POOL_MONTH || !POOL_YEAR) {
		console.error(RED(BOLD('Error: Missing CAMPUS_ID, POOL_MONTH, or POOL_YEAR')));
		process.exit(1);
	}

	console.log(`\n${BOLD('Pool month:')} ${GREEN(POOL_MONTH)}\n${BOLD('Pool year:')} ${GREEN(POOL_YEAR)}\n`);

	const usersFilePath = path.join(prPath, 'users');
	let refresh = 0;

	if (!fs.existsSync(usersFilePath) || fs.statSync(usersFilePath).size === 0) {
		refresh = 1;
	} else {
		console.log(`Last updated date: ${BOLD(DEF(fs.statSync(usersFilePath).mtime.toISOString().replace('T', ' ').substring(0, 19)))}\n`);

		const answer = readlineSync.question(`${GRAY('Do you want to refresh ? (Y/n): ')}`);
		if (answer.toLowerCase() === 'y') refresh = 1;
	}

	if (refresh === 1) {
		fs.writeFileSync(usersFilePath, '');
		const allPageUsers = await fetchUsersByPool(POOL_MONTH, POOL_YEAR, CAMPUS_ID, accessToken);
		if (!allPageUsers) {
			console.error(RED(BOLD('Error: No students found for the specified pool month/year.')));
			process.exit(1);
		}

		await fetchUsersData(allPageUsers, accessToken, prPath);
	}

	const loginInput = readlineSync.question(`${GRAY('Choose login to highlight (default: ') + BOLD(GREEN(LOGIN)) + GRAY('): ')}`);

	const loginToHighlight = loginInput || LOGIN;

	console.log('\n');

	const rankUsers = fs.readFileSync(usersFilePath, 'utf8')
		.split('\n')
		.filter(Boolean)
		.sort((a, b) => parseFloat(b.split(': ')[1]) - parseFloat(a.split(': ')[1]));

	console.log(BOLD(RED('RANK  LOGIN      LVL')));

	rankUsers.forEach((line, index) => {
		const [login, level] = line.split(': ');

		if (login === loginToHighlight) {
			console.log(`${BOLD(GREEN(String(index + 1).padEnd(5)))} ${GREEN(login.padEnd(10))} ${YELLOW(level.slice(0, 4))}`);
		} else {
			console.log(`${BOLD(GREEN(String(index + 1).padEnd(5)))} ${GRAY(login.padEnd(10))} ${YELLOW(level.slice(0, 4))}`);
		}
	});
};

main().catch(console.error);
