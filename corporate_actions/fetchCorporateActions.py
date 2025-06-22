from bse import BSE
import pandas as pd
from datetime import datetime, timedelta
import os
import json

# --- Configuration ---
# Input CSV file path
CSV_FILE_PATH = r"C:\Users\Rahul Saxena\Documents\GitHub\Internship @Calquity\CQNow-Report\corporate_actions\companies.csv"

# Define a generous lookback period to increase the chance of finding a recent action
LOOKBACK_DAYS = 365 * 2 # Looking back 2 years to find recent actions (adjust if needed)

# Define BSE internal download folder (for the bse library's own temporary files)
script_dir = os.path.dirname(os.path.abspath(__file__))
BSE_DOWNLOAD_FOLDER = os.path.join(script_dir, 'bse_downloads')

# Define the output folder for your generated JSON file
OUTPUT_FOLDER = r"C:\Users\Rahul Saxena\Documents\GitHub\Internship @Calquity\CQNow-Report\corporate_actions"
OUTPUT_FILENAME = "corporate_actions_latest.json" # New name for the output file

# Ensure necessary folders exist
os.makedirs(BSE_DOWNLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

print(f"BSE internal download folder set to: {BSE_DOWNLOAD_FOLDER}")
print(f"Output JSON file will be saved to: {os.path.join(OUTPUT_FOLDER, OUTPUT_FILENAME)}")

# --- Main Script ---

print(f"\nAttempting to load CSV from: {CSV_FILE_PATH}")

if not os.path.exists(CSV_FILE_PATH):
    print(f"Error: The file '{CSV_FILE_PATH}' was not found.")
    print("Please double-check the path for any typos, spelling, or case differences.")
    print("Also, ensure the file is not open in another program which might lock it.")
    exit()

try:
    df = pd.read_csv(CSV_FILE_PATH)
    print(f"Successfully loaded data from '{CSV_FILE_PATH}'.")

except Exception as e:
    print(f"Error reading the CSV file: {e}")
    print("Please ensure the CSV file is correctly formatted (e.g., correct delimiters, no unusual characters).")
    exit()

# List to store the LATEST corporate action for each company
latest_corporate_actions = []
companies_without_bse_code = []

# Flag to ensure we only print the sample structure once
sample_structure_printed = False

# Helper function to convert datetime/Timestamp objects to string for JSON serialization
def convert_datetime_to_str(obj):
    if isinstance(obj, (datetime, pd.Timestamp)):
        # Check if it's a date-only object by checking if time is midnight
        if isinstance(obj, datetime) and obj.time() == datetime.min.time():
            return obj.strftime('%Y-%m-%d') # Format as YYYY-MM-DD if time is not relevant
        elif isinstance(obj, pd.Timestamp) and obj.to_datetime64().astype('datetime64[D]') == obj.to_datetime64(): # Check if it's a date only timestamp
            return obj.strftime('%Y-%m-%d')
        return obj.strftime('%Y-%m-%d %H:%M:%S') # Full datetime format
    # For 'N/A' or other non-date strings, return as is
    if isinstance(obj, str):
        return obj
    raise TypeError(f"Object of type {obj.__class__.__name__} is not JSON serializable")


with BSE(download_folder=BSE_DOWNLOAD_FOLDER) as bse:
    to_date = datetime.now()
    from_date = to_date - timedelta(days=LOOKBACK_DAYS)

    print(f"\nFetching corporate actions from {from_date.strftime('%Y-%m-%d')} to {to_date.strftime('%Y-%m-%d')} for each company...\n")

    for index, row in df.iterrows():
        nse_symbol = str(row['Securities']).strip()
        print(f"Processing {nse_symbol}...")

        bse_scrip_code = None
        try:
            bse_scrip_code = bse.getScripCode(nse_symbol)
            print(f"  Found BSE scrip code for {nse_symbol}: {bse_scrip_code}")

            actions = bse.actions(
                scripcode=bse_scrip_code,
                from_date=from_date,
                to_date=to_date,
                segment='equity'
            )

            if actions:
                # --- Debugging: Print keys of the first action found for ANY company ---
                # This will only print once, at the first company that returns actions.
                if not sample_structure_printed:
                    print(f"\n--- Sample Corporate Action Structure for {nse_symbol} (First action found) ---")
                    print(f"Keys available: {list(actions[0].keys())}")
                    print(f"Full first action details: {json.dumps(actions[0], indent=2, default=convert_datetime_to_str)}")
                    print("----------------------------------------------------\n")
                    sample_structure_printed = True


                # Define the sorting key function: prioritize 'exdate' (YYYYMMDD), then 'Ex_date' (DD Mon YYYY)
                def get_sort_date(action_item):
                    # Priority 1: 'exdate' (YYYYMMDD numeric string)
                    exdate_num = action_item.get('exdate')
                    if exdate_num and exdate_num != '' and exdate_num.isdigit() and len(exdate_num) == 8:
                        try:
                            return datetime.strptime(str(exdate_num).strip(), '%Y%m%d')
                        except ValueError:
                            pass # Fallback

                    # Priority 2: 'Ex_date' (DD Mon YYYY)
                    ex_date_str = action_item.get('Ex_date')
                    if ex_date_str and ex_date_str != '-' and ex_date_str != 'N/A':
                        try:
                            return datetime.strptime(str(ex_date_str).strip(), '%d %b %Y') # e.g., "18 Sep 2023"
                        except ValueError:
                            pass # Fallback

                    # Priority 3: 'ND_START_DATE' (DD Mon YYYY) - example, could be any other date field
                    nd_start_date_str = action_item.get('ND_START_DATE')
                    if nd_start_date_str and nd_start_date_str != '-' and nd_start_date_str != 'N/A':
                        try:
                            return datetime.strptime(str(nd_start_date_str).strip(), '%d %b %Y')
                        except ValueError:
                            pass # Fallback

                    # If no valid date found in any field
                    return datetime.min

                # Sort actions by the derived date in descending order (latest first)
                sorted_actions = sorted(
                    actions,
                    key=get_sort_date,
                    reverse=True # Newest to oldest
                )

                # The first item after sorting in reverse is the latest
                latest_action = sorted_actions[0]
                latest_action['NSE_Symbol'] = nse_symbol
                latest_action['BSE_ScripCode'] = bse_scrip_code
                latest_corporate_actions.append(latest_action)
                
                # Print the actual date that was used for sorting for confirmation
                used_date_for_sorting = get_sort_date(latest_action)
                print(f"  Found latest corporate action for {nse_symbol} (Sorted by: {used_date_for_sorting.strftime('%Y-%m-%d')}).")
            else:
                print(f"  No corporate actions found for {nse_symbol} in the specified date range.")

        except ValueError as e:
            print(f"  Error: Could not find BSE scrip code for {nse_symbol}. {e}")
            companies_without_bse_code.append(nse_symbol)
        except TimeoutError:
            print(f"  Error: Request timed out for {nse_symbol}. Skipping.")
        except ConnectionError as e:
            print(f"  Error: Connection error for {nse_symbol}: {e}. Skipping.")
        except Exception as e:
            print(f"  An unexpected error occurred for {nse_symbol}: {e}. Skipping.")
        print("-" * 30)

# Display results
if latest_corporate_actions:
    print("\n--- Summary of Latest Fetched Corporate Actions for Each Company ---")
    for action in latest_corporate_actions:
        print(f"NSE Symbol: {action.get('NSE_Symbol')}, "
              f"BSE ScripCode: {action.get('BSE_ScripCode')}, "
              f"Purpose: {action.get('Purpose', 'N/A')}, "
              f"Ex_date: {action.get('Ex_date', 'N/A')}, " # Changed to Ex_date
              f"exdate: {action.get('exdate', 'N/A')}, "   # Added exdate
              f"RD_Date: {action.get('RD_Date', 'N/A')}" # Changed to RD_Date
              )
else:
    print("\nNo corporate actions were fetched for any company.")

if companies_without_bse_code:
    print("\n--- Companies for which BSE Scrip Code was NOT found ---")
    for company in companies_without_bse_code:
        print(company)

# Save the results to a JSON file
if latest_corporate_actions:
    output_full_path = os.path.join(OUTPUT_FOLDER, OUTPUT_FILENAME)
    try:
        with open(output_full_path, 'w', encoding='utf-8') as f:
            json.dump(latest_corporate_actions, f, indent=4, default=convert_datetime_to_str)
        print(f"\nAll latest corporate actions saved to '{output_full_path}'")
    except Exception as e:
        print(f"\nError saving JSON file: {e}")