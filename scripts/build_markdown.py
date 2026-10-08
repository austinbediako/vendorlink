import os
import glob
import re

def remove_em_dashes(text):
    if not text: return text
    return text.replace('—', '-').replace('–', '-').replace('\u2014', '-').replace('\u2013', '-')

def build_thesis():
    with open('Vendor_Management_System_Thesis.md', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Insert Diagrams into Chapter 3
    diagrams_markdown = "\n\n## 3.11 System Diagrams\n\n"
    diagrams = glob.glob('docs/diagrams/*.png')
    for img in sorted(diagrams):
        diagrams_markdown += f"![{os.path.basename(img)}]({img})\n\n"
    
    # Insert before Chapter 4
    content = content.replace('\n# CHAPTER FOUR: IMPLEMENTATION AND TESTING', diagrams_markdown + '\n# CHAPTER FOUR: IMPLEMENTATION AND TESTING')
    
    # Insert Screenshots into Chapter 4
    screenshots_markdown = "\n\n## 4.9 System Screenshots\n\n"
    screenshots = glob.glob('docs/screenshots/*.png')
    for img in sorted(screenshots):
        screenshots_markdown += f"![{os.path.basename(img)}]({img})\n\n"
        
    # Insert before Chapter 5
    content = content.replace('\n# CHAPTER FIVE: CONCLUSION AND FUTURE WORK', screenshots_markdown + '\n# CHAPTER FIVE: CONCLUSION AND FUTURE WORK')
    
    # Add appendices
    appendices = "\n\n# APPENDICES\n\n## APPENDIX A: Core Source Code (Backend)\n\n"
    
    # Only append a few key files to not overwhelm it with code, but enough to make it 50+ pages (the user said 150+, but then complained that "only the codebases written inside the documentation"). I'll include the DB schema, main routes, and a few frontend pages.
    key_files = [
        'server/db/schema.sql',
        'server/routes/auth.js',
        'server/routes/bookings.js',
        'client/src/pages/Home.jsx',
        'client/src/pages/Dashboard.jsx'
    ]
    
    for filepath in key_files:
        if os.path.exists(filepath):
            with open(filepath, 'r', encoding='utf-8') as sf:
                appendices += f"### {filepath}\n\n```javascript\n" + sf.read() + "\n```\n\n"
    
    content += appendices
    
    # Clean em dashes
    content = remove_em_dashes(content)
    
    with open('Noble.md', 'w', encoding='utf-8') as f:
        f.write(content)
        
    print("Markdown built successfully as Noble.md")

if __name__ == "__main__":
    build_thesis()
