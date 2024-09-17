import axios from 'axios';
import readlineSync from 'readline-sync';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RED = chalk.red;
const PURPLE = chalk.hex('#ab47bc');
const GRAY = chalk.gray;
const GREEN = chalk.green;
const BOLD = chalk.bold;
const DEF = chalk.reset();

const SCRIPT_DIR = __dirname;
const SETTINGS_FILE = path.join(SCRIPT_DIR, 'settings_pool_rank.json');

export const printBanner = () => {
	console.log(BOLD(PURPLE(`
		     .__                          __
______   ____   ____ |  |   ____________    ____ |  | __
\\____ \\ /  _ \\ /  _ \\|  |   \\_  __ \\__  \\  /    \\|  |/ /
|  |_> >  <_> |  <_> )  |__  |  | \\// __ \\|   |  \\    <
|   __/ \\____/ \\____/|____/  |__|  (____  /___|  /__|_ \\
|__|                                    \\/     \\/     \\/
`)));
};

// Obtain application UID and SECRET from the user
const getCredentials = () => {
	const uid42 = readlineSync.question(`${GRAY('Paste your application UID:')}${DEF} `);
	const secret42 = readlineSync.question(`${GRAY('Paste your application SECRET:')}${DEF} `);
	return { uid42, secret42 };
}

// Function to obtain access token from 42 API
const obtainAccessToken = async (uid42, secret42) => {
	try {
		const response = await axios.post('https://api.intra.42.fr/oauth/token', {
			grant_type: 'client_credentials',
			client_id: uid42,
			client_secret: secret42,
		}, {
			headers: { 'Content-Type': 'application/json' }
		});

		if (response.data.access_token) {
			return response.data.access_token;
		} else {
			throw new Error('Failed to obtain access token');
		}
	} catch (error) {
		if (error.response && error.response.data) {
			const errorMessage = error.response.data.error_description || 'Unknown error';
			console.error(RED(BOLD(`Error: Failed to obtain access token - ${errorMessage}`)));
		} else {
			console.error(RED(BOLD('Error: Failed to connect to the API. Please check your credentials or network connection.')));
		}
		return null;
	}
}

// Function to fetch basic user info
async function getUserData(login, accessToken) {
	try {
		const response = await axios.get(`https://api.intra.42.fr/v2/users/${login}`, {
			headers: { Authorization: `Bearer ${accessToken}` }
		});

		if (Object.keys(response.data).length === 0) {
			return null;
		}
		return response.data;
	} catch (error) {
		return null;
	}
};

// Initialize the pool rank settings
export const initPoolRank = async () => {
	console.log(`
╭─────────────────────────────────────────────────────────────╮
│                                                             │
│    First create a 42 application following this link:       │
│    https://api.intra.42.fr/apidoc/guides/getting_started    │
│                                                             │
╰─────────────────────────────────────────────────────────────╯
	`);

	const { uid42, secret42 } = getCredentials();
	const accessToken = await obtainAccessToken(uid42, secret42);

	let userData;
	let login;

	while (true) {
		login = readlineSync.question(`${GRAY('Type your login to fetch campus information:')}${DEF} `);
		userData = await getUserData(login, accessToken);

		if (!userData) {
			console.log(RED("Couldn't find user in 42 Database") + DEF);
		} else {
			break;
		}
	}

	// Extract pool year, month, and campus ID
	const poolYear = userData.pool_year || null;
	const poolMonth = userData.pool_month || null;
	const campusId = userData.campus.length ? userData.campus[0].id : null;
	const prPath = process.cwd();

	if (!poolYear || !poolMonth || !campusId) {
		console.error(RED(BOLD('Error: Could not extract pool information from user data.')));
		process.exit(1);
	}

	// Save to settings file
	const settings = {
		IS_INIT: 1,
		UID_42: uid42,
		SECRET_42: secret42,
		CAMPUS_ID: campusId,
		POOL_YEAR: poolYear,
		POOL_MONTH: poolMonth,
		LOGIN: login,
		PR_PATH: prPath
	};

	fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));

	console.log(GREEN(`\nSettings saved to ${SETTINGS_FILE}\n`));
};
