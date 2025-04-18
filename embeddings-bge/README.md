# Book Embedding Scripts

This directory contains scripts for generating embeddings for books and storing them in Turbopuffer.

## Setup

1. Create a `.env` file in this directory with your API keys:
   ```
   HUGGINGFACE_API_KEY=your_huggingface_api_key_here
   TURBOPUFFER_API_KEY=your_turbopuffer_api_key_here
   ```

2. You can use the `update_env.sh` script to help you set these keys:
   ```bash
   ./update_env.sh
   ```

## Processing a Single Book

Use `embed_books.py` to process a single EPUB file:

```bash
python embed_books.py
```

By default, it will look for "1984-George Orwell (3).epub" in your Downloads folder.

## Processing Multiple Books from a CSV

Use `process_csv.py` to process multiple books from a CSV file in parallel:

```bash
python process_csv.py --workers 3
```

### Command Line Options

- `--csv`: Path to the CSV file (default: "~/Downloads/Embeddings Prep_ Epubs.csv")
- `--workers`: Number of parallel workers (default: 3)
- `--namespace-prefix`: Prefix for Turbopuffer namespaces (default: "alexandria-")
- `--skip`: Number of rows to skip (default: 0)
- `--limit`: Maximum number of books to process (default: all rows)

### Examples

Process 5 books starting from the 10th row:
```bash
python process_csv.py --skip 9 --limit 5
```

Use 4 parallel workers:
```bash
python process_csv.py --workers 4
```

Use a custom namespace prefix:
```bash
python process_csv.py --namespace-prefix "books-"
```

## Parallel Processing Performance

The optimal number of parallel workers depends on:

1. **System Resources**:
   - CPU cores: Each worker is a separate process
   - Memory: Each process requires 500MB-1GB of RAM
   - Network bandwidth: Each process makes API calls

2. **API Rate Limits**:
   - Hugging Face API may throttle many simultaneous requests
   - Turbopuffer may have write limits

### Recommendations

- For most systems, 3-4 workers is a good balance
- For machines with 16+ cores and good bandwidth, 5-6 workers may work well
- Monitor system resource usage and adjust accordingly

## Output

The script generates a CSV file with results for each book processed, including:
- Download URL
- Book UUID
- Turbopuffer namespace
- Processing status
- Processing time
- Number of paragraphs embedded
- Error reason (if any)

## Utilities

- `update_env.sh`: Helper script for updating API keys in .env
- `delete_namespaces.py`: Utility for cleaning up Turbopuffer namespaces 