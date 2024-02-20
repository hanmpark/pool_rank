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
3. Configure the `.env` file with the necessary variables.

## Configuration

Set the following environment variables in your `settings` file to prepare the script for execution:
```shell
# ESSENTIAL VARIABLES
UID_42="YOUR_UID_42"
SECRET_42="YOUR_SECRET_42"
CAMPUS_ID="" # execute ./campus_id YOUR_CAMPUS_CITY if you don't know your campus id
POOL_MONTH="" # Format eg: "february"
POOL_YEAR="" # Format: "yyyy"
```

## Execution

To run the script, use the following command:
```bash
./pool_ranking
```
