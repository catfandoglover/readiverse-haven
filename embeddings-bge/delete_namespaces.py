import requests
import time

# API Configuration
API_KEY = "tpuf_Aj4e0ABRMlq5Qzoh5IOZFcQzrn4snfXu"
BASE_URL = "https://api.turbopuffer.com/v1"
HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

# List of namespaces to delete
namespaces = [
    "1984-test-embedding",
    "alexandria",
    "alexandria_discover_feed",
    "alexandria_library",
    "alexandria_test",
    "alexandria-bge-768",
    "alexandria-real-test",
    "alexandria-test-1984",
    "alexandria-test-4-11",
    "alexandria-test-4-11-sample",
    "book-1984-1744312428",
    "book-1984-1744312565",
    "book-1984-1744313138",
    "book-1984-1744318288",
    "book-1984-1744318442",
    "book-1984-1744318481",
    "book-1984-1744318514",
    "book-1984-1744318569",
    "book-1984-1744318744",
    "book-1984-1744319295",
    "book-1984-1744319560933",
    "book-1984-1744319801593",
    "minimal-test-1744306104277",
    "readiverse-docstest_namespace",
    "test-connection-1744309603",
    "test-connection-1744312132",
    "test-connection-1744312139",
    "test-namespace-1744306034338",
    "test-namespace-1744312922",
    "test-namespace-768",
    "test-vectors-768"
]

def delete_namespace(namespace):
    url = f"{BASE_URL}/namespaces/{namespace}"
    try:
        response = requests.delete(url, headers=HEADERS)
        if response.status_code == 200 or response.status_code == 204:
            print(f"Successfully deleted namespace: {namespace}")
            return True
        else:
            print(f"Failed to delete namespace: {namespace}. Status code: {response.status_code}")
            return False
    except Exception as e:
        print(f"Error when deleting namespace {namespace}: {str(e)}")
        return False

def main():
    print(f"Starting deletion of {len(namespaces)} namespaces...")
    success_count = 0
    failure_count = 0
    
    for namespace in namespaces:
        print(f"Deleting {namespace}...")
        if delete_namespace(namespace):
            success_count += 1
        else:
            failure_count += 1
        time.sleep(0.5)
    
    print(f"Total namespaces: {len(namespaces)}")
    print(f"Successfully deleted: {success_count}")
    print(f"Failed to delete: {failure_count}")

if __name__ == "__main__":
    main()