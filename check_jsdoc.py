import os
import re

def check_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    lines = content.split('\n')
    missing_count = 0

    # Match exported items in TS/JS files
    # Matches export const, export function, export interface, export class, module.exports
    for i, line in enumerate(lines):
        stripped = line.strip()
        if (stripped.startswith('export ') or 'module.exports' in stripped) and not stripped.startswith('export {') and not stripped.startswith('export default'):
            # Check lines above for JSDoc pattern /** ... */
            has_jsdoc = False
            for offset in range(1, 10):
                prev_idx = i - offset
                if prev_idx < 0:
                    break
                prev_line = lines[prev_idx].strip()
                if '*/' in prev_line:
                    # Look further up for the start of JSDoc /**
                    for start_offset in range(prev_idx, -1, -1):
                        if '/**' in lines[start_offset]:
                            has_jsdoc = True
                            break
                    break
                if prev_line != '' and not prev_line.startswith('@') and not prev_line.startswith('*') and not prev_line.startswith('//'):
                    break

            if not has_jsdoc:
                print(f"[MISSING JSDOC] {filepath}:{i+1} -> {stripped}")
                missing_count += 1

    return missing_count

def main():
    total_missing = 0
    for root, dirs, files in os.walk('.'):
        if 'node_modules' in root or '.git' in root or '.gemini' in root:
            continue
        for file in files:
            if file.endswith(('.ts', '.tsx', '.js')):
                # Skip test files and check_jsdoc.py itself
                if '.test.' in file or file == 'check_jsdoc.py':
                    continue
                total_missing += check_file(os.path.join(root, file))

    print(f"\nJSDoc Audit Complete. Total missing JSDoc blocks: {total_missing}")
    if total_missing > 0:
        exit(1)
    else:
        exit(0)

if __name__ == '__main__':
    main()
