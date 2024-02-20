#!/bin/bash

UID_42="YOUR_UID_42"
SECRET_42="YOUR_SECRET_42"
CAMPUS_ID=""

# COLORS FOR DISPLAY
RED="\033[38;5;124m"
PURPLE="\033[38;5;171m"
YELLOW="\033[38;5;227m"
GREEN="\033[38;5;119m"
DEF="\033[0m"
BOLD="\033[1m"
GRAY="\033[2;37m"

clear

printf "$BOLD$PURPLE
                     .__                          __    
______   ____   ____ |  |   ____________    ____ |  | __
\\____ \\ /  _ \\ /  _ \\|  |   \\_  __ \\__  \\  /    \\|  |/ /
|  |_> >  <_> |  <_> )  |__  |  | \\// __ \\|   |  \\    < 
|   __/ \\____/ \\____/|____/  |__|  (____  /___|  /__|_ \\
|__|                                    \\/     \\/     \\/
$DEF
"


# ---------------------------------------- Obtain an access token ---------------------------------------- #
RESPONSE=$(curl -s --request POST \
	--url "https://api.intra.42.fr/oauth/token" \
	--header "content-type: application/json" \
	--data "{
		\"grant_type\": \"client_credentials\",
		\"client_id\": \"$UID_42\",
		\"client_secret\": \"$SECRET_42\"
	}")

ACCESS_TOKEN=$(echo $RESPONSE | jq -r '.access_token')

if [ -z "$ACCESS_TOKEN" ]; then
	printf $BOLD$RED"Error: Failed to obtain access token\n"$DEF
	exit 1
fi

# --------------------- Fetch the list of campuses if $CAMPUS_ID not set by the user --------------------- #
if [ -z "$CAMPUS_ID" ]; then
	CAMPUS_JSON=$(curl -s -H "Authorization: Bearer $ACCESS_TOKEN" "https://api.intra.42.fr/v2/campus")
	if [ -z "$1" ]; then
		printf $BOLD$RED"Error: Please set the name of your 42 Campus\n"$DEF
		exit 1
	else
		CAMPUS_ID=$(echo "$CAMPUS_JSON" | jq --arg name "$1" '.[] | select(.name == $name) | .id')
		if [ -z "$CAMPUS_ID" ]; then
			printf $BOLD$RED"Error: Not an existing campus please check it again\n"$DEF
			exit 1
		fi
	fi
fi

# Ask the user for pool month and pool year
read -p "Enter the pool month (e.g., 'february'): " POOL_MONTH
read -p "Enter the pool year (e.g., '2024'): " POOL_YEAR
echo ""

# ----------------------------------- Fetch all the piscineux/ses data ----------------------------------- #
echo -n "" > users
PAGE=1
ALL_PAGE_USERS='[]'
while : ; do
	# Fetch a page of users
	PAGE_USERS=$(curl -g -s -H "Authorization: Bearer $ACCESS_TOKEN" \
		"https://api.intra.42.fr/v2/campus/$CAMPUS_ID/users?&filter[pool_month]=$POOL_MONTH&filter[pool_year]=$POOL_YEAR&page[number]=$PAGE&page[size]=100")

	# Because 42 API application has a secondly rate limit set at 2 :((((
	if ((PAGE % 2 == 0)); then
		sleep 1
	fi

	# Break if the page is empty
	if [ "$(echo "$PAGE_USERS" | jq '. | length')" -eq 0 ]; then
		break
	fi

	# Append PAGE_USERS to ALL_PAGE_USERS
	ALL_PAGE_USERS=$(echo "$ALL_PAGE_USERS" "$PAGE_USERS" | jq -s 'add')
	((PAGE++))
done

if [ "$ALL_PAGE_USERS" == "[]" ]; then
	printf $BOLD$RED"Error: No students found for the specified pool month/yeara\n"$DEF
	exit 1
fi

TOTAL_API_CALL=$(echo "$ALL_PAGE_USERS" | jq -r '.[] | .login' | wc -l)
NB_API_CALL=0

show_progress_bar() {
	# Percentage of progress
	local progress=$((100 * $NB_API_CALL / $TOTAL_API_CALL))
	local signs=$((progress / 5))
	local sec=$(($TOTAL_API_CALL - $NB_API_CALL))

	local bar=""
	for ((i = 0; i < signs; i++)); do
		bar="${bar}="
	done

	for ((i = signs; i < 20; i++)); do
		bar="${bar} "
	done

	printf "\rFetching data: [%-20s] %3d%% (estimated: %ds)" "$bar" "$progress" "$sec"
}

# ------------------------------- get the login and the corresponding level ------------------------------ #
echo "$ALL_PAGE_USERS" | jq -r '.[] | .login' | \
	while read LOGIN; do
	USER_DATA=$(curl -g -s -H "Authorization: Bearer $ACCESS_TOKEN" "https://api.intra.42.fr/v2/users/$LOGIN")
	((NB_API_CALL++))

	if [ -z "$USER_DATA" ]; then
		printf $BOLD$RED"Error: Failed to fetch students' data\n"$DEF
		exit 1
	fi

	# Because 42 API application has a secondly rate limit set at 2 :((((
	if ((NB_API_CALL % 2 == 0)); then
		show_progress_bar
		sleep 1
	fi

	USER_LEVEL=$(echo "$USER_DATA" | jq '.cursus_users[] | select(.cursus_id == 9) | .level')
	echo "$LOGIN: $USER_LEVEL" >> users
done

# Read from the file, sort in reverse by the second field (level), and format the output
printf $BOLD$RED"\n\nRANK  LOGIN      LVL\n"$DEF
head -n -1 users | sort -t: -k2 -nr | awk -F": " 'BEGIN {rank=1} {printf "\033[1m\033[38;5;119m%-5s \033[2;37m%-10s \033[38;5;227m%.4s\033[0m\n", rank++, $1, $2}'

# TODO
# - last update
# - remove interactive variables
# - animation climbing rank (OPTIONAL MATHIEU IDEA)
# - select a user