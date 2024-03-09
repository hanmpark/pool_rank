# 42 API POOL RANKING

This script is designed to fetch and display the levels of students from a specific piscine cohort at any 42 School campus using the 42 API. It filters users based on the specified pool month and year, retrieves detailed user information, extracts the level in their C Piscine Cursus of each student and rank them by their level.

> [!IMPORTANT]
> The script comes with no guarantees for applicability to all contexts. It might require customization to function correctly in your specific environment.

## Features

- **User Filtering**: Targets users based on the piscine's designated month and year.
- **Detailed Information Retrieval**: Compiles extensive user data, emphasizing the C Piscine Cursus level.
- **Ranking System**: Assesses and ranks students according to their performance level.

## Prerequisites

- `jq`: A versatile and lightweight command-line tool for processing JSON data.
- `curl`: A command-line tool for getting or sending data using URL syntax.

Make sure both tools are installed on your system. You can install them using your system's package manager.

## Setup Instructions

1. Clone the repository to your machine.
2. Ensure you have a valid UID and SECRET for accessing the 42 API token, necessary for authenticated requests.
3. Execute `pool_rank`

## Configuration

After executing pool_rank, you will have a new file called `settings_pool_rank` in the root with the following variables. You could still modify them:
```bash
# ESSENTIAL VARIABLES
UID_42="" # your application's UID
SECRET_42="" # your application's SECRET
CAMPUS_ID="" # your campus id
POOL_MONTH="" # Format eg: "february"
POOL_YEAR="" # Format: "yyyy"
PR_PATH="" # for storing a "users" file listing found users in the project directory
LOGIN="" # 42 student login
```

## Execution

To run the script, use the following command:
```bash
pool_rank
```
