import ast
import os

def minify(source_file, target_file):
    with open(source_file, "r", encoding="utf-8") as f:
        source = f.read()
            
    tree = ast.parse(source)
    for node in ast.walk(tree):
        if not isinstance(node, (ast.FunctionDef, ast.ClassDef, ast.AsyncFunctionDef, ast.Module)):
            continue
        
        if not hasattr(node, 'body') or not len(node.body):
            continue
            
        if not isinstance(node.body[0], ast.Expr):
            continue
            
        # check if it's a string literal (docstring)
        # in py3.8+ ast.Constant is used
        if isinstance(node.body[0].value, ast.Constant) and isinstance(node.body[0].value.value, str):
            node.body.pop(0)

    # Convert back to source
    minified = ast.unparse(tree)
    
    # Also remove all empty lines
    minified = "\n".join([line for line in minified.split("\n") if line.strip()])
    
    # minified = '# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }\n' + minified

    with open(target_file, "w", encoding="utf-8") as f:
        f.write(minified)
        
    print(f"Original: {len(source)} bytes")
    print(f"Minified: {len(minified)} bytes")

minify("contracts/licenselock.py", "contracts/licenselock_min.py")
