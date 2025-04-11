# API Keys (replace with your actual keys)
TURBOPUFFER_API_KEY = "tpuf_Aj4e0ABRMlq5Qzoh5IOZFcQzrn4snfXu"  # Replace this
HUGGINGFACE_API_KEY = "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"  # Replace this
SUPABASE_URL = "https://myeyoafugkrkwcnfedlu.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15ZXlvYWZ1Z2tya3djbmZlZGx1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzExMTMxMCwiZXhwIjoyMDU4Njg3MzEwfQ.IAxjgKWL1edbNJyqH-eTMjMXW-51U5sRZn7gafflDW4"

# Processing settings
BATCH_SIZE = 8  # Number of embeddings to process at once
EMBEDDING_MODEL = "BAAI/bge-large-en-v1.5"
EMBEDDING_DIMENSION = 1024  # Expected dimension for BGE models
NAMESPACE_PREFIX = "book-embeddings"

# Text extraction settings
MIN_PARAGRAPH_LENGTH = 50  # Minimum characters to consider a paragraph
MAX_PARAGRAPH_LENGTH = 1000  # Maximum characters to store in metadata 