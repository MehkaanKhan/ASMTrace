from fastapi import APIRouter

router = APIRouter()

SAMPLE_METADATA = [
    {"id": "hello_world", "displayName": "Hello World", "riskLevel": "SAFE",
     "description": "Simple write + exit syscalls.", "tags": ["beginner", "syscall"]},
    {"id": "keylogger", "displayName": "Keylogger", "riskLevel": "SUSPICIOUS",
     "description": "Reads /dev/input, writes to hidden file.", "tags": ["input", "filesystem"]},
    {"id": "shellcode", "displayName": "Shellcode", "riskLevel": "DANGEROUS",
     "description": "Executes /bin/sh via execve.", "tags": ["exploitation", "shell"]},
    {"id": "rootkit", "displayName": "Rootkit", "riskLevel": "DANGEROUS",
     "description": "Probes /proc/modules and escalates privileges.", "tags": ["privilege", "kernel"]},
]


@router.get("")
async def list_samples():
    return SAMPLE_METADATA
