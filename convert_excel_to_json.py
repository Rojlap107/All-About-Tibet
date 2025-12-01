import pandas as pd
import json
import os

# Read the Excel file
excel_path = '/Users/tenzinpaljor/Downloads/MP_Candidate_Formatted.xlsx'
df = pd.read_excel(excel_path)

# Output JSON path
json_output_path = '/Users/tenzinpaljor/Desktop/Norzin Consultancy/1. All About Tibet/Website without DBMongo/data/candidates.json'

# Image directory
image_dir = '/Users/tenzinpaljor/Desktop/Norzin Consultancy/1. All About Tibet/Website without DBMongo/images/candidates'

# Convert dataframe to list of dictionaries
candidates = []

for _, row in df.iterrows():
    candidate_id = int(row['id'])

    # Determine the correct image extension
    image_file = None
    for ext in ['.jpg', '.jpeg', '.png', '.gif', '.webp']:
        potential_path = os.path.join(image_dir, f"{candidate_id}{ext}")
        if os.path.exists(potential_path):
            image_file = f"{candidate_id}{ext}"
            break

    # If no image found, use default
    if not image_file:
        image_file = f"{candidate_id}.jpg"

    candidate = {
        "id": candidate_id,
        "photo": f"../../images/candidates/{image_file}",
        "name": str(row['name']) if pd.notna(row['name']) else "",
        "ageGroup": str(row['age-group']) if pd.notna(row['age-group']) else "",
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

    candidates.append(candidate)

# Create the final JSON structure
output_data = {
    "candidates": candidates
}

# Write to JSON file with proper formatting
with open(json_output_path, 'w', encoding='utf-8') as f:
    json.dump(output_data, f, indent=2, ensure_ascii=False)

print(f"Successfully converted {len(candidates)} candidates to JSON")
print(f"Output saved to: {json_output_path}")
