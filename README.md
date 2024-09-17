# 42 API POOL RANKING

This script is designed to fetch and display the levels of students from a specific piscine cohort at any 42 School campus using the 42 API. It filters users based on the specified pool month and year, retrieves detailed user information, extracts the level in their C Piscine Cursus of each student and rank them by their level.

> [!IMPORTANT]
> The script might require customization for different environments. This is a general implementation and may need adjustments based on your specific setup.

## Features

- **User Filtering**: Targets users based on the piscine's designated month and year.
- **Ranking System**: Sorts students by their performance levels.

## Prerequisites
### System Requirements:

- **Node.js**: Make sure you have Node.js installed (version 14 or higher is recommended).
- **npm**: Ensure `npm` is available to install project dependencies.
- **Access to 42 API**: You must have a registered application in the 42 API to obtain the necessary UID and SECRET.

### Tools:
- **Axios**: For making API requests.
- **Chalk**: For colorful terminal output.
- **cli-progress**: For a sleek progress bar during the fetching process.
- **p-limit**: To manage the concurrency of requests to avoid hitting rate limits.
- **Readline-Sync**: For interactive command-line inputs.

You can install all necessary dependencies with:

```bash
npm install
```

## Setup Instructions

1. **Clone the repository**:

```bash
git clone https://github.com/hanmpark/pool_rank.git
cd pool_rank
```

2. **Create a 42 API Application**:
	- Register an app at the `intra > Settings > API > Register A New App` to obtain a UID and SECRET.
3. Run the script:

```bash
node index.js
```

## Configuration

After executing `index.js`, you will have a new file called `settings_pool_rank.json` in the root with the following variables. You could still modify them:
```json
{
	"UID_42": # your application's UID
	"SECRET_42": # your application's SECRET
	"CAMPUS_ID": # your campus id
	"POOL_YEAR": # Format: "yyyy"
	"POOL_MONTH": # Format eg: "february"
	"LOGIN": # 42 student login
	"PR_PATH": # for storing a "users" file listing found users in the project directory
}
```

## Execution

To run the script, use the following command:
```bash
node index.js
```

## Output

```bash
RANK  LOGIN      LVL
1     student1   15.43
2     student2   14.98
3     student3   13.21
...
```

## Troubleshooting

- If you encounter issues with missing variables or API failures, ensure that:
	- The `settings_pool_rank.json` file is correctly configured.
	- Your *UID* and *SECRET* are valid and have the correct API permissions.
	- You have a stable internet connection.
- If you need to update the ranking data, rerun the script with the refresh option when prompted.
