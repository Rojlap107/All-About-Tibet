import pandas as pd
import requests
from bs4 import BeautifulSoup
import os
import time

# Read the Excel file
excel_path = '/Users/tenzinpaljor/Desktop/Norzin Consultancy/1. All About Tibet/Website without DBMongo/images/candidates/source.xlsx'
df = pd.read_excel(excel_path)

# Output directory
output_dir = '/Users/tenzinpaljor/Desktop/Norzin Consultancy/1. All About Tibet/Website without DBMongo/images/candidates'

# Ensure output directory exists
os.makedirs(output_dir, exist_ok=True)

# Process each row
for index, row in df.iterrows():
    name = row['Name']
    source_url = row['source']
    image_name = str(row['image name'])

    print(f"\n[{index + 1}/45] Processing: {name}")
    print(f"  URL: {source_url}")

    try:
        # Fetch the page
        response = requests.get(source_url, timeout=30)
        response.raise_for_status()

        # Parse HTML
        soup = BeautifulSoup(response.content, 'html.parser')

        # Find the image - looking for common patterns on profile pages
        image_url = None

        # Try to find the main profile image
        # Method 1: Look for images in common profile containers
        profile_img = soup.find('img', class_=lambda x: x and ('profile' in x.lower() or 'avatar' in x.lower() or 'member' in x.lower()))

        if not profile_img:
            # Method 2: Look for the first large image in the content area
            profile_img = soup.find('div', class_='entry-content')
            if profile_img:
                profile_img = profile_img.find('img')

        if not profile_img:
            # Method 3: Look for any img tag with wp-post-image class (common in WordPress)
            profile_img = soup.find('img', class_='wp-post-image')

        if not profile_img:
            # Method 4: Find first img in main content
            main_content = soup.find('main') or soup.find('article')
            if main_content:
                profile_img = main_content.find('img')

        if profile_img:
            image_url = profile_img.get('src') or profile_img.get('data-src')

            if image_url:
                # Handle relative URLs
                if image_url.startswith('//'):
                    image_url = 'https:' + image_url
                elif image_url.startswith('/'):
                    from urllib.parse import urljoin
                    image_url = urljoin(source_url, image_url)

                # Download the image
                print(f"  Downloading image from: {image_url}")
                img_response = requests.get(image_url, timeout=30)
                img_response.raise_for_status()

                # Get file extension from URL
                ext = os.path.splitext(image_url)[1].split('?')[0]
                if not ext or ext not in ['.jpg', '.jpeg', '.png', '.gif', '.webp']:
                    ext = '.jpg'

                # Save the image
                output_path = os.path.join(output_dir, f"{image_name}{ext}")
                with open(output_path, 'wb') as f:
                    f.write(img_response.content)

                print(f"  ✓ Saved as: {image_name}{ext}")
            else:
                print(f"  ✗ Could not find image URL in img tag")
        else:
            print(f"  ✗ Could not find profile image on page")

    except Exception as e:
        print(f"  ✗ Error: {str(e)}")

    # Be polite - add a small delay between requests
    time.sleep(1)

print("\n\n=== Download Complete ===")
print(f"Images saved to: {output_dir}")
