import turbopuffer
from config import TURBOPUFFER_API_KEY
import argparse

def create_turbo_namespace(namespace_name):
    """Create a namespace in TurboPuffer"""
    print(f"Initializing TurboPuffer with namespace: {namespace_name}")
    
    # Configure the TurboPuffer API
    turbopuffer.api_key = TURBOPUFFER_API_KEY
    
    try:
        # Create the namespace
        print(f"Creating namespace: {namespace_name}")
        turbopuffer.namespace.create(namespace_name)
        print(f"✅ Successfully created namespace: {namespace_name}")
        return True
    except Exception as e:
        if "already exists" in str(e).lower():
            print(f"Namespace {namespace_name} already exists")
            return True
        else:
            print(f"❌ Failed to create namespace: {str(e)}")
            return False

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Create a namespace in TurboPuffer')
    parser.add_argument('namespace', help='Namespace to create')
    
    args = parser.parse_args()
    create_turbo_namespace(args.namespace) 