import os
from embed_books import epub_to_text

# Get the path to your Downloads folder
home_directory = os.path.expanduser("~")
downloads_folder = os.path.join(home_directory, "Downloads")
epub_path = os.path.join(downloads_folder, "1984-George Orwell (3).epub")

# Check if the file exists before trying to parse
if not os.path.exists(epub_path):
    print(f"Error: EPUB file not found at {epub_path}")
    print("Please ensure the file exists in your Downloads folder or update the path in test_parse.py.")
    exit(1) # Exit the script if the file is not found

# Parse the book
print(f"Attempting to parse EPUB: {epub_path}")
book_content = epub_to_text(epub_path)

# Check if parsing was successful
if book_content is None:
    print(f"Error: Failed to parse the EPUB file. Check previous error messages from embed_books.py.")
    exit(1) # Exit if parsing failed

# Print basic info
print(f"\n--- EPUB Metadata ---")
print(f"Book Title: {book_content['book_title']}")
print(f"Book Author: {book_content['book_author']}")
print(f"Number of spine items processed into sections: {len(book_content['chapters'])}")

# --- Modify this section to show first 5 sections ---
print(f"\n--- Details for First 5 Extracted Sections ---")
if book_content['chapters']:
    # Loop through the first 5 sections, or fewer if the book has less than 5
    sections_to_show = book_content['chapters'][:5]
    print(f"(Showing details for {len(sections_to_show)} sections)")

    for section in sections_to_show:
        print("-" * 20) # Separator for readability
        print(f"Section Number (Spine Position): {section['chapter_number']}")
        print(f"Section Title: {section['chapter_title']}")
        print(f"Original Item ID: {section.get('item_id', 'N/A')}") # Use .get for safety
        print(f"Number of paragraphs extracted: {len(section['paragraphs'])}")

        if section['paragraphs']:
            print("\nSample paragraph (first extracted):")
            # Limit printing length for readability
            sample_text = section['paragraphs'][0]['text']
            print(sample_text[:300] + ('...' if len(sample_text) > 300 else '')) # Shortened sample
        else:
            print("Section contains no extractable paragraphs based on current criteria.")
        print("-" * 20 + "\n") # Separator

else:
    print("\nNo sections with content were extracted from the book's spine items.")
