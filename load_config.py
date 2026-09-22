import json
from pathlib import Path

def load_harness_config(config_path="harness_config.json"):
    path = Path(config_path)
    if not path.exists():
        raise FileNotFoundError(f"Configuration file not found at {config_path}")
    
    with open(path, "r") as f:
        config = json.load(f)
        
    return config

if __name__ == "__main__":
    try:
        config = load_harness_config()
        active_provider = config.get("active_model_provider")
        provider_details = config.get("providers", {}).get(active_provider, {})
        domains = config.get("domains", {})
        print("\n")
        print(f"----- Project: {config.get('project_name')} -----")
        print(f"Active Provider: {active_provider}")
        print(f"Default Model: {provider_details.get('default_model')}")
        print("Configured Domains:")
        for domain_name, domain_details in domains.items():
            print(f"  {domain_name}: {domain_details.get('description')}")
    except Exception as e:
        print(f"Error loading configuration: {e}")
