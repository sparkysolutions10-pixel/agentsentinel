import sys
import re
from pathlib import Path

def audit_html_file(filepath):
    print(f"\n=======================================================")
    print(f"AUDITING DOM & INTERACTION HEALTH: {Path(filepath).name}")
    print(f"=======================================================")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()

    # 1. Check all anchor tags
    a_pattern = re.compile(r'<a\b([^>]*)>(.*?)</a>', re.IGNORECASE | re.DOTALL)
    anchors = a_pattern.findall(html)
    dead_anchors = []
    
    for attrs, text in anchors:
        href_match = re.search(r'href\s*=\s*["\']([^"\']*)["\']', attrs, re.IGNORECASE)
        onclick_match = re.search(r'onclick\s*=\s*["\']([^"\']*)["\']', attrs, re.IGNORECASE)
        id_match = re.search(r'id\s*=\s*["\']([^"\']*)["\']', attrs, re.IGNORECASE)
        
        href = href_match.group(1).strip() if href_match else ''
        onclick = onclick_match.group(1).strip() if onclick_match else ''
        aid = id_match.group(1).strip() if id_match else ''
        
        # An anchor is dead if href is '#' or empty and there is no onclick and no JS event binding for its ID
        has_js_binding = aid and (f"'{aid}'" in html[html.find('<script>'):] or f'"{aid}"' in html[html.find('<script>'):])
        
        if href in ['#', '', 'javascript:void(0)', 'javascript:;'] and not onclick and not has_js_binding:
            dead_anchors.append({'attrs': attrs.strip(), 'text': text.strip()[:40]})
            
    print(f"Total <a> anchors: {len(anchors)}")
    print(f"Dead / Unwired <a> anchors: {len(dead_anchors)}")
    for da in dead_anchors:
        print(f"  [DEAD ANCHOR] text='{da['text']}' attrs='{da['attrs']}'")

    # 2. Check all button tags
    btn_pattern = re.compile(r'<button\b([^>]*)>(.*?)</button>', re.IGNORECASE | re.DOTALL)
    buttons = btn_pattern.findall(html)
    dead_buttons = []
    
    for attrs, text in buttons:
        onclick_match = re.search(r'onclick\s*=\s*["\']([^"\']*)["\']', attrs, re.IGNORECASE)
        id_match = re.search(r'id\s*=\s*["\']([^"\']*)["\']', attrs, re.IGNORECASE)
        type_match = re.search(r'type\s*=\s*["\']([^"\']*)["\']', attrs, re.IGNORECASE)
        
        onclick = onclick_match.group(1).strip() if onclick_match else ''
        bid = id_match.group(1).strip() if id_match else ''
        btype = type_match.group(1).strip() if type_match else ''
        
        has_js_binding = bid and (f"'{bid}'" in html[html.find('<script>'):] or f'"{bid}"' in html[html.find('<script>'):])
        
        if not onclick and not has_js_binding and btype != 'submit':
            dead_buttons.append({'attrs': attrs.strip(), 'text': text.strip()[:40]})
            
    print(f"Total <button> elements: {len(buttons)}")
    print(f"Dead / Unwired <button> elements: {len(dead_buttons)}")
    for db in dead_buttons:
        print(f"  [DEAD BUTTON] text='{db['text']}' attrs='{db['attrs']}'")

    return len(dead_anchors) == 0 and len(dead_buttons) == 0

if __name__ == '__main__':
    ok1 = audit_html_file(r'd:\PersonalAI\agentsentinel\docs\index.html')
    ok2 = audit_html_file(r'd:\PersonalAI\agentsentinel\docs\dashboard.html')
    print(f"\nAudit complete. Index: {'PASS' if ok1 else 'FAIL'}, Dashboard: {'PASS' if ok2 else 'FAIL'}")
