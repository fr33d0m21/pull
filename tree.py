import os
import fnmatch
from pathlib import Path
from typing import List, Set

def load_gitignore(root_dir: str) -> Set[str]:
    """Load .gitignore patterns and convert them to a set of patterns."""
    gitignore_patterns = set()
    gitignore_path = os.path.join(root_dir, '.gitignore')
    
    if os.path.exists(gitignore_path):
        with open(gitignore_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#'):
                    # Convert .gitignore pattern to fnmatch pattern
                    pattern = line.rstrip('/')  # Remove trailing slashes
                    if pattern.startswith('/'):
                        pattern = pattern[1:]  # Remove leading slash
                    if '*' not in pattern and '.' in pattern:
                        pattern = f'**/{pattern}'
                    elif pattern.startswith('**/'):
                        pattern = pattern[3:]
                    gitignore_patterns.add(pattern)
    
    return gitignore_patterns

def should_ignore(path: str, root: str, ignore_patterns: Set[str]) -> bool:
    """Check if a path should be ignored based on .gitignore patterns."""
    rel_path = os.path.relpath(path, root)
    
    # Always ignore .git directory
    if '.git' in rel_path.split(os.sep):
        return True
        
    # Check each pattern
    for pattern in ignore_patterns:
        if fnmatch.fnmatch(rel_path, pattern) or fnmatch.fnmatch(os.path.basename(path), pattern):
            return True
    
    return False

def print_tree(root_dir: str, output_file: str = 'tree_output.md'):
    """Print the directory tree and file contents to a markdown file."""
    ignore_patterns = load_gitignore(root_dir)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write('# Project Tree with File Contents\n\n')
        
        for root, dirs, files in os.walk(root_dir):
            # Remove ignored directories
            dirs[:] = [d for d in dirs if not should_ignore(os.path.join(root, d), root_dir, ignore_patterns)]
            
            # Process files
            for file in sorted(files):
                file_path = os.path.join(root, file)
                
                # Skip ignored files
                if should_ignore(file_path, root_dir, ignore_patterns):
                    continue
                
                # Get relative path for display
                rel_path = os.path.relpath(file_path, root_dir)
                
                # Write file header
                f.write(f'## {rel_path}\n')
                
                # Try to read and write file contents
                try:
                    with open(file_path, 'r', encoding='utf-8') as content_file:
                        content = content_file.read()
                        f.write('```\n')
                        f.write(content)
                        if not content.endswith('\n'):
                            f.write('\n')
                        f.write('```\n\n')
                except (UnicodeDecodeError, IOError):
                    f.write('*Binary or unreadable file*\n\n')

if __name__ == '__main__':
    # Get the directory where the script is located
    script_dir = os.path.dirname(os.path.abspath(__file__))
    # Use the script directory as both the root and output location
    output_file = os.path.join(script_dir, 'tree_output.md')
    print_tree(script_dir, output_file)
    print(f'Tree output has been written to {output_file}') 