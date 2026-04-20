# -*- coding: utf-8 -*-
"""
生成初中教材各章节 Markdown 知识要点文件。
用法：python gen_chapter_md.py --base "D:\Users\kongchun\Desktop\初中教材\八年级物理上" --chapters chapters.json

chapters.json 格式示例：
[
  {
    "filename": "第1章_声现象.md",
    "title": "第1章  声现象",
    "sections": [
      {"id": "1.1", "title": "声音的产生与传播", "key_points": ["振动产生声音", "声音需要介质传播"]},
      {"id": "1.2", "title": "声音的特性", "key_points": ["音调、响度、音色"]}
    ],
    "formulas": [],
    "experiments": [],
    "common_mistakes": ["音调与响度容易混淆"]
  }
]
"""
import json, os, sys, argparse

def generate_chapter_md(ch):
    """根据章节 JSON 数据生成 Markdown 文本"""
    lines = []
    lines.append(f"# {ch['title']}")
    lines.append("")
    
    # 学习目标
    lines.append("## 本章学习目标")
    lines.append("")
    lines.append("| 目标 | 内容 |")
    lines.append("|:---|:---|")
    for sec in ch.get('sections', []):
        points = '；'.join(sec.get('key_points', []))
        lines.append(f"| 掌握 | {sec['id']} {sec['title']}：{points} |")
    lines.append("")
    
    # 各节内容
    for sec in ch.get('sections', []):
        lines.append(f"## {sec['id']}  {sec['title']}")
        lines.append("")
        
        # 核心概念
        if sec.get('key_points'):
            lines.append("### 核心概念")
            lines.append("")
            for p in sec['key_points']:
                lines.append(f"- {p}")
            lines.append("")
        
        # 公式（如果有）
        if sec.get('formulas'):
            lines.append("### 核心公式")
            lines.append("")
            for f in sec['formulas']:
                lines.append(f"$$\\boxed{{{f}}}$$")
            lines.append("")
        
        # 实验
        if sec.get('experiments'):
            lines.append("### 实验")
            lines.append("")
            lines.append("```")
            for i, step in enumerate(sec['experiments'], 1):
                lines.append(f"{chr(0x2460+i-1)} {step}")
            lines.append("```")
            lines.append("")
        
        # 易错
        if sec.get('common_mistakes'):
            lines.append("### 易错警示")
            lines.append("")
            for m in sec['common_mistakes']:
                lines.append(f"> ⚠️ {m}")
            lines.append("")
    
    # 本章公式速查
    all_formulas = []
    for sec in ch.get('sections', []):
        all_formulas.extend(sec.get('formulas', []))
    if all_formulas:
        lines.append("## ⭐ 本章核心公式速查")
        lines.append("")
        for f in all_formulas:
            lines.append(f"$$\\boxed{{{f}}}$$")
        lines.append("")
    
    # 本章易错点
    all_mistakes = []
    for sec in ch.get('sections', []):
        all_mistakes.extend(sec.get('common_mistakes', []))
    ch_mistakes = ch.get('common_mistakes', [])
    all_mistakes.extend(ch_mistakes)
    if all_mistakes:
        lines.append("## ⚠️ 本章易错点")
        lines.append("")
        for i, m in enumerate(all_mistakes, 1):
            lines.append(f"{i}. {m}")
        lines.append("")
    
    return '\n'.join(lines)


def main():
    parser = argparse.ArgumentParser(description='Generate chapter Markdown files')
    parser.add_argument('--base', required=True, help='Output base directory')
    parser.add_argument('--chapters', required=True, help='Path to chapters.json')
    args = parser.parse_args()
    
    os.makedirs(args.base, exist_ok=True)
    
    with open(args.chapters, 'r', encoding='utf-8') as f:
        chapters = json.load(f)
    
    for ch in chapters:
        md = generate_chapter_md(ch)
        path = os.path.join(args.base, ch['filename'])
        with open(path, 'w', encoding='utf-8') as f:
            f.write(md)
        size = os.path.getsize(path)
        print(f'[OK] {ch["filename"]}  ({size // 1024} KB)')
    
    print(f'\nDone. {len(chapters)} files generated.')


if __name__ == '__main__':
    main()
