# 42 API POOL RANKING

This script is designed to fetch and display the levels of students from a specific piscine cohort at any 42 School campus using the 42 API. It filters users based on the specified pool month and year, retrieves detailed user information, extracts the level in their C Piscine Cursus of each student and rank them by their level.

## Features

- Fetches users based on a specified pool month and year.
- Retrieves detailed information for each user, focusing on their level in their C Piscine Cursus.
- Outputs the username and corresponding level.

## Prerequisites

- `jq`: A lightweight and flexible command-line JSON processor.
- `curl`: A command-line tool for getting or sending data using URL syntax.

Make sure both tools are installed on your system. You can install them using your system's package manager.

## Setup

1. Clone the repository to your local machine.
2. Ensure you have a valid UID and SECRET to get the access token. This token is required for making authenticated requests to the 42 API.
3. Set up variables in .env file.

## Usage

Before running the script, make sure to set the following variables in the .env file:
```shell
# NECESSARY VARIABLES
UID_42="YOUR_UID_42"
SECRET_42="YOUR_SECRET_42"
CAMPUS_ID="" # execute ./campus_id.sh if you don't know
POOL_MONTH=""
POOL_YEAR=""
```

To run the script, use the following command:
```bash
./pool_ranking
```
