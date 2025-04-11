# cleanup_namespaces.py
import requests
import time
import argparse
from config import SUPABASE_URL, SUPABASE_KEY

def list_namespaces():
    """List all existing TurboPuffer namespaces"""
    print("Listing all TurboPuffer namespaces...")
    
    # Manually defined list of namespaces based on the provided information
    namespaces = [
        "alexandria",
        "alexandria-bge-768",
        "alexandria-real-test",
        "alexandria-test-1984",
        "book-1984-1744312428",
        "book-1984-1744312565",
        "book-1984-1744313138",
        "minimal-test-1744306104277",
        "readiverse-docs",
        "test-connection-1744309603",
        "test-connection-1744312132",
        "test-connection-1744312139",
        "test-namespace-1744306034338",
        "test-namespace-1744312922",
        "test-namespace-768",
        "test-vectors-768"
    ]
    
    if not namespaces or len(namespaces) == 0:
        print("No namespaces found.")
        return []
    
    print(f"Found {len(namespaces)} namespaces:")
    for i, namespace in enumerate(namespaces):
        print(f"{i+1}. {namespace}")
    
    return namespaces

def delete_namespace(namespace_name):
    """Delete a specific TurboPuffer namespace"""
    print(f"Deleting namespace: {namespace_name}")
    
    try:
        # Set headers for Supabase
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {SUPABASE_KEY}'
        }
        
        # Request to delete namespace
        response = requests.post(
            f"{SUPABASE_URL}/functions/v1/turbopuffer-api",
            headers=headers,
            json={
                'operation': 'delete',
                'namespace': namespace_name
            }
        )
        
        if response.status_code != 200:
            print(f"Error deleting namespace {namespace_name}: {response.status_code} - {response.text}")
            return False
        
        print(f"Successfully deleted namespace: {namespace_name}")
        return True
    
    except Exception as e:
        print(f"Error deleting namespace {namespace_name}: {e}")
        return False

def clean_up_namespaces(pattern=None, confirm=True):
    """Clean up namespaces matching a pattern"""
    namespaces = list_namespaces()
    
    if not namespaces:
        return
    
    namespaces_to_delete = []
    
    if pattern:
        print(f"\nSelecting namespaces matching pattern: {pattern}")
        namespaces_to_delete = [ns for ns in namespaces if pattern in ns]
        print(f"Found {len(namespaces_to_delete)} namespaces matching the pattern.")
    else:
        namespaces_to_delete = namespaces
    
    if not namespaces_to_delete:
        print("No namespaces to delete.")
        return
    
    print("\nNamespaces to be deleted:")
    for ns in namespaces_to_delete:
        print(f"- {ns}")
    
    if confirm:
        confirmation = input("\nAre you sure you want to delete these namespaces? (y/n): ")
        if confirmation.lower() != 'y':
            print("Operation cancelled.")
            return
    
    success_count = 0
    failure_count = 0
    
    for ns in namespaces_to_delete:
        success = delete_namespace(ns)
        if success:
            success_count += 1
        else:
            failure_count += 1
        
        # Add a small delay between deletions
        time.sleep(0.5)
    
    print(f"\nCleanup completed: {success_count} namespaces deleted, {failure_count} failures.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Clean up TurboPuffer namespaces')
    parser.add_argument('--pattern', help='Pattern to match for namespaces to delete (e.g., "book-")')
    parser.add_argument('--force', action='store_true', help='Skip confirmation prompt')
    parser.add_argument('--list-only', action='store_true', help='Only list namespaces without deleting')
    
    args = parser.parse_args()
    
    if args.list_only:
        list_namespaces()
    else:
        clean_up_namespaces(pattern=args.pattern, confirm=not args.force) 