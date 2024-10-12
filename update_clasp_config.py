import json
import os


def _get_required_env_var(key_name: str, default=None):
    val = os.getenv(key_name, default)
    if val is None:
        raise ValueError(f"Environment variable {key_name} is not set")
    return val


def _load_dot_env(file_path: str = ".env"):
    with open(file_path, "rt") as f:
        lines = f.readlines()
    for line in lines:
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", maxsplit=1)
        os.environ[key] = value


_load_dot_env()
script_id = _get_required_env_var("SCRIPT_ID")
spreadsheet_id = _get_required_env_var("SPREADSHEET_ID")
gcp_project_id = _get_required_env_var("GCP_PROJECT_ID")

with open(".clasp.json", "w") as f:
    json.dump({
        "scriptId": script_id,
        "rootDir": "src",
        "parentId": [
            spreadsheet_id
        ],
        "projectId": gcp_project_id
    }, f, indent=4)
