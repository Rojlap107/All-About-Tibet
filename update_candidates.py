import pandas as pd
import json

# Read the Excel file
excel_path = '/Users/tenzinpaljor/Downloads/MP Candidate (1).xlsx'
df = pd.read_excel(excel_path)

# Read existing candidates.json
json_path = '/Users/tenzinpaljor/Desktop/Norzin Consultancy/1. All About Tibet/Website without DBMongo/data/candidates.json'
with open(json_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

existing_candidates = data['candidates']

# Create a dictionary of existing candidates by ID for quick lookup
existing_dict = {c['id']: c for c in existing_candidates}

print(f"Existing candidates: {len(existing_candidates)}")
print(f"Excel rows: {len(df)}")

# Track updates and additions
updated_count = 0
added_count = 0

# Process each row from Excel
for _, row in df.iterrows():
    candidate_id = int(row['id'])

    # Determine image file name
    image_file = f"{candidate_id}.jpg"

    # Create candidate object
    candidate = {
        "id": candidate_id,
        "photo": f"../../images/candidates/{image_file}",
        "name": str(row['name']) if pd.notna(row['name']) else "",
        "ageGroup": str(row['ageGroup']) if pd.notna(row['ageGroup']) else "",
        "gender": str(row['gender']) if pd.notna(row['gender']) else "",
        "origin": str(row['origin']) if pd.notna(row['origin']) else "",
        "currentAddress": str(row['currentAddress']) if pd.notna(row['currentAddress']) else "",
        "occupation": str(row['occupation']) if pd.notna(row['occupation']) else "",
        "representing": str(row['representing']) if pd.notna(row['representing']) else "",
        "briefBio": str(row['briefBio']) if pd.notna(row['briefBio']) else "",
        "educationalBackground": str(row['educationalBackground']) if pd.notna(row['educationalBackground']) else "",
        "workExperience": str(row['workExperience']) if pd.notna(row['workExperience']) else "",
        "otherInformation": str(row['otherInformation']) if pd.notna(row['otherInformation']) else ""
    }

    # Check if candidate exists
    if candidate_id in existing_dict:
        # Update existing candidate
        existing_dict[candidate_id].update(candidate)
        updated_count += 1
    else:
        # Add new candidate
        existing_candidates.append(candidate)
        added_count += 1

# Sort candidates by id
existing_candidates.sort(key=lambda x: x['id'])

# Update the data structure
data['candidates'] = existing_candidates

# Write back to JSON file
with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"\nUpdated: {updated_count} candidates")
print(f"Added: {added_count} new candidates")
print(f"Total candidates now: {len(existing_candidates)}")
print(f"\nSuccessfully updated {json_path}")
